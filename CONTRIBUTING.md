# Contributing to DevDiff

First off — thank you! DevDiff exists because of contributors like you.

## Code of Conduct

We follow the [Contributor Covenant](CODE_OF_CONDUCT.md). Please read it.

## Ways to Contribute

| What | Time | Skills |
|------|------|--------|
| Report bugs | 5 min | Using DevDiff |
| Improve docs | 15 min | Writing, code examples |
| Answer questions | 30 min | DevDiff experience |
| Fix good-first-issues | 1-2 hours | TypeScript |
| Add AI providers | 2-4 hours | TypeScript, REST APIs |
| Core development | Ongoing | TypeScript, ASTs, Git internals |

## Development Setup

```bash
# Prerequisites
node >= 20
pnpm >= 9
git
ollama (for local AI testing)

# Clone & install
git clone https://github.com/EldrexDelosReyesBula/devdiff.git
cd devdiff
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Start docs locally
pnpm docs:dev

# Run DevDiff on itself!
pnpm devdiff generate
```

## Project Structure

```
packages/
├── core/          # @eldrex/core — main library
├── cli/           # @eldrex/cli — command line interface
├── vscode/        # VS Code extension
├── vite-plugin/   # @eldrex/vite — Vite integration
└── dashboard/     # Web dashboard
```

## Finding Issues

- [`good-first-issue`](https://github.com/EldrexDelosReyesBula/devdiff/issues?q=label:good-first-issue)
- [`help-wanted`](https://github.com/EldrexDelosReyesBula/devdiff/issues?q=label:help-wanted)
- [`documentation`](https://github.com/EldrexDelosReyesBula/devdiff/issues?q=label:documentation)

## Pull Request Process

1. Fork and create a branch: `feature/my-feature` or `fix/my-bug`
2. Add tests if applicable
3. Run `pnpm lint && pnpm test`
4. Update docs if needed
5. Submit PR with description using the template

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(core): add AST-aware diff trimming
fix(cli): handle missing git config
docs(guide): add Ollama setup instructions
test(core): add unit tests for batcher
```

## Recognition

Significant contributions earn commit access via our [Governance](GOVERNANCE.md) model.
