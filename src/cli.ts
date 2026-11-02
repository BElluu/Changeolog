#!/usr/bin/env bun

import { parseArgs } from 'util';
import { GitParser } from './git/parser';
import { StageManager } from './stage';
import { loadConfig } from './config';
import { isExportFormat, mergeChangelog, renderExport, type ExportRequest } from './export';
import { normalizeRepoUrl } from './links';
import { COMMIT_TYPES, CommitTypeConfig } from './types';
import { generateMarkdownRelease } from './web/generators';
import { startWebServer } from './web/server';

const { values, positionals } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    from: { type: 'string' },
    to: { type: 'string', default: 'HEAD' },
    repo: { type: 'string', default: '.' },
    pattern: { type: 'string' },
    name: { type: 'string' },
    config: { type: 'string' },
    release: { type: 'string' },
    'repo-url': { type: 'string' },
    format: { type: 'string', default: 'markdown' },
    output: { type: 'string', short: 'o' },
    template: { type: 'string', default: 'full' },
    language: { type: 'string', default: 'en' },
    update: { type: 'boolean' },
    port: { type: 'string', default: '3000' },
    help: { type: 'boolean', short: 'h' }
  },
  allowPositionals: true
});

const command = positionals[0];

if (values.help || !command) {
  console.log(`
📋 Changeolog - Smart Changelog Generator

Usage:
  Changeolog <command> [options]

Commands:
  analyze     Analyze git commits and create stage file
  web         Start web editor
  generate    Write the changelog from the stage file (no browser, CI friendly)
  clean       Remove stage file

Analyze Options:
  --from <ref>      Start commit/tag (required)
  --to <ref>        End commit/tag (default: HEAD)
  --repo <path>     Repository path (default: .)
  --pattern <regex> Message pattern filter (e.g. "\\[25\\.4\\.\\d+\\.\\d+\\]")
  --name <name>     Application name (default: Changeolog)
  --config <path>   Config file (default: changeolog.config.json if present)
  --release <name>  Release label (default: the tag at --to, else "Unreleased")
  --repo-url <url>  Repository URL for commit/issue links (default: from "origin")

Generate Options:
  --format <fmt>    markdown | html | json (default: markdown)
  -o, --output <f>  Output file, "-" for stdout (default: CHANGELOG.md, CHANGELOG.html, changelog.json)
  --update          Markdown only: insert/replace this release in an existing changelog file
  --template <t>    HTML only: full | simple (default: full)
  --language <l>    HTML only: en | pl (default: en)

Web Options:
  --port <port>     Server port (default: 3000)

Examples:
  # Analyze commits with version pattern
  Changeolog analyze --from v1.0.0 --pattern "\\[25\\.4\\.\\d+\\.\\d+\\]"
  
  # Start web editor
  Changeolog web
  
  # Analyze and start web editor
  Changeolog analyze --from v1.0.0 && Changeolog web
`);
  process.exit(0);
}

async function analyze() {
  if (!values.from) {
    console.error('❌ --from is required');
    process.exit(1);
  }

  try {
    console.log('🔍 Analyzing commits...\n');

    const config = await loadConfig(values.config);
    const appName = values.name ?? config.appName;

    const parser = new GitParser(values.repo!);
    const commits = await parser.parseRange({
      from: values.from,
      to: values.to!,
      repo: values.repo!,
      pattern: values.pattern,
      extraPatterns: config.patterns
    });

    if (commits.length === 0) {
      console.log(`❌ No commits found`);
      if (values.pattern) {
        console.log(`   Pattern: ${values.pattern}`);
      }
      process.exit(1);
    }

    const stage = new StageManager();
    const explicitUrl = values['repo-url'] ?? config.repoUrl;
    const repoUrl = explicitUrl ? normalizeRepoUrl(explicitUrl) : await parser.remoteUrl();
    if (explicitUrl && !repoUrl) throw new Error(`Invalid repository URL: ${explicitUrl}`);

    const tag = await parser.resolveRelease(values.to!);
    await stage.save(commits, {
      fromRef: values.from,
      toRef: values.to!,
      pattern: values.pattern,
      appName,
      release: values.release ?? tag.release,
      releaseDate: tag.releaseDate,
      repoUrl
    });

    console.log(`✅ Analyzed ${commits.length} commits`);
    console.log('\n📊 Breakdown:');
    for (const type of COMMIT_TYPES) {
      const count = commits.filter(c => c.type === type).length;
      if (count) console.log(`   ${CommitTypeConfig[type].emoji} ${CommitTypeConfig[type].titles.en}: ${count}`);
    }
    const breaking = commits.filter(c => c.breaking).length;
    if (breaking) console.log(`   ⚠️  Breaking changes: ${breaking}`);
    
    if (values.pattern) {
      console.log(`\n🔍 Pattern: ${values.pattern}`);
    }
    
    console.log('\n✅ Saved to .Changeolog_stage.json');
    console.log('\n💡 Next: Run "Changeolog web" to edit commits');

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function web() {
  const stage = new StageManager();
  
  if (!stage.exists()) {
    console.error('❌ No stage file found. Run "Changeolog analyze" first');
    process.exit(1);
  }

  const port = Number(values.port);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error(`❌ Invalid --port: ${values.port}`);
    process.exit(1);
  }
  console.log(`🌐 Starting web editor on http://localhost:${port}`);
  console.log('Press Ctrl+C to stop\n');
  
  await startWebServer(port);
}

async function clean() {
  const removed = await new StageManager().remove();
  console.log(removed ? '✅ Stage file removed' : 'ℹ️  No stage file to clean');
}

async function generate() {
  const stage = new StageManager();
  if (!stage.exists()) {
    console.error('❌ No stage file found. Run "Changeolog analyze" first');
    process.exit(1);
  }

  const format = values.format === 'md' ? 'markdown' : values.format;
  if (!isExportFormat(format)) {
    console.error(`❌ Invalid --format: ${values.format} (use markdown, html or json)`);
    process.exit(1);
  }
  if (!['full', 'simple'].includes(values.template!) || !['en', 'pl'].includes(values.language!)) {
    console.error('❌ --template must be full|simple and --language must be en|pl');
    process.exit(1);
  }
  if (values.update && format !== 'markdown') {
    console.error('❌ --update only works with --format markdown');
    process.exit(1);
  }

  try {
    const data = await stage.load();
    const request: ExportRequest = {
      format,
      template: values.template as ExportRequest['template'],
      language: values.language as ExportRequest['language']
    };
    const { content, filename } = renderExport(data, request);
    const output = values.output ?? filename;

    if (values.update) {
      const file = Bun.file(output);
      const existing = (await file.exists()) ? await file.text() : undefined;
      const merged = mergeChangelog(
        existing,
        generateMarkdownRelease(data),
        data.release ?? 'Unreleased',
        data.appName || 'Changeolog'
      );
      await Bun.write(output, merged);
      console.log(`✅ Updated ${output} (${data.release ?? 'Unreleased'})`);
    } else if (output === '-') {
      process.stdout.write(content);
    } else {
      await Bun.write(output, content);
      console.log(`✅ Wrote ${output}`);
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

switch (command) {
  case 'generate':
    await generate();
    break;
  case 'analyze':
    await analyze();
    break;
  case 'web':
    await web();
    break;
  case 'clean':
    await clean();
    break;
  default:
    console.error(`❌ Unknown command: ${command}`);
    console.log('Run "Changeolog --help" for usage');
    process.exit(1);
}