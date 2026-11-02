# Troubleshooting

| Problem | What to check |
|---------|---------------|
| "No commits found" | The `--from` ref exists (`git tag`, `git log --oneline`), and `--pattern` is a valid regex. Remember to escape backslashes in the shell (`"\\d+"`) |
| "No stage file found" | Run `changeolog analyze` first, in the same directory |
| Port already in use | Pass another port: `changeolog web --port 8080` |
| Wrong type detected | Change it in the editor, use Conventional Commits, or add `patterns` to the [config file](configuration.md) |
| Old stage file shows old types | Run `changeolog analyze` again |
