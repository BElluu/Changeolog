import { type CommitType, COMMIT_TYPES } from '../types';
import { CONVENTIONAL_TYPES, FALLBACK_TYPE, KEYWORD_PRIORITY } from './keywords';

export interface Classification {
  type: CommitType;
  /** Subject without the `type(scope)!:` prefix when it was a Conventional Commit. */
  message: string;
  scope?: string;
  breaking: boolean;
}

const CONVENTIONAL = /^(\w+)(?:\(([^)]*)\))?(!)?:\s+(.+)$/;
const BREAKING_FOOTER = /^BREAKING[ -]CHANGE:/m;

export class CommitClassifier {
  private rules: [CommitType, RegExp[]][];

  /** @param extraPatterns user regex sources per type; checked before built-in keywords */
  constructor(extraPatterns: Partial<Record<string, string[]>> = {}) {
    const extra: [CommitType, RegExp[]][] = [];
    for (const [type, sources] of Object.entries(extraPatterns)) {
      if (!(COMMIT_TYPES as string[]).includes(type)) {
        throw new Error(`Unknown commit type "${type}" in patterns (expected: ${COMMIT_TYPES.join(', ')})`);
      }
      const regexes = (sources ?? []).map(source => {
        try {
          return new RegExp(source, 'iu');
        } catch (e) {
          throw new Error(`Invalid pattern "${source}" for type "${type}": ${(e as Error).message}`);
        }
      });
      extra.push([type as CommitType, regexes]);
    }
    const builtin = KEYWORD_PRIORITY.map(
      ([type, patterns]): [CommitType, RegExp[]] => [type, patterns.map(p => new RegExp(p.source, 'iu'))]
    );
    this.rules = [...extra, ...builtin];
  }

  classify(subject: string, body = ''): Classification {
    const breakingFooter = BREAKING_FOOTER.test(body);
    const match = CONVENTIONAL.exec(subject.trim());

    if (match) {
      const mapped = CONVENTIONAL_TYPES[match[1].toLowerCase()];
      if (mapped) {
        return {
          type: mapped,
          message: match[4].trim(),
          scope: match[2]?.trim() || undefined,
          breaking: Boolean(match[3]) || breakingFooter
        };
      }
    }

    return { type: this.byKeywords(subject), message: subject.trim(), breaking: breakingFooter };
  }

  private byKeywords(subject: string): CommitType {
    for (const [type, patterns] of this.rules) {
      if (patterns.some(p => p.test(subject))) {
        return type;
      }
    }
    return FALLBACK_TYPE;
  }
}
