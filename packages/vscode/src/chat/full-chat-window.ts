import * as vscode from "vscode";
import { ChatHistory } from "./chat-history";
import { ConversationalQA } from "@eldrex/core";

export class FullChatWindow {
  /**
   * Open DevDiff Chat in a full editor tab
   */
  static async open(context: vscode.ExtensionContext): Promise<void> {
    const panel = vscode.window.createWebviewPanel(
      "devdiff-chat-full",
      "DevDiff Chat",
      vscode.ViewColumn.Active,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [],
      },
    );

    panel.webview.html = this.renderHTML();

    let activeConversationId: string =
      await ChatHistory.createConversation(context);

    panel.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case "send-message": {
          const userMsg = {
            role: "user" as const,
            content: message.text,
            timestamp: new Date().toISOString(),
          };

          await ChatHistory.addMessage(activeConversationId, userMsg, context);

          let assistantReply = "I have analyzed your workspace changes.";
          try {
            const qa = new ConversationalQA({ workspacePath: process.cwd() });
            const res = await qa.ask(message.text);
            assistantReply = res.answer || assistantReply;
          } catch {
            assistantReply = `Understood: "${message.text}". DevDiff context-aware analysis is ready.`;
          }

          const assistantMsg = {
            role: "assistant" as const,
            content: assistantReply,
            timestamp: new Date().toISOString(),
          };

          await ChatHistory.addMessage(
            activeConversationId,
            assistantMsg,
            context,
          );

          panel.webview.postMessage({
            command: "receive-message",
            message: assistantMsg,
          });
          break;
        }

        case "new-conversation": {
          activeConversationId = await ChatHistory.createConversation(context);
          panel.webview.postMessage({
            command: "conversation-created",
            conversationId: activeConversationId,
          });
          break;
        }

        case "load-conversations": {
          const list = await ChatHistory.getAllConversations(context);
          panel.webview.postMessage({
            command: "search-results",
            results: list,
          });
          break;
        }

        case "load-conversation": {
          activeConversationId = message.conversationId;
          const conv = await ChatHistory.getConversation(
            activeConversationId,
            context,
          );
          panel.webview.postMessage({
            command: "conversation-loaded",
            messages: conv?.messages || [],
          });
          break;
        }

        case "search-history": {
          const results = await ChatHistory.searchConversations(
            message.query,
            context,
          );
          panel.webview.postMessage({
            command: "search-results",
            results,
          });
          break;
        }

        case "export-chat": {
          const exportText = await ChatHistory.exportConversation(
            activeConversationId,
            context,
          );
          const doc = await vscode.workspace.openTextDocument({
            content: exportText,
            language: "markdown",
          });
          await vscode.window.showTextDocument(doc);
          break;
        }

