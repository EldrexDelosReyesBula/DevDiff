# Security Model

DevDiff is designed with strict security constraints to prevent prompt injection and secret leaks.

## 1. Local Defaults
All operations compile, parse, and run locally by default. No data is sent to external services unless you configure cloud providers.

## 2. Secrets Redaction
A local scanner searches for signatures matching API keys, credentials, and configuration secrets in diff changes. Discovered matches are redacted (`[REDACTED]`) before the data reaches the AI Router.

## 3. Sandboxed Execution
Watchers and builders run in sandboxed user directories.
