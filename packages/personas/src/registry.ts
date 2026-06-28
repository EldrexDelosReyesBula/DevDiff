import { Persona } from "./engine";
import { developer } from "./built-in/developer";
import { ceo } from "./built-in/ceo";
import { dataAnalyst } from "./built-in/data-analyst";
import { educator } from "./built-in/educator";
import { robot } from "./built-in/robot";
import { journalist } from "./built-in/journalist";
import { pm } from "./built-in/pm";
import { compliance } from "./built-in/compliance";

export const BUILTIN_PERSONAS: Record<string, Persona> = {
  developer,
  ceo,
  "data-analyst": dataAnalyst,
  educator,
  robot,
  journalist,
  pm,
  compliance,
};

export class PersonaRegistry {
  private static customPersonas: Map<string, Persona> = new Map();

  static get(id: string): Persona | undefined {
    return BUILTIN_PERSONAS[id] || this.customPersonas.get(id);
  }

  static register(persona: Persona): void {
    this.customPersonas.set(persona.id, persona);
  }

  static list(): Persona[] {
    return [
      ...Object.values(BUILTIN_PERSONAS),
      ...Array.from(this.customPersonas.values()),
    ];
  }

  static clearCustom(): void {
    this.customPersonas.clear();
  }
}
