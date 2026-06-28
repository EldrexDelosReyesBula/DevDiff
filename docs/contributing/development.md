# Development Guide

Step-by-step setup to develop DevDiff workspace packages.

## Monorepo Layout

DevDiff uses `pnpm` workspace to link packages under `/packages/`.

```bash
# Clone the repository
git clone https://github.com/EldrexDelosReyesBula/devdiff.git
cd devdiff

# Install dependencies
pnpm install

# Run build tasks
pnpm run build

# Run unit tests
pnpm run test
```
