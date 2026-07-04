#!/bin/bash
# RELEASE-GATE.sh — Run this before ANY release

echo "╔══════════════════════════════════════════════╗"
echo "║     DEVDIFF v1.0.3 — RELEASE GATE            ║"
echo "║     ALL checks must PASS before release       ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

TOTAL_PASS=0
TOTAL_FAIL=0

check_section() {
    echo "━━━ $1 ━━━"
    # Ensure script is executable
    chmod +x "$2" 2>/dev/null
    
    if bash "$2"; then
        echo "✅ $1: PASSED"
        TOTAL_PASS=$((TOTAL_PASS + 1))
    else
        echo "❌ $1: FAILED"
        TOTAL_FAIL=$((TOTAL_FAIL + 1))
    fi
    echo ""
}

check_section "Code Quality" "audit/code-quality.sh"
check_section "Security Scan" "audit/security-scan.sh"
check_section "Privacy Audit" "audit/privacy-audit.sh"
check_section "Performance Benchmarks" "audit/performance-bench.sh"
check_section "Package Health" "audit/package-health.sh"

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║              FINAL VERDICT                    ║"
echo "╠══════════════════════════════════════════════╣"
echo "║  Passed: $TOTAL_PASS/5 sections                        ║"
echo "║  Failed: $TOTAL_FAIL/5 sections                        ║"
echo "║                                              ║"

if [ $TOTAL_FAIL -eq 0 ]; then
    echo "║  ✅ READY FOR RELEASE                        ║"
    echo "║                                              ║"
    echo "║  Next steps:                                 ║"
    echo "║  1. npm version patch                        ║"
    echo "║  2. git push --tags                          ║"
    echo "║  3. npm publish --workspaces                ║"
    echo "║  4. vsce publish                             ║"
else
    echo "║  ❌ NOT READY — Fix $TOTAL_FAIL sections           ║"
fi
echo "╚══════════════════════════════════════════════╝"

exit $TOTAL_FAIL
