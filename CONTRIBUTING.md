# Contributing

## Prerequisites

- [Bun](https://bun.sh) >= 1.0
- Node.js >= 18

## Setup

```bash
git clone https://github.com/hyper-serve/video-uploader
cd upload
bun install
bun run build
```

## Development

```bash
bun run test          # run all tests
bun run lint:check    # check lint
bun run format:check  # check formatting
bun run format:write  # auto-format
bun run typecheck     # type check all packages
bun run docs:dev      # docs site dev server
```

## Pre-push hook

Install [Lefthook](https://github.com/evilmartians/lefthook) to run lint, format, and type checks before every push:

```bash
bunx lefthook install
```

## Pull requests

- Branch from `main`
- PR titles must follow [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `build:`
- Individual commits have no required format — we squash on merge
- CI checks lint, format, types, build, and tests on every PR

## Questions

Open a [GitHub Discussion](https://github.com/hyper-serve/video-uploader/discussions).
