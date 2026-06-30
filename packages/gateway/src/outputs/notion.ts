export interface NotionConfig {
  token: string;
  databaseId?: string;
  pageId?: string;
  /** Title of the page to create. Defaults to a timestamp-based title. */
  title?: string;
}

interface NotionRichTextItem {
  type: "text";
  text: { content: string };
}

interface NotionBlock {
  object: "block";
  type: string;
  [key: string]: any;
}

function markdownToNotionBlocks(markdown: string): NotionBlock[] {
  const blocks: NotionBlock[] = [];
  const lines = markdown.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("# ")) {
      blocks.push({
        object: "block",
        type: "heading_1",
        heading_1: { rich_text: [rt(line.slice(2))] },
      });
    } else if (line.startsWith("## ")) {
      blocks.push({
        object: "block",
        type: "heading_2",
        heading_2: { rich_text: [rt(line.slice(3))] },
      });
    } else if (line.startsWith("### ")) {
      blocks.push({
        object: "block",
        type: "heading_3",
        heading_3: { rich_text: [rt(line.slice(4))] },
      });
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      blocks.push({
        object: "block",
        type: "bulleted_list_item",
        bulleted_list_item: { rich_text: [rt(line.slice(2))] },
      });
    } else if (/^\d+\.\s/.test(line)) {
      blocks.push({
        object: "block",
        type: "numbered_list_item",
        numbered_list_item: { rich_text: [rt(line.replace(/^\d+\.\s/, ""))] },
      });
    } else if (line.startsWith("```")) {
      // Code block — collect until closing ```
      const langLine = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({
        object: "block",
        type: "code",
        code: {
          rich_text: [rt(codeLines.join("\n"))],
          language: langLine || "plain text",
        },
      });
    } else if (line.startsWith("> ")) {
      blocks.push({
        object: "block",
        type: "quote",
        quote: { rich_text: [rt(line.slice(2))] },
      });
    } else if (line.trim() === "" || line.trim() === "---") {
      blocks.push({ object: "block", type: "divider", divider: {} });
    } else {
      blocks.push({
        object: "block",
        type: "paragraph",
        paragraph: { rich_text: [rt(line)] },
      });
    }
  }

  return blocks;
}

function rt(text: string): NotionRichTextItem {
  return { type: "text", text: { content: text.slice(0, 2000) } };
}

export class NotionOutputter {
  private static BASE_URL = "https://api.notion.com/v1";
  private static API_VERSION = "2022-06-28";

  /**
   * Creates a new Notion page in a database or under a parent page.
   */
  static async createPage(
    config: NotionConfig,
    content: string,
  ): Promise<{
    success: boolean;
    pageUrl?: string;
    pageId?: string;
    error?: string;
  }> {
    if (!config.token) {
      return { success: false, error: "Notion token is required." };
    }
    if (!config.databaseId && !config.pageId) {
      return {
        success: false,
        error: "Either databaseId or pageId is required.",
      };
    }

    const title =
      config.title ||
      `DevDiff Changelog — ${new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}`;

    // Notion API limits blocks to 100 per request; we'll send in chunks
    const allBlocks = markdownToNotionBlocks(content);
    const firstBatch = allBlocks.slice(0, 100);
    const remainingBlocks = allBlocks.slice(100);

    const parent = config.databaseId
      ? { database_id: config.databaseId }
      : { page_id: config.pageId! };

    const body = {
      parent,
      properties: {
        Name: {
          title: [{ text: { content: title } }],
        },
      },
      children: firstBatch,
    };

    try {
      const response = await fetch(`${this.BASE_URL}/pages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.token}`,
          "Content-Type": "application/json",
          "Notion-Version": this.API_VERSION,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errBody = await response.text();
        return {
          success: false,
          error: `Notion API error ${response.status}: ${errBody}`,
        };
      }

      const data = (await response.json()) as any;
      const pageId = data.id as string;
      const pageUrl = data.url as string;

      // Append remaining blocks if any
      if (remainingBlocks.length > 0) {
        for (let i = 0; i < remainingBlocks.length; i += 100) {
          const batch = remainingBlocks.slice(i, i + 100);
          await fetch(`${this.BASE_URL}/blocks/${pageId}/children`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${config.token}`,
              "Content-Type": "application/json",
              "Notion-Version": this.API_VERSION,
            },
            body: JSON.stringify({ children: batch }),
          });
        }
      }

      console.log(`[Notion] Page created: ${pageUrl}`);
      return { success: true, pageUrl, pageId };
    } catch (err: any) {
      return { success: false, error: `Network error: ${err.message}` };
    }
  }
}
