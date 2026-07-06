export class InjectionGuardV2 {
  private static promptPatterns = [
    /ignore\s+(all\s+)?(previous\s+)?(rules|instructions|constraints)/i,
    /you\s+are\s+now\s+an?\s+unrestricted/i,
    /you\s+are\s+now/i,
    /system:\s*override/i,
    /disregard.*(rules|instructions|constraints|training)/i,
    /pretend\s+you\s+are/i,
    /\[INST\]/i,
    /<\|im_start\|>/i,
  ];

  private static shellPatterns = [
    /;\s*(rm|sudo|curl|wget)/i,
    /\$\(/,
    /`[^`]*`/,
    /\|\s*bash/i,
    /\$IFS/,
  ];

  private static traversalPatterns = [
    /\.\.\/\.\./,
    /\.\.\\\.\./,
    /%2e%2e%2f/i,
    /%2e%2e%2f%2e%2e%2f/i,
  ];

  private static sqlPatterns = [
    /UNION\s+SELECT/i,
    /DROP\s+TABLE/i,
    /'\s*OR\s*'\d+'\s*=\s*'\d+'/i,
    /'\s*OR\s*'[a-zA-Z0-9]+'\s*=\s*'[a-zA-Z0-9]+'/i,
  ];

  private static xssPatterns = [
    /<script[\s>]/i,
    /<\/script>/i,
    /javascript:/i,
    /onerror\s*=/i,
    /onload\s*=/i,
    /<iframe[\s>]/i,
  ];

  private static protoPatterns = [/__proto__/, /constructor\.prototype/];

  static test(input: string): { safe: boolean; attacks: { type: string }[] } {
    const attacks: { type: string }[] = [];

    for (const p of this.promptPatterns) {
      if (p.test(input)) {
        attacks.push({ type: "promptInjection" });
        break;
      }
    }

    for (const p of this.shellPatterns) {
      if (p.test(input)) {
        attacks.push({ type: "shellInjection" });
        break;
      }
    }

    for (const p of this.traversalPatterns) {
      if (p.test(input)) {
        attacks.push({ type: "pathTraversal" });
        break;
      }
    }

    for (const p of this.sqlPatterns) {
      if (p.test(input)) {
        attacks.push({ type: "sqlInjection" });
        break;
      }
    }

    for (const p of this.xssPatterns) {
      if (p.test(input)) {
        attacks.push({ type: "xss" });
        break;
      }
    }

    for (const p of this.protoPatterns) {
      if (p.test(input)) {
        attacks.push({ type: "prototypePollution" });
        break;
      }
    }

    return {
      safe: attacks.length === 0,
      attacks,
    };
  }
}
