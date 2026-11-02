# Commands

## `analyze`

Reads commits and writes the [stage file](stage-file.md) (`.Changeolog_stage.json`).

| Option | Description |
|--------|-------------|
| `--from <ref>` | Start commit or tag (required) |
| `--to <ref>` | End commit or tag (default `HEAD`) |
| `--repo <path>` | Repository path (default `.`) |
| `--pattern <regex>` | Only keep commits whose message matches, e.g. `"^JIRA-\\d+"` |
| `--name <name>` | Application name shown in the changelog |
| `--release <name>` | Release label (default: the tag at `--to`, else `Unreleased`) |
| `--repo-url <url>` | Repository URL for links (default: taken from `origin`) |
| `--config <path>` | Config file (default `changeolog.config.json` if present) |

## `web`

Starts the editor on `127.0.0.1` (default port 3000, change with `--port`). It is a local tool and is not reachable from other machines.

## `generate`

Writes the changelog straight from the stage file, no browser needed.

```bash
changeolog generate                                   # CHANGELOG.md
changeolog generate --update                          # insert this release at the top of an existing file
changeolog generate --format html --template simple --language pl -o docs/release.html
changeolog generate --format json -o -                # print to stdout
```

| Option | Description |
|--------|-------------|
| `--format` | `markdown` (default), `html` or `json` |
| `-o`, `--output` | Output file, `-` for stdout. Defaults to `CHANGELOG.md`, `CHANGELOG.html` or `changelog.json` |
| `--update` | Markdown only: merge into the existing file, newest release first. Re-running replaces the same `## [version]` section instead of duplicating it |
| `--template`, `--language` | HTML only: `full` or `simple`, `en` or `pl` |

The HTML export is a single searchable, filterable page.

## `clean`

Deletes the stage file.
