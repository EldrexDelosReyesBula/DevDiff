#!/bin/bash
# test/phase2-install.sh

echo "╔══════════════════════════════════════════════╗"
echo "║   PHASE 2: Installation & Basic Commands     ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

FAIL=0

# Clean npm cache
echo "🧹 Cleaning npm cache..."
npm cache clean --force 2>/dev/null

# Uninstall if exists
echo "🧹 Removing existing installation..."
npm uninstall -g @eldrex/cli @eldrex/core 2>/dev/null
npm uninstall -g devdiff 2>/dev/null

# Fresh install
echo "📦 Installing @eldrex/cli globally..."
if npm install -g @eldrex/cli 2>&1 | tail -1; then
    echo "   ✅ Install successful"
else
    echo "   ❌ Install failed"
    FAIL=$((FAIL + 1))
fi

# Verify binary exists
echo ""
echo "🔍 Verifying installation..."
if command -v devdiff &>/dev/null; then
    echo "   ✅ devdiff command available"
else
    echo "   ❌ devdiff command not found"
    FAIL=$((FAIL + 1))
fi

# Version check
echo ""
echo "📋 Version command..."
VERSION_OUTPUT=$(devdiff version 2>&1)
if echo "$VERSION_OUTPUT" | grep -q "DevDiff"; then
    echo "   ✅ Version output: $VERSION_OUTPUT"
else
    echo "   ❌ Version command failed: $VERSION_OUTPUT"
    FAIL=$((FAIL + 1))
fi

# Help check
echo ""
echo "📋 Help command..."
if devdiff --help 2>&1 | grep -q "Usage"; then
    echo "   ✅ Help works"
else
    echo "   ❌ Help failed"
    FAIL=$((FAIL + 1))
fi

# List available commands
echo ""
echo "📋 Available commands:"
devdiff --help 2>&1 | grep -E "^\s+\w+" | while read cmd; do
    echo "   • $cmd"
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
[ $FAIL -eq 0 ] && echo "   ✅ Phase 2 passed" || echo "   ❌ Phase 2: $FAIL failures"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
