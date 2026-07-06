import * as path from "path";
import { ParseResult, ParsedFileDiff } from "../diff/parser";
import { DiffChunk } from "./chunking-strategy";
import { DynamicTimeout } from "./providers/ollama";
import { AIExplanationResult } from "./providers/base";

export class ProgressiveChunking {
  private static readonly CHUNK_SIZES = [
    { maxFiles: 50, label: "large", timeoutMultiplier: 1.0 },
    { maxFiles: 25, label: "medium", timeoutMultiplier: 1.5 },
    { maxFiles: 10, label: "small", timeoutMultiplier: 2.0 },
    { maxFiles: 5, label: "tiny", timeoutMultiplier: 3.0 },
    { maxFiles: 1, label: "single", timeoutMultiplier: 5.0 },
  ];

  /**
   * Process diff with automatic size reduction on failure
   */
  static async processWithFallback(
    diff: ParseResult,
    modelSize: string,
    historicalAvgMs: number | undefined,
    processFn: (
      chunk: DiffChunk,
      timeoutMs: number,
    ) => Promise<AIExplanationResult>,
    onProgress: (stage: string, progress: number) => void,
  ): Promise<AIExplanationResult[]> {
    let currentSizeIndex = 0;

    while (currentSizeIndex < this.CHUNK_SIZES.length) {
      const sizeConfig = this.CHUNK_SIZES[currentSizeIndex];

      try {
        onProgress(
          `Processing in ${sizeConfig.label} chunks (max ${sizeConfig.maxFiles} files each)`,
          0,
        );

        const chunks = this.chunkBySize(diff, sizeConfig.maxFiles);
        const results: AIExplanationResult[] = [];

        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          const timeoutMs =
            DynamicTimeout.calculate({
              fileCount: chunk.files.length,
              estimatedTokens: chunk.estimatedTokens,
              modelSize: modelSize,
              historicalAvgMs: historicalAvgMs,
            }) * sizeConfig.timeoutMultiplier;

          onProgress(
            `Chunk ${i + 1}/${chunks.length} (${chunk.files.length} files, ${(timeoutMs / 1000).toFixed(0)}s timeout)`,
            Math.round((i / chunks.length) * 100),
          );

          try {
            const result = await processFn(chunk, timeoutMs);
            results.push(result);
          } catch (chunkError) {
            // Individual chunk failed — log and continue with stub
            console.log(
              `   ⚠️ Chunk ${i + 1} failed: ${(chunkError as Error).message}`,
            );
            results.push({
              summary: `*[Analysis unavailable for: ${chunk.label}]*`,
              impact: "none",
              breaking: false,
              files: chunk.files.map((f) => ({
                path: f.path || f.newPath || f.oldPath || "unknown",
                explanation:
                  "Analysis unavailable due to timeout or generation error.",
              })),
              relatedIssues: [],
            });
          }
        }

        onProgress("Merging results", 100);
        return results;
      } catch (error) {
        // Whole batch failed — try smaller chunks
        console.log(
          `   ⚠️ ${sizeConfig.label} chunks failed. Trying smaller chunks...`,
        );
        currentSizeIndex++;

        if (currentSizeIndex >= this.CHUNK_SIZES.length) {
          // All strategies exhausted — use template
          throw new Error(
            "All chunking strategies exhausted. Falling back to template mode.",
          );
        }
      }
    }

    throw new Error("Unreachable");
  }

  private static chunkBySize(diff: ParseResult, maxFiles: number): DiffChunk[] {
    const chunks: DiffChunk[] = [];

    // Sort by importance (most changed first)
    const sorted = [...diff.files].sort((a, b) => {
      const aSize = (a.additions || 0) + (a.deletions || 0);
      const bSize = (b.additions || 0) + (b.deletions || 0);
      return bSize - aSize;
    });

    for (let i = 0; i < sorted.length; i += maxFiles) {
      const chunkFiles = sorted.slice(i, i + maxFiles);
      const estimatedTokens =
        chunkFiles.reduce((sum, f) => {
          let fileLineLength = 0;
          if (f.hunks) {
            for (const h of f.hunks) {
              for (const l of h.lines) {
                fileLineLength += l.content.length;
              }
            }
          }
          return sum + fileLineLength;
        }, 0) / 3.5;

      chunks.push({
        id: `chunk-${chunks.length}`,
        files: chunkFiles,
        label: chunkFiles
          .map((f) =>
            path.basename(f.path || f.newPath || f.oldPath || "unknown"),
          )
          .join(", "),
        estimatedTokens: Math.ceil(estimatedTokens + 200),
        priority: i === 0 ? 1 : 2,
      });
    }

    return chunks;
  }
}
