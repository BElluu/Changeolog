#!/usr/bin/env bun

import { parseArgs } from 'util';
import { GitParser } from './git/parser';
import { StageManager } from './stage';
import { loadConfig } from './config';
import { COMMIT_TYPES, CommitTypeConfig } from './types';
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
  clean       Remove stage file

Analyze Options:
  --from <ref>      Start commit/tag (required)
  --to <ref>        End commit/tag (default: HEAD)
  --repo <path>     Repository path (default: .)
  --pattern <regex> Message pattern filter (e.g. "\\[25\\.4\\.\\d+\\.\\d+\\]")
  --name <name>     Application name (default: Changeolog)
  --config <path>   Config file (default: changeolog.config.json if present)

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
    await stage.save(commits, values.from, values.to!, values.pattern, appName);

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

switch (command) {
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