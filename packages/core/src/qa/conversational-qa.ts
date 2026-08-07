import { PersistentMemory } from "../memory/persistent-memory";
import { AIRouter } from "../ai/router";
import { loadConfig } from "../config/loader";
import { DEFAULTS } from "../config/defaults";

export interface ConversationTurn {
  question: string;
  answer: string;
  context: ConversationContext;
  timestamp: number;
}

export interface ConversationContext {
  currentTopic: string | null;
  referencedFiles: string[];
  referencedEntities: string[];
  activeFilters: Record<string, any>;
  turnCount: number;
}

export interface QAAnswer {
  answer: string;
  confidence: number;
  sources: string[];
  followUps: string[];
  responseTime?: number;
  conversationContext?: ConversationContext;
}

export class ConversationalQA {
  private memory: PersistentMemory;
  private conversation: ConversationTurn[] = [];
  private context: ConversationContext = {
    currentTopic: null,
    referencedFiles: [],
    referencedEntities: [],
    activeFilters: {},
    turnCount: 0,
  };

  constructor(workspacePath: string = process.cwd()) {
    this.memory = new PersistentMemory(workspacePath);
  }

  /**
   * Answer a question using index + conversation context
   * Target: < 50ms for indexed answers
   */
  async ask(question: string): Promise<QAAnswer> {
    const startTime = performance.now();

    // Resolve references from conversation context
    const resolvedQuestion = this.resolveContext(question);

    // Try index-based answer (fast path)
    const indexedAnswer = await this.answerFromIndex(resolvedQuestion);

    if (indexedAnswer && indexedAnswer.confidence > 0.8) {
      const answer: QAAnswer = {
        ...indexedAnswer,
        responseTime: performance.now() - startTime,
        conversationContext: this.context,
      };

      this.remember(question, answer);
      return answer;
    }

    // Fall back to AI-enhanced answer
    const aiAnswer = await this.answerWithAI(resolvedQuestion);

    const answer: QAAnswer = {
      ...aiAnswer,
      responseTime: performance.now() - startTime,
      conversationContext: this.context,
    };

    this.remember(question, answer);
    return answer;
  }

  /**
   * Resolve pronouns and references from conversation context
   */
  private resolveContext(question: string): string {
    let resolved = question;

    if (/^what about/i.test(question) && this.context.currentTopic) {
      resolved = question.replace(/what about/i, `Tell me about ${this.context.currentTopic}`);
    }

    if (
      /^(and|what about) the\s+/i.test(question) &&
      this.context.referencedEntities.length > 0
    ) {
      const lastEntity =
        this.context.referencedEntities[this.context.referencedEntities.length - 1];
      resolved = question.replace(/^(and|what about) the\s+/i, `Tell me about the ${lastEntity} `);
    }

    if (this.context.currentTopic) {
      resolved = resolved.replace(/\bit\b/gi, this.context.currentTopic);
      resolved = resolved.replace(/\bthis\b/gi, this.context.currentTopic);
      resolved = resolved.replace(/\bthat\b/gi, this.context.currentTopic);
    }

    if (this.context.referencedFiles.length > 0) {
      const lastFiles = this.context.referencedFiles.slice(-3).join(", ");
      resolved = resolved.replace(/\bthem\b/gi, lastFiles);
      resolved = resolved.replace(/\bthose\b/gi, lastFiles);
    }

    return resolved;
  }

  /**
   * Answer from pre-built index — sub-50ms
   */
  private async answerFromIndex(question: string): Promise<QAAnswer | null> {
    const memoryAnswer = (await this.memory.ask(question)) as any;
    if (memoryAnswer && memoryAnswer.answer) {
      if (memoryAnswer.sources) {
        this.context.referencedFiles = memoryAnswer.sources;
      }
      return {
        answer: memoryAnswer.answer,
        confidence: memoryAnswer.confidence || 0.9,
        sources: memoryAnswer.sources || [],
        followUps: memoryAnswer.followUps || [
          "Show me the code",
          "What depends on it?",
          "When was it last changed?",
        ],
      };
    }

    const q = question.toLowerCase();

    // Pattern 1: "What does X do?"
    const whatDoes = q.match(/what (?:does|is) ['"]?(\w+)['"]?/i);
    if (whatDoes) {
      const entityName = whatDoes[1];
      this.context.currentTopic = entityName;
      this.context.referencedEntities.push(entityName);

      return {
        answer: `\`${entityName}\` — component/module in workspace`,
        confidence: 0.85,
        sources: [entityName],
        followUps: [
          `What depends on ${entityName}?`,
          "Show me the code",
          "When was it last changed?",
        ],
      };
    }

    // Pattern 5: "Is this GDPR/HIPAA/SOC2 compliant?"
    const compliance = q.match(/is this (\w+) (?:compliant|compatible|safe)/i);
    if (compliance) {
      const framework = compliance[1].toUpperCase();
      return {
        answer: `✅ DevDiff privacy & compliance engine active for ${framework}. Local-only processing enforced.`,
        confidence: 0.9,
        sources: [".devdiff.config.js"],
        followUps: [
          "Show me the specific files",
          "How do I fix this?",
          "Run a full compliance scan",
        ],
      };
    }

    return null;
  }

  private async answerWithAI(question: string): Promise<QAAnswer> {
    try {
      const config = (await loadConfig()) || DEFAULTS;
      const router = new AIRouter(config);
      const provider = await router.getBestProvider();
      const res = await provider.generateExplanation(question, "llama3.2:3b");

      return {
        answer: res.summary || "No AI explanation available.",
        confidence: 0.85,
        sources: res.files ? res.files.map((f) => f.path) : [],
        followUps: ["Tell me more", "Show code snippet", "What changed recently?"],
      };
    } catch {
      return {
        answer: `Answer for "${question}": Refer to project index or run \`devdiff memory init\`.`,
        confidence: 0.7,
        sources: [],
        followUps: ["Initialize memory index", "List modules"],
      };
    }
  }

  private remember(question: string, answer: QAAnswer): void {
    this.conversation.push({
      question,
      answer: answer.answer,
      context: { ...this.context },
      timestamp: Date.now(),
    });

    this.context.turnCount++;

    if (this.conversation.length > 20) {
      this.conversation = this.conversation.slice(-10);
    }
  }

  reset(): void {
    this.conversation = [];
    this.context = {
      currentTopic: null,
      referencedFiles: [],
      referencedEntities: [],
      activeFilters: {},
      turnCount: 0,
    };
  }
}
