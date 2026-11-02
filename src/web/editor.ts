import { type StagedData, CommitTypeConfig } from '../types';
import { jsonForScript, ESC_FN_SOURCE } from '../util/html';

const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23101828'/%3E%3Cpath d='M9 11h14M9 16h14M9 21h8' stroke='white' stroke-width='2.4' stroke-linecap='round'/%3E%3C/svg%3E";

const STYLES = `
  :root {
    --bg: #f5f6f8; --surface: #fff; --surface-2: #f9fafb; --border: #e4e7ec; --border-strong: #d0d5dd;
    --text: #101828; --muted: #667085; --faint: #98a2b3; --accent: #2563eb; --accent-soft: #eff4ff;
    --danger: #b42318; --shadow: 0 1px 2px rgba(16, 24, 40, .05);
    --mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #0c111d; --surface: #161b26; --surface-2: #1b2130; --border: #2a3142; --border-strong: #3a4256;
      --text: #f2f4f7; --muted: #98a2b3; --faint: #667085; --accent: #6b9bff; --accent-soft: #172554;
      --danger: #fda29b; --shadow: none;
    }
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased;
    font: 14px/1.5 Inter, ui-sans-serif, system-ui, "Segoe UI", Roboto, sans-serif; }
  button, input, select { font: inherit; color: inherit; }
  button { cursor: pointer; }
  :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .wrap { max-width: 1120px; margin: 0 auto; padding: 0 24px; }

  /* Header */
  .topbar { position: sticky; top: 0; z-index: 10; background: var(--surface); border-bottom: 1px solid var(--border); }
  .topbar .wrap { display: flex; align-items: center; gap: 16px; height: 60px; }
  .brand { display: flex; align-items: center; gap: 10px; font-weight: 650; font-size: 16px; letter-spacing: -.01em; }
  .brand svg { width: 26px; height: 26px; }
  .range { display: flex; align-items: center; gap: 8px; min-width: 0; color: var(--muted); font-size: 13px; }
  .range code, .tag { font-family: var(--mono); font-size: 12px; padding: 2px 8px; border: 1px solid var(--border);
    border-radius: 6px; background: var(--surface-2); color: var(--text); white-space: nowrap;
    overflow: hidden; text-overflow: ellipsis; max-width: 220px; }
  .spacer { flex: 1; }
  .export { display: flex; align-items: center; gap: 8px; }
  .export-label { color: var(--muted); font-size: 13px; margin-right: 2px; }

  /* Buttons */
  .btn { padding: 6px 12px; border: 1px solid var(--border-strong); background: var(--surface); border-radius: 8px;
    font-weight: 500; box-shadow: var(--shadow); transition: background .12s, border-color .12s; }
  .btn:hover:not(:disabled) { background: var(--surface-2); border-color: var(--faint); }
  .btn:disabled { opacity: .45; cursor: not-allowed; }
  .btn.primary { background: var(--text); border-color: var(--text); color: var(--surface); }
  .btn.primary:hover:not(:disabled) { opacity: .88; background: var(--text); }
  .btn.sm { padding: 3px 10px; font-size: 13px; box-shadow: none; }
  .btn.quiet { border-color: transparent; background: transparent; box-shadow: none; color: var(--muted); }
  .btn.quiet:hover:not(:disabled) { background: var(--surface-2); border-color: var(--border); color: var(--text); }

  main.wrap { padding-top: 28px; padding-bottom: 120px; }

  /* Summary */
  .summary { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 20px 24px;
    margin-bottom: 20px; box-shadow: var(--shadow); }
  .totals { display: flex; gap: 40px; margin-bottom: 16px; }
  .total strong { display: block; font-size: 28px; line-height: 1.1; font-weight: 650; letter-spacing: -.02em; }
  .total span { color: var(--muted); font-size: 13px; }
  .bar { display: flex; gap: 2px; height: 8px; border-radius: 99px; overflow: hidden; background: var(--border); }
  .bar span { min-width: 4px; }
  .legend { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 14px; }
  .chip { display: inline-flex; align-items: center; gap: 7px; padding: 3px 10px 3px 8px; border: 1px solid var(--border);
    border-radius: 99px; background: var(--surface); font-size: 13px; color: var(--muted); }
  .chip:hover { border-color: var(--border-strong); color: var(--text); }
  .chip.active { border-color: var(--accent); background: var(--accent-soft); color: var(--text); }
  .chip i, .type i { width: 8px; height: 8px; border-radius: 50%; background: var(--c, var(--faint)); flex: none; }
  .chip i { background: var(--c); }
  .chip b { font-weight: 600; color: var(--text); }

  /* Toolbar */
  .toolbar { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; }
  .toolbar input[type=search], .toolbar select { height: 36px; border: 1px solid var(--border-strong); border-radius: 8px;
    background: var(--surface); padding: 0 12px; box-shadow: var(--shadow); }
  .toolbar input[type=search] { flex: 1 1 260px; }
  .toolbar input::placeholder { color: var(--faint); }
  .toolbar .btn { height: 36px; min-width: 112px; }

  /* Groups */
  .section-title { display: flex; align-items: baseline; gap: 8px; margin: 0 0 10px; font-size: 13px; font-weight: 600;
    text-transform: uppercase; letter-spacing: .06em; color: var(--muted); }
  .section-title span { font-weight: 500; color: var(--faint); }
  .groups { margin-bottom: 24px; }
  .group { display: flex; align-items: center; gap: 16px; padding: 14px 16px; margin-bottom: 8px; background: var(--surface);
    border: 1px solid var(--border); border-left: 3px solid var(--c); border-radius: 10px; box-shadow: var(--shadow); }
  .group-body { flex: 1; min-width: 0; }
  .group-title { font-weight: 600; margin-bottom: 2px; }
  .group-meta { display: flex; flex-wrap: wrap; gap: 6px 14px; align-items: center; color: var(--muted); font-size: 13px; }
  .group-meta code { font-family: var(--mono); font-size: 12px; color: var(--faint); }

  /* Commit list */
  .list { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; box-shadow: var(--shadow); overflow: hidden; }
  .row { display: grid; align-items: center; column-gap: 12px; padding: 8px 16px; border-top: 1px solid var(--border);
    grid-template-columns: 20px 132px minmax(0, 1fr) 110px 96px 64px 76px; }
  .row.head { border-top: 0; padding-top: 10px; padding-bottom: 10px; background: var(--surface-2); color: var(--faint);
    font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; }
  .row:not(.head):hover { background: var(--surface-2); }
  .row.selected { background: var(--accent-soft); }
  .row.selected:hover { background: var(--accent-soft); }
  .check { width: 16px; height: 16px; margin: 0; accent-color: var(--accent); cursor: pointer; }
  .type { position: relative; display: flex; align-items: center; gap: 8px; height: 30px; padding: 0 8px 0 10px;
    border: 1px solid var(--border); border-radius: 8px; background: var(--surface); cursor: pointer; }
  .type:hover { border-color: var(--border-strong); }
  .type select { appearance: none; -webkit-appearance: none; border: 0; background: transparent; width: 100%; height: 100%;
    padding: 0 14px 0 0; cursor: pointer; font-size: 13px; font-weight: 500;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none' stroke='%2398a2b3' stroke-width='1.6'%3E%3Cpath d='M1 1l4 4 4-4'/%3E%3C/svg%3E") right center no-repeat; }
  .type select option { color: #101828; background: #fff; }
  .msg { width: 100%; height: 32px; padding: 0 8px; margin: 0 -8px; border: 1px solid transparent; border-radius: 6px;
    background: transparent; text-overflow: ellipsis; }
  .msg:hover { border-color: var(--border); }
  .msg:focus { outline: none; border-color: var(--accent); background: var(--surface); box-shadow: 0 0 0 3px var(--accent-soft); }
  .author { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--muted); }
  .date { color: var(--muted); font-size: 13px; line-height: 1.25; white-space: nowrap; }
  .date small { display: block; color: var(--faint); font-size: 12px; }
  .hash { font-family: var(--mono); font-size: 12px; color: var(--faint); }
  .row .btn { justify-self: end; }
  .row.excluded .msg { text-decoration: line-through; color: var(--faint); }
  .row.excluded .type, .row.excluded .author, .row.excluded .date, .row.excluded .hash { opacity: .5; }
  .row.excluded .btn { color: var(--accent); }
  .empty { padding: 48px 16px; text-align: center; color: var(--muted); }

  /* Selection bar */
  .selbar { position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%); z-index: 20; display: flex; align-items: center;
    gap: 6px; padding: 8px 8px 8px 18px; background: var(--text); color: var(--surface); border-radius: 12px;
    box-shadow: 0 12px 32px rgba(16, 24, 40, .28); }
  .selbar[hidden] { display: none; }
  .selbar span { margin-right: 10px; font-weight: 500; }
  .selbar .btn { box-shadow: none; }
  .selbar .btn.quiet { color: inherit; opacity: .75; }
  .selbar .btn.quiet:hover { background: rgba(255, 255, 255, .12); border-color: transparent; color: inherit; opacity: 1; }
  .selbar .btn.light { background: var(--surface); border-color: var(--surface); color: var(--text); }

  /* Dialogs */
  dialog { width: min(440px, calc(100vw - 32px)); padding: 0; border: 1px solid var(--border); border-radius: 14px;
    background: var(--surface); color: var(--text); box-shadow: 0 24px 64px rgba(16, 24, 40, .24); }
  dialog::backdrop { background: rgba(16, 24, 40, .45); }
  dialog form { padding: 24px; }
  dialog h2 { margin: 0 0 4px; font-size: 18px; letter-spacing: -.01em; }
  dialog p { margin: 0 0 20px; color: var(--muted); }
  .field { display: block; margin-bottom: 16px; }
  .field span { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 500; }
  .field input, .field select { width: 100%; height: 38px; padding: 0 12px; border: 1px solid var(--border-strong);
    border-radius: 8px; background: var(--surface); }
  .actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 24px; }

  @media (max-width: 820px) {
    .wrap { padding: 0 16px; }
    .topbar .wrap { height: auto; flex-wrap: wrap; padding-top: 12px; padding-bottom: 12px; }
    .export-label { display: none; }
    .totals { gap: 24px; }
    .row.head { display: none; }
    .row { grid-template-columns: 20px minmax(0, 1fr) auto; row-gap: 6px; padding: 12px 16px; }
    .row .msg { grid-column: 2; grid-row: 1; }
    .row .btn { grid-column: 3; grid-row: 1; }
    .row .type { grid-column: 2; grid-row: 2; justify-self: start; min-width: 132px; }
    .row .check { grid-column: 1; grid-row: 1; }
    .row .author, .row .date, .row .hash { display: none; }
  }
`;

