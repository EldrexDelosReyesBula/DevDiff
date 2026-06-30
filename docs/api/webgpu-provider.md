# WebGPU Provider API Reference

The `WebGPUProvider` implements local model inference accelerated by WebGPU.

## Import

```typescript
import { WebGPUProvider } from "@eldrex/core";
```

## Constructor

```typescript
const provider = new WebGPUProvider();
```

## Methods

### `initialize(config?: { model, quantization }): Promise<void>`

Requests WebGPU adapters and devices, compile shaders, and load model weights into GPU memory buffers.

### `generate(prompt: string): Promise<AsyncGenerator<string>>`

Executes WebGPU compute passes and streams detokenized text results.

### `generateExplanation(diffText: string, modelName: string): Promise<AIExplanationResult>`

Generates a structured changelog explanation based on a raw diff.
