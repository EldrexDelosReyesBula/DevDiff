# Privacy Guarantees

We believe your source code is your most valuable intellectual property. DevDiff is engineered to give you absolute transparency and complete control over where your data travels.

---

## The DevDiff Privacy Core Guarantees

### 1. Strict Zero-Telemetry Commitment
-   **No Background Tracking:** DevDiff does not collect, store, or transmit analytics logs, CLI usage profiles, or user behaviour records.
-   **No Remote Dashboards:** Your configurations, active files, and statistics remain entirely on your local machine.

---

### 2. Complete Model Portability (BYOAI)
You choose the model and data boundaries:
-   **Local Runs:** By selecting Ollama, llama.cpp, or Transformers.js, your code is processed locally using your device's CPU/GPU. No external API requests are initiated.
-   **Cloud Integrity:** If you configure external cloud models (OpenAI, Gemini, Anthropic), DevDiff only transmits the specific, pre-trimmed, and redacted diff data required for explanation. 

---

### 3. Key and Token Protection
-   **Local Key Ingestion:** Cloud API credentials (such as `OPENAI_API_KEY`) are read directly from local environment variables or your secure local configuration file. 
-   **No Middlemen:** DevDiff makes direct requests to the respective AI provider endpoints. We do not operate a proxy service or intermediary servers that intercept your API keys or data payloads.

---

### 4. Transparent Inbound Prompts
You can audit exactly what data leaves your machine before making any API calls:
```bash
devdiff generate --dry-run
```
Running in dry-run mode prints the exact system prompts, formatted context, and redacted diff syntax directly to your terminal console so you can inspect it.
