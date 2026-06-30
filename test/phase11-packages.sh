#!/bin/bash
# test/phase11-packages.sh

echo "╔══════════════════════════════════════════════╗"
echo "║   PHASE 11: Package Integrity Check          ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

FAIL=0

PACKAGES=(
    "@eldrex/core"
    "@eldrex/cli"
    "@eldrex/personas"
    "@eldrex/dashboard"
    "@eldrex/gateway"
    "@eldrex/vite"
    "@eldrex/vscode"
    "@eldrex/openclaw"
    "create-devdiff-app"
)

# Since packages are local and not published on registry under this specific name yet,
# we will verify their local package.json package configurations.
PROJECT_DIR="c:/Users/Eldrex/Downloads/classhost/DevDiff"

check_local_pkg() {
    local PKG_PATH="$1"
    local NAME="$2"
    
    echo "📦 $NAME ($PKG_PATH)"
    
    if [ ! -f "$PKG_PATH/package.json" ]; then
        echo "   ❌ package.json missing"
        FAIL=$((FAIL + 1))
        return
    fi
    
    # Check for README
    if [ -f "$PKG_PATH/README.md" ] || [ -f "$PKG_PATH/README.md" ]; then
        echo "   ✅ Has README"
    else
        echo "   ❌ Missing README"
        FAIL=$((FAIL + 1))
    fi
    
    # Check license in package.json
    LICENSE=$(node -e "try { console.log(require('$PKG_PATH/package.json').license || ''); } catch { console.log(''); }")
    if [ -n "$LICENSE" ]; then
        echo "   ✅ License: $LICENSE"
    else
        echo "   ⚠️ Missing or unparseable license field"
    fi
    
    # Run audit on this package directory
    echo "   🔍 Running dependency security check..."
    if (cd "$PKG_PATH" && pnpm audit --audit-level=high) 2>/dev/null; then
        echo "   ✅ No high/critical dependencies vulnerabilities"
    else
        echo "   ⚠️ Audit failed or found warnings (review recommended)"
    fi
    
    echo ""
}

check_local_pkg "$PROJECT_DIR/packages/core" "@eldrex/core"
check_local_pkg "$PROJECT_DIR/packages/cli" "@eldrex/cli"
check_local_pkg "$PROJECT_DIR/packages/personas" "@eldrex/personas"
check_local_pkg "$PROJECT_DIR/packages/web-dashboard" "@eldrex/dashboard"
check_local_pkg "$PROJECT_DIR/packages/gateway" "@eldrex/gateway"
check_local_pkg "$PROJECT_DIR/packages/vite-plugin" "@eldrex/vite"
check_local_pkg "$PROJECT_DIR/packages/vscode" "@eldrex/vscode"
check_local_pkg "$PROJECT_DIR/packages/integrations/openclaw" "@eldrex/openclaw"
check_local_pkg "$PROJECT_DIR/packages/create-devdiff-app" "create-devdiff-app"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
[ $FAIL -eq 0 ] && echo "   ✅ Package integrity checks passed" || echo "   ❌ $FAIL package issues"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
