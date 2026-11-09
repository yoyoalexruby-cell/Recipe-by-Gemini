import { Recipe } from '../types/recipe';

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  autoSync: boolean;
  lastSyncedAt?: string;
  lastCommitSha?: string;
}

const GITHUB_CONFIG_KEY = 'food_journal_github_config_v1';

export function getGitHubConfig(): GitHubConfig {
  try {
    const raw = localStorage.getItem(GITHUB_CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load GitHub config', err);
  }
  return {
    token: '',
    owner: '',
    repo: 'food-journal-app',
    branch: 'main',
    autoSync: false
  };
}

export function saveGitHubConfig(config: GitHubConfig): void {
  try {
    localStorage.setItem(GITHUB_CONFIG_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save GitHub config', err);
  }
}

/**
 * Validates connection with GitHub API
 */
export async function testGitHubRepo(token: string, owner: string, repo: string): Promise<{ success: boolean; message: string }> {
  if (!token || !owner || !repo) {
    return { success: false, message: '请完整填写 GitHub Token、用户名与仓库名称' };
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    if (res.status === 200) {
      const data = await res.json();
      return { success: true, message: `连接成功！已找到仓库「${data.full_name}」` };
    } else if (res.status === 404) {
      return { success: false, message: `找不到仓库「${owner}/${repo}」，请检查仓库名或确保 Token 具备访问权限` };
    } else if (res.status === 401) {
      return { success: false, message: 'Token 无效或已过期，请重新生成' };
    } else {
      const data = await res.json().catch(() => ({}));
      return { success: false, message: data.message || `GitHub 请求返回错误状态码: ${res.status}` };
    }
  } catch (err) {
    return { success: false, message: `网络连接异常: ${(err as Error).message}` };
  }
}

/**
 * Gets the current sha of a file in the repository (needed for updating files via API)
 */
async function getFileSha(token: string, owner: string, repo: string, path: string, branch: string): Promise<string | undefined> {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, {
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        Accept: 'application/vnd.github+json'
      }
    });
    if (res.ok) {
      const data = await res.json();
      return data.sha;
    }
  } catch {
    // File may not exist yet
  }
  return undefined;
}

/**
 * Commits and pushes the food recipes data to GitHub
 */
export async function syncRecipesToGitHub(
  config: GitHubConfig,
  recipes: Recipe[]
): Promise<{ success: boolean; commitSha?: string; message: string }> {
  const { token, owner, repo, branch } = config;
  if (!token || !owner || !repo) {
    return { success: false, message: '尚未配置 GitHub 访问令牌或仓库信息' };
  }

  try {
    const filePath = 'data/recipes.json';
    const sha = await getFileSha(token, owner, repo, filePath, branch);

    const jsonContent = JSON.stringify(recipes, null, 2);
    // Base64 encode supporting UTF-8 Chinese characters
    const utf8Bytes = new TextEncoder().encode(jsonContent);
    let binary = '';
    utf8Bytes.forEach((b) => (binary += String.fromCharCode(b)));
    const base64Content = btoa(binary);

    const commitMessage = `chore(backup): 实时备份烹饪手帐 (${recipes.length}篇食谱) - ${new Date().toLocaleString('zh-CN')}`;

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: commitMessage,
        content: base64Content,
        branch,
        ...(sha ? { sha } : {})
      })
    });

    if (res.ok) {
      const data = await res.json();
      const newSha = data.commit?.sha?.slice(0, 7) || 'latest';
      return {
        success: true,
        commitSha: newSha,
        message: `成功备份到 GitHub 分支 ${branch}！Commit: ${newSha}`
      };
    } else {
      const errData = await res.json().catch(() => ({}));
      return { success: false, message: errData.message || `提交失败 (HTTP ${res.status})` };
    }
  } catch (err) {
    return { success: false, message: `备份失败: ${(err as Error).message}` };
  }
}
