import * as fs from "fs/promises";
import * as path from "path";
import yaml from "js-yaml";
import { Persona } from "./engine";
import { PersonaRegistry } from "./registry";

export class CustomPersonaLoader {
  /**
   * Loads a custom persona from a YAML configuration file.
   * If the persona extends an existing persona, it will inherit and override properties.
   */
  static async loadFromFile(filePath: string): Promise<Persona> {
    const rawContent = await fs.readFile(filePath, "utf-8");
    const parsed = yaml.load(rawContent) as Partial<Persona> & {
      extends?: string;
    };

    if (!parsed.id) {
      throw new Error(
        `Custom persona file at ${filePath} is missing required 'id' field.`,
      );
    }

    let basePersona: Partial<Persona> = {};
    if (parsed.extends) {
      const inherited = PersonaRegistry.get(parsed.extends);
      if (!inherited) {
        throw new Error(
          `Persona '${parsed.id}' extends unknown persona '${parsed.extends}'.`,
        );
      }
      basePersona = { ...inherited };
    }

    // Merge base persona with overrides
    const mergedPersona: Persona = {
      id: parsed.id,
      name: parsed.name ?? basePersona.name ?? parsed.id,
      description: parsed.description ?? basePersona.description ?? "",
      tone: parsed.tone ?? basePersona.tone ?? "technical",
      verbosity: parsed.verbosity ?? basePersona.verbosity ?? 3,
      focus: parsed.focus ?? basePersona.focus ?? [],
      ignore: parsed.ignore ?? basePersona.ignore ?? [],
      format_preference:
        parsed.format_preference ?? basePersona.format_preference ?? "mixed",
      emoji_usage: parsed.emoji_usage ?? basePersona.emoji_usage ?? false,
      jargon_level:
        parsed.jargon_level ?? basePersona.jargon_level ?? "moderate",
      system_prompt: parsed.system_prompt ?? basePersona.system_prompt ?? "",
    };

    PersonaRegistry.register(mergedPersona);
    return mergedPersona;
  }

  /**
   * Discovers and loads all custom personas in a directory.
   */
  static async loadDirectory(dirPath: string): Promise<Persona[]> {
    const loaded: Persona[] = [];
    try {
      const files = await fs.readdir(dirPath);
      for (const file of files) {
        if (file.endsWith(".yaml") || file.endsWith(".yml")) {
          try {
            const persona = await this.loadFromFile(path.join(dirPath, file));
            loaded.push(persona);
          } catch (err) {
            console.error(`Failed to load custom persona from ${file}:`, err);
          }
        }
      }
    } catch (err) {
      // Directory may not exist, ignore
    }
    return loaded;
  }
}
