# Changeolog 📋

Smart changelog generator with interactive web editor. Built with Bun + TypeScript.

## ✨ Features

- 🔍 Analyze Git commits with pattern filtering
- 🌐 Interactive web editor
- 🏷️ 4 commit types: Feature, Bug Fix, Security, Refactor
- 📦 Group multiple commits into one entry
- 📝 Export to Markdown, HTML, or JSON
- 🎯 Filter, search, and sort in HTML output

## 🚀 Installation

### Prerequisites
- [Bun](https://bun.sh) installed

### Install
```bash
# Clone and install
git clone git@github.com:BElluu/Changeolog.git
cd Changeolog
bun install

# Link globally

bun link
```

**Note:** On Linux/Mac, you may need to make the CLI executable:
```bash
chmod +x src/cli.ts
```

## 📖 Usage

**Note:** After running `bun link`, you can use `Changeolog` instead of `bun run src/cli.ts`.

### 1. Analyze Commits

```bash
# Basic usage
bun run src/cli.ts analyze --from v1.0.0
# Or after linking: Changeolog analyze --from v1.0.0

# With pattern filter (e.g., version numbers)
bun run src/cli.ts analyze --from v1.0.0 --pattern "\\[25\\.4\\.\\d+\\.\\d+\\]"

# Custom range and repository path
bun run src/cli.ts analyze --from abc123 --to def456 --repo /path/to/repo

# Custom application name (appears in changelog header)
bun run src/cli.ts analyze --from v1.0.0 --name "My Awesome App"

# Show help
bun run src/cli.ts --help
```

This creates `.Changeolog_stage.json` with all commits.

**Available Options:**
- `--from <ref>` - Start commit/tag (required)
- `--to <ref>` - End commit/tag (default: HEAD)
- `--repo <path>` - Repository path (default: current directory)
- `--pattern <regex>` - Message pattern filter
- `--name <name>` - Application name for changelog (default: "Changeolog")

### 2. Edit with Web Interface

```bash
# Start web editor on default port (3000)
bun run src/cli.ts web

# Start on custom port
bun run src/cli.ts web --port 8080
```

Open http://localhost:3000 (or your custom port) in your browser.

**Web Editor Features:**
- ✅ Include/exclude commits
- 🏷️ Change commit types (Feature, Bug, Security, Refactor)
- ✏️ Edit commit messages
- 📦 Group multiple commits into one entry
- 🔍 Search by message, author, or hash
- 🎯 Filter by type
- ↕️ Sort by date, author, type, or message
- 💾 Export to Markdown, HTML, or JSON

### 3. Export Changelog

In the web interface, click:
- **📝 Markdown** - Generate CHANGELOG.md
- **🌐 HTML** - Generate interactive HTML with filters
  - Choose template: **Full** (with summary, dates, references) or **Simple** (type and description only)
  - Choose language: **English** or **Polish**
- **📊 JSON** - Generate structured JSON

**HTML Export Options:**
- **Full template**: Includes summary statistics, filters, search, and detailed table with dates and authors
- **Simple template**: Minimal design with only type badges and descriptions
- **Language**: English or Polish (affects section titles and labels)

### 4. Clean Up

```bash
bun run src/cli.ts clean
```

## 🎯 Pattern Filtering

Filter commits by message pattern:

```bash
# Only commits with version numbers like [25.4.101.504]
bun run src/cli.ts analyze --from v1.0.0 --pattern "\\[25\\.4\\.\\d+\\.\\d+\\]"

# Only commits starting with ticket number
bun run src/cli.ts analyze --from v1.0.0 --pattern "^JIRA-\\d+"

# Only commits with specific prefix
bun run src/cli.ts analyze --from v1.0.0 --pattern "^\\[RELEASE\\]"
```

## 📦 Grouping Commits

In the web editor:
1. Select multiple commits using checkboxes
2. Click "📦 Group Selected"
3. Enter a group message
4. Select group type
5. Click "Create Group"

Groups appear as single entries in the changelog with a badge showing commit count.

## 🎨 Commit Types

Commit types are automatically detected from commit messages. The classifier supports both **English** and **Polish** keywords.

| Type | Emoji | Color | Auto-detected from |
|------|-------|-------|-------------------|
| **Feature** | ✨ | Green | `feat`, `feature`, `add`, `new`, `implement`<br/>`funkcja`, `nowa funkcja`, `dodaj`, `nowy`, `implementuj`, `wdroż` |
| **Bug Fix** | 🐛 | Red | `fix`, `bug`, `issue`, `error`<br/>`napraw`, `błąd`, `problem` |
| **Security** | 🔒 | Orange | `security`, `sec`, `vulnerability`, `cve`<br/>`bezpieczeństwo`, `podatność`, `wrażliwość`, `zagrożenie` |
| **Refactor** | ♻️ | Blue | `refactor`, `restructure`, `clean up`, `extract`<br/>`refaktoryzuj`, `przebuduj`, `przeorganizuj`, `uporządkuj`, `wyodrębnij` |

If no pattern matches, commits default to **Feature** type. You can manually change types in the web editor.

## 📄 Export Formats

### Markdown
```markdown
# Changelog

## [Unreleased] - 2024-01-15

### ✨ Features
- Added authentication (John Doe) `abc123`
- New dashboard (Jane Smith) [Group]

### 🐛 Bug Fixes
- Fixed memory leak (John Doe) `def456`
```

### HTML

**Full Template:**
- Interactive page with filters and search
- Summary statistics cards
- Sortable table with type, description, author, date, and reference
- Search functionality
- Filter by commit type
- Sort by type, author, or date
- Responsive design
- Available in English and Polish

**Simple Template:**
- Minimal design focused on content
- Type badges and descriptions only
- Clean, readable layout
- Available in English and Polish

### JSON
```json
{
  "version": "Unreleased",
  "date": "2024-01-15",
  "groups": [...],
  "commits": [...],
  "stats": {...}
}
```

## 🔧 Stage File Format

`.Changeolog_stage.json`:
```json
{
  "version": "1.0",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z",
  "fromRef": "v1.0.0",
  "toRef": "HEAD",
  "pattern": "\\[25\\.4\\.\\d+\\.\\d+\\]",
  "appName": "Changeolog",
  "commits": [
    {
      "hash": "abc123...",
      "shortHash": "abc123",
      "message": "Added feature",
      "author": "John Doe",
      "email": "john@example.com",
      "date": "2024-01-15T10:00:00Z",
      "type": "feature"
    }
  ],
  "groups": [
    {
      "id": "group_1234567890",
      "commits": ["abc123", "def456"],
      "message": "Major refactoring",
      "type": "refactor",
      "author": "John Doe",
      "date": "2024-01-15T10:00:00Z"
    }
  ],
  "excluded": ["xyz789"]
}
```

**Fields:**
- `version` - Stage file format version
- `createdAt` - When the stage file was first created
- `updatedAt` - Last modification timestamp
- `fromRef` / `toRef` - Git reference range
- `pattern` - Optional regex pattern used for filtering
- `appName` - Application name (from `--name` option or default)
- `commits` - Array of all analyzed commits
- `groups` - Array of commit groups created in web editor
- `excluded` - Array of commit hashes excluded from changelog

## 🛠️ Development

```bash
# Run in watch mode
bun --watch src/cli.ts analyze --from v1.0.0

# Run web server
bun --watch src/cli.ts web

# Build
bun build src/cli.ts --outdir dist --target bun
```

## 📝 Example Workflow

```bash
# 1. Analyze commits with version pattern and custom app name
bun run src/cli.ts analyze --from v24.1.0 --pattern "\\[25\\.4\\.\\d+\\.\\d+\\]" --name "MyApp"

# Output:
# 🔍 Analyzing commits...
# 
# ✅ Analyzed 42 commits
# 
# 📊 Breakdown:
#    ✨ Features: 15
#    🐛 Bug Fixes: 20
#    🔒 Security: 3
#    ♻️  Refactor: 4
# 
# 🔍 Pattern: \[25\.4\.\d+\.\d+\]
# 
# ✅ Saved to .Changeolog_stage.json
# 
# 💡 Next: Run "Changeolog web" to edit commits

# 2. Open web editor (on custom port if needed)
bun run src/cli.ts web --port 3000

# 3. In browser (http://localhost:3000):
#    - Review and edit commits
#    - Change commit types if needed
#    - Edit commit messages for clarity
#    - Group related commits
#    - Exclude irrelevant commits
#    - Export to desired format:
#      * Markdown for version control
#      * HTML (Full) for sharing with team
#      * HTML (Simple) for documentation
#      * JSON for programmatic use

# 4. Done! Your changelog is ready
```

### More Examples

```bash
# Analyze commits between two specific tags
bun run src/cli.ts analyze --from v1.0.0 --to v2.0.0

# Analyze commits using commit hashes
bun run src/cli.ts analyze --from abc123def --to HEAD
bun run src/cli.ts analyze --from abc123def --to def456ghi

# Analyze commits from different repository
bun run src/cli.ts analyze --from v1.0.0 --repo ../other-project

# Analyze only commits with JIRA ticket numbers
bun run src/cli.ts analyze --from v1.0.0 --pattern "^JIRA-\\d+"

# Analyze with custom app name
bun run src/cli.ts analyze --from v1.0.0 --name "Production App"

# Start web editor on different port
bun run src/cli.ts web --port 8080
```

## 🎯 Tips

1. **Use pattern filtering** to only include relevant commits (e.g., version tags, ticket numbers)
2. **Group related commits** for cleaner, more readable changelog
3. **Review commit types** - auto-classification isn't perfect, adjust in web editor
4. **Edit messages** for clarity and consistency
5. **HTML export (Full)** is best for sharing (has interactive filters and search)
6. **HTML export (Simple)** is great for embedding in documentation
7. **Use `--name`** to customize the application name in changelog headers
8. **Polish keywords** are supported for commit type detection

## ❓ Troubleshooting

### "No commits found"
- Check that the `--from` reference exists: `git tag` or `git log --oneline`
- Verify the pattern regex is correct (use `--pattern` option)
- Ensure you're in a Git repository or specify `--repo` path

### "No stage file found"
- Run `analyze` command first before starting the web editor
- Check that `.Changeolog_stage.json` exists in the current directory

### Web server port already in use
- Use `--port` option to specify a different port: `bun run src/cli.ts web --port 8080`

### Pattern not matching commits
- Test your regex pattern separately first
- Remember to escape special characters: `\\[` for `[`, `\\.` for `.`
- Use online regex testers to verify your pattern

### Commit types not detected correctly
- Manually change types in the web editor
- The classifier uses keyword matching - exact matches work best

## 📦 Project Structure

```
Changeolog/
├── src/
│   ├── cli.ts              # CLI entry point and command handling
│   ├── types/
│   │   └── index.ts        # TypeScript types and commit type configs
│   ├── git/
│   │   └── parser.ts       # Git commit parser using simple-git
│   ├── classifier/
│   │   └── index.ts        # Commit type classifier (EN/PL keywords)
│   ├── stage/
│   │   └── index.ts        # Stage file (.Changeolog_stage.json) manager
│   └── web/
│       ├── server.ts       # Bun HTTP server for web editor
│       ├── editor.ts       # Interactive web editor HTML/JS
│       └── generators.ts   # Export generators (Markdown, HTML, JSON)
├── dist/                   # Build output (after bun build)
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── README.md               # This file
```

**Key Components:**
- **cli.ts**: Handles command-line arguments and orchestrates workflow
- **git/parser.ts**: Parses Git commits using simple-git library
- **classifier/index.ts**: Classifies commits into types using keyword patterns
- **stage/index.ts**: Manages the stage file (save, load, update)
- **web/server.ts**: Serves the editor and handles API endpoints
- **web/editor.ts**: Client-side interactive editor with filtering and editing
- **web/generators.ts**: Generates changelog in different formats

## 📄 License

MIT