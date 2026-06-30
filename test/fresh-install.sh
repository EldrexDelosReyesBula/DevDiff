#!/bin/bash
# test/fresh-install.sh

echo "=== Fresh Install Test ==="

# Clean everything
rm -rf /tmp/devdiff-test
mkdir -p /tmp/devdiff-test
cd /tmp/devdiff-test

# Initialize git repo
git init
echo "console.log('hello')" > index.js
git add . && git commit -m "initial commit"

# Install DevDiff globally
npm install -g @eldrex/cli

# Initialize DevDiff
devdiff init --yes

# Verify files created
check_file() {
    [ -f "$1" ] && echo "✅ $1 created" || echo "❌ $1 missing"
}

check_file ".devdiff.config.js"
check_file ".devdiffignore"
check_file ".git/hooks/post-commit"

# Test basic command
devdiff --version && echo "✅ CLI works" || echo "❌ CLI broken"
devdiff --help && echo "✅ Help works" || echo "❌ Help broken"
