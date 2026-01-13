import { simpleGit, SimpleGit } from 'simple-git';
import { Commit, CommitType, AnalyzeOptions } from '../types';
import { CommitClassifier } from '../classifier';

export class GitParser {
  private git: SimpleGit;

  constructor(private repoPath: string) {
    this.git = simpleGit(repoPath);
  }

  async parseRange(options: AnalyzeOptions): Promise<Commit[]> {
    try {
      const log = await this.git.log({
        from: options.from,
        to: options.to,
      });

      let commits = log.all.map(commit => this.parseCommit(commit));

      if (options.pattern) {
        const pattern = new RegExp(options.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        commits = commits.filter(c => pattern.test(c.message));
      }

      const classifier = new CommitClassifier();
      commits = commits.map(commit => ({
        ...commit,
        type: classifier.classify(commit.message)
      }));

      return commits;
    } catch (error) {
      throw new Error(`Failed to parse commits: ${error}`);
    }
  }

  private parseCommit(gitCommit: any): Commit {
    return {
      hash: gitCommit.hash,
      shortHash: gitCommit.hash.substring(0, 7),
      message: gitCommit.message.trim(),
      author: gitCommit.author_name,
      email: gitCommit.author_email,
      date: new Date(gitCommit.date),
      type: CommitType.FEATURE // Will be classified later
    };
  }
}