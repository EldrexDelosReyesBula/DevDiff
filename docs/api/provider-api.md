# Custom AI Provider API Reference

The AI Provider API in `@eldrex/core` allows developers to implement custom LLM integrations (e.g. self-hosted vLLM servers, internal corporate gateways, or proprietary AI endpoints).

---

## 📦 Import Syntax

```typescript
import { AIProvider, AIExplanationResult, ProviderConfig } from "@eldrex/core";
```

---

## 🧩 Interface Specification

```typescript
export interface AIProvider {
  name: string;
  generateExplanation(
    diffText: string,
    model: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
      customHeaders?: Record<string, string>;
    }
  ): Promise<AIExplanationResult>;
}

export interface AIExplanationResult {
  rawOutput: string;
  formattedOutput: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  durationMs: number;
  model: string;
}
```
