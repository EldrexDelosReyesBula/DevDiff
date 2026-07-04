# test/cross-platform.ps1 - Native Windows PowerShell Cross-Platform Compatibility Tester

Write-Host "+----------------------------------------------+" -ForegroundColor Cyan
Write-Host "|   CROSS-PLATFORM COMPATIBILITY TESTS (WIN)   |" -ForegroundColor Cyan
Write-Host "+----------------------------------------------+" -ForegroundColor Cyan
Write-Host ""

$platform = node -e "console.log(process.platform)"
$fail = 0

Write-Host "Platform: $platform"
Write-Host ""

# Test 1: Platform detection
Write-Host "1. Platform detection..."
$code1 = @'
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
'@
$output = node -e $code1
Write-Host "   $output"
if ($output -match "os") {
    Write-Host "   ✅ Platform detection works" -ForegroundColor Green
} else {
    Write-Host "   ❌ Platform detection failed" -ForegroundColor Red
    $fail++
}

# Test 2: Requirements check
Write-Host "2. Requirements check..."
$code2 = @'
const { PlatformCompat } = require('./packages/core/dist/index');
PlatformCompat.checkRequirements().then(result => {
  console.log('   Compatible:', result.compatible);
  console.log('   Issues:', result.issues.length);
  if (result.issues.length > 0) {
    result.issues.forEach(i => console.log('   •', i.severity, '-', i.message));
  }
});
'@
node -e $code2

# Test 3: Secure input detection
Write-Host "3. Secure input availability..."
$code3 = @'
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
'@
node -e $code3

# Test 4: Terminal state restoration
Write-Host "4. Terminal state test..."
$code4 = @'
const wasRaw = process.stdin.isRaw;
if (process.stdin.setRawMode) {
  process.stdin.setRawMode(true);
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
'@
node -e $code4

# Test 5: Error formatting
Write-Host "5. Error output format..."
$code5 = @'
const { GitError } = require('./packages/core/dist/index');
const error = new GitError('Not a git repository');
console.log(error.toCLIOutput());
'@
$errorOutput = node -e $code5
if ($errorOutput -match "Error Code" -and $errorOutput -match "GIT_001") {
    Write-Host "   ✅ Error formatting correct" -ForegroundColor Green
} else {
    Write-Host "   ❌ Error formatting broken" -ForegroundColor Red
    $fail++
}

# Test 6: Retry logic
Write-Host "6. Retry logic..."
$code6 = @'
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
'@
node -e $code6

Write-Host ""
Write-Host "---------------------------------------------"
if ($fail -eq 0) {
    Write-Host "   ✅ Cross-platform tests passed" -ForegroundColor Green
} else {
    Write-Host "   ❌ $fail failures" -ForegroundColor Red
}
Write-Host "---------------------------------------------"

if ($fail -gt 0) {
    exit 1
} else {
    exit 0
}
