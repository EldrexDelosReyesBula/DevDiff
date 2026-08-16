import { ExplanationLevel } from "../levels";
import { CodeExplanation, UniversalExplainer } from "./universal";

export class RustExplainer {
  explain(params: {
    code: string;
    level: ExplanationLevel;
    filePath: string;
  }): CodeExplanation {
    const base = UniversalExplainer.explain({
      code: params.code,
      language: "Rust",
      level: params.level,
      filePath: params.filePath,
    });

    if (/&mut\s+|&'a\s+/i.test(params.code)) {
      base.sections.push({
        title: "Ownership & Borrowing",
        content: "Leverages Rust borrow checker semantics (`&mut` mutable references / lifetimes) for compile-time memory safety without a garbage collector.",
        importance: "essential",
      });
      base.relatedConcepts.push("Ownership", "Borrowing Rules", "Lifetimes");
    }

    return base;
  }
}
