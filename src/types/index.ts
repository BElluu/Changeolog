export enum CommitType {
    FEATURE = 'feature',
    BUG = 'bug',
    SECURITY = 'security',
    REFACTOR = 'refactor'
  }
  
  export interface Commit {
    hash: string;
    shortHash: string;
    message: string;
    author: string;
    email: string;
    date: Date;
    type: CommitType;
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
  }
  
  export interface ExportOptions {
    format: 'html' | 'markdown' | 'json';
    output: string;
  }
  
  export const CommitTypeConfig = {
    [CommitType.FEATURE]: {
      label: 'Feature',
      color: '#10B981',
      emoji: '✨',
      patterns: [
        /^feat/i,
        /^feature/i,
        /\badd(ed|ing)?\b/i,
        /\bnew\b/i,
        /\bimplement(ed)?\b/i,
        /^funkcja/i,
        /^nowa\s+funkcja/i,
        /\bdodaj(ę|e|a|ane)?\b/i,
        /\bnowy\b/i,
        /\bnowe\b/i,
        /\bnowa\b/i,
        /\bimplementuj(ę|e|a|ane)?\b/i,
        /\bwdr[oó]ż(am|asz|a|amy|acie|ają)?\b/i
      ]
    },
    [CommitType.BUG]: {
      label: 'Bug Fix',
      color: '#EF4444',
      emoji: '🐛',
      patterns: [
        /^fix/i,
        /\bfix(ed|ing)?\b/i,
        /\bbug\b/i,
        /\bissue\b/i,
        /\berror\b/i,
        /^napraw/i,
        /\bnapraw(iam|iasz|ia|iamy|iacie|iają)?\b/i,
        /\bb[łl]ą(d|d|dku|dków|dek|dka)\b/i,
        /\bbug\b/i,
        /\bproblem\b/i,
        /\bbł[ęe]d\b/i
      ]
    },
    [CommitType.SECURITY]: {
      label: 'Security',
      color: '#F59E0B',
      emoji: '🔒',
      patterns: [
        /^security/i,
        /^sec/i,
        /\bsecurity\b/i,
        /\bvulnerabilit/i,
        /\bcve\b/i,
        /^bezpieczeństwo/i,
        /^bezpiecze/i,
        /\bbezpieczeństwo\b/i,
        /\bpodatnoś[ćc]\b/i,
        /\bwrażliwoś[ćc]\b/i,
        /\bzagrożenie\b/i
      ]
    },
    [CommitType.REFACTOR]: {
      label: 'Refactor',
      color: '#3B82F6',
      emoji: '♻️',
      patterns: [
        /^refactor/i,
        /\brefactor(ing)?\b/i,
        /\brestructur/i,
        /\bclean\s*up\b/i,
        /\bextract\b/i,
        /^refaktoryz/i,
        /\brefaktoryz(uj|uję|ujesz|uje|ujemy|ujecie|ują)?\b/i,
        /\bprzebud(uj|uję|ujesz|uje|ujemy|ujecie|ują)?\b/i,
        /\bprzeorganiz(uj|uję|ujesz|uje|ujemy|ujecie|ują)?\b/i,
        /\buporz[ąa]d(kuj|kuję|kujesz|kuje|kujemy|kujecie|kują)?\b/i,
        /\bwyodrębn(ij|iję|ijesz|ije|ijemy|ijecie|iją)?\b/i
      ]
    }
  };