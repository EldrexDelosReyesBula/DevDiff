import { SkillLoader } from "@eldrex/core";

export const devdiff_read_skill = {
  name: "devdiff_read_skill",
  description: `
Read the project's SKILL.md file — the universal instruction document
that all AI agents must follow when working with this codebase.

This file defines:
• How changelogs should be formatted
• Naming conventions
• Architecture overview
• Code review preferences
• Anti-patterns to avoid
• Agent permissions

ALWAYS read this before generating changelogs, reviewing code,
or making suggestions for this project.
  `,
  inputSchema: {
    type: "object",
    properties: {
      section: {
        type: "string",
        description:
          "Specific section to read: changelog, architecture, naming, review, permissions, or all",
      },
    },
  },

  handler: async (params: { section?: string }) => {
    const skill = SkillLoader.load(process.cwd());

    if (!skill) {
      return {
        content: [
          {
            type: "text",
            text: [
              "No SKILL.md found in this project.",
              "",
              "Create one to standardize how all AI agents work with your codebase:",
              "```bash",
              "devdiff skill generate",
              "```",
              "",
              "This creates a SKILL.md that DevDiff, Copilot, Gemini,",
              "Claude, and all compatible agents will follow.",
            ].join("\n"),
          },
        ],
      };
    }

    // Return requested section or full document
    if (params?.section && params.section !== "all") {
      const section = skill.sections.find((s) =>
        s.title.toLowerCase().includes(params.section!.toLowerCase()),
      );

      if (section) {
        return {
          content: [
            {
              type: "text",
              text: [
                `## ${section.title}`,
                "",
                ...section.content,
                "",
                ...section.subsections.flatMap((sub) => [
                  `### ${sub.title}`,
                  "",
                  ...sub.content,
                  "",
                ]),
              ].join("\n"),
            },
          ],
        };
      }
    }

    // Return full SKILL.md
    return {
      content: [
        {
          type: "text",
          text: skill.raw,
        },
      ],
    };
  },
};
