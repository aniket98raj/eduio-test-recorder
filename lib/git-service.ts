// =============================================================================
// Git Service - Auto-commit generated tests to repository
// =============================================================================

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export class GitService {
  private repoPath: string;
  private authorName: string;
  private authorEmail: string;

  constructor() {
    this.repoPath = process.env.GIT_REPO_PATH || '';
    this.authorName = process.env.GIT_AUTHOR_NAME || 'Test Recorder Bot';
    this.authorEmail = process.env.GIT_AUTHOR_EMAIL || 'bot@eduio.io';
  }

  /**
   * Save generated test to repository and commit
   */
  async commitGeneratedTest(
    fileName: string,
    testCode: string,
    commitMessage: string
  ): Promise<void> {
    if (!this.repoPath) {
      throw new Error('GIT_REPO_PATH not configured');
    }

    // Determine file path (save to tests/ai-tests/ directory)
    const testDir = path.join(this.repoPath, 'tests', 'ai-tests');
    const filePath = path.join(testDir, fileName);

    // Ensure directory exists
    await fs.mkdir(testDir, { recursive: true });

    // Write test file
    await fs.writeFile(filePath, testCode, 'utf-8');

    // Git add
    await execAsync(`git add "${filePath}"`, {
      cwd: this.repoPath,
    });

    // Git commit
    await execAsync(
      `git -c user.name="${this.authorName}" -c user.email="${this.authorEmail}" commit -m "${commitMessage}"`,
      {
        cwd: this.repoPath,
      }
    );

    console.log(`✅ Test committed: ${fileName}`);
  }

  /**
   * Check if there are uncommitted changes
   */
  async hasUncommittedChanges(): Promise<boolean> {
    if (!this.repoPath) return false;

    try {
      const { stdout } = await execAsync('git status --porcelain', {
        cwd: this.repoPath,
      });
      return stdout.trim().length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get recent commits
   */
  async getRecentCommits(count: number = 10): Promise<any[]> {
    if (!this.repoPath) return [];

    try {
      const { stdout } = await execAsync(
        `git log --pretty=format:'%H|%an|%ae|%ad|%s' -n ${count}`,
        {
          cwd: this.repoPath,
        }
      );

      return stdout.split('\n').map(line => {
        const [hash, author, email, date, message] = line.split('|');
        return { hash, author, email, date, message };
      });
    } catch (error) {
      return [];
    }
  }
}

export const gitService = new GitService();
