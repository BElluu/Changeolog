import { existsSync } from 'fs';
import { unlink } from 'fs/promises';
import { type StagedData, type Commit, CommitGroup, CommitType } from '../types';

const STAGE_FILE = '.Changeolog_stage.json';

const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every(x => typeof x === 'string');

/** Validates data received from the web editor before it is written to disk. */
export function validateStagedData(input: unknown): StagedData {
  const d = input as any;
  const types = Object.values(CommitType) as string[];
  const ok =
    d && typeof d === 'object' &&
    typeof d.fromRef === 'string' && typeof d.toRef === 'string' &&
    [d.release, d.releaseDate, d.repoUrl].every((v: unknown) => v === undefined || typeof v === 'string') &&
    Array.isArray(d.commits) && Array.isArray(d.groups) && isStringArray(d.excluded) &&
    d.commits.every((c: any) =>
      c && typeof c.hash === 'string' && typeof c.shortHash === 'string' &&
      typeof c.message === 'string' && typeof c.author === 'string' &&
      types.includes(c.type)) &&
    d.groups.every((g: any) =>
      g && typeof g.id === 'string' && typeof g.message === 'string' &&
      typeof g.author === 'string' && isStringArray(g.commits) && types.includes(g.type));
  if (!ok) throw new Error('Invalid stage data');
  return d as StagedData;
}

export class StageManager {
  async save(
    commits: Commit[],
    meta: Pick<StagedData, 'fromRef' | 'toRef' | 'pattern' | 'appName' | 'release' | 'releaseDate' | 'repoUrl'>
  ): Promise<void> {
    const data: StagedData = {
      version: '1.0',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...meta,
      appName: meta.appName || 'Changeolog',
      commits,
      groups: [],
      excluded: []
    };

    await Bun.write(STAGE_FILE, JSON.stringify(data, null, 2));
  }

  async load(): Promise<StagedData> {
    try {
      const file = Bun.file(STAGE_FILE);
      const text = await file.text();
      const data = JSON.parse(text);
      
      data.createdAt = new Date(data.createdAt);
      data.updatedAt = new Date(data.updatedAt);
      data.commits = data.commits.map((c: any) => ({
        ...c,
        date: new Date(c.date)
      }));
      data.groups = data.groups || [];
      data.excluded = data.excluded || [];

      return data;
    } catch (error) {
      throw new Error(`Failed to load stage file: ${error}`);
    }
  }

  async update(data: StagedData): Promise<void> {
    data.updatedAt = new Date();
    await Bun.write(STAGE_FILE, JSON.stringify(data, null, 2));
  }

  exists(): boolean {
    return Bun.file(STAGE_FILE).size > 0;
  }

  async remove(): Promise<boolean> {
    if (!existsSync(STAGE_FILE)) return false;
    await unlink(STAGE_FILE);
    return true;
  }
}