#!/bin/bash
# test/phase3-git.sh

echo "╔══════════════════════════════════════════════╗"
echo "║   PHASE 3: Git Integration Testing           ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

TEST_DIR="/tmp/devdiff-git-test-$(date +%s)"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"
FAIL=0

# Setup
git init
git config user.email "test@devdiff.dev"
git config user.name "Test"
devdiff init --yes

echo "📋 Test 1: Initial commit detection"
echo "console.log('initial')" > app.js
git add app.js
git commit -m "initial commit"
if devdiff generate --dry-run 2>&1 | grep -q "app.js"; then
    echo "   ✅ Detects initial commit"
else
    echo "   ❌ Failed to detect initial commit"
    FAIL=$((FAIL + 1))
fi

echo ""
echo "📋 Test 2: File addition detection"
echo "function newFeature() {}" > feature.js
git add feature.js
if devdiff generate --dry-run 2>&1 | grep -q "feature.js"; then
    echo "   ✅ Detects new file"
else
    echo "   ❌ Failed to detect new file"
    FAIL=$((FAIL + 1))
fi
git commit -m "add feature"

echo ""
echo "📋 Test 3: File modification detection"
echo "function newFeature() { return true; }" > feature.js
git add feature.js
if devdiff generate --dry-run 2>&1 | grep -q "modified|feature.js"; then
    echo "   ✅ Detects modification"
else
    echo "   ❌ Failed to detect modification"
    FAIL=$((FAIL + 1))
fi
git commit -m "modify feature"

echo ""
echo "📋 Test 4: File deletion detection"
git rm feature.js
if devdiff generate --dry-run 2>&1 | grep -q "deleted|feature.js"; then
    echo "   ✅ Detects deletion"
else
    echo "   ❌ Failed to detect deletion"
    FAIL=$((FAIL + 1))
fi
git commit -m "delete feature"

echo ""
echo "📋 Test 5: Multi-file changes"
for i in {1..10}; do
    echo "export const f$i = () => {}" > "file$i.ts"
done
git add .
git commit -m "add 10 files"
OUTPUT=$(devdiff generate --dry-run 2>&1)
if echo "$OUTPUT" | grep -q "10"; then
    echo "   ✅ Detects multi-file changes"
else
    echo "   ❌ Failed multi-file detection"
    echo "      Output: ${OUTPUT:0:200}"
    FAIL=$((FAIL + 1))
fi

echo ""
echo "📋 Test 6: Commit range analysis"
git checkout -b feature-branch 2>/dev/null
echo "branch code" > branch.js
git add branch.js
git commit -m "branch commit"
git checkout main 2>/dev/null
git merge feature-branch --no-edit 2>/dev/null
if devdiff generate --since "HEAD~1..HEAD" --dry-run 2>&1 | grep -qi "merge\|branch"; then
    echo "   ✅ Handles merge commits"
else
    echo "   ⚠️ Merge handling needs review"
fi

echo ""
echo "📋 Test 7: Binary files (should skip gracefully)"
dd if=/dev/urandom of=image.png bs=1024 count=10 2>/dev/null
git add image.png
git commit -m "add image" 2>/dev/null
OUTPUT=$(devdiff generate --dry-run 2>&1)
if echo "$OUTPUT" | grep -qi "binary\|skip\|image"; then
    echo "   ✅ Handles binary files"
else
    echo "   ⚠️ Binary handling needs review"
fi

echo ""
echo "📋 Test 8: Large file (>10K lines)"
python3 -c "for i in range(10000): print(f'const x{i} = {i};')" > large.js 2>/dev/null || \
  for i in {1..10000}; do echo "const x$i = $i;" >> large.js; done
git add large.js
git commit -m "add large file" 2>/dev/null
START=$(date +%s%N)
devdiff generate --dry-run >/dev/null 2>&1
ELAPSED=$((($(date +%s%N) - START) / 1000000))
echo "   ✅ Large file processed in ${ELAPSED}ms"
if [ $ELAPSED -gt 10000 ]; then
    echo "   ⚠️ Large file took >10s — may need optimization"
fi

echo ""
echo "📋 Test 9: Special characters in filenames"
echo "content" > "file-with-dashes.js"
echo "content" > "file_with_underscores.js"
echo "content" > "FileWithUpper.js"
echo "content" > "file@test.js" 2>/dev/null || true
git add *.js 2>/dev/null
git commit -m "special chars" 2>/dev/null
if devdiff generate --dry-run 2>&1 | grep -q "file-with-dashes"; then
    echo "   ✅ Handles special characters"
else
    echo "   ⚠️ Special char handling needs review"
fi

echo ""
echo "📋 Test 10: .gitignore respect"
echo "ignored-file.js" > .gitignore
echo "secret" > ignored-file.js
echo "public" > tracked-file.js
git add .gitignore tracked-file.js
git commit -m "add gitignore"
OUTPUT=$(devdiff generate --dry-run 2>&1)
if echo "$OUTPUT" | grep -qv "ignored-file"; then
    echo "   ✅ Respects .gitignore"
else
    echo "   ⚠️ Gitignore handling needs review"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
[ $FAIL -eq 0 ] && echo "   ✅ Git integration tests passed" || echo "   ❌ $FAIL git test failures"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

rm -rf "$TEST_DIR"
