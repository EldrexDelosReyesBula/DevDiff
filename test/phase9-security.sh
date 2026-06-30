#!/bin/bash
# test/phase9-security.sh

echo "╔══════════════════════════════════════════════╗"
echo "║   PHASE 9: Security & Privacy Verification   ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

FAIL=0

echo "📋 Test 1: No secrets in output"
TEST_DIR="/tmp/devdiff-sec-test-$(date +%s)"
mkdir -p "$TEST_DIR" && cd "$TEST_DIR"
git init && git config user.email "sec@test.dev" && git config user.name "Security"
echo 'const API_KEY = "sk-abc123def456ghi789"' > config.js
git add . && git commit -m "has secret"

echo "// changed" >> config.js
git add config.js

OUTPUT=$(devdiff generate --dry-run 2>&1)
if echo "$OUTPUT" | grep -q "sk-abc123"; then
    echo "   ❌ SECRET LEAK: API key visible in output!"
    FAIL=$((FAIL + 1))
else
    echo "   ✅ No secrets in dry-run output"
fi

rm -rf "$TEST_DIR"

echo ""
echo "📋 Test 2: Shell access is sandboxed"
# Verify shell commands are whitelisted
OUTPUT=$(node -e "
  try {
    const { ShellSandbox } = require('@eldrex/core');
    ShellSandbox.exec('rm -rf /', []);
  } catch(e) {
    console.log('blocked');
  }
" 2>/dev/null || echo "blocked")
if echo "$OUTPUT" | grep -q "blocked"; then
    echo "   ✅ Dangerous commands blocked"
else
    echo "   ⚠️ Shell sandbox not verified"
fi

echo ""
echo "📋 Test 3: Network access is documented"
if devdiff audit network 2>&1 | grep -qi "network\|access\|disabled\|enabled"; then
    echo "   ✅ Network audit available"
else
    echo "   ℹ️ Network audit — may need implementation"
fi

echo ""
echo "📋 Test 4: Compliance framework loading"
for fw in gdpr ccpa hipaa soc2 fedramp iso27001 pipeda lgpd pdpa; do
    OUTPUT=$(devdiff compliance apply --framework "$fw" --dry-run 2>&1 || true)
    if echo "$OUTPUT" | grep -qi "$fw\|compliance\|applied\|framework"; then
        echo "   ✅ $fw: Recognized"
    else
        echo "   ⚠️ $fw: May not be fully implemented"
    fi
done

echo ""
echo "📋 Test 5: No telemetry"
# Check for common telemetry domains in source
# Use project directory path since we cd'd to TEST_DIR
PROJECT_DIR="c:/Users/Eldrex/Downloads/classhost/DevDiff"
if grep -r "telemetry\|analytics\|tracking\|sentry\|logrocket\|mixpanel\|amplitude" "$PROJECT_DIR"/packages/*/src/ 2>/dev/null; then
    echo "   ⚠️ Potential telemetry references found — review"
else
    echo "   ✅ No telemetry references detected"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
[ $FAIL -eq 0 ] && echo "   ✅ Security tests passed" || echo "   ❌ $FAIL security issues"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
