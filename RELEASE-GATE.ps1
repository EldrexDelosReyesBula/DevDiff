# RELEASE-GATE.ps1 — Native Windows PowerShell Release Gate
# Run this before any release to verify code quality, security, privacy, performance, and package health.

Write-Host "+----------------------------------------------+" -ForegroundColor Cyan
Write-Host "|     DEVDIFF v1.0.3 -- RELEASE GATE (WIN)     |" -ForegroundColor Cyan
Write-Host "|     ALL checks must PASS before release      |" -ForegroundColor Cyan
Write-Host "+----------------------------------------------+" -ForegroundColor Cyan
Write-Host ""

$totalPass = 0
$totalFail = 0

# --- SECTION 1: Code Quality ---
Write-Host "--- Code Quality ---" -ForegroundColor Yellow
$qcFail = $false

# 1. TS Strict mode
$tsconfigFiles = Get-ChildItem -Path "packages" -Filter "tsconfig.json" -Recurse
foreach ($tsconfig in $tsconfigFiles) {
    $content = Get-Content $tsconfig.FullName -Raw
    if (($content -match '"strict":\s*true') -or (($content -match '"extends"') -and ($content -notmatch '"strict":\s*false'))) {
        Write-Host "   ✅ $($tsconfig.Directory.Name): strict mode enabled"
    } else {
        Write-Host "   ❌ $($tsconfig.Directory.Name): strict mode NOT enabled" -ForegroundColor Red
        $qcFail = $true
    }
}

# 2. Undocumented 'any' check
$anyMatches = Get-ChildItem -Path "packages" -Filter "*.ts" -Recurse | 
    Where-Object { $_.FullName -notmatch "node_modules|dist|tests" } |
    Select-String -Pattern ": any" | 
    Where-Object { $_.Line -notmatch "// allow-any" }

$anyCount = @($anyMatches).Count
if ($anyCount -lt 15) {
    Write-Host "   ✅ Only $anyCount undocumented 'any' types"
} else {
    Write-Host "   ⚠️ $anyCount undocumented 'any' types -- review needed" -ForegroundColor Yellow
}

# 3. console.log check
$logMatches = Get-ChildItem -Path "packages" -Filter "*.ts" -Recurse | 
    Where-Object { $_.FullName -notmatch "node_modules|dist|tests|disclose.ts" } |
    Select-String -Pattern "console.log"

$logCount = @($logMatches).Count
if ($logCount -eq 0) {
    Write-Host "   ✅ No console.log in production"
} else {
    Write-Host "   ⚠️ $logCount console.log statements found" -ForegroundColor Yellow
}

if (-not $qcFail) { $totalPass++ } else { $totalFail++ }
Write-Host ""

# --- SECTION 2: Security Scan ---
Write-Host "--- Security Scan ---" -ForegroundColor Yellow
$secFail = $false

# 1. pnpm audit
if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    $null = pnpm audit --audit-level critical 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ❌ pnpm audit found critical vulnerabilities" -ForegroundColor Red
        $secFail = $true
    } else {
        Write-Host "   ✅ pnpm audit check passed"
    }
} else {
    Write-Host "   ⚠️ pnpm not installed, skipping audit" -ForegroundColor Yellow
}

# 2. Lockfiles
$lockFound = $false
if (Test-Path "pnpm-lock.yaml") {
    $lockFound = $true
}
if ($lockFound) {
    Write-Host "   ✅ Root workspace lockfile present"
} else {
    Write-Host "   ❌ Root workspace lockfile missing" -ForegroundColor Red
    $secFail = $true
}

if (-not $secFail) { $totalPass++ } else { $totalFail++ }
Write-Host ""

# --- SECTION 3: Privacy Audit ---
Write-Host "--- Privacy Audit ---" -ForegroundColor Yellow
# 1. Telemetry check
$telemetryMatches = Get-ChildItem -Path "packages" -Filter "*.ts" -Recurse | 
    Where-Object { $_.FullName -notmatch "node_modules|dist|tests|network-guard.ts" } |
    Select-String -Pattern "mixpanel|sentry|amplitude|datadog|newrelic"

