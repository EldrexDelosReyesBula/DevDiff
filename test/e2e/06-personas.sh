#!/bin/bash
# test/phase5-personas.sh

echo "╔══════════════════════════════════════════════╗"
echo "║   PHASE 5: Persona & Format Testing          ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

TEST_DIR="/tmp/devdiff-persona-test-$(date +%s)"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"
FAIL=0

git init && git config user.email "persona@test.dev" && git config user.name "Persona Test"
echo "// complex code change" > src.js
echo "function auth(user, pass) { if (pass === 'admin123') return true; }" >> src.js
git add . && git commit -m "initial"

echo "function auth(user, pass) { return bcrypt.compare(pass, hash); }" > src.js
git add src.js

echo ""
echo "📋 Persona Output Tests (dry-run to verify structure)"

for persona in developer ceo educator robot data-analyst journalist pm compliance; do
    echo ""
    echo "   Testing: $persona"
    OUTPUT=$(devdiff generate --persona "$persona" --dry-run 2>&1)
    
    if echo "$OUTPUT" | grep -qi "DRY RUN\|would call AI\|No changes\|diff"; then
        echo "   ✅ $persona: Command accepted"
    else
        echo "   ❌ $persona: Command rejected"
        echo "      $OUTPUT"
        FAIL=$((FAIL + 1))
    fi
done

echo ""
echo "📋 Format Tests (dry-run)"

for format in markdown json mermaid; do
    echo ""
    echo "   Testing format: $format"
    OUTPUT=$(devdiff generate --format "$format" --dry-run 2>&1)
    
    if echo "$OUTPUT" | grep -qi "DRY RUN\|would call AI\|No changes\|diff"; then
        echo "   ✅ $format: Command accepted"
    else
        echo "   ❌ $format: Command rejected"
        FAIL=$((FAIL + 1))
    fi
done

echo ""
echo "📋 Invalid Input Tests"

echo "   Testing invalid persona..."
OUTPUT=$(devdiff generate --persona "invalid_persona" --dry-run 2>&1)
if echo "$OUTPUT" | grep -qi "invalid\|valid\|choose\|option"; then
    echo "   ✅ Invalid persona: Properly rejected with guidance"
else
    echo "   ⚠️ Invalid persona: May not have proper error message"
fi

echo ""
echo "   Testing invalid format..."
OUTPUT=$(devdiff generate --format "pdf" --dry-run 2>&1)
if echo "$OUTPUT" | grep -qi "invalid\|valid\|choose\|option"; then
    echo "   ✅ Invalid format: Properly rejected with guidance"
else
    echo "   ⚠️ Invalid format: May not have proper error message"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
[ $FAIL -eq 0 ] && echo "   ✅ Persona & format tests passed" || echo "   ❌ $FAIL test failures"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

rm -rf "$TEST_DIR"
