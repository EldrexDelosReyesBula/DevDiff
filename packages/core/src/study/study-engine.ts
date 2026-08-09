import * as path from "path";
import { loadConfig } from "../config/loader";
import { AIRouter } from "../ai/router";
import { UniversalProjectDetector, ProjectDetection } from "../detection/universal-detector";

export interface LearningStep {
  step: number;
  title: string;
  durationMinutes: number;
  explanation: string;
  relevantFiles: string[];
  keyConcept: string;
}

export interface LearningPath {
  topic: string;
  overview: string;
  totalDurationMinutes: number;
  steps: LearningStep[];
  quizQuestions: string[];
}

export interface CodebaseTourSection {
  category: string;
  description: string;
  files: Array<{ path: string; purpose: string }>;
}

export interface CodebaseTour {
  projectName: string;
  overview: string;
  techStack: string[];
  sections: CodebaseTourSection[];
  suggestedFirstFiles: string[];
  explorationPrompts: string[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface StudyQuiz {
  topic: string;
  questions: QuizQuestion[];
}

export class StudyEngine {
  private workspacePath: string;

  constructor(workspacePath: string = process.cwd()) {
    this.workspacePath = workspacePath;
  }

  /**
   * Educational line-by-line explanation of code
   */
  async explainCode(codeSnippet: string, filePath?: string): Promise<string> {
    const config = await loadConfig(this.workspacePath);
    const router = new AIRouter(config);

    const prompt = `You are a friendly, patient senior developer teaching a student. Explain this code for learning:

File: ${filePath || "code snippet"}
\`\`\`
${codeSnippet}
\`\`\`

Structure your response into:
1. ## 📖 Overview & Purpose (Simple plain-English summary)
2. ## 🔍 Line-by-Line Breakdown (With 'Why?' explanations for design decisions)
3. ## 🔐 Key Concepts Learned (Bullet points with clear definitions)
4. ## 🚀 Related Concepts to Explore
5. ## 🧪 Try It Yourself (Small experiments/changes to try)`;

    const response = await router.getExplanation(prompt, {
      depth: "deep",
      projectContext: "Study Buddy Mode: Patient educational explanation for learning developers.",
      personaId: "study-buddy",
    });

    return response.summary;
  }

  /**
   * Generates a step-by-step learning path for a topic mapped to real codebase files
   */
  async generateLearningPath(topic: string): Promise<LearningPath> {
    const detection = UniversalProjectDetector.detect(this.workspacePath);
    const config = await loadConfig(this.workspacePath);
    const router = new AIRouter(config);

    const prompt = `Create a step-by-step 5-step learning path for a student learning "${topic}" in this repository.
Project type: ${detection.type}
Primary language: ${detection.primaryLanguage}
Languages detected: ${detection.languages.map((l) => l.name).join(", ")}

Respond with a JSON object matching this schema:
{
  "topic": "${topic}",
  "overview": "Clear overview of what the student will learn",
  "totalDurationMinutes": 30,
  "steps": [
    {
      "step": 1,
      "title": "Step Title",
      "durationMinutes": 5,
      "explanation": "What to study in this step",
      "relevantFiles": ["path/to/file.ts"],
      "keyConcept": "Core Concept"
    }
  ],
  "quizQuestions": [
    "Question 1 about this topic?",
    "Question 2 about this topic?"
  ]
}`;

    try {
      const response = await router.getExplanation(prompt, {
        depth: "deep",
        projectContext: "Study Buddy Learning Path",
      });

      const parsed = JSON.parse(
        response.summary.substring(
          response.summary.indexOf("{"),
          response.summary.lastIndexOf("}") + 1,
        ),
      );
      return parsed;
    } catch {
      return {
        topic,
        overview: `Learn about ${topic} in this repository.`,
        totalDurationMinutes: 25,
        steps: [
          {
            step: 1,
            title: `Understanding ${topic} Basics`,
            durationMinutes: 5,
            explanation: `Review entry points and configuration for ${topic}.`,
            relevantFiles: detection.entryPoints.slice(0, 2),
            keyConcept: `Core ${topic} flow`,
          },
          {
            step: 2,
            title: `Tracing ${topic} Handlers`,
            durationMinutes: 10,
            explanation: `Follow request/event lifecycle.`,
            relevantFiles: detection.entryPoints.slice(0, 1),
            keyConcept: `Data flow`,
          },
        ],
        quizQuestions: [
          `What is the primary role of ${topic} in this codebase?`,
          `How are errors handled during ${topic} processing?`,
        ],
      };
    }
  }

  /**
   * Generates a 5-minute tour for newcomers exploring a repository
   */
  async generateCodebaseTour(): Promise<CodebaseTour> {
    const detection = UniversalProjectDetector.detect(this.workspacePath);
    const projectName = path.basename(this.workspacePath);

    return {
      projectName,
      overview: `Welcome to ${projectName}! This is a ${detection.type} project written primarily in ${detection.primaryLanguage}.`,
      techStack: detection.languages.map((l) => `${l.name} (${l.fileCount} files)`),
      sections: [
        {
          category: "Core Engine & Logic",
          description: "Contains main domain logic and entry points.",
          files: detection.entryPoints.map((ep) => ({
            path: ep,
            purpose: "Primary workspace entry point",
          })),
        },
        {
          category: "Frameworks & Tools",
          description: "Detected frameworks and web libraries.",
          files: detection.frameworks.map((f) => ({
            path: "configuration",
            purpose: `Framework integration: ${f}`,
          })),
        },
      ],
      suggestedFirstFiles: detection.entryPoints.slice(0, 3),
      explorationPrompts: [
        "Show me how data flows from entry point to output",
        "Explain the database or storage layer",
        "What security and validation guards are present?",
      ],
    };
  }

  /**
   * Generates an interactive self-quiz on a codebase topic
   */
  async generateQuiz(topic: string): Promise<StudyQuiz> {
    return {
      topic,
      questions: [
        {
          id: 1,
          question: `What is the primary purpose of ${topic} in this architecture?`,
          options: [
            "Encrypting secret credentials at rest",
            "Verifying user identity and enforcing request security",
            "Parsing raw HTML strings into DOM elements",
            "Managing static CSS stylesheets",
          ],
          correctAnswerIndex: 1,
          explanation: `${topic} verifies identity and ensures requests meet security standards before processing.`,
        },
        {
          id: 2,
          question: `Which data structure best prevents duplicate entries in ${topic}?`,
          options: ["Array", "Set", "Linked List", "Queue"],
          correctAnswerIndex: 1,
          explanation: "Sets enforce element uniqueness automatically.",
        },
      ],
    };
  }
}
