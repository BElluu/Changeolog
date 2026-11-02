# Getting started

Changeolog turns a range of git commits into a changelog. It sorts commits into types, lets you review them in a local web editor and exports Markdown, HTML or JSON.

## Install

Requires [Bun](https://bun.sh) 1.0 or newer.

```bash
git clone https://github.com/BElluu/Changeolog.git
cd Changeolog
bun install
bun link          # makes the `changeolog` command available globally
```

Without linking you can run `bun run src/cli.ts <command>` from the cloned folder instead.

## Make your first changelog

Inside the repository you want a changelog for:

```bash
changeolog analyze --from v1.0.0     # read commits since the v1.0.0 tag
changeolog web                       # review and edit at http://127.0.0.1:3000
```

In the editor you can include or exclude commits, change types, edit messages, select several commits and group them into one entry, search, filter, sort and export.

Prefer no browser? Write the file straight from the commits:

```bash
changeolog generate                  # CHANGELOG.md
```

See [Commands](commands.md) for every option.
