# Quick Start

Get up and running with `@eldrex/cli` in less than two minutes.

## 1. Stage Changes

Make some changes to your code and stage them using git:

```bash
git add .
```

## 2. Generate Explanation

Run the generator to see an AI-powered explanation of the staged changes:

```bash
devdiff generate
```

## 3. Specify a Persona

Format the changelog with different personas using the `--persona` flag:

```bash
devdiff generate --persona compliance
```

## 4. Run the Daemon Watcher

To continuously watch a repository and run custom pipelines on new commits, launch the watcher:

```bash
devdiff watch
```
