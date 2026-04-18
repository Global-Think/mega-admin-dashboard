import 'server-only';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

import { injectConfigFiles } from '@/lib/config-files';
import type { ProjectConfig } from '@/types/project';

const TEMP_ROOT = '/tmp/project-factory';

function runCommand(command: string, cwd: string): void {
  try {
    execSync(command, {
      cwd,
      stdio: 'pipe',
      encoding: 'utf8',
    });
  } catch (error) {
    const execError = error as Error & { stdout?: string | Buffer; stderr?: string | Buffer };
    const stdout = execError.stdout?.toString() ?? '';
    const stderr = execError.stderr?.toString() ?? '';
    throw new Error(
      `Command failed: ${command}\n${stderr || stdout || execError.message}`.trim()
    );
  }
}

export async function scaffoldProject(config: ProjectConfig): Promise<string> {
  if (!/^[a-z0-9-]+$/.test(config.projectName)) {
    throw new Error('Invalid project name');
  }

  fs.mkdirSync(TEMP_ROOT, { recursive: true });

  const projectPath = path.join(TEMP_ROOT, config.projectName);
  removeTempProjectDirs(config.projectName);
  const beforeEntries = new Set(
    fs
      .readdirSync(TEMP_ROOT, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
  );

  switch (config.framework) {
    case 'vue3':
      runCommand(`npm create vite@latest ${config.projectName} -- --template vue-ts`, TEMP_ROOT);
      runCommand('npm install', projectPath);
      runCommand('npm install vue-router@latest pinia@latest', projectPath);
      break;
    case 'nextjs':
      runCommand(
        `npx create-next-app@latest ${config.projectName} --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack --use-npm --disable-git --yes`,
        TEMP_ROOT
      );
      break;
    case 'angular':
      runCommand(
        `npx @angular/cli@latest new ${config.projectName} --routing --style=scss --strict --skip-git --defaults --package-manager npm`,
        TEMP_ROOT
      );
      break;
    default:
      throw new Error(`Unsupported framework: ${String(config.framework)}`);
  }

  const resolvedProjectPath = resolveProjectPath(TEMP_ROOT, config.projectName, beforeEntries);

  if (!fs.existsSync(resolvedProjectPath) || !fs.statSync(resolvedProjectPath).isDirectory()) {
    throw new Error(
      `Scaffold completed but the project directory was not found at ${resolvedProjectPath}`
    );
  }

  injectConfigFiles(resolvedProjectPath);
  return resolvedProjectPath;
}

function resolveProjectPath(
  tempRoot: string,
  projectName: string,
  beforeEntries: Set<string>
): string {
  const exactPath = path.join(tempRoot, projectName);

  if (fs.existsSync(exactPath)) {
    return exactPath;
  }

  const createdDirectories = fs
    .readdirSync(tempRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !beforeEntries.has(entry.name))
    .map((entry) => entry.name);

  const normalizedTarget = normalizeName(projectName);
  const matchedDirectory =
    createdDirectories.find((entry) => normalizeName(entry) === normalizedTarget) ??
    createdDirectories.at(-1);

  return matchedDirectory ? path.join(tempRoot, matchedDirectory) : exactPath;
}

function normalizeName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function removeTempProjectDirs(projectName: string): void {
  const normalizedTarget = normalizeName(projectName);

  for (const entry of fs.readdirSync(TEMP_ROOT, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }

    if (entry.name === projectName || normalizeName(entry.name) === normalizedTarget) {
      fs.rmSync(path.join(TEMP_ROOT, entry.name), { recursive: true, force: true });
    }
  }
}
