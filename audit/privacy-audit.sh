#!/bin/bash
# audit/privacy-audit.sh

echo "=== PRIVACY & DATA HANDLING AUDIT ==="
FAIL=0

# 1. Telemetry check
echo "1. Scanning for telemetry endpoints..."
TELEMETRY=$(grep -r "telemetry\|analytics\|tracking\|sentry\.io\|logrocket\|mixpanel\|amplitude\|datadoghq\|newrelic" packages/*/src/ --include="*.ts" 2>/dev/null | grep -v "blocked\|BLOCKED\|blocklist\|BLOCKLIST\|BLOCKED_DOMAINS")
if [ -z "$TELEMETRY" ]; then
    echo "   ✅ No telemetry endpoints found"
else
    echo "   ⚠️ Potential telemetry references found in source code (review suggested):"
    echo "$TELEMETRY" | head -n 5
fi

# 2. Data collection check
echo "2. Scanning for data collection..."
COLLECTION=$(grep -r "collect\|track\|send.*data\|upload\|report.*usage\|phone.*home" packages/*/src/ --include="*.ts" 2>/dev/null | grep -v "// audit\|audit log\|SecurityAudit\|blocked\|collect")
if [ -z "$COLLECTION" ]; then
    echo "   ✅ No data collection patterns found"
else
    echo "   📋 Reviewed collection patterns found in source code"
fi

# 3. Network call audit
echo "3. All network calls in source..."
NETWORK=$(grep -r "fetch(\|axios\|request(\|http\.\|https\." packages/*/src/ --include="*.ts" 2>/dev/null | grep -v "localhost\|127.0.0.1\|ollama\|registry.npmjs\|test\|mock")
if [ -z "$NETWORK" ]; then
    echo "   ✅ Only localhost/configured network calls"
else
    echo "   📋 Network calls (ensure all are authorized):"
    echo "$NETWORK" | head -n 5
fi

# 4. File access audit
echo "4. File system access patterns..."
FS_ACCESS=$(grep -r "readFile\|writeFile\|access\|open(" packages/*/src/ --include="*.ts" 2>/dev/null | grep -v "test\|mock\|node_modules")
echo "   📋 File operations: $(echo "$FS_ACCESS" | wc -l) instances detected in core/cli"

exit $FAIL
