import { z } from "zod";
import * as crypto from "crypto";

export class GitHubWebhookParser {
  /**
   * Validates GitHub webhook HMAC-SHA256 signature.
   * @param secret  The webhook secret configured in GitHub.
   * @param body    The raw request body as a string.
   * @param signature The value of `X-Hub-Signature-256` header.
   */
  static verifySignature(
    secret: string,
    body: string,
    signature: string,
  ): boolean {
    if (!secret || !body || !signature) return false;

    const expected = `sha256=${crypto
      .createHmac("sha256", secret)
      .update(body, "utf8")
      .digest("hex")}`;

    // Constant-time comparison to prevent timing attacks
    try {
      return crypto.timingSafeEqual(
        Buffer.from(expected, "utf8"),
        Buffer.from(signature, "utf8"),
      );
    } catch {
      // Buffers of different lengths would throw — treat as mismatch
      return false;
    }
  }

  static parse(
    headers: Record<string, string>,
    body: any,
    options?: { secret?: string; rawBody?: string },
  ): { event: string; payload: any } | null {
    const eventType = headers["x-github-event"];
    if (!eventType) return null;

    // HMAC validation (if secret provided)
    if (options?.secret && options?.rawBody) {
      const sig = headers["x-hub-signature-256"] || headers["x-hub-signature"];
      if (!sig) {
        console.warn(
          "[GitHubWebhook] Missing signature header — request rejected",
        );
        return null;
      }
      if (!this.verifySignature(options.secret, options.rawBody, sig)) {
        console.warn(
          "[GitHubWebhook] HMAC signature mismatch — request rejected",
        );
        return null;
      }
    }

    if (eventType === "push") {
      const ref = body.ref || "";
      const branch = ref.replace("refs/heads/", "");
      return {
        event: "git_push",
        payload: {
          id: body.after,
          source: "webhook",
          repository: {
            url: body.repository?.html_url,
            path: body.repository?.name || "",
            branch,
          },
          change_range: {
            from: body.before,
            to: body.after,
            commit_count: body.commits?.length || 0,
          },
        },
      };
    }

    if (eventType === "pull_request") {
      const action = body.action;
      if (["opened", "synchronize", "reopened"].includes(action)) {
        return {
          event: "pull_request",
          payload: {
            id: body.pull_request?.head?.sha,
            source: "webhook",
            repository: {
              url: body.repository?.html_url,
              path: body.repository?.name || "",
              branch: body.pull_request?.base?.ref || "main",
            },
            change_range: {
              from: body.pull_request?.base?.sha,
              to: body.pull_request?.head?.sha,
            },
          },
        };
      }
    }

    return null;
  }
}
