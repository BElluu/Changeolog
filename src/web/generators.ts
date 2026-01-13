import { StagedData, CommitType, CommitTypeConfig } from '../types';

type Language = 'pl' | 'en';
type TemplateType = 'full' | 'simple';

const translations = {
  en: {
    releaseNotes: 'Release Notes',
    versionRange: 'Version Range',
    generated: 'Generated',
    pattern: 'Pattern',
    summary: 'Summary',
    totalChanges: 'Total Changes',
    newFeatures: 'New Features',
    bugFixes: 'Bug Fixes',
    security: 'Security',
    refactoring: 'Refactoring',
    searchChanges: 'Search changes...',
    allTypes: 'All Types',
    sortByType: 'Sort by Type',
    sortByAuthor: 'Sort by Author',
    sortByDate: 'Sort by Date',
    type: 'Type',
    description: 'Description',
    author: 'Author',
    date: 'Date',
    reference: 'Reference',
    groupedChange: 'Grouped change',
    commits: 'commits',
    group: 'Group'
  },
  pl: {
    releaseNotes: 'Informacje o Wersji',
    versionRange: 'Zakres Wersji',
    generated: 'Wygenerowano',
    pattern: 'Wzorzec',
    summary: 'Podsumowanie',
    totalChanges: 'Łączne Zmiany',
    newFeatures: 'Nowe Funkcje',
    bugFixes: 'Poprawki Błędów',
    security: 'Bezpieczeństwo',
    refactoring: 'Refaktoryzacja',
    searchChanges: 'Szukaj zmian...',
    allTypes: 'Wszystkie Typy',
    sortByType: 'Sortuj według Typu',
    sortByAuthor: 'Sortuj według Autora',
    sortByDate: 'Sortuj według Daty',
    type: 'Typ',
    description: 'Opis',
    author: 'Autor',
    date: 'Data',
    reference: 'Referencja',
    groupedChange: 'Zmiana zgrupowana',
    commits: 'commitów',
    group: 'Grupa'
  }
};

function getIncludedItems(data: StagedData) {
  const commits = data.commits.filter(c => !data.excluded.includes(c.hash));
  return { commits, groups: data.groups };
}

function groupByType(commits: any[]) {
  const grouped: Record<CommitType, any[]> = {
    [CommitType.FEATURE]: [],
    [CommitType.BUG]: [],
    [CommitType.SECURITY]: [],
    [CommitType.REFACTOR]: []
  };

  commits.forEach(commit => {
    (grouped[commit.type as CommitType]).push(commit);
  });

  return grouped;
}

export function generateMarkdown(data: StagedData): string {
  const { commits, groups } = getIncludedItems(data);
  const allItems = [...groups, ...commits];
  const grouped = groupByType(allItems);
  const appName = data.appName || 'Changeolog';

  let md = `# ${appName} Changelog\n\n`;
  md += `## [Unreleased] - ${new Date().toISOString().split('T')[0]}\n\n`;
  md += `> Generated from ${data.fromRef} to ${data.toRef}\n\n`;

  const sections = [
    { type: CommitType.FEATURE, title: 'Features', emoji: '✨' },
    { type: CommitType.SECURITY, title: 'Security', emoji: '🔒' },
    { type: CommitType.BUG, title: 'Bug Fixes', emoji: '🐛' },
    { type: CommitType.REFACTOR, title: 'Refactoring', emoji: '♻️' }
  ];

  sections.forEach(({ type, title, emoji }) => {
    const items = grouped[type];
    if (items.length > 0) {
      md += `### ${emoji} ${title}\n\n`;
      items.forEach(item => {
        const hash = item.commits ? `[Group]` : `\`${item.shortHash}\``;
        const message = item.message;
        const author = item.author;
        md += `- ${message} (${author}) ${hash}\n`;
      });
      md += '\n';
    }
  });

  md += `---\n`;
  md += `*Generated with ${appName} on ${new Date().toLocaleString()}*\n`;

  return md;
}

export function generateJSON(data: StagedData): string {
  const { commits, groups } = getIncludedItems(data);
  const appName = data.appName || 'Changeolog';
  
  const output = {
    version: 'Unreleased',
    date: new Date().toISOString().split('T')[0],
    appName,
    metadata: {
      fromRef: data.fromRef,
      toRef: data.toRef,
      pattern: data.pattern,
      generated: new Date().toISOString()
    },
    groups: groups.map(g => ({
      message: g.message,
      type: g.type,
      author: g.author,
      date: g.date,
      commitCount: g.commits.length
    })),
    commits: commits.map(c => ({
      hash: c.hash,
      shortHash: c.shortHash,
      message: c.message,
      author: c.author,
      email: c.email,
      date: c.date,
      type: c.type
    })),
    stats: {
      total: commits.length + groups.length,
      groups: groups.length,
      commits: commits.length,
      byType: groupByType([...commits, ...groups])
    }
  };

  return JSON.stringify(output, null, 2);
}

