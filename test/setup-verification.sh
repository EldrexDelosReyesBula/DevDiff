#!/bin/bash
# test/setup-verification.sh

echo "=== DevDiff Environment Verification ==="

# Node.js version
node --version | grep -q "v2[0-9]" && echo "✅ Node.js 20+" || echo "❌ Node.js too old"

# pnpm version
pnpm --version | grep -q "[9-9]" && echo "✅ pnpm 9+" || echo "❌ pnpm not found or too old"

# Git version
git --version | grep -q "2\.[4-9][0-9]" && echo "✅ Git 2.40+" || echo "❌ Git too old"

# Ollama (optional)
ollama --version 2>/dev/null && echo "✅ Ollama installed" || echo "⚠️ Ollama not found (optional)"

# Disk space (need 2GB+)
df -h . | awk 'NR==2 {if ($4+0 > 2000000) print "✅ Disk space OK"; else print "❌ Low disk space"}'

# Memory (need 4GB+)
free -m | awk 'NR==2 {if ($2+0 > 4000) print "✅ RAM OK"; else print "❌ Low RAM"}'
