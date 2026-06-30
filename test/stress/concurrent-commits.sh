#!/bin/bash
# test/stress/concurrent-commits.sh

echo "=== Concurrent Commit Storm Test ==="

TEST_DIR="/tmp/devdiff-concurrent-$(date +%s)"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

git init
git config user.email "concurrent@test.dev"
git config user.name "Concurrent Test"
devdiff init --yes

echo ""
echo "🌪️ Simulating: 5 developers committing simultaneously"

# Create 5 branches with rapid changes
for branch in {1..5}; do
    (
        git checkout -b "dev-$branch" 2>/dev/null || git checkout "dev-$branch"
        
        for commit in {1..20}; do
            for file in {1..10}; do
                echo "// dev-$branch commit-$commit file-$file" > "src/dev${branch}_${commit}_${file}.ts"
            done
            git add .
            git commit -m "dev-$branch: batch $commit" --quiet
        done
    ) &
done

# Wait for all background processes
wait

echo "   ✅ 5 developers × 20 commits × 10 files = 1000 files created"

echo ""
echo "🔍 Running DevDiff on all branches..."
START=$(date +%s)

for branch in {1..5}; do
    git checkout "dev-$branch" --quiet
    devdiff analyze --since "HEAD~20..HEAD" --format json --output "/tmp/result-$branch.json" &
done
wait

ELAPSED=$(($(date +%s) - START))

echo "   ✅ All 5 branches analyzed in ${ELAPSED}s"

# Verify all analyses completed
SUCCESS=0
for branch in {1..5}; do
    if [ -f "/tmp/result-$branch.json" ]; then
        FILES=$(cat "/tmp/result-$branch.json" | jq '.stats.files_changed')
        echo "   Branch $branch: $FILES files analyzed"
        SUCCESS=$((SUCCESS + 1))
    fi
done

echo ""
echo "📊 Results: $SUCCESS/5 branches analyzed successfully"

rm -rf "$TEST_DIR" /tmp/result-*.json
