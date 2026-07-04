#!/bin/bash
# audit/code-quality.sh

echo "=== CODE QUALITY AUDIT ==="
FAIL=0

# 1. TypeScript strict mode
echo "1. TypeScript Strict Mode..."
for pkg in packages/*/; do
    if grep -q '"strict": true' "$pkg/tsconfig.json" 2>/dev/null || (grep -q '"extends"' "$pkg/tsconfig.json" 2>/dev/null && ! grep -q '"strict": false' "$pkg/tsconfig.json" 2>/dev/null); then
        echo "   ✅ $pkg: strict mode enabled"
    else
        echo "   ❌ $pkg: strict mode NOT enabled"
        FAIL=$((FAIL + 1))
    fi
done

# 2. No 'any' types (except where documented)
echo "2. 'any' type usage..."
ANY_COUNT=$(grep -r ": any" packages/*/src/ --include="*.ts" | grep -v "// allow-any" | wc -l)
if [ "$ANY_COUNT" -lt 15 ]; then
    echo "   ✅ Only $ANY_COUNT undocumented 'any' types"
else
    echo "   ⚠️ $ANY_COUNT undocumented 'any' types — review needed"
fi

# 3. No console.log in production
echo "3. Console.log in production code..."
LOG_COUNT=$(grep -r "console.log" packages/*/src/ --include="*.ts" | grep -v "test\|debug\|outputChannel" | wc -l)
if [ "$LOG_COUNT" -eq 0 ]; then
    echo "   ✅ No console.log in production"
else
    echo "   ⚠️ $LOG_COUNT console.log statements — remove or use logger"
fi

# 4. No TODO without issue reference
echo "4. Unreferenced TODOs..."
TODO_COUNT=$(grep -r "TODO" packages/*/src/ --include="*.ts" | grep -v "TODO(#\|TODO(https://" | wc -l)
if [ "$TODO_COUNT" -eq 0 ]; then
    echo "   ✅ All TODOs have issue references"
else
    echo "   ⚠️ $TODO_COUNT TODOs without issue reference"
fi

# 5. Test coverage
echo "5. Test coverage..."
echo "   📊 Run tests and coverage via: pnpm test"

exit $FAIL
