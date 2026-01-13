#!/usr/bin/env bun

import { parseArgs } from 'util';
import { GitParser } from './git/parser';
import { StageManager } from './stage';
import { startWebServer } from './web/server';

const { values, positionals } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    from: { type: 'string' },
    to: { type: 'string', default: 'HEAD' },
    repo: { type: 'string', default: '.' },
    pattern: { type: 'string' },
    name: { type: 'string' },
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

    const parser = new GitParser(values.repo!);
    const commits = await parser.parseRange({
      from: values.from,
      to: values.to!,
      repo: values.repo!,
      pattern: values.pattern
    });

    if (commits.length === 0) {
      console.log(`❌ No commits found`);
      if (values.pattern) {
        console.log(`   Pattern: ${values.pattern}`);
      }
      process.exit(1);
    }

    const stage = new StageManager();
    await stage.save(commits, values.from, values.to!, values.pattern, values.name);

    const stats = {
      feature: commits.filter(c => c.type === 'feature').length,
      bug: commits.filter(c => c.type === 'bug').length,
      security: commits.filter(c => c.type === 'security').length,
      refactor: commits.filter(c => c.type === 'refactor').length
    };

    console.log(`✅ Analyzed ${commits.length} commits`);
    console.log('\n📊 Breakdown:');
    if (stats.feature) console.log(`   ✨ Features: ${stats.feature}`);
    if (stats.bug) console.log(`   🐛 Bug Fixes: ${stats.bug}`);
    if (stats.security) console.log(`   🔒 Security: ${stats.security}`);
    if (stats.refactor) console.log(`   ♻️  Refactor: ${stats.refactor}`);
    
    if (values.pattern) {
      console.log(`\n🔍 Pattern: ${values.pattern}`);
    }
    
    console.log('\n✅ Saved to .Changeolog_stage.json');
    console.log('\n💡 Next: Run "Changeolog web" to edit commits');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

async function web() {
  const stage = new StageManager();
  
  if (!stage.exists()) {
    console.error('❌ No stage file found. Run "Changeolog analyze" first');
    process.exit(1);
  }

  const port = parseInt(values.port!);
  console.log(`🌐 Starting web editor on http://localhost:${port}`);
  console.log('Press Ctrl+C to stop\n');
  
  await startWebServer(port);
}

async function clean() {
  try {
    await Bun.write('.Changeolog_stage.json', '');
    console.log('✅ Stage file removed');
  } catch (error) {
    console.log('ℹ️  No stage file to clean');
  }
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