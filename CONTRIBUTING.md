# Contributing to Changeolog

Thanks for helping out! Bug reports, ideas and pull requests are all welcome.

## Setup

```bash
git clone https://github.com/BElluu/Changeolog.git
cd Changeolog
bun install
```

Requires [Bun](https://bun.sh) 1.0 or newer.

## Workflow

1. Open an issue first for larger changes so we can agree on the approach.
2. Create a branch from `master`.
3. Make your change and add or update tests (`*.test.ts` next to the code).
4. Run `bun run check` (typecheck, lint, tests). CI runs the same on Linux and Windows.
5. Open a pull request and fill in the template.

## Project layout

See the "Development" section of the [README](README.md) for the source layout.

## Guidelines

- Treat commit messages and author names as untrusted input; always escape them
  with `escapeHtml` / `jsonForScript` from `src/util/html.ts` when generating HTML.
- Keep changes focused; avoid unrelated reformatting.
- Use clear, imperative commit messages (e.g. "Fix pattern matching for tags").
