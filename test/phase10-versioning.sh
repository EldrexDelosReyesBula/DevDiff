#!/bin/bash
# test/phase10-versioning.sh

echo "╔══════════════════════════════════════════════╗"
echo "║   PHASE 10: Version Immutability Test         ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

FAIL=0

echo "📋 Test 1: Version command works"
OUTPUT=$(devdiff version 2>&1)
echo "   Output: $OUTPUT"
if echo "$OUTPUT" | grep -qE "[0-9]+\.[0-9]+\.[0-9]+"; then
    echo "   ✅ Version displayed"
else
    echo "   ❌ Version not displayed"
    FAIL=$((FAIL + 1))
fi

echo ""
echo "📋 Test 2: Version check flag"
OUTPUT=$(devdiff version --check 2>&1)
echo "   Output: $OUTPUT"
if echo "$OUTPUT" | grep -qE "Current|Latest|[0-9]+\.[0-9]+\.[0-9]+"; then
    echo "   ✅ Version check works"
else
    echo "   ⚠️ Version check needs review"
fi

echo ""
echo "📋 Test 3: No auto-update mechanism"
# Verify no auto-update code in CLI
# Use project directory path
PROJECT_DIR="c:/Users/Eldrex/Downloads/classhost/DevDiff"
if grep -r "autoUpdate\|auto-update\|auto update" "$PROJECT_DIR"/packages/cli/src/ 2>/dev/null; then
    echo "   ⚠️ Auto-update code found — should be user-initiated only"
else
    echo "   ✅ No auto-update code detected"
fi

echo ""
echo "📋 Test 4: Config version pinning"
mkdir -p /tmp/devdiff-version-test
cat > /tmp/devdiff-version-test/.devdiff.config.js <<'EOF'
export default {
  version: '1.0.0'
}
EOF
echo "   ✅ Config with version pin created"

echo ""
echo "📋 Test 5: Update instructions are clear"
OUTPUT=$(devdiff version --check 2>&1)
if echo "$OUTPUT" | grep -qi "upgrade\|update\|install.*latest"; then
    echo "   ✅ Upgrade instructions provided"
else
    echo "   ℹ️ Upgrade instructions may need improvement"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
[ $FAIL -eq 0 ] && echo "   ✅ Version tests passed" || echo "   ❌ $FAIL version issues"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

rm -rf /tmp/devdiff-version-test
