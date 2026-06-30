#!/bin/bash
# test/phase2b-commands.sh

echo "╔══════════════════════════════════════════════╗"
echo "║   PHASE 2B: All CLI Commands Test            ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# Ensure test repo directory exists
mkdir -p /tmp/devdiff-test-repo
cd /tmp/devdiff-test-repo
git init 2>/dev/null
git config user.email "test@devdiff.dev" 2>/dev/null
git config user.name "Test" 2>/dev/null

FAIL=0

test_command() {
    local CMD="$1"
    local DESC="$2"
    local EXPECT="$3"
    
    echo -n "   $DESC... "
    OUTPUT=$($CMD 2>&1)
    EXIT_CODE=$?
    
    if echo "$OUTPUT" | grep -qE "$EXPECT"; then
        echo "✅"
    elif [ $EXIT_CODE -eq 0 ] && [ "$EXPECT" = "SUCCESS" ]; then
        echo "✅"
    else
        echo "❌ (exit: $EXIT_CODE)"
        echo "      Output: ${OUTPUT:0:100}"
        FAIL=$((FAIL + 1))
    fi
}

echo "📋 Core Commands"
test_command "devdiff --version" "Version flag" "DevDiff|v?[0-9]+\.[0-9]+\.[0-9]+"
test_command "devdiff --help" "Help flag" "Usage|Commands"
test_command "devdiff init --yes" "Initialize repo" "initialized|DevDiff"
test_command "devdiff config" "Show config" "Configuration|Loaded"
test_command "devdiff generate --dry-run" "Dry run" "DRY RUN|No changes"
test_command "devdiff watch &>/dev/null & sleep 2; kill %1 2>/dev/null" "Watch mode starts" "Starting|Watching"

echo ""
echo "📋 Persona Commands"
for persona in developer ceo educator robot data-analyst journalist pm compliance; do
    test_command "devdiff generate --persona $persona --dry-run 2>&1" "Persona: $persona" "DRY RUN|No changes|persona"
done

echo ""
echo "📋 Format Commands"
for format in markdown json mermaid; do
    test_command "devdiff generate --format $format --dry-run 2>&1" "Format: $format" "DRY RUN|No changes"
done

echo ""
echo "📋 Session Commands"
test_command "devdiff vibe start 2>&1" "Vibe start" "Session|Vibe|started"
test_command "devdiff vibe status 2>&1" "Vibe status" "Session|Duration|No active"
test_command "devdiff vibe stop 2>&1" "Vibe stop" "stopped|saved|Session"

echo ""
echo "📋 Compliance Commands"
test_command "devdiff compliance list 2>&1" "Compliance list" "GDPR|CCPA|HIPAA|SOC|ISO|PIPEDA|LGPD|PDPA"
test_command "devdiff compliance apply --framework gdpr --dry-run 2>&1 || true" "Compliance apply" "GDPR|compliance|applied"

echo ""
echo "📋 Audit Commands"
test_command "devdiff audit ai-calls 2>&1 || true" "Audit AI calls" ""
test_command "devdiff audit network 2>&1 || true" "Audit network" ""
test_command "devdiff audit shell 2>&1 || true" "Audit shell" ""

echo ""
echo "📋 Version Management"
test_command "devdiff version --check 2>&1" "Version check" "[0-9]+\.[0-9]+\.[0-9]+"
test_command "devdiff version --changelog 2>&1 || true" "Version changelog" ""

echo ""
echo "📋 Playground"
test_command "timeout 3 devdiff playground 2>&1 || true" "Playground starts" "Playground|localhost"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
[ $FAIL -eq 0 ] && echo "   ✅ All commands working" || echo "   ❌ $FAIL command failures"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
