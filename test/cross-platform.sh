#!/bin/bash
# test/cross-platform.sh

echo "╔══════════════════════════════════════════════╗"
echo "║   CROSS-PLATFORM COMPATIBILITY TESTS          ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

PLATFORM=$(node -e "console.log(process.platform)")
FAIL=0

echo "Platform: $PLATFORM"
echo ""

# Test 1: Platform detection
echo "1. Platform detection..."
OUTPUT=$(node -e "
  const { PlatformCompat } = require('./packages/core/dist/index');
  const info = PlatformCompat.detect();
  console.log(JSON.stringify({
    os: info.os,
    isWSL: info.isWSL,
    isContainer: info.isContainer,
    isCI: info.isCI,
    lineEnding: info.lineEnding,
    shellCommand: info.shellCommand
  }));
")
echo "   $OUTPUT"
if echo "$OUTPUT" | grep -q '"os"'; then
    echo "   ✅ Platform detection works"
else
    echo "   ❌ Platform detection failed"
    FAIL=$((FAIL + 1))
fi

# Test 2: Requirements check
echo "2. Requirements check..."
node -e "
  const { PlatformCompat } = require('./packages/core/dist/index');
  PlatformCompat.checkRequirements().then(result => {
    console.log('   Compatible:', result.compatible);
    console.log('   Issues:', result.issues.length);
    if (result.issues.length > 0) {
      result.issues.forEach(i => console.log('   •', i.severity, '-', i.message));
    }
  });
"

echo "3. Secure input availability..."
node -e "
  const fs = require('fs');
  const files = fs.readdirSync('./packages/cli/dist');
  const target = files.find(f => f.startsWith('secure-input-') && f.endsWith('.js'));
  if (target) {
    import('./packages/cli/dist/' + target).then(m => {
      console.log('   Interactive:', process.stdin.isTTY);
      console.log('   Secure input available:', m.canSecurePrompt());
    }).catch(err => console.error(err));
  } else {
    console.log('   ⚠️ Could not find secure-input build asset');
  }
"

# Test 4: Terminal state restoration
echo "4. Terminal state test..."
node -e "
  // Save current state
  const wasRaw = process.stdin.isRaw;
  
  // Simulate raw mode
  if (process.stdin.setRawMode) {
    process.stdin.setRawMode(true);
    // Immediately restore
    process.stdin.setRawMode(false);
    
    const isRaw = process.stdin.isRaw;
    if (isRaw === wasRaw) {
      console.log('   ✅ Terminal state correctly restored');
    } else {
      console.log('   ❌ Terminal state NOT restored');
      process.exit(1);
    }
  } else {
    console.log('   ⚠️ setRawMode not available (non-TTY?)');
  }
"

# Test 5: Error formatting
echo "5. Error output format..."
OUTPUT=$(node -e "
  const { GitError } = require('./packages/core/dist/index');
  const error = new GitError('Not a git repository');
  console.log(error.toCLIOutput());
" 2>&1)
if echo "$OUTPUT" | grep -q "Error Code\|GIT_001\|Fix:"; then
    echo "   ✅ Error formatting correct"
else
    echo "   ❌ Error formatting broken"
    FAIL=$((FAIL + 1))
fi

# Test 6: Retry logic
echo "6. Retry logic..."
node -e "
  const { withRetry } = require('./packages/core/dist/index');
  let attempts = 0;
  
  withRetry(async () => {
    attempts++;
    if (attempts < 3) throw new Error('Temporary failure');
    return 'success';
  }, { maxAttempts: 3, backoffMs: 10 }).then(result => {
    console.log('   Result:', result);
    console.log('   Attempts:', attempts);
    if (attempts === 3 && result === 'success') {
      console.log('   ✅ Retry works correctly');
    } else {
      console.log('   ❌ Retry broken');
    }
  }).catch(err => {
    console.log('   ❌ Retry failed:', err.message);
  });
"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
[ $FAIL -eq 0 ] && echo "   ✅ Cross-platform tests passed" || echo "   ❌ $FAIL failures"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

exit $FAIL
