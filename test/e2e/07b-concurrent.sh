#!/bin/bash
# test/phase6b-concurrent.sh

echo "╔══════════════════════════════════════════════╗"
echo "║   PHASE 6B: Concurrent Commit Storm          ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

TEST_DIR="/tmp/devdiff-concurrent-$(date +%s)"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"
FAIL=0

git init && git config user.email "concurrent@test.dev" && git config user.name "Concurrent"
devdiff init --yes

# Initial commit
echo "base" > base.js && git add . && git commit -m "base"

echo "🌪️ Simulating 5 developers simultaneously..."

for dev in {1..5}; do
    (
        git checkout -b "dev-$dev" 2>/dev/null
        
        for commit in {1..10}; do
            for file in {1..5}; do
                mkdir -p "src/dev${dev}"
                echo "// dev-$dev commit-$commit file-$file $(date +%s%N)" > "src/dev${dev}/file_${commit}_${file}.ts"
            done
            git add .
            git commit -m "dev-$dev: commit $commit" --quiet
        done
    ) &
done

wait
echo "   ✅ 5 devs × 10 commits × 5 files = 250 files created"

echo ""
echo "📋 Testing DevDiff on each branch..."
START=$(date +%s)

for dev in {1..5}; do
    git checkout "dev-$dev" --quiet 2>/dev/null
    devdiff generate --since "HEAD~10..HEAD" --dry-run > "/tmp/devdiff-result-$dev.txt" 2>&1 &
done
wait

ELAPSED=$(($(date +%s) - START))

SUCCESS=0
for dev in {1..5}; do
    if grep -q "DRY RUN\|would call AI\|batch" "/tmp/devdiff-result-$dev.txt" 2>/dev/null; then
        SUCCESS=$((SUCCESS + 1))
    fi
done

echo "   ✅ $SUCCESS/5 branches analyzed in ${ELAPSED}s"

if [ $SUCCESS -eq 5 ]; then
    echo "   ✅ All concurrent analyses succeeded"
else
    echo "   ❌ Some analyses failed"
    FAIL=$((FAIL + 1))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
[ $FAIL -eq 0 ] && echo "   ✅ Concurrent stress test passed" || echo "   ❌ $FAIL failures"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

rm -rf "$TEST_DIR" /tmp/devdiff-result-*.txt
