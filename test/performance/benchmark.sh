#!/bin/bash
# test/performance/benchmark.sh

echo "=== DevDiff Performance Benchmarks ==="
echo ""

# Test 1: Tiny repo (<10 files)
echo "📊 Benchmark 1: Tiny repository"
echo "   Files: 5 | Commits: 1 | Lines changed: 50"
cd /tmp/devdiff-perf-tiny
START=$(date +%s%N)
devdiff analyze --since "HEAD~1..HEAD" --no-ai > /dev/null
ELAPSED=$((($(date +%s%N) - START) / 1000000))
echo "   ⏱️ Time: ${ELAPSED}ms"
echo "   Threshold: <500ms"
[ $ELAPSED -lt 500 ] && echo "   ✅ PASS" || echo "   ❌ FAIL"
echo ""

# Test 2: Small repo (50 files)
echo "📊 Benchmark 2: Small repository"
echo "   Files: 50 | Commits: 5 | Lines changed: 500"
cd /tmp/devdiff-perf-small
START=$(date +%s%N)
devdiff analyze --since "HEAD~5..HEAD" --no-ai > /dev/null
ELAPSED=$((($(date +%s%N) - START) / 1000000))
echo "   ⏱️ Time: ${ELAPSED}ms"
echo "   Threshold: <2000ms"
[ $ELAPSED -lt 2000 ] && echo "   ✅ PASS" || echo "   ❌ FAIL"
echo ""

# Test 3: Medium repo (500 files)
echo "📊 Benchmark 3: Medium repository"
echo "   Files: 500 | Commits: 1 | Lines changed: 5000"
cd /tmp/devdiff-perf-medium
START=$(date +%s%N)
devdiff analyze --since "HEAD~1..HEAD" --no-ai > /dev/null
ELAPSED=$((($(date +%s%N) - START) / 1000000))
echo "   ⏱️ Time: ${ELAPSED}ms"
echo "   Threshold: <10000ms (10s)"
[ $ELAPSED -lt 10000 ] && echo "   ✅ PASS" || echo "   ❌ FAIL"
echo ""

# Test 4: Large repo (5000 files — vibe coding sim)
echo "📊 Benchmark 4: Large repository (Vibe Coding)"
echo "   Files: 5000 | Commits: 1 | Lines changed: 50000"
cd /tmp/devdiff-perf-large
START=$(date +%s%N)
devdiff analyze --since "HEAD~1..HEAD" --no-ai > /dev/null
ELAPSED=$((($(date +%s%N) - START) / 1000000))
echo "   ⏱️ Time: ${ELAPSED}ms ($((ELAPSED / 1000))s)"
echo "   Threshold: <60000ms (60s)"
[ $ELAPSED -lt 60000 ] && echo "   ✅ PASS" || echo "   ❌ FAIL"
echo ""

# Test 5: Memory usage
echo "📊 Benchmark 5: Memory Usage (5000 files)"
cd /tmp/devdiff-perf-large
MEM_BEFORE=$(ps -o rss= -p $$)
devdiff analyze --since "HEAD~1..HEAD" --no-ai > /dev/null &
PID=$!
MEM_PEAK=0
while kill -0 $PID 2>/dev/null; do
    MEM_CURRENT=$(ps -o rss= -p $PID 2>/dev/null || echo 0)
    [ $MEM_CURRENT -gt $MEM_PEAK ] && MEM_PEAK=$MEM_CURRENT
    sleep 0.1
done
wait $PID
echo "   🧠 Peak memory: $((MEM_PEAK / 1024))MB"
echo "   Threshold: <2048MB (2GB)"
[ $MEM_PEAK -lt 2097152 ] && echo "   ✅ PASS" || echo "   ❌ FAIL"
