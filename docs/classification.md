# How commits are classified

1. **Conventional Commits** (`type(scope)!: subject`) are parsed exactly. The prefix is removed from the message, the scope is kept, and `!` or a `BREAKING CHANGE:` footer marks the entry as breaking.
2. Everything else is matched against **English and Polish keywords**. The first matching type wins, in the order below, so "Fix new issue" is a bug, not a feature.
3. Commits that match nothing become **Other**.

| Type | Conventional prefixes | Keyword examples |
|------|-----------------------|------------------|
| Security | `security`, `sec` | `security`, `vulnerability`, `cve`, `xss`, `bezpieczeństwo`, `podatność` |
| Bug Fix | `fix`, `bugfix`, `hotfix` | `fix`, `bug`, `crash`, `napraw`, `błąd` |
| Performance | `perf` | `performance`, `optimize`, `wydajność`, `optymalizacja` |
| Refactor | `refactor` | `refactor`, `restructure`, `clean up`, `refaktoryzacja`, `przebuduj` |
| Docs | `docs`, `doc` | `docs`, `readme`, `documentation`, `dokumentacja` |
| Feature | `feat`, `feature` | `add`, `new`, `implement`, `dodaj`, `nowy`, `wdroż` |
| Other | `chore`, `ci`, `build`, `test`, `style`, `deps`, `revert` | anything unmatched |

Automatic detection is a best effort. Fix any entry in the web editor, or add your own keywords in the [configuration](configuration.md).
