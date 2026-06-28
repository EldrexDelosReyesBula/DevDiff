import { cosmiconfig } from "cosmiconfig";
import { ConfigSchema, DevDiffConfig } from "./schema";
import { DEFAULTS } from "./defaults";

const MODULE_NAME = "devdiff";

export async function loadConfig(searchFrom?: string): Promise<DevDiffConfig> {
  const explorer = cosmiconfig(MODULE_NAME, {
    searchPlaces: [
      `.${MODULE_NAME}rc`,
      `.${MODULE_NAME}rc.json`,
      `.${MODULE_NAME}rc.yaml`,
      `.${MODULE_NAME}rc.yml`,
      `.${MODULE_NAME}rc.js`,
      `.${MODULE_NAME}rc.mjs`,
      `.${MODULE_NAME}rc.cjs`,
      `${MODULE_NAME}.config.js`,
      `${MODULE_NAME}.config.mjs`,
      `${MODULE_NAME}.config.cjs`,
      "package.json",
    ],
  });

  try {
    const result = await explorer.search(searchFrom);
    if (!result || !result.config) {
      return DEFAULTS;
    }

    // Parse and validate config
    const parsed = ConfigSchema.parse(result.config);

    // Deep merge with defaults for any missing nested structures
    return {
      ...DEFAULTS,
      ...parsed,
      ai: {
        ...DEFAULTS.ai,
        ...parsed.ai,
        routing: {
          ...DEFAULTS.ai.routing,
          ...parsed.ai?.routing,
        },
        providers: parsed.ai?.providers?.length
          ? parsed.ai.providers
          : DEFAULTS.ai.providers,
      },
      cache: {
        ...DEFAULTS.cache,
        ...parsed.cache,
      },
    };
  } catch (error) {
    console.warn(
      "Failed to load DevDiff configuration, falling back to defaults:",
      error,
    );
    return DEFAULTS;
  }
}
