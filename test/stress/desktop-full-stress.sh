#!/bin/bash
# test/desktop-full-stress.sh
# Run this on your desktop to stress test everything

echo "╔══════════════════════════════════════════════════╗"
echo "║     DevDiff v1.0.3 — Full Desktop Stress Test    ║"
echo "║     Run time: ~30 minutes                        ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

FAILURES=0

run_test() {
    echo "▶ $1"
    if bash "$2" 2>&1 | tee "/tmp/devdiff-test-$(basename $2).log"; then
        echo "  ✅ PASS: $1"
    else
        echo "  ❌ FAIL: $1"
        FAILURES=$((FAILURES + 1))
    fi
    echo ""
}

# Environment
run_test "Environment Check" "test/setup-verification.sh"

# Installation
run_test "Fresh Install" "test/fresh-install.sh"

# Unit tests
echo "▶ Unit Tests"
if pnpm test 2>&1 | tee /tmp/devdiff-unit.log; then
    echo "  ✅ PASS: Unit Tests"
else
    echo "  ❌ FAIL: Unit Tests"
    FAILURES=$((FAILURES + 1))
fi
echo ""

# Integration tests
echo "▶ Integration Tests"
if pnpm test:integration 2>&1 | tee /tmp/devdiff-integration.log; then
    echo "  ✅ PASS: Integration Tests"
else
    echo "  ❌ FAIL: Integration Tests"
    FAILURES=$((FAILURES + 1))
fi
echo ""

# Stress tests
run_test "Vibe Coding Blast (1000 files)" "test/stress/vibe-coding-blast.sh"
run_test "Concurrent Commit Storm" "test/stress/concurrent-commits.sh"
run_test "Monorepo Stress" "test/stress/monorepo-stress.sh"

# Performance
run_test "Performance Benchmarks" "test/performance/benchmark.sh"

# Security
echo "▶ Security Audit"
if npm audit --audit-level=high 2>&1; then
    echo "  ✅ PASS: No high/critical vulnerabilities"
else
    echo "  ⚠️ WARNING: High vulnerabilities found (check audit)"
fi
echo ""

# Documentation
echo "▶ Documentation Check"
MISSING_README=0
for pkg in packages/*/; do
    if [ ! -f "$pkg/README.md" ]; then
        echo "  ❌ Missing README: $pkg"
        MISSING_README=$((MISSING_README + 1))
    fi
done
[ $MISSING_README -eq 0 ] && echo "  ✅ All READMEs present" || FAILURES=$((FAILURES + 1))
echo ""

# Final report
echo "╔══════════════════════════════════════════════════╗"
echo "║              STRESS TEST RESULTS                  ║"
echo "╠══════════════════════════════════════════════════╣"
if [ $FAILURES -eq 0 ]; then
    echo "║  ✅ ALL TESTS PASSED                             ║"
    echo "║  DevDiff v1.0.3 is ready for release!            ║"
else
    echo "║  ❌ $FAILURES TEST(S) FAILED                      ║"
    echo "║  Fix before release                              ║"
fi
echo "╚══════════════════════════════════════════════════╝"

exit $FAILURES
