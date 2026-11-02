# Configuration

Create `changeolog.config.json` in the directory where you run Changeolog (or pass `--config <path>`):

```json
{
  "appName": "My App",
  "repoUrl": "https://github.com/owner/repo",
  "patterns": {
    "bug": ["^hotfix", "^poprawka"],
    "docs": ["^wiki"]
  }
}
```

- `appName` – default application name (`--name` overrides it).
- `repoUrl` – repository URL for links. Detected from `origin` when omitted; credentials in the URL are never used.
- `patterns` – extra case-insensitive regular expressions per type (`feature`, `security`, `bug`, `perf`, `refactor`, `docs`, `other`), checked before the built-in keywords. This is the easy way to support another language or a project-specific convention.
