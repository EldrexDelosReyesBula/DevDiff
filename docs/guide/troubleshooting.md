# Troubleshooting

Common issues and resolutions for DevDiff.

## MIME Type Errors in Docs
If you see console MIME type errors when running the VitePress documentation server locally, it indicates that referenced sidebar routes are missing from the filesystem. Ensure all sidebar routes declared in `config.ts` have corresponding `.md` files in `docs/`.

## Local LLM Connection Refused
If Ollama returns a connection refused error:
1. Ensure the Ollama daemon is running locally (`ollama serve`).
2. Verify the model is downloaded (`ollama pull llama3.2:3b`).
3. Check the configured provider URL starts with `ollama://`.
