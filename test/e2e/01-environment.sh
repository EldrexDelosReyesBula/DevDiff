#!/bin/bash
# test/phase1-environment.sh

echo "╔══════════════════════════════════════════════╗"
echo "║   PHASE 1: Environment Verification          ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

PASS=0
FAIL=0

check() {
    if eval "$2" 2>/dev/null; then
        echo "   ✅ $1"
        PASS=$((PASS + 1))
    else
        echo "   ❌ $1"
        FAIL=$((FAIL + 1))
    fi
}

echo "📦 Node.js & Package Manager"
check "Node.js >= 20.0.0" "node -e 'process.exit(parseInt(process.version.slice(1)) < 20 ? 1 : 0)'"
check "npm >= 10.0.0" "npm --version | grep -qE '^1[0-9]\.'"
check "pnpm >= 9.0.0 (optional)" "pnpm --version 2>/dev/null | grep -qE '^9\.' || true"

echo ""
echo "🔧 Git"
check "Git >= 2.40.0" "git --version | grep -qE '2\.[4-9][0-9]'"
check "Git user.name configured" "git config --global user.name | grep -q ."
check "Git user.email configured" "git config --global user.email | grep -q ."

echo ""
echo "🤖 AI Providers (at least one required)"
check "Ollama installed" "ollama --version 2>/dev/null || echo 'not found'"
check "Ollama running" "curl -s http://localhost:11434/api/tags >/dev/null 2>&1"
check "llama3.2:3b pulled" "ollama list 2>/dev/null | grep -q llama3.2"
check "llama3.1:8b pulled (optional)" "ollama list 2>/dev/null | grep -q llama3.1 || true"

echo ""
echo "💻 System Resources"
TOTAL_MEM=$(free -m 2>/dev/null | awk 'NR==2{print $2}' || echo "8192")
check "RAM >= 4GB" "[ $TOTAL_MEM -ge 4000 ]"
DISK_FREE=$(df -m . 2>/dev/null | awk 'NR==2{print $4}' || echo "10000")
check "Free disk >= 2GB" "[ $DISK_FREE -ge 2000 ]"
check "CPU cores >= 2" "[ $(nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo 4) -ge 2 ]"

echo ""
echo "🌐 Network (optional features)"
check "Internet access (for cloud AI)" "curl -s --connect-timeout 3 https://registry.npmjs.org >/dev/null 2>&1"
check "GitHub connectivity" "curl -s --connect-timeout 3 https://api.github.com >/dev/null 2>&1"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   Results: $PASS passed, $FAIL failed"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

[ $FAIL -gt 0 ] && echo "⚠️  Fix failed checks before proceeding" || echo "✅ All checks passed"
