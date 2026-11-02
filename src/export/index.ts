import type { StagedData } from '../types';
import { generateHTML, generateJSON, generateMarkdown } from '../web/generators';

export type ExportFormat = 'html' | 'markdown' | 'json';

export interface ExportRequest {
  format: ExportFormat;
  template?: 'full' | 'simple';
  language?: 'pl' | 'en';
}

export interface ExportResult {
  content: string;
  contentType: string;
  filename: string;
}

export function isExportFormat(value: unknown): value is ExportFormat {
  return value === 'html' || value === 'markdown' || value === 'json';
}

/** Single place that maps a format to its generator, content type and default file name. */
export function renderExport(data: StagedData, req: ExportRequest): ExportResult {
  const template = req.template ?? 'full';
  const language = req.language ?? 'en';

  switch (req.format) {
    case 'html': {
      const langSuffix = language === 'pl' ? '_pl' : '';
      const templateSuffix = template === 'simple' ? '_simple' : '';
      return {
        content: generateHTML(data, template, language),
        contentType: 'text/html; charset=utf-8',
        filename: `CHANGELOG${templateSuffix}${langSuffix}.html`
      };
    }
    case 'markdown':
      return { content: generateMarkdown(data), contentType: 'text/markdown; charset=utf-8', filename: 'CHANGELOG.md' };
    case 'json':
      return { content: generateJSON(data), contentType: 'application/json', filename: 'changelog.json' };
    default:
      throw new Error(`Invalid format: ${String(req.format)}`);
  }
}

/**
 * Inserts a release section into an existing changelog (newest first).
 * A section with the same `## [release]` heading is replaced, so re-running is idempotent.
 */
export function mergeChangelog(existing: string | undefined, section: string, release: string, appName: string): string {
  const block = `${section.trimEnd()}\n\n`;
  if (!existing?.trim()) return `# ${appName} Changelog\n\n${block}`.trimEnd() + '\n';

  const lines = existing.replace(/\r\n/g, '\n').split('\n');
  const heading = `## [${release}]`;

  const old = lines.findIndex(l => l.startsWith(heading));
  if (old !== -1) {
    let end = lines.findIndex((l, i) => i > old && l.startsWith('## '));
    if (end === -1) end = lines.length;
    lines.splice(old, end - old);
  }

  const first = lines.findIndex(l => l.startsWith('## '));
  const at = first === -1 ? lines.length : first;
  const before = lines.slice(0, at).join('\n').trimEnd();
  const after = lines.slice(at).join('\n').trimEnd();

  return `${before}\n\n${block}${after}`.trimEnd() + '\n';
}