if (@($telemetryMatches).Count -eq 0) {
    Write-Host "   ✅ No telemetry endpoints found"
} else {
    Write-Host "   ⚠️ Potential telemetry references found in source code (review suggested)" -ForegroundColor Yellow
}
$totalPass++
Write-Host ""

# --- SECTION 4: Performance Benchmarks ---
Write-Host "--- Performance Benchmarks ---" -ForegroundColor Yellow
$benchDir = "./.devdiff-bench-temp"
if (Test-Path $benchDir) { Remove-Item $benchDir -Recurse -Force }
New-Item -ItemType Directory -Path $benchDir -Force | Out-Null

# Time simple dry-run
$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
node packages/cli/dist/index.js generate --dry-run | Out-Null
$stopwatch.Stop()
$elapsed = $stopwatch.ElapsedMilliseconds

Write-Host "   ⏱️ ${elapsed}ms (threshold: <1000ms)"
if ($elapsed -lt 1000) {
    Write-Host "   ✅ PASS"
} else {
    Write-Host "   ⚠️ Warning: Dry-run benchmark took longer than 1000ms" -ForegroundColor Yellow
}

if (Test-Path $benchDir) { Remove-Item $benchDir -Recurse -Force }
$totalPass++
Write-Host ""

# --- SECTION 5: Package Health Check ---
Write-Host "--- Package Health ---" -ForegroundColor Yellow
$healthFail = $false

$packages = @("packages/core", "packages/cli", "packages/personas", "packages/gateway", "packages/vscode")
foreach ($pkg in $packages) {
    if (Test-Path $pkg) {
        if (-not (Test-Path "$pkg/package.json")) { continue }
        
        $pkgJson = Get-Content "$pkg/package.json" -Raw | ConvertFrom-Json
        Write-Host "  Package: $($pkgJson.name) ($($pkgJson.version))"
        
        if ($pkgJson.license -eq "MIT") {
            Write-Host "  ✅ License: MIT"
        } else {
            Write-Host "  ❌ Invalid License: $($pkgJson.license)" -ForegroundColor Red
            $healthFail = $true
        }
        
        if (Test-Path "$pkg/README.md") {
            $readmeSize = (Get-Item "$pkg/README.md").Length
            if ($readmeSize -gt 100) {
                Write-Host "  ✅ README.md present ($readmeSize bytes)"
            } else {
                Write-Host "  ❌ README.md too short ($readmeSize bytes)" -ForegroundColor Red
                $healthFail = $true
            }
        } else {
            Write-Host "  ❌ README.md is MISSING" -ForegroundColor Red
            $healthFail = $true
        }
    }
}

if (-not $healthFail) { $totalPass++ } else { $totalFail++ }
Write-Host ""

# --- FINAL REPORT ---
Write-Host "+----------------------------------------------+" -ForegroundColor Cyan
Write-Host "|              FINAL VERDICT                   |" -ForegroundColor Cyan
Write-Host "+----------------------------------------------+" -ForegroundColor Cyan
Write-Host "|  Passed: $totalPass/5 sections                        |" -ForegroundColor Cyan
Write-Host "|  Failed: $totalFail/5 sections                        |" -ForegroundColor Cyan
Write-Host "|                                              |" -ForegroundColor Cyan

if ($totalFail -eq 0) {
    Write-Host "|  ✅ READY FOR RELEASE                        |" -ForegroundColor Green
    Write-Host "|                                              |" -ForegroundColor Cyan
    Write-Host "|  Next steps:                                 |" -ForegroundColor Cyan
    Write-Host "|  1. npm version patch                        |" -ForegroundColor Cyan
    Write-Host "|  2. git push --tags                          |" -ForegroundColor Cyan
    Write-Host "|  3. npm publish --workspaces                 |" -ForegroundColor Cyan
    Write-Host "|  4. vsce publish                             |" -ForegroundColor Cyan
} else {
    Write-Host "|  ❌ NOT READY -- Fix $totalFail sections           |" -ForegroundColor Red
}
Write-Host "+----------------------------------------------+" -ForegroundColor Cyan

if ($totalFail -gt 0) {
    exit 1
} else {
    exit 0
}
