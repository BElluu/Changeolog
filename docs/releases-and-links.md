# Releases and links

- If `--to` points exactly at a tag (for example `--to v1.2.0`), the tag becomes the release name and its commit date the release date. Otherwise the section is called `Unreleased`.
- Commit hashes and `#123` references are linked to GitHub, GitLab or Bitbucket.

Example of the Markdown output:

```markdown
## [v1.2.0] - 2026-01-14

### New Features

- BREAKING: api: new response schema (John Doe) [`a1b2c3d`](https://github.com/owner/repo/commit/a1b2c3d…)
- dark mode [#7](https://github.com/owner/repo/issues/7) (Jane Smith) [`e4f5a6b`](https://github.com/owner/repo/commit/e4f5a6b…)

### Bug Fixes

- crash on start (Jane Smith) [`c7d8e9f`](https://github.com/owner/repo/commit/c7d8e9f…)
```
