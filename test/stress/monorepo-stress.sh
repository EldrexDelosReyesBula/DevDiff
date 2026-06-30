#!/bin/bash
# test/stress/monorepo-stress.sh

echo "=== Monorepo Stress Test ==="

TEST_DIR="/tmp/devdiff-monorepo-$(date +%s)"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

git init
git config user.email "monorepo@test.dev"
git config user.name "Monorepo Test"
devdiff init --yes

echo ""
echo "🏗️ Building monorepo structure..."

# Create monorepo with 10 packages
PACKAGES=("core" "api" "web" "admin" "mobile" "shared" "utils" "db" "auth" "workers")

for pkg in "${PACKAGES[@]}"; do
    mkdir -p "packages/$pkg/src"
    mkdir -p "packages/$pkg/tests"
    
    # Package.json
    cat > "packages/$pkg/package.json" <<EOF
{
  "name": "@mono/$pkg",
  "version": "1.0.0",
  "main": "dist/index.js"
}
EOF
    
    # Source files
    for file in {1..50}; do
        cat > "packages/$pkg/src/file${file}.ts" <<EOF
export function ${pkg}Function${file}(input: unknown): unknown {
    return input
}
EOF
    done
    
    # Test files
    for file in {1..20}; do
        cat > "packages/$pkg/tests/test${file}.test.ts" <<EOF
import { describe, it, expect } from 'vitest'
import { ${pkg}Function${file} } from '../src/file${file}'

describe('${pkg}Function${file}', () => {
    it('works', () => {
        expect(${pkg}Function${file}(42)).toBe(42)
    })
})
EOF
    done
done

# Add root config files
cat > "package.json" <<EOF
{
  "name": "monorepo-test",
  "private": true,
  "workspaces": ["packages/*"]
}
EOF

cat > "tsconfig.json" <<EOF
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "ESNext"
  }
}
EOF

# Commit everything
git add .
git commit -m "initial monorepo setup"

echo "   Created: ${#PACKAGES[@]} packages"
echo "   Files per package: 50 source + 20 test = 70 files"
echo "   Total files: $((${#PACKAGES[@]} * 70 + 3))"

echo ""
echo "🔍 Running DevDiff analysis on initial commit..."
START=$(date +%s)

devdiff analyze --since "HEAD~1..HEAD" --format json --output /tmp/monorepo-result.json

ELAPSED=$(($(date +%s) - START))

FILES=$(cat /tmp/monorepo-result.json | jq '.stats.files_changed')
LINES=$(cat /tmp/monorepo-result.json | jq '.stats.total_changes')

echo "   ✅ Analysis complete in ${ELAPSED}s"
echo "   📁 Files: $FILES"
echo "   📝 Lines: $LINES"

# Make changes across multiple packages
echo ""
echo "🔄 Making cross-package changes..."

for pkg in "${PACKAGES[@]:0:5}"; do
    for file in {1..25}; do
        echo "export const VERSION = '2.0.0'" >> "packages/$pkg/src/file${file}.ts"
    done
done

git add .
git commit -m "cross-package version update"

START=$(date +%s)
devdiff analyze --since "HEAD~1..HEAD" --format json --output /tmp/monorepo-result2.json
ELAPSED=$(($(date +%s) - START))

echo "   ✅ Cross-package analysis: ${ELAPSED}s"

rm -rf "$TEST_DIR" /tmp/monorepo-result*.json
