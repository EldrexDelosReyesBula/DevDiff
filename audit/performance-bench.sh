#!/bin/bash
# audit/performance-bench.sh

echo "=== PERFORMANCE BENCHMARKS ==="
FAIL=0

BENCH_DIR="./.devdiff-bench-temp"
rm -rf "$BENCH_DIR"
mkdir -p "$BENCH_DIR"

# Helper to time execution
time_run() {
    local start=$(date +%s%N 2>/dev/null || date +%s)
    node packages/cli/dist/index.js generate --dry-run > /dev/null 2>&1
    local end=$(date +%s%N 2>/dev/null || date +%s)
    local diff
    if [ ${#start} -gt 10 ]; then
        diff=$(( (end - start) / 1000000 )) # milliseconds
    else
        diff=$(( (end - start) * 1000 )) # fallback to seconds to ms conversion
    fi
    echo $diff
}

# Benchmark 1: Tiny change (1 file, 10 lines)
echo "1. Tiny change benchmark..."
mkdir -p "$BENCH_DIR/tiny" && cd "$BENCH_DIR/tiny"
git init -b main --quiet && git config user.email "bench@test.dev" && git config user.name "Bench"
echo "line1" > file.js && git add . && git commit -m "init" --quiet
echo -e "line1\nline2\nline3\nline4\nline5\nline6\nline7\nline8\nline9\nline10" > file.js && git add .
cd ../../

# Run benchmark
ELAPSED=$(time_run)
echo "   ⏱️ ${ELAPSED}ms (threshold: <1000ms)"
if [ $ELAPSED -lt 1000 ]; then
    echo "   ✅ PASS"
else
    echo "   ⚠️ Warning: Tiny change benchmark took longer than 1000ms"
fi

# Cleanup
rm -rf "$BENCH_DIR"

echo "Performance Benchmarks Complete."
exit $FAIL
