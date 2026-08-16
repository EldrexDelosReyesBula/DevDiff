import * as vscode from "vscode";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  metadata?: {
    model?: string;
    confidence?: number;
    responseTime?: number;
  };
}

export interface ChatConversation {
  id: string;
  title: string | null;
  messages: ChatMessage[];
  createdAt: string;
  lastActive: string;
  messageCount: number;
}

export interface ChatConversationSummary {
  id: string;
  title: string;
  messageCount: number;
  lastActive: string;
  createdAt: string;
}

export class ChatHistory {
  private static inMemoryStore: Record<string, ChatConversation> = {};

  /**
   * Create a new conversation thread
   */
  static async createConversation(
    context?: vscode.ExtensionContext,
    title?: string,
  ): Promise<string> {
    const conversationId = `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const conversation: ChatConversation = {
      id: conversationId,
      title: title || null,
      messages: [],
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      messageCount: 0,
    };

    await this.saveConversation(conversation, context);
    return conversationId;
  }

  static async addMessage(
    conversationId: string,
    message: ChatMessage,
    context?: vscode.ExtensionContext,
  ): Promise<void> {
    const conversation = await this.getConversation(conversationId, context);
    if (!conversation) return;

    conversation.messages.push(message);
    conversation.messageCount = conversation.messages.length;
    conversation.lastActive = new Date().toISOString();

    if (!conversation.title && message.role === "user") {
      conversation.title = message.content.slice(0, 50);
    }

    await this.saveConversation(conversation, context);
  }

  static async getConversation(
    conversationId: string,
    context?: vscode.ExtensionContext,
  ): Promise<ChatConversation | null> {
    const conversations = this.loadConversations(context);
    return conversations[conversationId] || null;
  }

  static async getAllConversations(
    context?: vscode.ExtensionContext,
  ): Promise<ChatConversationSummary[]> {
    const conversations = this.loadConversations(context);

    return Object.values(conversations)
      .sort(
        (a, b) =>
          new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime(),
      )
      .map((c) => ({
        id: c.id,
        title: c.title || "New Conversation",
        messageCount: c.messageCount,
        lastActive: this.formatRelativeTime(c.lastActive),
        createdAt: c.createdAt,
      }));
  }

  static async searchConversations(
    query: string,
    context?: vscode.ExtensionContext,
  ): Promise<ChatConversationSummary[]> {
    const all = await this.getAllConversations(context);
    if (!query || query.trim().length === 0) return all;

    const lowerQuery = query.toLowerCase();
    return all.filter(
      (c) =>
        c.title.toLowerCase().includes(lowerQuery) || c.id.includes(lowerQuery),
    );
  }

  static async clearConversation(
    conversationId: string,
    context?: vscode.ExtensionContext,
  ): Promise<void> {
    const conversations = this.loadConversations(context);
    delete conversations[conversationId];

    if (context) {
      await context.globalState.update(
        "devdiff.chat.conversations",
        conversations,
      );
    } else {
      delete this.inMemoryStore[conversationId];
    }
  }

  static async exportConversation(
    conversationId: string,
    context?: vscode.ExtensionContext,
  ): Promise<string> {
    const conversation = await this.getConversation(conversationId, context);
    if (!conversation) return "";

    const lines: string[] = [];

    lines.push(`# DevDiff Chat — ${conversation.title || "Conversation"}`);
    lines.push(`Exported: ${new Date().toLocaleString()}`);
    lines.push("");
    lines.push("---");
    lines.push("");

    for (const message of conversation.messages) {
      const role = message.role === "user" ? "👤 You" : "🤖 DevDiff";
      const time = new Date(message.timestamp).toLocaleTimeString();

      lines.push(`## ${role} (${time})`);
      lines.push("");
      lines.push(message.content);
      lines.push("");
      lines.push("---");
      lines.push("");
    }

    return lines.join("\n");
  }

  private static loadConversations(
    context?: vscode.ExtensionContext,
  ): Record<string, ChatConversation> {
    if (context) {
      return (
        context.globalState.get<Record<string, ChatConversation>>(
          "devdiff.chat.conversations",
          {},
        ) || {}
      );
    }
    return this.inMemoryStore;
  }

  private static async saveConversation(
    conversation: ChatConversation,
    context?: vscode.ExtensionContext,
  ): Promise<void> {
    const conversations = this.loadConversations(context);
    conversations[conversation.id] = conversation;

    if (context) {
      await context.globalState.update(
        "devdiff.chat.conversations",
        conversations,
      );
    } else {
      this.inMemoryStore[conversation.id] = conversation;
    }
  }

  private static formatRelativeTime(isoString: string): string {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  }
}
