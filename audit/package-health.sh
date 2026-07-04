#!/bin/bash
# audit/package-health.sh

echo "=== PACKAGE HEALTH CHECK ==="
FAIL=0

PACKAGES=(
    "packages/core"
    "packages/cli"
    "packages/personas"
    "packages/gateway"
    "packages/vscode"
)

for pkg in "${PACKAGES[@]}"; do
    if [ -d "$pkg" ]; then
        echo "=== $pkg ==="
        
        # Check Name & Version in package.json
        NAME=$(grep -m1 '"name":' "$pkg/package.json" | cut -d'"' -f4)
        VERSION=$(grep -m1 '"version":' "$pkg/package.json" | cut -d'"' -f4)
        echo "  Package: $NAME ($VERSION)"
        
        # Check README size
        if [ -f "$pkg/README.md" ]; then
            README_SIZE=$(wc -c < "$pkg/README.md")
            if [ $README_SIZE -gt 100 ]; then
                echo "  ✅ README.md present ($README_SIZE bytes)"
            else
                echo "  ❌ README.md too short ($README_SIZE bytes)"
                FAIL=$((FAIL + 1))
            fi
        else
            echo "  ❌ README.md is MISSING"
            FAIL=$((FAIL + 1))
        fi
        
        # Check License
        LICENSE=$(grep -m1 '"license":' "$pkg/package.json" | cut -d'"' -f4)
        if [ "$LICENSE" = "MIT" ]; then
            echo "  ✅ License: MIT"
        else
            echo "  ❌ Invalid License: $LICENSE"
            FAIL=$((FAIL + 1))
        fi
    fi
done

exit $FAIL
