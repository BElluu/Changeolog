import { existsSync } from 'node:fs';

export const DEFAULT_CONFIG_FILE = 'changeolog.config.json';

export interface ChangeologConfig {
  /** Application name shown in the changelog header. */
  appName?: string;
  /**
   * Extra regex sources per commit type, checked before the built-in keywords.
   * Handy for other languages or project conventions, e.g. `{ "bug": ["^hotfix"] }`.
   */
  patterns?: Record<string, string[]>;
}

/**
 * Loads the config file. A missing default file is fine; an explicitly
 * requested file that does not exist is an error.
 */
export async function loadConfig(path?: string): Promise<ChangeologConfig> {
  const file = path ?? DEFAULT_CONFIG_FILE;
  if (!existsSync(file)) {
    if (path) throw new Error(`Config file not found: ${path}`);
    return {};
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(await Bun.file(file).text());
  } catch (e) {
    throw new Error(`Cannot read config ${file}: ${(e as Error).message}`);
  }
  return validateConfig(parsed, file);
}

export function validateConfig(input: unknown, file = DEFAULT_CONFIG_FILE): ChangeologConfig {
  const fail = (msg: string) => new Error(`Invalid config ${file}: ${msg}`);
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw fail('expected a JSON object');
  const c = input as Record<string, unknown>;

  if (c.appName !== undefined && typeof c.appName !== 'string') throw fail('"appName" must be a string');
  if (c.patterns !== undefined) {
    const p = c.patterns as Record<string, unknown>;
    if (
      !p ||
      typeof p !== 'object' ||
      Array.isArray(p) ||
      !Object.values(p).every(v => Array.isArray(v) && v.every(s => typeof s === 'string'))
    ) {
      throw fail('"patterns" must map commit types to arrays of regex strings');
    }
  }
  return c as ChangeologConfig;
}