export function renderEditor(data: StagedData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Changeolog Editor</title>
  <link rel="icon" href="${FAVICON}">
  <style>${STYLES}</style>
</head>
<body>
  <header class="topbar">
    <div class="wrap">
      <div class="brand">
        <svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="currentColor"/><path d="M9 11h14M9 16h14M9 21h8" stroke="var(--surface)" stroke-width="2.4" stroke-linecap="round"/></svg>
        Changeolog
      </div>
      <div class="range" id="range"></div>
      <div class="spacer"></div>
      <div class="export">
        <span class="export-label">Export</span>
        <button class="btn" data-export="markdown">Markdown</button>
        <button class="btn" data-export="html">HTML</button>
        <button class="btn" data-export="json">JSON</button>
      </div>
    </div>
  </header>

  <main class="wrap">
    <section class="summary" id="summary" aria-label="Summary"></section>

    <div class="toolbar">
      <input type="search" id="search" placeholder="Search message, author or hash" aria-label="Search commits">
      <select id="filterType" aria-label="Filter by type"></select>
      <select id="sortBy" aria-label="Sort by">
        <option value="date">Sort by date</option>
        <option value="author">Sort by author</option>
        <option value="type">Sort by type</option>
        <option value="message">Sort by message</option>
      </select>
      <button class="btn" id="sortOrder"></button>
    </div>

    <section class="groups" id="groups"></section>
    <div class="list" id="list"></div>
  </main>

  <div class="selbar" id="selbar" hidden>
    <span id="selCount"></span>
    <button class="btn quiet sm" id="selClear">Clear</button>
    <button class="btn light" id="selGroup">Group commits</button>
  </div>

  <dialog id="htmlExportDialog">
    <form method="dialog" id="htmlExportForm">
      <h2>Export HTML</h2>
      <p>A single searchable page you can host or attach to a release.</p>
      <label class="field"><span>Template</span>
        <select id="htmlTemplate">
          <option value="full">Full (summary, dates, references)</option>
          <option value="simple">Simple (type and description only)</option>
        </select>
      </label>
      <label class="field"><span>Language</span>
        <select id="htmlLanguage">
          <option value="en">English</option>
          <option value="pl">Polski</option>
        </select>
      </label>
      <div class="actions">
        <button type="button" class="btn" data-close>Cancel</button>
        <button type="submit" class="btn primary">Export</button>
      </div>
    </form>
  </dialog>

  <dialog id="groupDialog">
    <form method="dialog" id="groupForm">
      <h2>Group commits</h2>
      <p>Combine the selected commits into a single changelog entry.</p>
      <label class="field"><span>Entry text</span>
        <input id="groupMessage" type="text" placeholder="e.g. Sales report and dark mode" required autocomplete="off">
      </label>
      <label class="field"><span>Type</span>
        <select id="groupType"></select>
      </label>
      <div class="actions">
        <button type="button" class="btn" data-close>Cancel</button>
        <button type="submit" class="btn primary">Create group</button>
      </div>
    </form>
  </dialog>

  <script>
    ${ESC_FN_SOURCE}
    let stageData = ${jsonForScript(data)};

    stageData.createdAt = new Date(stageData.createdAt);
    stageData.updatedAt = new Date(stageData.updatedAt);
    stageData.commits = stageData.commits.map(c => ({
      ...c,
      date: new Date(c.date)
    }));

    const typeConfig = ${jsonForScript(CommitTypeConfig)};

    let searchQuery = '';
    let filterType = 'all';
    let sortBy = 'date';
    let sortOrder = 'desc';
    const selectedCommits = new Set();

    const $ = id => document.getElementById(id);
    const cfgOf = type => typeConfig[type] || typeConfig.other;
    const fmtDate = d => new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
    const fmtTime = d => new Date(d).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    const typeOptions = selected => Object.entries(typeConfig)
      .map(([t, c]) => '<option value="' + t + '"' + (t === selected ? ' selected' : '') + '>' + esc(c.label) + '</option>')
      .join('');

    function getFilteredCommits() {
      let commits = [...stageData.commits];

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        commits = commits.filter(c =>
          c.message.toLowerCase().includes(q) ||
          c.author.toLowerCase().includes(q) ||
          c.hash.includes(q)
        );
      }

      if (filterType !== 'all') {
        commits = commits.filter(c => c.type === filterType);
      }

      commits.sort((a, b) => {
        let result = 0;
        switch (sortBy) {
          case 'date':
            result = new Date(b.date) - new Date(a.date);
            break;
          case 'author':
            result = a.author.localeCompare(b.author);
            break;
          case 'type':
            result = a.type.localeCompare(b.type);
            break;
          case 'message':
            result = a.message.localeCompare(b.message);
            break;
        }
        return sortOrder === 'asc' ? -result : result;
      });

      return commits;
    }

    function isExcluded(hash) {
      return stageData.excluded.includes(hash);
    }

    function toggleExclude(hash) {
      if (isExcluded(hash)) {
        stageData.excluded = stageData.excluded.filter(h => h !== hash);
      } else {
        stageData.excluded.push(hash);
      }
      saveAndRender();
    }

    function changeType(hash, newType) {
      const commit = stageData.commits.find(c => c.hash === hash);
      if (commit) {
        commit.type = newType;
        saveAndRender();
      }
    }

    function editMessage(hash, newMessage) {
      const commit = stageData.commits.find(c => c.hash === hash);
      if (commit) {
        commit.message = newMessage;
        saveAndRender();
      }
    }

    function groupCommits(hashes, message, type) {
      const group = {
        id: 'group_' + Date.now(),
        commits: hashes,
        message,
        type,
        author: stageData.commits.find(c => c.hash === hashes[0]).author,
        date: new Date()
      };
      stageData.groups.push(group);
      stageData.excluded.push(...hashes);
      saveAndRender();
    }

    function removeGroup(groupId) {
      const group = stageData.groups.find(g => g.id === groupId);
      if (group) {
        stageData.excluded = stageData.excluded.filter(h => !group.commits.includes(h));
        stageData.groups = stageData.groups.filter(g => g.id !== groupId);
        saveAndRender();
      }
    }

    async function saveAndRender() {
      await fetch('/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stageData)
      });
      render();
    }

    async function exportChangelog(format, template, language) {
      const response = await fetch('/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format, template, language })
      });

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.headers.get('Content-Disposition').split('filename=')[1].replace(/"/g, '');
      a.click();
    }

    function getStats() {
      const included = stageData.commits.filter(c => !isExcluded(c.hash));
      const byType = {};
      [...included, ...stageData.groups].forEach(c => {
        byType[c.type] = (byType[c.type] || 0) + 1;
      });
      return {
        total: stageData.commits.length,
        included: included.length + stageData.groups.length,
        excluded: stageData.excluded.length - stageData.groups.reduce((sum, g) => sum + g.commits.length, 0),
        byType
      };
    }

    function chipHtml(type, cfg, count) {
      return '<button class="chip' + (filterType === type ? ' active' : '') + '" data-filter="' + type + '" style="--c:' + cfg.color + '">' +
        '<i></i>' + esc(cfg.label) + ' <b>' + count + '</b></button>';
    }

    function renderSummary() {
      const stats = getStats();
      const types = Object.entries(typeConfig).filter(([type]) => stats.byType[type]);
      $('summary').innerHTML = \`
        <div class="totals">
          <div class="total"><strong>\${stats.total}</strong><span>commits</span></div>
          <div class="total"><strong>\${stats.included}</strong><span>in changelog</span></div>
          <div class="total"><strong>\${stats.excluded}</strong><span>excluded</span></div>
        </div>
        <div class="bar">\${types.map(([type, cfg]) => '<span style="flex:' + stats.byType[type] + ';background:' + cfg.color + '"></span>').join('')}</div>
        <div class="legend">\${types.map(([type, cfg]) => chipHtml(type, cfg, stats.byType[type])).join('')}</div>\`;
    }

    function groupHtml(group) {
      const cfg = cfgOf(group.type);
      const hashes = group.commits.map(h => (stageData.commits.find(c => c.hash === h) || { shortHash: h.slice(0, 7) }).shortHash);
      return \`
        <div class="group" style="--c:\${cfg.color}">
          <div class="group-body">
            <div class="group-title">\${esc(group.message)}</div>
            <div class="group-meta">
              <span>\${esc(cfg.label)}</span>
              <span>\${esc(group.author)}</span>
              <span>\${group.commits.length} commits</span>
              <code>\${hashes.map(esc).join(' ')}</code>
            </div>
          </div>
          <button class="btn sm" data-ungroup="\${esc(group.id)}">Ungroup</button>
        </div>\`;
    }

    function rowHtml(commit) {
      const excluded = isExcluded(commit.hash);
      const selected = selectedCommits.has(commit.hash);
      return \`
        <div class="row\${excluded ? ' excluded' : ''}\${selected ? ' selected' : ''}" data-hash="\${esc(commit.hash)}">
          <input type="checkbox" class="check" aria-label="Select commit" \${selected ? 'checked' : ''}>
          <label class="type" style="--c:\${cfgOf(commit.type).color}"><i></i>
            <select data-act="type" aria-label="Commit type">\${typeOptions(commit.type)}</select>
          </label>
          <input type="text" class="msg" data-act="msg" value="\${esc(commit.message)}" aria-label="Commit message">
          <span class="author" title="\${esc(commit.author)}">\${esc(commit.author)}</span>
          <span class="date">\${fmtDate(commit.date)}<small>\${fmtTime(commit.date)}</small></span>
          <code class="hash">\${esc(commit.shortHash)}</code>
          <button class="btn sm" data-act="toggle">\${excluded ? 'Include' : 'Exclude'}</button>
        </div>\`;
    }

    function renderList() {
      const commits = getFilteredCommits();
      $('list').innerHTML = commits.length === 0
        ? '<div class="empty">No commits match the current filters.</div>'
        : '<div class="row head"><span></span><span>Type</span><span>Message</span><span>Author</span><span>Date</span><span>Hash</span><span></span></div>' +
          commits.map(rowHtml).join('');
    }

    function renderGroups() {
      $('groups').innerHTML = stageData.groups.length === 0 ? '' :
        '<h2 class="section-title">Groups <span>' + stageData.groups.length + '</span></h2>' +
        stageData.groups.map(groupHtml).join('');
    }

    function renderSelection() {
      const n = selectedCommits.size;
      $('selbar').hidden = n === 0;
      $('selCount').textContent = n + ' selected';
      $('selGroup').disabled = n < 2;
      $('selGroup').title = n < 2 ? 'Select at least two commits to group them' : '';
    }

    function render() {
      $('range').innerHTML =
        '<code>' + esc(stageData.fromRef) + '</code> → <code>' + esc(stageData.toRef) + '</code>' +
        (stageData.pattern ? '<span>matching</span><code>' + esc(stageData.pattern) + '</code>' : '');
      $('filterType').value = filterType;
      $('sortOrder').textContent = sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending';
      renderSummary();
      renderGroups();
      renderList();
      renderSelection();
    }

    function init() {
      $('filterType').innerHTML = '<option value="all">All types</option>' + typeOptions();
      $('groupType').innerHTML = typeOptions();

      $('search').addEventListener('input', e => { searchQuery = e.target.value; renderList(); });
      $('filterType').addEventListener('change', e => { filterType = e.target.value; render(); });
      $('sortBy').addEventListener('change', e => { sortBy = e.target.value; renderList(); });
      $('sortOrder').addEventListener('click', () => {
        sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        render();
      });

      $('summary').addEventListener('click', e => {
        const chip = e.target.closest('[data-filter]');
        if (!chip) return;
        filterType = filterType === chip.dataset.filter ? 'all' : chip.dataset.filter;
        render();
      });

      $('groups').addEventListener('click', e => {
        const btn = e.target.closest('[data-ungroup]');
        if (btn) removeGroup(btn.dataset.ungroup);
      });

      $('list').addEventListener('change', e => {
        const row = e.target.closest('.row[data-hash]');
        if (!row) return;
        const hash = row.dataset.hash;
        if (e.target.matches('.check')) {
          if (e.target.checked) selectedCommits.add(hash); else selectedCommits.delete(hash);
          row.classList.toggle('selected', e.target.checked);
          renderSelection();
        } else if (e.target.dataset.act === 'type') {
          changeType(hash, e.target.value);
        } else if (e.target.dataset.act === 'msg') {
          editMessage(hash, e.target.value);
        }
      });

      $('list').addEventListener('click', e => {
        const btn = e.target.closest('[data-act="toggle"]');
        if (btn) toggleExclude(btn.closest('.row').dataset.hash);
      });

      document.querySelectorAll('[data-export]').forEach(btn => {
        btn.addEventListener('click', () => {
          if (btn.dataset.export === 'html') $('htmlExportDialog').showModal();
          else exportChangelog(btn.dataset.export);
        });
      });

      $('htmlExportForm').addEventListener('submit', () => {
        exportChangelog('html', $('htmlTemplate').value, $('htmlLanguage').value);
      });

      $('selClear').addEventListener('click', () => {
        selectedCommits.clear();
        renderList();
        renderSelection();
      });

      $('selGroup').addEventListener('click', () => {
        const counts = {};
        selectedCommits.forEach(h => {
          const c = stageData.commits.find(x => x.hash === h);
          if (c) counts[c.type] = (counts[c.type] || 0) + 1;
        });
        const order = Object.keys(typeConfig);
        const common = Object.keys(counts).sort((a, b) => counts[b] - counts[a] || order.indexOf(a) - order.indexOf(b))[0];
        if (common) $('groupType').value = common;
        $('groupMessage').value = '';
        $('groupDialog').showModal();
        $('groupMessage').focus();
      });

      $('groupForm').addEventListener('submit', () => {
        const message = $('groupMessage').value.trim();
        if (!message || selectedCommits.size < 2) return;
        groupCommits(Array.from(selectedCommits), message, $('groupType').value);
        selectedCommits.clear();
      });

      document.querySelectorAll('dialog').forEach(dialog => {
        dialog.addEventListener('click', e => {
          if (e.target === dialog || e.target.closest('[data-close]')) dialog.close();
        });
      });

      render();
    }

    init();
  </script>
</body>
</html>`;
}
