# Security Policy

## Reporting a vulnerability

Please do not open a public issue for security problems.
Report them privately through GitHub's
["Report a vulnerability"](https://github.com/BElluu/Changeolog/security/advisories/new)
form on this repository. You can expect an initial response within a few days.

## Scope notes

- The web editor (`changeolog web`) is a local tool and binds to `127.0.0.1` only.
  Do not expose it to untrusted networks.
- Commit messages are treated as untrusted input and are HTML-escaped in the editor and in HTML exports.
