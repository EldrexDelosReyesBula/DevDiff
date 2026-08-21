# Proprietary Codebases in the Enterprise

For enterprises managing intellectual property within proprietary codebases, DevDiff offers flexible deployments that balance security and AI capability.

---

## Enterprise Deployment Strategies

### 1. Self-Hosted Local AI (Local-First)

Run DevDiff fully offline using Ollama. Organizations can host a central Ollama instance on local enterprise servers, ensuring that no source code or diff metadata leaves the company's private network.

### 2. Private Cloud Gateways

Configure DevDiff to point to private API gateways or enterprise instances of cloud providers (like Microsoft Azure OpenAI or AWS Bedrock):

```javascript
// .devdiff.config.js
export default {
  ai: {
    providers: [
      {
        url: "openai://custom-model-tier",
        endpoint: "https://your-private-gateway.company.internal/v1",
      },
    ],
  },
};
```
