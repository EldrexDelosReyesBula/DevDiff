#!/bin/bash
# test/phase12-release-gate.sh

echo "╔══════════════════════════════════════════════════════════╗"
echo "║                                                          ║"
echo "║   DEVDIFF v1.0.3 — FINAL RELEASE GATE                    ║"
echo "║                                                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

TOTAL_PASS=0
TOTAL_FAIL=0

run_phase() {
    local PHASE="$1"
    local SCRIPT="$2"
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "▶ Running: $PHASE"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if bash "$SCRIPT"; then
        echo "✅ $PHASE: PASSED"
        TOTAL_PASS=$((TOTAL_PASS + 1))
    else
        echo "❌ $PHASE: FAILED"
        TOTAL_FAIL=$((TOTAL_FAIL + 1))
    fi
    echo ""
}

# Run all phases
run_phase "Environment" "test/phase1-environment.sh"
run_phase "Installation" "test/phase2-install.sh"
run_phase "CLI Commands" "test/phase2b-commands.sh"
run_phase "Git Integration" "test/phase3-git.sh"
run_phase "AI Providers" "test/phase4-ai-providers.sh"
run_phase "Personas & Formats" "test/phase5-personas.sh"
run_phase "Vibe Coding Stress" "test/phase6-stress-vibe.sh"
run_phase "Concurrent Storm" "test/phase6b-concurrent.sh"
run_phase "Recovery" "test/phase7-recovery.sh"
run_phase "Playground" "test/phase8-playground.sh"
run_phase "Security" "test/phase9-security.sh"
run_phase "Versioning" "test/phase10-versioning.sh"
run_phase "Packages" "test/phase11-packages.sh"

# Manual verification checklist
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   MANUAL VERIFICATION CHECKLIST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "   [ ] VS Code extension installs from VSIX"
echo "   [ ] VS Code inline annotations appear on staged changes"
echo "   [ ] VS Code sidebar shows changelog history"
echo "   [ ] VS Code status bar shows DevDiff status"
echo "   [ ] GitHub Action completes without errors"
echo "   [ ] PR comment appears with changelog"
echo "   [ ] Vite plugin overlay shows in dev mode"
echo "   [ ] Public playground loads at devdiff.dev/playground"
echo "   [ ] All README badges link correctly"
echo "   [ ] docs.eldrex.dev loads all pages"
echo "   [ ] CHANGELOG.md is up to date"
echo "   [ ] Git tag v1.0.3 exists"
echo "   [ ] npm publish --dry-run succeeds for all packages"
echo "   [ ] Socket.dev scores are >= 85 for all packages"
echo ""

# Final report
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                    FINAL RESULTS                          ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║   Automated Phases Passed: $TOTAL_PASS/13                        ║"
echo "║   Automated Phases Failed: $TOTAL_FAIL/13                        ║"
echo "║                                                          ║"
if [ $TOTAL_FAIL -eq 0 ]; then
    echo "║   ✅ ALL AUTOMATED TESTS PASSED                          ║"
    echo "║                                                          ║"
    echo "║   Complete manual verification checklist above.          ║"
    echo "║   Then:                                                  ║"
    echo "║     npm publish --workspaces                            ║"
    echo "║     git tag v1.0.3                                      ║"
    echo "║     git push --tags                                      ║"
else
    echo "║   ❌ $TOTAL_FAIL PHASE(S) FAILED                               ║"
    echo "║   Fix failures before release.                          ║"
fi
echo "╚══════════════════════════════════════════════════════════╝"

exit $TOTAL_FAIL
