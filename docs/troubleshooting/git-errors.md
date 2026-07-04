# Git Errors

## ❌ Error: "Not a git repository"

### What This Means

You ran `devdiff` in a folder that has no `.git` directory.

### Fix

```bash
# Check if you're in the right folder
ls -la
# Look for a .git directory

# If not, initialize git
git init
git add .
git commit -m "initial commit"

# Then initialize DevDiff
devdiff init
devdiff generate
```

---

## ❌ Error: "No staged changes"

### What This Means

DevDiff analyzes **staged** changes (files you've `git add`-ed). There's nothing staged yet.

### Fix

```bash
# See what's unstaged
git status

# Stage all changes
git add .

# Or stage specific files
git add src/app.js

# Now generate
devdiff generate
```

---

## ❌ Error: "HEAD not found" or "initial commit"

### What This Means

This is a brand-new repository with no commits yet. DevDiff needs at least one commit to compare against.

### Fix

```bash
# Make your first commit
git add .
git commit -m "initial commit"

# Now make another change, stage it, then run DevDiff
echo "// hello" >> app.js
git add app.js
devdiff generate
```

---

## ❌ Error: "Git not found" or "git: command not found"

### What This Means

Git is not installed or not in your PATH.

### Fix

#### Windows
Download Git from [git-scm.com](https://git-scm.com) and install it.
Then restart your terminal.

```powershell
# Verify after install
git --version
```

#### macOS
```bash
# Install via Homebrew
brew install git

# Or via Xcode CLI tools
xcode-select --install
```

#### Linux
```bash
# Debian/Ubuntu
sudo apt install git

# Fedora/RHEL
sudo dnf install git

# Arch
sudo pacman -S git
```

---

## ❌ Warning: "LF will be replaced by CRLF"

### What This Means

Windows uses CRLF line endings, Unix uses LF. This warning is **harmless**.

### Suppress It

```bash
git config core.autocrlf true
```

---

## ❌ Error: "Permission denied (.git/index.lock)"

### What This Means

Another Git process is running, or a previous one crashed and left a lock file.

### Fix

```bash
# Remove the lock file
rm .git/index.lock

# On Windows (PowerShell)
Remove-Item .git\index.lock

# Then try again
git add .
devdiff generate
```

---

## ❌ DevDiff sees no changes after committing

### What This Means

DevDiff compares **staged** (not committed) changes to the last commit. Once you commit, the diff is "consumed."

### Fix

```bash
# Make a new change after your commit
echo "// another change" >> app.js
git add app.js
devdiff generate
```

---

## Understanding How DevDiff Uses Git

```
Working directory  →  git add  →  Staging area  →  devdiff generate
                                      ↑
                              DevDiff reads from here
```

DevDiff reads from the **staging area** (index), not the working directory and not committed history. Always `git add` before running `devdiff generate`.
