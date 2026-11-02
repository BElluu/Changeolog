import { simpleGit, type SimpleGit } from 'simple-git';
import { CommitClassifier } from '../classifier';
import { normalizeRepoUrl } from '../links';
import type { AnalyzeOptions, Commit } from '../types';

export class GitParser {
  private git: SimpleGit;

  constructor(repoPath: string) {
    this.git = simpleGit(repoPath);
  }

  /** Browsable URL of the `origin` remote, if there is one. */
  async remoteUrl(): Promise<string | undefined> {
    try {
      return normalizeRepoUrl(await this.git.raw(['remote', 'get-url', 'origin']));
    } catch {
      return undefined;
    }
  }

  /** If `ref` is exactly a tag, returns the tag name and its commit date (YYYY-MM-DD). */
  async resolveRelease(ref: string): Promise<{ release?: string; releaseDate?: string }> {
    try {
      const release = (await this.git.raw(['describe', '--tags', '--exact-match', ref])).trim();
      const releaseDate = (await this.git.raw(['log', '-1', '--format=%cs', ref])).trim();
      return release ? { release, releaseDate } : {};
    } catch {
      return {};
    }
  }

  async parseRange(options: AnalyzeOptions): Promise<Commit[]> {
    // Validate user input before touching git so errors are not wrapped.
    const pattern = options.pattern ? compilePattern(options.pattern) : undefined;
    const classifier = new CommitClassifier(options.extraPatterns);

    try {
      const log = await this.git.log({ from: options.from, to: options.to });

      return log.all
        .filter(c => !pattern || pattern.test(c.message))
        .map(c => {
          const result = classifier.classify(c.message, c.body);
          return {
            hash: c.hash,
            shortHash: c.hash.substring(0, 7),
            message: result.message,
            author: c.author_name,
            email: c.author_email,
            date: new Date(c.date),
            type: result.type,
            ...(result.scope && { scope: result.scope }),
            ...(result.breaking && { breaking: true })
          };
        });
    } catch (error) {
      throw new Error(`Failed to parse commits: ${error}`);
    }
  }
}

function compilePattern(source: string): RegExp {
  try {
    return new RegExp(source);
  } catch (e) {
    throw new Error(`Invalid --pattern regex "${source}": ${(e as Error).message}`);
  }
}
