import 'server-only';
import { execSync } from 'child_process';

function runGit(command: string, cwd: string): void {
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
    throw new Error(`Git command failed: ${command}\n${stderr || stdout || execError.message}`.trim());
  }
}

function injectToken(repoCloneUrl: string): string {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error('GITHUB_TOKEN is not configured');
  }

  return repoCloneUrl.replace('https://', `https://${encodeURIComponent(token)}@`);
}

export async function initAndPush(
  projectPath: string,
  repoCloneUrl: string
): Promise<void> {
  const remoteUrl = injectToken(repoCloneUrl);

  runGit('git init', projectPath);
  runGit('git config user.name "project-factory"', projectPath);
  runGit('git config user.email "project-factory@local"', projectPath);
  runGit('git add .', projectPath);
  runGit('git commit -m "chore: initial scaffold via project-factory"', projectPath);
  runGit('git branch -M main', projectPath);
  runGit(`git remote add origin ${remoteUrl}`, projectPath);
  runGit('git push -u origin main', projectPath);
}
