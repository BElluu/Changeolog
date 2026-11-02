# Stage file format

`changeolog analyze` writes `.Changeolog_stage.json` to the current directory. The web editor and
`changeolog generate` read and update it. It is listed in `.gitignore` by default; delete it with
`changeolog clean`.

```json
{
  "version": "1.0",
  "createdAt": "2026-01-15T10:00:00.000Z",
  "updatedAt": "2026-01-15T10:00:00.000Z",
  "fromRef": "v1.0.0",
  "toRef": "v1.1.0",
  "pattern": "^JIRA-\\d+",
  "appName": "My App",
  "release": "v1.1.0",
  "releaseDate": "2026-01-14",
  "repoUrl": "https://github.com/owner/repo",
  "commits": [
    {
      "hash": "abc123...",
      "shortHash": "abc123",
      "message": "add login",
      "author": "John Doe",
      "email": "john@example.com",
      "date": "2026-01-15T10:00:00Z",
      "type": "feature",
      "scope": "auth",
      "breaking": true
    }
  ],
  "groups": [
    {
      "id": "group_1234567890",
      "commits": ["abc123", "def456"],
      "message": "Major refactoring",
      "type": "refactor",
      "author": "John Doe",
      "date": "2026-01-15T10:00:00Z"
    }
  ],
  "excluded": ["xyz789"]
}
```

| Field | Description |
|-------|-------------|
| `version` | Stage file format version |
| `createdAt`, `updatedAt` | Creation and last modification time |
| `fromRef`, `toRef` | Analyzed git range |
| `pattern` | Optional regex used to filter commit messages |
| `appName` | Application name (`--name`, config file, or "Changeolog") |
| `release`, `releaseDate` | Release label and date (tag at `--to`, or `--release`); "Unreleased" and today when absent |
| `repoUrl` | Repository URL used for commit and issue links |
| `commits` | All analyzed commits. `message` has the Conventional Commits prefix removed; `scope` and `breaking` are optional |
| `groups` | Entries created by grouping commits in the web editor |
| `excluded` | Hashes of commits left out of the changelog (includes commits that were grouped) |

`type` is one of `feature`, `security`, `bug`, `perf`, `refactor`, `docs`, `other`.
