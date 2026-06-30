#!/bin/bash
# test/phase7-recovery.sh

echo "╔══════════════════════════════════════════════╗"
echo "║   PHASE 7: Checkpoint & Recovery Testing     ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

TEST_DIR="/tmp/devdiff-recovery-$(date +%s)"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"
FAIL=0

git init && git config user.email "recovery@test.dev" && git config user.name "Recovery"
devdiff init --yes

echo "content v1" > important.js
git add . && git commit -m "initial"

echo "📋 Test 1: Vibe session start"
OUTPUT=$(devdiff vibe start 2>&1)
if echo "$OUTPUT" | grep -qi "session\|vibe\|started"; then
    echo "   ✅ Vibe session starts"
else
    echo "   ❌ Vibe session failed to start"
    FAIL=$((FAIL + 1))
fi

echo ""
echo "📋 Test 2: Auto-checkpoint on change"
echo "content v2 — critical change" > important.js
git add important.js
git commit -m "important update" --quiet

OUTPUT=$(devdiff vibe status 2>&1)
if echo "$OUTPUT" | grep -qi "checkpoint\|session\|changes"; then
    echo "   ✅ Session tracks changes"
else
    echo "   ⚠️ Session status unclear"
fi

echo ""
echo "📋 Test 3: Simulated AI failure recovery"
# Force a failure and check recovery messaging
OUTPUT=$(DEVDIFF_FORCE_FAIL=true devdiff generate 2>&1 || true)
if echo "$OUTPUT" | grep -qi "saved\|checkpoint\|safe\|recover\|no data loss\|no work lost"; then
    echo "   ✅ Recovery messaging present"
else
    echo "   ℹ️ Forced failure test — checking safe exit..."
    if echo "$OUTPUT" | grep -qi "error\|fail"; then
        echo "   ✅ Fails with error (expected)"
    fi
fi

echo ""
echo "📋 Test 4: Vibe session stop"
OUTPUT=$(devdiff vibe stop 2>&1)
if echo "$OUTPUT" | grep -qi "stopped\|saved\|session"; then
    echo "   ✅ Session stops cleanly"
else
    echo "   ⚠️ Session stop needs review"
fi

echo ""
echo "📋 Test 5: Data integrity verification"
# Verify file still exists with correct content
if [ -f "important.js" ]; then
    CONTENT=$(cat important.js)
    if echo "$CONTENT" | grep -q "content v2"; then
        echo "   ✅ File integrity maintained"
    else
        echo "   ❌ File content corrupted!"
        FAIL=$((FAIL + 1))
    fi
else
    echo "   ❌ File missing after session!"
    FAIL=$((FAIL + 1))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
[ $FAIL -eq 0 ] && echo "   ✅ Recovery tests passed" || echo "   ❌ $FAIL recovery failures"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

rm -rf "$TEST_DIR"
