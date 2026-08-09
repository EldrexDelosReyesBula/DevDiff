/**
 * DevDiff MCP Codebase Query Tools — v1.5.0
 *
 * Knowledge layer for IDE agents (Copilot, Gemini, Claude, Cursor, Windsurf).
 * These tools return structured data from the persistent codebase index.
 * The IDE agent uses its OWN tokens to synthesize the final natural-language response.
 *
 * DevDiff provides KNOWLEDGE (10-50ms). IDE agent provides INTELLIGENCE.
 */

export const CODEBASE_QUERY_TOOLS = [
  {
    name: "devdiff_query_entity",
    description:
      "Get complete information about a function, class, component, or module — its purpose, file location, dependencies, and full change history. Use when a developer asks about a specific named entity.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Entity name (function, class, component, module, etc.)",
        },
        include_history: {
          type: "boolean",
          description: "Include full change history (default: true)",
          default: true,
        },
        include_dependencies: {
          type: "boolean",
          description: "Include what depends on this entity (default: true)",
          default: true,
        },
      },
      required: ["name"],
    },
  },
  {
    name: "devdiff_query_changes",
    description:
      'Get all code changes in a time period. Perfect for "what changed today?", "what changed this week?", "what was modified in the auth module?". Returns structured entity-level change data.',
    inputSchema: {
      type: "object",
      properties: {
        since: {
          type: "string",
          description:
            'Time range: "today", "yesterday", "24h", "7d", "1 week", "1 month", "2026-07-01"',
        },
        filter: {
          type: "string",
          description:
            "Filter by change type: all, added, modified, refactored, breaking",
          default: "all",
        },
        module: {
          type: "string",
          description:
            'Limit to a specific module or directory path (optional). Example: "auth", "src/api"',
        },
      },
      required: ["since"],
    },
  },
  {
    name: "devdiff_query_dependencies",
    description:
      "Get the dependency graph for any entity — what it depends on (upstream) and what depends on it (downstream). Use when a developer asks about impact analysis or coupling.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Entity name to get dependencies for",
        },
        direction: {
          type: "string",
          description:
            "upstream (what it depends on), downstream (what depends on it), both",
          default: "both",
        },
        max_depth: {
          type: "number",
          description: "How many levels deep to traverse the dependency graph",
          default: 2,
        },
      },
      required: ["name"],
    },
  },
  {
    name: "devdiff_query_architecture",
    description:
      "Get the project architecture — all modules, their relationships, and how they connect. Optionally includes a Mermaid diagram. Use for architecture questions, onboarding, or code reviews.",
    inputSchema: {
      type: "object",
      properties: {
        module: {
          type: "string",
          description:
            "Focus on a specific module (optional — omit for full project)",
        },
        include_diagram: {
          type: "boolean",
          description: "Include Mermaid graph diagram syntax in the response",
          default: false,
        },
      },
    },
  },
  {
    name: "devdiff_query_search",
    description:
      "Search the entire indexed codebase for files, functions, classes, or components matching a query. Supports partial name matching and file path search.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Search query — supports partial names and path segments",
        },
        type: {
          type: "string",
          description: "Search type: entity (functions/classes), file, all",
          default: "all",
        },
        limit: {
          type: "number",
          description: "Maximum number of results to return",
          default: 10,
        },
      },
      required: ["query"],
    },
  },
  {
    name: "devdiff_query_compliance",
    description:
      "Scan the codebase index for compliance issues — potential secrets exposure, PII handling, GDPR concerns, HIPAA patterns, and security anti-patterns. Use when a developer asks about compliance or security.",
    inputSchema: {
      type: "object",
      properties: {
        framework: {
          type: "string",
          description: "Compliance framework to check: gdpr, hipaa, soc2, all",
          default: "all",
        },
        severity: {
          type: "string",
          description:
            "Minimum severity to include: low, medium, high, critical",
          default: "medium",
        },
      },
    },
  },
  {
    name: "devdiff_query_stats",
    description:
      "Get codebase statistics — file counts, entity counts, language breakdown, module count, last scan time. Optionally includes trends vs. previous snapshot.",
    inputSchema: {
      type: "object",
      properties: {
        include_trends: {
          type: "boolean",
          description:
            "Include delta trends vs previous scan (requires 2+ snapshots)",
          default: false,
        },
      },
    },
  },
  {
    name: "devdiff_query_timeline",
    description:
      "Get a chronological timeline of all significant changes to a specific entity or module. Use for 'show me the history of X' or 'what has changed in Y over the last 3 months'.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Entity or module name to get the timeline for",
        },
        since: {
          type: "string",
          description: 'How far back to look: "30d", "6 months", "2026-01-01"',
          default: "30d",
        },
      },
      required: ["name"],
    },
  },
];