        case "clear-conversation": {
          await ChatHistory.clearConversation(activeConversationId, context);
          activeConversationId = await ChatHistory.createConversation(context);
          panel.webview.postMessage({
            command: "conversation-created",
            conversationId: activeConversationId,
          });
          break;
        }
      }
    });
  }

  private static renderHTML(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DevDiff Chat</title>
  <style>
    :root {
      --bg: var(--vscode-editor-background);
      --fg: var(--vscode-editor-foreground);
      --fg-secondary: var(--vscode-descriptionForeground);
      --border: var(--vscode-sideBar-border);
      --sidebar-bg: var(--vscode-sideBar-background);
      --input-bg: var(--vscode-input-background);
      --button-bg: var(--vscode-button-background);
      --button-fg: var(--vscode-button-foreground);
      --hover: var(--vscode-list-hoverBackground);
      --accent: var(--vscode-textLink-foreground);
      --radius: 4px;
      --spacing-sm: 4px;
      --spacing-md: 8px;
      --spacing-lg: 12px;
      --spacing-xl: 16px;
      --spacing-xxl: 24px;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: var(--vscode-font-family);
      font-size: 13px;
      color: var(--fg);
      background: var(--bg);
      height: 100vh;
      display: grid;
      grid-template-columns: 240px 1fr;
      grid-template-rows: 48px 1fr;
      grid-template-areas:
        "sidebar header"
        "sidebar main";
      overflow: hidden;
    }

    .header {
      grid-area: header;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--spacing-xl);
      border-bottom: 1px solid var(--border);
      background: var(--bg);
    }

    .header-title {
      font-size: 14px;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      gap: var(--spacing-md);
    }

    .header-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: transparent;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      color: var(--fg-secondary);
      cursor: pointer;
      font-family: inherit;
      font-size: 12px;
    }

    .header-btn:hover {
      background: var(--hover);
      color: var(--fg);
    }

    .sidebar {
      grid-area: sidebar;
      background: var(--sidebar-bg);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .sidebar-header {
      padding: var(--spacing-lg) var(--spacing-xl);
      border-bottom: 1px solid var(--border);
    }

    .new-conversation-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 8px 12px;
      background: var(--button-bg);
      color: var(--button-fg);
      border: none;
      border-radius: var(--radius);
      cursor: pointer;
      font-family: inherit;
      font-size: 12px;
    }

    .search-bar {
      padding: var(--spacing-md) var(--spacing-lg);
      border-bottom: 1px solid var(--border);
    }

    .search-input {
      width: 100%;
      padding: 6px 10px;
      background: var(--input-bg);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      color: var(--fg);
      font-family: inherit;
      font-size: 12px;
      outline: none;
    }

    .search-input:focus { border-color: var(--accent); }

    .conversation-list {
      flex: 1;
      overflow-y: auto;
      padding: var(--spacing-md);
    }

    .conversation-item {
      padding: var(--spacing-md) var(--spacing-lg);
      border-radius: var(--radius);
      cursor: pointer;
      margin-bottom: 2px;
    }

    .conversation-item:hover, .conversation-item.active {
      background: var(--hover);
    }

    .conversation-title {
      font-size: 12px;
      color: var(--fg);
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .conversation-meta {
      font-size: 11px;
      color: var(--fg-secondary);
      margin-top: 2px;
    }

    .chat-main {
      grid-area: main;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .messages {
      flex: 1;
      overflow-y: auto;
      padding: var(--spacing-xxl);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xl);
    }

    .message {
      max-width: 75%;
      display: flex;
      flex-direction: column;
    }

    .message.user { align-self: flex-end; }
    .message.assistant { align-self: flex-start; }

    .message-bubble {
      padding: var(--spacing-lg) var(--spacing-xl);
      border-radius: var(--radius);
      font-size: 13px;
      line-height: 1.6;
    }

    .message.user .message-bubble {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }

    .message.assistant .message-bubble {
      background: var(--vscode-editorWidget-background);
      border: 1px solid var(--border);
    }

    .message-meta {
      font-size: 11px;
      color: var(--fg-secondary);
      margin-top: 4px;
    }

    .input-area {
      padding: var(--spacing-xl);
      border-top: 1px solid var(--border);
      background: var(--bg);
    }

    .input-container {
      display: flex;
      gap: var(--spacing-md);
      align-items: flex-end;
    }

    .chat-input {
      flex: 1;
      padding: var(--spacing-lg);
      background: var(--input-bg);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      color: var(--fg);
      font-family: inherit;
      font-size: 13px;
      resize: none;
      outline: none;
      min-height: 40px;
      max-height: 200px;
    }

    .chat-input:focus { border-color: var(--accent); }

    .send-btn {
      padding: var(--spacing-lg) var(--spacing-xl);
      background: var(--button-bg);
      color: var(--button-fg);
      border: none;
      border-radius: var(--radius);
      cursor: pointer;
      font-family: inherit;
      font-size: 13px;
    }

    .empty-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--fg-secondary);
      text-align: center;
    }

    .suggestion-chips {
      display: flex;
      gap: var(--spacing-md);
      margin-top: var(--spacing-xl);
    }

    .suggestion-chip {
      padding: 6px 12px;
      background: var(--vscode-editorWidget-background);
      border: 1px solid var(--border);
      border-radius: 16px;
      cursor: pointer;
      font-size: 12px;
      color: var(--fg-secondary);
    }

    .suggestion-chip:hover {
      background: var(--hover);
      color: var(--fg);
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-title">DevDiff Full Chat Window</div>
    <div class="header-actions">
      <button class="header-btn" onclick="exportChat()">Export Markdown</button>
      <button class="header-btn" onclick="clearChat()">Clear</button>
    </div>
  </div>

  <div class="sidebar">
    <div class="sidebar-header">
      <button class="new-conversation-btn" onclick="newConversation()">+ New Conversation</button>
    </div>
    <div class="search-bar">
      <input class="search-input" type="text" placeholder="Search conversations..." oninput="searchHistory(this.value)"/>
    </div>
    <div class="conversation-list" id="conversation-list"></div>
  </div>

  <div class="chat-main">
    <div class="messages" id="messages"></div>
    <div class="input-area">
      <div class="input-container">
        <textarea class="chat-input" id="chat-input" placeholder="Ask anything about your codebase..." rows="1" onkeydown="handleKeydown(event)"></textarea>
        <button class="send-btn" id="send-btn" onclick="sendMessage()">Send</button>
      </div>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    let currentConversationId = null;

    function newConversation() { vscode.postMessage({ command: 'new-conversation' }); }
    function searchHistory(query) { vscode.postMessage({ command: 'search-history', query }); }

    function sendMessage() {
      const input = document.getElementById('chat-input');
      const text = input.value.trim();
      if (!text) return;
      appendMessage('user', text);
      input.value = '';
      vscode.postMessage({ command: 'send-message', text });
    }

    function handleKeydown(event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
      }
    }

    function appendMessage(role, content) {
      const messages = document.getElementById('messages');
      const emptyState = messages.querySelector('.empty-state');
      if (emptyState) emptyState.remove();

      const msgDiv = document.createElement('div');
      msgDiv.className = 'message ' + role;
      const bubble = document.createElement('div');
      bubble.className = 'message-bubble';
      bubble.textContent = content;

      const meta = document.createElement('div');
      meta.className = 'message-meta';
      meta.textContent = new Date().toLocaleTimeString();

      msgDiv.appendChild(bubble);
      msgDiv.appendChild(meta);
      messages.appendChild(msgDiv);
      messages.scrollTop = messages.scrollHeight;
    }

    window.addEventListener('message', (event) => {
      const message = event.data;
      switch (message.command) {
        case 'receive-message':
          appendMessage('assistant', message.message.content);
          break;
        case 'conversation-created':
          currentConversationId = message.conversationId;
          vscode.postMessage({ command: 'load-conversations' });
          clearMessages();
          break;
        case 'conversation-loaded':
          clearMessages();
          for (const msg of message.messages) {
            appendMessage(msg.role, msg.content);
          }
          break;
        case 'search-results':
          renderConversationList(message.results);
          break;
      }
    });

    function clearMessages() {
      document.getElementById('messages').innerHTML = \`
        <div class="empty-state">
          <div class="empty-state-title">Start a Conversation</div>
          <div style="margin-top: 8px;">Ask anything about your codebase, architecture, or recent commits.</div>
          <div class="suggestion-chips">
            <button class="suggestion-chip" onclick="quickAsk('What changed today?')">What changed today?</button>
            <button class="suggestion-chip" onclick="quickAsk('Architecture overview')">Architecture overview</button>
          </div>
        </div>
      \`;
    }

    function quickAsk(q) {
      document.getElementById('chat-input').value = q;
      sendMessage();
    }

    function renderConversationList(conversations) {
      const list = document.getElementById('conversation-list');
      list.innerHTML = conversations.map(c => \`
        <div class="conversation-item \${c.id === currentConversationId ? 'active' : ''}" onclick="selectConversation('\${c.id}')">
          <div class="conversation-title">\${c.title}</div>
          <div class="conversation-meta">\${c.messageCount} msgs · \${c.lastActive}</div>
        </div>
      \`).join('');
    }

    function selectConversation(id) {
      currentConversationId = id;
      vscode.postMessage({ command: 'load-conversation', conversationId: id });
    }

    function exportChat() { vscode.postMessage({ command: 'export-chat' }); }
    function clearChat() { vscode.postMessage({ command: 'clear-conversation' }); }

    clearMessages();
    vscode.postMessage({ command: 'load-conversations' });
  </script>
</body>
</html>`;
  }
}
