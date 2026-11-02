export enum CommitType {
  FEATURE = 'feature',
  SECURITY = 'security',
  BUG = 'bug',
  PERF = 'perf',
  REFACTOR = 'refactor',
  DOCS = 'docs',
  OTHER = 'other'
}

export interface Commit {
  hash: string;
  shortHash: string;
  message: string;
  author: string;
  email: string;
  date: Date;
  type: CommitType;
  /** Conventional Commits scope, e.g. "auth" in `feat(auth): ...` */
  scope?: string;
  /** Set by `!` after the type or a `BREAKING CHANGE:` footer. */
  breaking?: boolean;
}

export interface CommitGroup {
  id: string;
  commits: string[]; // commit hashes
  message: string;
  type: CommitType;
  author: string;
  date: Date;
}

export interface StagedData {
  version: string;
  createdAt: Date;
  updatedAt: Date;
  fromRef: string;
  toRef: string;
  pattern?: string;
  appName?: string;
  commits: Commit[];
  groups: CommitGroup[];
  excluded: string[]; // hashes of excluded commits
}

export interface AnalyzeOptions {
  from: string;
  to: string;
  repo: string;
  pattern?: string;
  /** Extra user keyword patterns (regex sources) per commit type. */
  extraPatterns?: Partial<Record<CommitType, string[]>>;
}

export interface ExportOptions {
  format: 'html' | 'markdown' | 'json';
  output: string;
}

/**
 * Display configuration. Key order is the order of sections in the changelog
 * and of options in the editor.
 */
export const CommitTypeConfig: Record<
  CommitType,
  { label: string; color: string; emoji: string; titles: { en: string; pl: string } }
> = {
  [CommitType.FEATURE]: {
    label: 'Feature',
    color: '#10B981',
    emoji: '✨',
    titles: { en: 'New Features', pl: 'Nowe Funkcje' }
  },
  [CommitType.SECURITY]: {
    label: 'Security',
    color: '#F59E0B',
    emoji: '🔒',
    titles: { en: 'Security Updates', pl: 'Aktualizacje Bezpieczeństwa' }
  },
  [CommitType.BUG]: {
    label: 'Bug Fix',
    color: '#EF4444',
    emoji: '🐛',
    titles: { en: 'Bug Fixes', pl: 'Poprawki Błędów' }
  },
  [CommitType.PERF]: {
    label: 'Performance',
    color: '#8B5CF6',
    emoji: '⚡',
    titles: { en: 'Performance', pl: 'Wydajność' }
  },
  [CommitType.REFACTOR]: {
    label: 'Refactor',
    color: '#3B82F6',
    emoji: '♻️',
    titles: { en: 'Refactoring', pl: 'Refaktoryzacja' }
  },
  [CommitType.DOCS]: {
    label: 'Docs',
    color: '#6B7280',
    emoji: '📝',
    titles: { en: 'Documentation', pl: 'Dokumentacja' }
  },
  [CommitType.OTHER]: {
    label: 'Other',
    color: '#9CA3AF',
    emoji: '🔧',
    titles: { en: 'Other Changes', pl: 'Pozostałe Zmiany' }
  }
};

export const COMMIT_TYPES = Object.keys(CommitTypeConfig) as CommitType[];
