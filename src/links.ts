import { escapeHtml } from './util/html';

/**
 * Turns a git remote (ssh, scp-like or http) into a browsable `https://host/owner/repo`.
 * Credentials embedded in the remote are always dropped.
 */
export function normalizeRepoUrl(remote: string | undefined): string | undefined {
  const value = remote?.trim();
  if (!value) return undefined;

  const scp = /^[\w.-]+@([\w.-]+):(.+?)(?:\.git)?\/?$/.exec(value);
  if (scp && !value.includes('://')) return `https://${scp[1]}/${scp[2]}`;

  try {
    const url = new URL(value);
    if (!['http:', 'https:', 'ssh:', 'git:'].includes(url.protocol)) return undefined;
    const path = url.pathname.replace(/\.git$/, '').replace(/\/+$/, '');
    return path ? `https://${url.hostname}${path}` : undefined;
  } catch {
    return undefined;
  }
}

type Provider = 'github' | 'gitlab' | 'bitbucket';

function providerOf(repoUrl: string): Provider {
  const host = new URL(repoUrl).hostname;
  if (host.includes('gitlab')) return 'gitlab';
  if (host.includes('bitbucket')) return 'bitbucket';
  return 'github';
}

export function commitUrl(repoUrl: string, hash: string): string {
  const path = { github: 'commit', gitlab: '-/commit', bitbucket: 'commits' }[providerOf(repoUrl)];
  return `${repoUrl}/${path}/${hash}`;
}

export function issueUrl(repoUrl: string, id: string): string {
  const path = { github: 'issues', gitlab: '-/issues', bitbucket: 'issues' }[providerOf(repoUrl)];
  return `${repoUrl}/${path}/${id}`;
}

// `#123`, but not the `#39` inside an HTML entity like `&#39;`
const ISSUE_REF = /(?<![\w&])#(\d+)\b/g;

/** Plain-text message -> Markdown with `#123` linked to the issue tracker. */
export function linkifyMarkdown(message: string, repoUrl?: string): string {
  if (!repoUrl) return message;
  return message.replace(ISSUE_REF, (_m, id) => `[#${id}](${issueUrl(repoUrl, id)})`);
}

/** Plain-text message -> escaped HTML with `#123` linked to the issue tracker. */
export function linkifyHtml(message: string, repoUrl?: string): string {
  const escaped = escapeHtml(message);
  if (!repoUrl) return escaped;
  return escaped.replace(
    ISSUE_REF,
    (_m, id) => `<a href="${escapeHtml(issueUrl(repoUrl, id))}" target="_blank" rel="noopener" class="text-blue-600 hover:underline">#${id}</a>`
  );
}

/** Commit hash as an HTML link when the repository URL is known. */
export function hashHtml(shortHash: string, hash: string, repoUrl?: string): string {
  if (!repoUrl) return escapeHtml(shortHash);
  return `<a href="${escapeHtml(commitUrl(repoUrl, hash))}" target="_blank" rel="noopener" class="hover:underline">${escapeHtml(shortHash)}</a>`;
}
