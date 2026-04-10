import fs from 'fs';
import path from 'path';

const TEMP_ROOT = '/tmp/project-factory';

export function cleanupTempDir(projectName: string): void {
  if (!fs.existsSync(TEMP_ROOT)) {
    return;
  }

  const normalizedTarget = normalizeName(projectName);

  for (const entry of fs.readdirSync(TEMP_ROOT, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }

    const entryPath = path.join(TEMP_ROOT, entry.name);
    if (entry.name === projectName || normalizeName(entry.name) === normalizedTarget) {
      fs.rmSync(entryPath, { recursive: true, force: true });
    }
  }
}

function normalizeName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}
