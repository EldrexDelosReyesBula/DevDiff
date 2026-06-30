#!/bin/sh
# .git/hooks/pre-commit
# DevDiff — Pre-commit secret scanning hook
#
# Installation: ln -sf ../../scripts/pre-commit-scan.sh .git/hooks/pre-commit
# Or run: devdiff init  (sets up automatically)

echo "🔍 DevDiff: Scanning staged changes for secrets..."

# Get staged diff
DIFF=$(git diff --cached --unified=0)

if [ -z "$DIFF" ]; then
    echo "   No staged changes to scan."
    exit 0
fi

# Patterns to detect (POSIX ERE for grep -E)
PATTERNS=(
    "sk-[a-zA-Z0-9-]{20,}"                           # OpenAI keys
    "sk-ant-[a-zA-Z0-9-]{20,}"                       # Anthropic keys
    "AIzaSy[a-zA-Z0-9_-]{33}"                        # Google API keys
    "(A3T[A-Z0-9]|AKIA|AGPA|AIDA)[A-Z0-9]{16}"     # AWS access keys
    "-----BEGIN (RSA |EC )?PRIVATE KEY-----"          # Private keys
    "https://hooks\.slack\.com/services/[A-Za-z0-9]+/[A-Za-z0-9]+/[A-Za-z0-9]+" # Slack webhooks
    "(mongodb\+srv|postgres|mysql|redis):\/\/[^:]+:[^@]+@" # Connection strings
    "(api_key|secret|token|password)\s*[:=]\s*['\"][A-Za-z0-9%_-]{16,}['\"]" # Generic secrets
)

FOUND=0
MESSAGES=()

for PATTERN in "${PATTERNS[@]}"; do
    MATCHES=$(echo "$DIFF" | grep -E "^\+" | grep -E "$PATTERN" 2>/dev/null)
    if [ -n "$MATCHES" ]; then
        FOUND=$((FOUND + 1))
        MESSAGES+=("  ⚠️  Pattern matched: $PATTERN")
        MESSAGES+=("     $(echo "$MATCHES" | head -1 | cut -c1-80)...")
    fi
done

if [ $FOUND -gt 0 ]; then
    echo ""
    echo "❌ COMMIT BLOCKED — Potential secrets detected in staged changes:"
    echo ""
    for MSG in "${MESSAGES[@]}"; do
        echo "$MSG"
    done
    echo ""
    echo "   To bypass (NOT recommended): git commit --no-verify"
    echo "   To redact: run devdiff redact-secrets && git add -u"
    echo ""
    exit 1
fi

echo "   ✅ No secrets detected. Proceeding with commit."
exit 0
