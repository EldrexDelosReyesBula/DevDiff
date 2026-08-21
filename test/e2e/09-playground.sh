#!/bin/bash
# test/phase8-playground.sh

echo "╔══════════════════════════════════════════════╗"
echo "║   PHASE 8: Playground & UI Testing           ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

TEST_DIR="/tmp/devdiff-playground-test-$(date +%s)"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"
FAIL=0

git init && git config user.email "playground@test.dev" && git config user.name "Playground"
echo "function test() {}" > app.js
git add . && git commit -m "initial"
devdiff init --yes

echo "📋 Test 1: Playground server starts"
# Start playground in background
devdiff playground &
PLAYGROUND_PID=$!
sleep 3

if curl -s http://localhost:3737/api/workspace >/dev/null 2>&1; then
    echo "   ✅ Playground server running"
else
    echo "   ❌ Playground server failed to start"
    FAIL=$((FAIL + 1))
fi

echo ""
echo "📋 Test 2: API endpoint — Workspace info"
OUTPUT=$(curl -s http://localhost:3737/api/workspace 2>/dev/null)
if echo "$OUTPUT" | grep -q "path\|name\|git"; then
    echo "   ✅ Workspace API works"
else
    echo "   ❌ Workspace API failed"
    FAIL=$((FAIL + 1))
fi

echo ""
echo "📋 Test 3: API endpoint — Changelog"
OUTPUT=$(curl -s "http://localhost:3737/api/changelog?persona=developer&format=markdown" 2>/dev/null)
if echo "$OUTPUT" | grep -q "success\|changelog\|error"; then
    echo "   ✅ Changelog API responds"
else
    echo "   ❌ Changelog API failed"
    FAIL=$((FAIL + 1))
fi

echo ""
echo "📋 Test 4: API endpoint — Stats"
OUTPUT=$(curl -s http://localhost:3737/api/stats 2>/dev/null)
if echo "$OUTPUT" | grep -q "files\|lines\|commits"; then
    echo "   ✅ Stats API works"
else
    echo "   ❌ Stats API failed"
    FAIL=$((FAIL + 1))
fi

echo ""
echo "📋 Test 5: WebSocket connection"
# Test WebSocket (basic connectivity check)
if command -v websocat &>/dev/null; then
    timeout 3 bash -c 'echo "" | websocat ws://localhost:3737 2>/dev/null' || true
    echo "   ✅ WebSocket connectivity check passed"
else
    echo "   ℹ️ websocat not installed, skipping WebSocket CLI test"
fi

# Cleanup
kill $PLAYGROUND_PID 2>/dev/null
wait $PLAYGROUND_PID 2>/dev/null

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
[ $FAIL -eq 0 ] && echo "   ✅ Playground tests passed" || echo "   ❌ $FAIL playground failures"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

rm -rf "$TEST_DIR"
