import { type StagedData, CommitTypeConfig } from '../types';
import { jsonForScript, ESC_FN_SOURCE } from '../util/html';

export function renderEditor(data: StagedData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Changeolog Editor</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    .commit-card { transition: all 0.2s; }
    .commit-card:hover { transform: translateX(4px); }
    .excluded { opacity: 0.5; }
  </style>
</head>
<body class="bg-gray-50">
  <div id="app"></div>
  
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

    function openHTMLExportDialog() {
      const dialog = document.getElementById('htmlExportDialog');
      dialog.classList.remove('hidden');
    }

    function closeHTMLExportDialog() {
      const dialog = document.getElementById('htmlExportDialog');
      dialog.classList.add('hidden');
    }

    function doHTMLExport() {
      const template = document.getElementById('htmlTemplate').value;
      const language = document.getElementById('htmlLanguage').value;
      closeHTMLExportDialog();
      exportChangelog('html', template, language);
    }

    function getStats() {
      const included = stageData.commits.filter(c => !isExcluded(c.hash));
      const byType = {};
      included.forEach(c => {
        byType[c.type] = (byType[c.type] || 0) + 1;
      });
      return {
        total: stageData.commits.length,
        included: included.length + stageData.groups.length,
        excluded: stageData.excluded.length - stageData.groups.reduce((sum, g) => sum + g.commits.length, 0),
        byType
      };
    }

    function render() {
      const stats = getStats();
      const commits = getFilteredCommits();

      document.getElementById('app').innerHTML = \`
        <!-- Header -->
        <div class="bg-white shadow-sm border-b">
          <div class="max-w-7xl mx-auto px-6 py-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="text-3xl">📋</div>
                <div>
                  <h1 class="text-2xl font-bold text-gray-900">Changeolog</h1>
                  <p class="text-sm text-gray-600">
                    \${esc(stageData.fromRef)} → \${esc(stageData.toRef)}
                    \${stageData.pattern ? \` • Pattern: \${esc(stageData.pattern)}\` : ''}
                  </p>
                </div>
              </div>
              <div class="flex gap-2">
                <button onclick="exportChangelog('markdown')" 
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  📝 Markdown
                </button>
                <button onclick="openHTMLExportDialog()" 
                  class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  🌐 HTML
                </button>
                <button onclick="exportChangelog('json')" 
                  class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  📊 JSON
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="max-w-7xl mx-auto px-6 py-8">
          <!-- Stats -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
              <div class="text-2xl font-bold">\${stats.total}</div>
              <div class="text-sm opacity-90">Total</div>
            </div>
            <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
              <div class="text-2xl font-bold">\${stats.included}</div>
              <div class="text-sm opacity-90">Included</div>
            </div>
            <div class="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white">
              <div class="text-2xl font-bold">\${stats.excluded}</div>
              <div class="text-sm opacity-90">Excluded</div>
            </div>
            \${Object.entries(typeConfig).filter(([type]) => stats.byType[type]).map(([type, cfg]) => \`
            <div class="rounded-xl p-4 text-white" style="background: \${cfg.color}">
              <div class="text-2xl font-bold">\${stats.byType[type]}</div>
              <div class="text-sm opacity-90">\${cfg.emoji} \${cfg.label}</div>
            </div>\`).join('')}
          </div>

          <!-- Filters -->
          <div class="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input 
                type="text" 
                placeholder="🔍 Search..."
                value="\${esc(searchQuery)}"
                oninput="searchQuery = this.value; render()"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              
              <select onchange="filterType = this.value; render()" 
                class="px-4 py-2 border border-gray-300 rounded-lg">
                <option value="all">All Types</option>
                \${Object.entries(typeConfig).map(([type, cfg]) => \`<option value="\${type}" \${filterType === type ? 'selected' : ''}>\${cfg.emoji} \${cfg.label}</option>\`).join('')}
              </select>

              <select onchange="sortBy = this.value; render()" 
                class="px-4 py-2 border border-gray-300 rounded-lg">
                <option value="date" \${sortBy === 'date' ? 'selected' : ''}>Sort by Date</option>
                <option value="author" \${sortBy === 'author' ? 'selected' : ''}>Sort by Author</option>
                <option value="type" \${sortBy === 'type' ? 'selected' : ''}>Sort by Type</option>
                <option value="message" \${sortBy === 'message' ? 'selected' : ''}>Sort by Message</option>
              </select>

              <button onclick="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'; render()"
                class="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                \${sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
              </button>
            </div>
          </div>

          <!-- Groups -->
          \${stageData.groups.length > 0 ? \`
            <div class="mb-6">
              <h3 class="text-lg font-bold mb-3">📦 Groups (\${stageData.groups.length})</h3>
              \${stageData.groups.map(group => \`
                <div class="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 mb-3">
                  <div class="flex items-start gap-4">
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-2">
                        <span class="px-3 py-1 rounded-full text-sm font-medium text-white"
                          style="background: \${typeConfig[group.type].color}">
                          \${typeConfig[group.type].emoji} \${typeConfig[group.type].label}
                        </span>
                        <span class="text-sm text-gray-600">\${group.commits.length} commits</span>
                      </div>
                      <p class="font-medium text-gray-900 mb-2">\${esc(group.message)}</p>
                      <div class="text-sm text-gray-600">
                        👤 \${esc(group.author)} • 📅 \${new Date(group.date).toLocaleString()}
                      </div>
                    </div>
                    <button onclick="removeGroup('\${esc(group.id)}')" 
                      class="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
                      Ungroup
                    </button>
                  </div>
                </div>
              \`).join('')}
            </div>
          \` : ''}

          <!-- Commits -->
          <div class="space-y-3">
            \${commits.map(commit => {
              const excluded = isExcluded(commit.hash);
              return \`
                <div class="commit-card bg-white rounded-xl shadow-sm border-2 \${excluded ? 'border-gray-200 excluded' : 'border-blue-200'} p-4">
                  <div class="flex items-start gap-4">
                    <input type="checkbox" 
                      class="mt-1 w-5 h-5"
                      \${selectedCommits.has(commit.hash) ? 'checked' : ''}
                      onchange="window.toggleCommitSelection('\${esc(commit.hash)}', this.checked)"
                    />
                    
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-3 mb-2 flex-wrap">
                        <select 
                          value="\${commit.type}"
                          onchange="changeType('\${esc(commit.hash)}', this.value)"
                          class="px-3 py-1 rounded-full text-sm font-medium text-white border-0"
                          style="background: \${typeConfig[commit.type].color}">
                          \${Object.keys(typeConfig).map(type => \`
                            <option value="\${type}" \${commit.type === type ? 'selected' : ''}>
                              \${typeConfig[type].emoji} \${typeConfig[type].label}
                            </option>
                          \`).join('')}
                        </select>
                        <code class="px-2 py-1 bg-gray-100 rounded text-xs">\${esc(commit.shortHash)}</code>
                      </div>
                      
                      <input 
                        type="text" 
                        value="\${esc(commit.message)}"
                        onchange="editMessage('\${esc(commit.hash)}', this.value)"
                        class="w-full px-2 py-1 mb-2 border border-gray-300 rounded"
                      />
                      
                      <div class="flex items-center gap-4 text-sm text-gray-600">
                        <span>👤 \${esc(commit.author)}</span>
                        <span>📅 \${new Date(commit.date).toLocaleDateString()}</span>
                        <span>🕐 \${new Date(commit.date).toLocaleTimeString()}</span>
                      </div>
                    </div>
                    
                    <button onclick="toggleExclude('\${esc(commit.hash)}')"
                      class="px-4 py-2 rounded-lg \${excluded ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}">
                      \${excluded ? '✓ Include' : '✗ Exclude'}
                    </button>
                  </div>
                </div>
              \`;
            }).join('')}
          </div>

          <!-- Group Selection Action -->
          <div id="groupAction" class="fixed bottom-6 right-6 \${selectedCommits.size < 2 ? 'hidden' : ''}">
            <button onclick="openGroupDialog()"
              class="px-6 py-3 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700">
              📦 Group Selected (\${selectedCommits.size})
            </button>
          </div>
        </div>

        <!-- HTML Export Dialog -->
        <div id="htmlExportDialog" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 class="text-xl font-bold mb-4">Export HTML</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Template</label>
                <select id="htmlTemplate" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option value="full">Full (with summary, dates, references)</option>
                  <option value="simple">Simple (type and description only)</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <select id="htmlLanguage" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option value="en">English</option>
                  <option value="pl">Polski</option>
                </select>
              </div>
            </div>
            <div class="flex gap-2 mt-6">
              <button onclick="closeHTMLExportDialog()" 
                class="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                Cancel
              </button>
              <button onclick="doHTMLExport()" 
                class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Export
              </button>
            </div>
          </div>
        </div>

        <!-- Group Dialog -->
        <div id="groupDialog" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 class="text-xl font-bold mb-4">Group Commits</h3>
            <input id="groupMessage" type="text" placeholder="Group message" 
              class="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4">
            <select id="groupType" class="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4">
              \${Object.entries(typeConfig).map(([type, cfg]) => \`<option value="\${type}">\${cfg.emoji} \${cfg.label}</option>\`).join('')}
            </select>
            <div class="flex gap-2">
              <button onclick="closeGroupDialog()" 
                class="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                Cancel
              </button>
              <button onclick="createGroup()" 
                class="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Create Group
              </button>
            </div>
          </div>
        </div>
      \`;
    }

    window.toggleCommitSelection = function(hash, checked) {
      if (checked) {
        selectedCommits.add(hash);
      } else {
        selectedCommits.delete(hash);
      }
      document.getElementById('groupAction').classList.toggle('hidden', selectedCommits.size < 2);
      document.querySelector('#groupAction button').textContent = '📦 Group Selected (' + selectedCommits.size + ')';
    };

    window.openGroupDialog = function() {
      document.getElementById('groupDialog').classList.remove('hidden');
    };

    window.closeGroupDialog = function() {
      document.getElementById('groupDialog').classList.add('hidden');
    };

    window.openHTMLExportDialog = openHTMLExportDialog;
    window.closeHTMLExportDialog = closeHTMLExportDialog;
    window.doHTMLExport = doHTMLExport;

    window.createGroup = function() {
      const message = document.getElementById('groupMessage').value;
      const type = document.getElementById('groupType').value;
      if (message && selectedCommits.size >= 2) {
        groupCommits(Array.from(selectedCommits), message, type);
        selectedCommits.clear();
        closeGroupDialog();
        document.getElementById('groupAction').classList.add('hidden');
      }
    };

    render();
  </script>
</body>
</html>`;
}