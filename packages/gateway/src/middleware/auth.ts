import { IncomingMessage, ServerResponse } from "http";

export class AuthMiddleware {
  private apiKeys: Set<string>;

  constructor(apiKeys: string[] = []) {
    this.apiKeys = new Set(apiKeys);
  }

  /**
   * Validates the request headers. If invalid, returns false and writes an error response.
   */
  handle(req: IncomingMessage, res: ServerResponse): boolean {
    // If no keys configured, allow all (development fallback)
    if (this.apiKeys.size === 0) {
      return true;
    }

    const authHeader = req.headers["authorization"];
    const apiKeyHeader = req.headers["x-api-key"];

    let token = "";
    if (apiKeyHeader) {
      token = String(apiKeyHeader);
    } else if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    if (!token || !this.apiKeys.has(token)) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({ error: "Unauthorized: Invalid or missing API key." }),
      );
      return false;
    }

    return true;
  }
}
