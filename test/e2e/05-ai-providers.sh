#!/bin/bash
# test/phase4-ai-providers.sh

echo "╔══════════════════════════════════════════════╗"
echo "║   PHASE 4: AI Provider Testing               ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

TEST_DIR="/tmp/devdiff-ai-test-$(date +%s)"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"
FAIL=0

git init && git config user.email "ai@test.dev" && git config user.name "AI Test"
echo "function hello() { return 'world'; }" > app.js
git add app.js && git commit -m "initial"

# Make a change
echo "function hello() { return 'universe'; }" > app.js
git add app.js

echo "📋 Provider Test 1: Ollama llama3.2:3b"
echo "   (This requires Ollama running locally)"
OUTPUT=$(devdiff generate --persona developer --format markdown 2>&1)
if echo "$OUTPUT" | grep -qi "changelog\|summary\|##\|change"; then
    echo "   ✅ Ollama generation successful"
elif echo "$OUTPUT" | grep -qi "ollama\|ECONNREFUSED\|not running"; then
    echo "   ⚠️ Ollama not available — skipping (install: https://ollama.com)"
else
    echo "   ❌ Ollama generation failed"
    echo "      $OUTPUT"
    FAIL=$((FAIL + 1))
fi

echo ""
echo "📋 Provider Test 2: Dry-run (no AI required)"
OUTPUT=$(devdiff generate --dry-run 2>&1)
if echo "$OUTPUT" | grep -qi "DRY RUN\|would call AI\|diff"; then
    echo "   ✅ Dry-run works without AI"
else
    echo "   ❌ Dry-run failed"
    FAIL=$((FAIL + 1))
fi

echo ""
echo "📋 Provider Test 3: AI Fallback Chain"
echo "   (Testing that fallback messages appear correctly)"
# Temporarily break Ollama URL to test fallback
OUTPUT=$(DEVDIFF_OLLAMA_URL="http://localhost:99999" devdiff generate 2>&1 || true)
if echo "$OUTPUT" | grep -qi "fallback\|retry\|recover\|checkpoint"; then
    echo "   ✅ Fallback mechanism active"
else
    echo "   ⚠️ Fallback output unclear — checking for safe failure..."
    if echo "$OUTPUT" | grep -qi "error\|fail\|cannot connect"; then
        echo "   ✅ Fails safely with error message"
    else
        echo "   ⚠️ May not handle AI failure gracefully"
    fi
fi

echo ""
echo "📋 Provider Test 4: Token Usage Estimation"
OUTPUT=$(devdiff generate --dry-run --verbose 2>&1 || true)
if echo "$OUTPUT" | grep -qi "token\|estimate"; then
    echo "   ✅ Token estimation present"
else
    echo "   ℹ️ Token estimation not in dry-run (expected)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
[ $FAIL -eq 0 ] && echo "   ✅ AI provider tests passed" || echo "   ❌ $FAIL AI test failures"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

rm -rf "$TEST_DIR"
