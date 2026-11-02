import { CommitType } from '../types';

/** Conventional Commits types mapped to Changeolog types. */
export const CONVENTIONAL_TYPES: Record<string, CommitType> = {
  feat: CommitType.FEATURE,
  feature: CommitType.FEATURE,
  fix: CommitType.BUG,
  bugfix: CommitType.BUG,
  hotfix: CommitType.BUG,
  perf: CommitType.PERF,
  refactor: CommitType.REFACTOR,
  docs: CommitType.DOCS,
  doc: CommitType.DOCS,
  security: CommitType.SECURITY,
  sec: CommitType.SECURITY,
  revert: CommitType.OTHER,
  chore: CommitType.OTHER,
  ci: CommitType.OTHER,
  build: CommitType.OTHER,
  test: CommitType.OTHER,
  tests: CommitType.OTHER,
  style: CommitType.OTHER,
  deps: CommitType.OTHER
};

/**
 * Keyword fallbacks (English and Polish) for commits that are not in
 * Conventional Commits format. Types are listed in priority order: the first
 * type with a matching pattern wins, so "fix new issue" is a bug, not a feature.
 * Patterns are compiled with the `iu` flags; word boundaries are only used at
 * the start of a word because `\b` does not understand Polish letters.
 */
export const KEYWORD_PRIORITY: [CommitType, RegExp[]][] = [
  [
    CommitType.SECURITY,
    [
      /\bsecurity\b/,
      /\bvulnerabilit/,
      /\bcve\b/,
      /\bxss\b/,
      /\bbezpiecze/,
      /\bpodatno/,
      /\bwra[żz]liwo/,
      /\bzagro[żz]eni/
    ]
  ],
  [
    CommitType.BUG,
    [
      /\bfix(?:e[sd]|ing)?\b/,
      /\bbugs?\b/,
      /\bhotfix/,
      /\bregression/,
      /\bcrash/,
      /\bnapraw/,
      /\bb[łl][ąęae]d/
    ]
  ],
  [
    CommitType.PERF,
    [/\bperf(?:ormance)?\b/, /\boptimi[sz]/, /\bspeed\s?up\b/, /\bfaster\b/, /\boptymaliz/, /\bwydajno/, /\bprzyspiesz/]
  ],
  [
    CommitType.REFACTOR,
    [
      /\brefactor/,
      /\brestructur/,
      /\bclean\s?up\b/,
      /\bsimplif/,
      /\brefaktor/,
      /\bprzebud/,
      /\bprzeorganiz/,
      /\buporz[ąa]dk/,
      /\bwyodr[ęe]bn/
    ]
  ],
  [CommitType.DOCS, [/\bdocs?\b/, /\breadme\b/, /\bdocumentation\b/, /\bdokumentac/]],
  [
    CommitType.FEATURE,
    [
      /\badd(?:s|ed|ing)?\b/,
      /\bnew\b/,
      /\bimplement/,
      /\bintroduc/,
      /\bdodaj/,
      /\bdodan/,
      /\bnow[aey]\b/,
      /\bnowy\b/,
      /\bimplementuj/,
      /\bwdr[oó][żz]/
    ]
  ]
];

export const FALLBACK_TYPE = CommitType.OTHER;
