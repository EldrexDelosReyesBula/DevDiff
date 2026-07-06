import * as fs from "fs/promises";
import * as path from "path";

export interface TeamAnnotation {
  id: string;
  author: string;
  timestamp: string;
  filePath?: string;
  lineNumber?: number;
  type: "comment" | "question" | "approval" | "rejection" | "clarification";
  content: string;
  resolved: boolean;
  resolvedBy?: string;
  replies: TeamAnnotation[];
}

export interface ReviewSummary {
  total: number;
  approved: number;
  rejected: number;
  questions: number;
  comments: number;
  authors: string[];
  pendingReview: number;
}

export class TeamCollaboration {
  /**
   * Add annotation to changelog
   */
  static async annotate(params: {
    changelogPath: string;
    annotation: Omit<TeamAnnotation, "id" | "timestamp" | "replies">;
  }): Promise<TeamAnnotation> {
    const annotation: TeamAnnotation = {
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      replies: [],
      ...params.annotation,
    };

    const annotationsDir = path.join(
      path.dirname(params.changelogPath),
      ".devdiff",
      "annotations"
    );

    // Ensure annotations folder exists
    await fs.mkdir(annotationsDir, { recursive: true });

    const annotationPath = path.join(annotationsDir, `${annotation.id}.json`);
    await fs.writeFile(annotationPath, JSON.stringify(annotation, null, 2));

    return annotation;
  }

  /**
   * Generate team review summary
   */
  static async getReviewSummary(changelogPath: string): Promise<ReviewSummary> {
    const annotationsDir = path.join(
      path.dirname(changelogPath),
      ".devdiff",
      "annotations"
    );

    const annotations = await this.loadAllAnnotations(annotationsDir);

    return {
      total: annotations.length,
      approved: annotations.filter((a) => a.type === "approval" && a.resolved).length,
      rejected: annotations.filter((a) => a.type === "rejection").length,
      questions: annotations.filter((a) => a.type === "question" && !a.resolved).length,
      comments: annotations.filter((a) => a.type === "comment").length,
      authors: [...new Set(annotations.map((a) => a.author))],
      pendingReview: annotations.filter((a) => !a.resolved).length,
    };
  }

  /**
   * Load all annotations in the given directory
   */
  private static async loadAllAnnotations(annotationsDir: string): Promise<TeamAnnotation[]> {
    try {
      const files = await fs.readdir(annotationsDir);
      const annotations: TeamAnnotation[] = [];
      
      for (const file of files) {
        if (file.endsWith(".json")) {
          const content = await fs.readFile(path.join(annotationsDir, file), "utf-8");
          try {
            annotations.push(JSON.parse(content));
          } catch {
            // Ignore corrupted JSON
          }
        }
      }
      return annotations;
    } catch {
      return [];
    }
  }
}
