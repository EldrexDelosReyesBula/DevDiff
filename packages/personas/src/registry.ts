import { Persona } from "./engine";
import { BUILTIN_PERSONAS } from "./built-in";

export { BUILTIN_PERSONAS };

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
