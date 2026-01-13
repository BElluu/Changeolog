import { StagedData, Commit, CommitGroup } from '../types';

const STAGE_FILE = '.Changeolog_stage.json';

export class StageManager {
  async save(
    commits: Commit[],
    fromRef: string,
    toRef: string,
    pattern?: string,
    appName?: string
  ): Promise<void> {
    const data: StagedData = {
      version: '1.0',
      createdAt: new Date(),
      updatedAt: new Date(),
      fromRef,
      toRef,
      pattern,
      appName: appName || 'Changeolog',
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
}