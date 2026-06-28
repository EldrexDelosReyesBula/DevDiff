import { SkillDefinition } from "./loader";

export class SkillRegistry {
  private static skills: Map<string, SkillDefinition> = new Map();

  static register(skill: SkillDefinition) {
    this.skills.set(skill.name, skill);
  }

  static get(name: string): SkillDefinition | undefined {
    return this.skills.get(name);
  }

  static list(): SkillDefinition[] {
    return Array.from(this.skills.values());
  }

  static discover(query?: {
    trigger?: string;
    tag?: string;
  }): SkillDefinition[] {
    let list = this.list();
    if (query?.trigger) {
      list = list.filter((s) => s.triggers.includes(query.trigger as any));
    }
    if (query?.tag) {
      list = list.filter((s) => s.tags?.includes(query.tag!));
    }
    return list;
  }
}