function getSectionTitles(language: Language) {
  return {
    [CommitType.FEATURE]: language === 'pl' ? 'Nowe Funkcje' : 'New Features',
    [CommitType.SECURITY]: language === 'pl' ? 'Aktualizacje Bezpieczeństwa' : 'Security Updates',
    [CommitType.BUG]: language === 'pl' ? 'Poprawki Błędów' : 'Bug Fixes',
    [CommitType.REFACTOR]: language === 'pl' ? 'Refaktoryzacja' : 'Refactoring'
  };
}

function formatDate(date: Date, language: Language): string {
  if (language === 'pl') {
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatDateShort(date: Date, language: Language): string {
  if (language === 'pl') {
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function generateHTML(data: StagedData, template: TemplateType = 'full', language: Language = 'en'): string {
  const { commits, groups } = getIncludedItems(data);
  const allItems = [...groups, ...commits];
  const grouped = groupByType(allItems);
  const t = translations[language];
  const sectionTitles = getSectionTitles(language);

  const stats = {
    total: allItems.length,
    feature: grouped[CommitType.FEATURE].length,
    bug: grouped[CommitType.BUG].length,
    security: grouped[CommitType.SECURITY].length,
    refactor: grouped[CommitType.REFACTOR].length
  };

  const appName = data.appName || 'Changeolog';
  const generationDate = formatDate(new Date(), language);

  if (template === 'simple') {
    return generateSimpleHTML(data, grouped, sectionTitles, t, language, appName);
  }

  return generateFullHTML(data, grouped, stats, sectionTitles, t, language, appName, generationDate, commits, groups);
}

function generateSimpleHTML(
  data: StagedData,
  grouped: Record<CommitType, any[]>,
  sectionTitles: Record<CommitType, string>,
  t: typeof translations.en,
  language: Language,
  appName: string
): string {
  const sections = [
    { type: CommitType.FEATURE, color: '#10B981' },
    { type: CommitType.SECURITY, color: '#F59E0B' },
    { type: CommitType.BUG, color: '#EF4444' },
    { type: CommitType.REFACTOR, color: '#3B82F6' }
  ];

  return `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appName} - ${t.releaseNotes}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .section-header { border-bottom: 2px solid #e5e7eb; }
    .badge { font-size: 0.75rem; letter-spacing: 0.025em; }
  </style>
</head>
<body class="bg-white">
  <div class="max-w-5xl mx-auto px-8 py-12">
    <header class="border-b border-gray-200 pb-6 mb-8">
      <h1 class="text-4xl font-bold text-gray-900 mb-2">${appName}</h1>
      <p class="text-xl text-gray-600 font-medium">${t.releaseNotes}</p>
    </header>
    ${sections.map(({ type, color }) => {
      const items = grouped[type];
      if (!items || items.length === 0) return '';
      const config = CommitTypeConfig[type];
      return `
        <section class="mb-10">
          <div class="section-header pb-3 mb-4">
            <h2 class="text-2xl font-bold text-gray-900 inline-flex items-center gap-3">
              <span class="w-1 h-8 rounded" style="background-color: ${color}"></span>
              <span>${sectionTitles[type]}</span>
            </h2>
          </div>
          <div class="space-y-2">
            ${items.map(item => {
              const isGroup = item.commits && item.commits.length > 0;
              return `
                <div class="flex items-start gap-3 py-2">
                  <span class="badge px-3 py-1 rounded-full text-white font-medium mt-0.5" 
                    style="background-color: ${config.color}">
                    ${config.label}
                  </span>
                  <div class="flex-1">
                    <div class="text-sm font-medium text-gray-900">${item.message}</div>
                    ${isGroup ? `<div class="text-xs text-gray-500 mt-1">${t.groupedChange} (${item.commits.length} ${t.commits})</div>` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </section>
      `;
    }).join('')}
  </div>
</body>
</html>`;
}

function generateFullHTML(
  data: StagedData,
  grouped: Record<CommitType, any[]>,
  stats: any,
  sectionTitles: Record<CommitType, string>,
  t: typeof translations.en,
  language: Language,
  appName: string,
  generationDate: string,
  commits: any[],
  groups: any[]
): string {
  return `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appName} - ${t.releaseNotes} ${data.fromRef} → ${data.toRef}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .changelog-item { transition: background-color 0.15s ease; }
    .changelog-item:hover { background-color: #f9fafb; }
    .section-header { border-bottom: 2px solid #e5e7eb; }
    .badge { font-size: 0.75rem; letter-spacing: 0.025em; }
    table { border-collapse: separate; border-spacing: 0; }
    th { background-color: #f9fafb; font-weight: 600; }
    td, th { border-bottom: 1px solid #e5e7eb; }
    tr:last-child td { border-bottom: none; }
  </style>
</head>
<body class="bg-white">
  <div class="max-w-6xl mx-auto px-8 py-12">
    <!-- Header -->
    <header class="border-b border-gray-200 pb-8 mb-10">
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-4xl font-bold text-gray-900 mb-2">${appName}</h1>
          <p class="text-xl text-gray-600 font-medium">${t.releaseNotes}</p>
        </div>
        <div class="text-right">
          <div class="text-sm text-gray-500 mb-1">${t.versionRange}</div>
          <div class="text-lg font-semibold text-gray-900">${data.fromRef} → ${data.toRef}</div>
        </div>
      </div>
      <div class="mt-6 flex items-center gap-6 text-sm text-gray-600">
        <div>
          <span class="font-medium">${t.generated}:</span> ${generationDate}
        </div>
        ${data.pattern ? `<div><span class="font-medium">${t.pattern}:</span> <code class="bg-gray-100 px-2 py-0.5 rounded text-xs">${data.pattern}</code></div>` : ''}
      </div>
    </header>

    <!-- Summary Statistics -->
    <section class="mb-10">
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">${t.summary}</h2>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div class="text-center">
            <div class="text-3xl font-bold text-gray-900">${stats.total}</div>
            <div class="text-sm text-gray-600 mt-1">${t.totalChanges}</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-emerald-600">${stats.feature}</div>
            <div class="text-sm text-gray-600 mt-1">${t.newFeatures}</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-red-600">${stats.bug}</div>
            <div class="text-sm text-gray-600 mt-1">${t.bugFixes}</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-amber-600">${stats.security}</div>
            <div class="text-sm text-gray-600 mt-1">${t.security}</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600">${stats.refactor}</div>
            <div class="text-sm text-gray-600 mt-1">${t.refactoring}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Filters -->
    <section class="mb-8">
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div class="flex flex-wrap gap-3 items-center">
          <input 
            type="text" 
            id="searchInput"
            placeholder="${t.searchChanges}"
            class="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            oninput="filterChangelog()"
          />
          <select id="typeFilter" onchange="filterChangelog()" 
            class="px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
            <option value="all">${t.allTypes}</option>
            <option value="feature">${t.newFeatures}</option>
            <option value="bug">${t.bugFixes}</option>
            <option value="security">${t.security}</option>
            <option value="refactor">${t.refactoring}</option>
          </select>
          <select id="sortSelect" onchange="filterChangelog()" 
            class="px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
            <option value="type">${t.sortByType}</option>
            <option value="author">${t.sortByAuthor}</option>
            <option value="date">${t.sortByDate}</option>
          </select>
        </div>
      </div>
    </section>

    <!-- Changelog Content -->
    <div id="changelogContent">
      ${renderSectionsFull(grouped, sectionTitles, t, language, commits, groups, CommitTypeConfig)}
    </div>
  </div>

  <script>
    const allData = ${JSON.stringify({ grouped, groups, commits })};
    const typeConfig = ${JSON.stringify(CommitTypeConfig)};
    const sectionTitles = ${JSON.stringify(sectionTitles)};
    const t = ${JSON.stringify(t)};
    const language = '${language}';

    function filterChangelog() {
      const search = document.getElementById('searchInput').value.toLowerCase();
      const typeFilter = document.getElementById('typeFilter').value;
      const sortBy = document.getElementById('sortSelect').value;

      let items = [...allData.groups, ...allData.commits];

      if (search) {
        items = items.filter(item => 
          item.message.toLowerCase().includes(search) ||
          item.author.toLowerCase().includes(search)
        );
      }

      if (typeFilter !== 'all') {
        items = items.filter(item => item.type === typeFilter);
      }

      items.sort((a, b) => {
        switch(sortBy) {
          case 'author':
            return a.author.localeCompare(b.author);
          case 'date':
            return new Date(b.date) - new Date(a.date);
          case 'type':
          default:
            return a.type.localeCompare(b.type);
        }
      });

      const grouped = {
        feature: items.filter(i => i.type === 'feature'),
        bug: items.filter(i => i.type === 'bug'),
        security: items.filter(i => i.type === 'security'),
        refactor: items.filter(i => i.type === 'refactor')
      };

      document.getElementById('changelogContent').innerHTML = renderSections(grouped);
    }

    function formatDateShort(date, lang) {
      const options = lang === 'pl' 
        ? { year: 'numeric', month: 'short', day: 'numeric' }
        : { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(date).toLocaleDateString(lang === 'pl' ? 'pl-PL' : 'en-US', options);
    }

    function renderSections(grouped) {
      const sections = [
        { type: 'feature', color: '#10B981' },
        { type: 'security', color: '#F59E0B' },
        { type: 'bug', color: '#EF4444' },
        { type: 'refactor', color: '#3B82F6' }
      ];

      return sections.map(section => {
        const items = grouped[section.type];
        if (!items || items.length === 0) return '';
        const title = sectionTitles[section.type] || section.type;

        return \`
          <section class="mb-12">
            <div class="section-header pb-3 mb-6">
              <h2 class="text-2xl font-bold text-gray-900 inline-flex items-center gap-3">
                <span class="w-1 h-8 rounded" style="background-color: \${section.color}"></span>
                <span>\${title}</span>
                <span class="text-base font-normal text-gray-500">(\${items.length})</span>
              </h2>
            </div>
            <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table class="w-full">
                <thead>
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">\${t.type}</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">\${t.description}</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">\${t.author}</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">\${t.date}</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">\${t.reference}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  \${items.map((item, index) => {
                    const config = typeConfig[item.type];
                    const isGroup = item.commits && item.commits.length > 0;
                    const dateFormatted = formatDateShort(item.date, language);
                    return \`
                      <tr class="changelog-item" data-type="\${item.type}" data-author="\${item.author}">
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span class="badge px-3 py-1 rounded-full text-white font-medium" 
                            style="background-color: \${config.color}">
                            \${config.label}
                          </span>
                        </td>
                        <td class="px-6 py-4">
                          <div class="text-sm font-medium text-gray-900">\${item.message}</div>
                          \${isGroup ? \`<div class="text-xs text-gray-500 mt-1">\${t.groupedChange} (\${item.commits.length} \${t.commits})</div>\` : ''}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="text-sm text-gray-700">\${item.author}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="text-sm text-gray-600">\${dateFormatted}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          \${isGroup ? \`
                            <span class="text-xs text-gray-500 font-mono">\${t.group}</span>
                          \` : \`
                            <code class="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-700">\${item.shortHash}</code>
                          \`}
                        </td>
                      </tr>
                    \`;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </section>
        \`;
      }).join('');
    }
  </script>
</body>
</html>`;
}

function renderSectionsFull(
  grouped: Record<CommitType, any[]>,
  sectionTitles: Record<CommitType, string>,
  t: typeof translations.en,
  language: Language,
  commits: any[],
  groups: any[],
  typeConfig: typeof CommitTypeConfig
): string {
  const sections = [
    { type: CommitType.FEATURE, color: '#10B981' },
    { type: CommitType.SECURITY, color: '#F59E0B' },
    { type: CommitType.BUG, color: '#EF4444' },
    { type: CommitType.REFACTOR, color: '#3B82F6' }
  ];

  return sections.map(({ type, color }) => {
    const items = grouped[type];
    if (!items || items.length === 0) return '';
    const title = sectionTitles[type];
    const config = typeConfig[type];

    return `
      <section class="mb-12">
        <div class="section-header pb-3 mb-6">
          <h2 class="text-2xl font-bold text-gray-900 inline-flex items-center gap-3">
            <span class="w-1 h-8 rounded" style="background-color: ${color}"></span>
            <span>${title}</span>
            <span class="text-base font-normal text-gray-500">(${items.length})</span>
          </h2>
        </div>
        <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table class="w-full">
            <thead>
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">${t.type}</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">${t.description}</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">${t.author}</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">${t.date}</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">${t.reference}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              ${items.map(item => {
                const isGroup = item.commits && item.commits.length > 0;
                const dateFormatted = formatDateShort(new Date(item.date), language);
                return `
                  <tr class="changelog-item">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="badge px-3 py-1 rounded-full text-white font-medium" 
                        style="background-color: ${config.color}">
                        ${config.label}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <div class="text-sm font-medium text-gray-900">${item.message}</div>
                      ${isGroup ? `<div class="text-xs text-gray-500 mt-1">${t.groupedChange} (${item.commits.length} ${t.commits})</div>` : ''}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-700">${item.author}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-600">${dateFormatted}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      ${isGroup ? `
                        <span class="text-xs text-gray-500 font-mono">${t.group}</span>
                      ` : `
                        <code class="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-700">${item.shortHash}</code>
                      `}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }).join('');
}