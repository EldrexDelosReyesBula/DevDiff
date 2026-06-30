# Ollama Provider

Ollama allows running open-source large language models (like Llama 3.2, CodeLlama) locally on your system.

## Setup

1. Install Ollama: https://ollama.ai
2. Run model:
   ```bash
   ollama run llama3.2:3b
   ```
3. Set the provider in your `.devdiff.config.js`:
   ```javascript
   export default {
     ai: {
       providers: [
         {
           name: "ollama-local",
           url: "ollama://llama3.2:3b",
           priority: 1
         }
       ]
     }
   };
   ```
