# Development

```bash
bun install
bun run check       # typecheck, lint and tests (same as CI)
bun test            # tests only
bun run build       # bundle to dist/
```

```
src/
├── cli.ts            # command line entry point
├── classifier/       # Conventional Commits parsing + keyword fallback
├── config/           # changeolog.config.json loading and validation
├── export/           # format → generator mapping, changelog merging
├── git/parser.ts     # reads commits with simple-git
├── links.ts          # repository URL and commit/issue links
├── stage/            # stage file read/write/validation
├── types/            # commit types and display configuration
├── util/html.ts      # HTML and JSON escaping helpers
└── web/              # editor, HTML/Markdown/JSON generators, local server
```

Contributions are welcome, see [CONTRIBUTING.md](../CONTRIBUTING.md). Please report security issues as described in [SECURITY.md](../SECURITY.md).

## Documentation site

The guides in `docs/` are plain Markdown, published by the [Astro](https://astro.build) project in the same folder. Search is [Pagefind](https://pagefind.app).

```bash
cd docs
npm install
npm run dev         # http://localhost:4321
npm run build       # static site in docs/dist
```

The first `# heading` is the page title. Link to another guide by file name, e.g. `[config](configuration.md)`.
