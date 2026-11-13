import { Recipe } from '../types/recipe';
import { getAllMasterRecipes } from './multiUserStorage';

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
    autoSync: false,
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
export async function testGitHubRepo(
  token: string,
  owner: string,
  repo: string
): Promise<{ success: boolean; message: string }> {
  if (!token || !owner || !repo) {
    return { success: false, message: '请完整填写 GitHub Token、用户名与仓库名称' };
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (res.status === 200) {
      const data = await res.json();
      return { success: true, message: `连接成功！已找到仓库「${data.full_name}」` };
    } else if (res.status === 404) {
      return {
        success: false,
        message: `找不到仓库「${owner}/${repo}」，请检查仓库名或确保细粒度 Token 具备 Contents 读写权限`,
      };
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
async function getFileSha(
  token: string,
  owner: string,
  repo: string,
  filePath: string,
  branch: string
): Promise<string | undefined> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`,
      {
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          Accept: 'application/vnd.github+json',
        },
      }
    );
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
 * Strip oversized inline video base64 strings before pushing JSON to GitHub Contents API (100MB file limit)
 */
function sanitizeRecipeForGitHub(recipe: Recipe): Recipe {
  const stripLargeVideo = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('data:video/') && url.length > 500_000) {
      return undefined; // Omit huge inline base64 video so commit stays compact
    }
    return url;
  };

  return {
    ...recipe,
    coverVideo: stripLargeVideo(recipe.coverVideo),
    videoUrl: stripLargeVideo(recipe.videoUrl),
    steps: recipe.steps.map((s) => ({
      ...s,
      videoUrl: stripLargeVideo(s.videoUrl),
    })),
  };
}

async function putGitHubFile(
  token: string,
  owner: string,
  repo: string,
  filePath: string,
  branch: string,
  base64Content: string,
  commitMessage: string,
  sha?: string
): Promise<Response> {
  return fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token.trim()}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: commitMessage,
      content: base64Content,
      branch,
      ...(sha ? { sha } : {}),
    }),
  });
}

function encodeUtf8ToBase64(text: string): string {
  const utf8Bytes = new TextEncoder().encode(text);
  const chunkSize = 0x8000;
  const chunks: string[] = [];
  for (let i = 0; i < utf8Bytes.length; i += chunkSize) {
    const slice = utf8Bytes.subarray(i, i + chunkSize);
    chunks.push(String.fromCharCode(...slice));
  }
  return btoa(chunks.join(''));
}

/**
 * Commits and pushes the full master snapshot (preserving all accounts & public square recipes)
 * with automatic 409 SHA conflict retry
 */
export async function syncRecipesToGitHub(
  config: GitHubConfig,
  currentUserRecipes: Recipe[]
): Promise<{ success: boolean; commitSha?: string; message: string }> {
  const { token, owner, repo, branch } = config;
  if (!token || !owner || !repo) {
    return { success: false, message: '尚未配置 GitHub 访问令牌或仓库信息' };
  }

  try {
    const filePath = 'data/recipes.json';
    // Merge current user's latest recipes into full master list so other accounts & public square are NEVER wiped
    const masterList = getAllMasterRecipes();
    const mergedMap = new Map<string, Recipe>(masterList.map((r) => [r.id, sanitizeRecipeForGitHub(r)]));
    for (const r of currentUserRecipes) {
      mergedMap.set(r.id, sanitizeRecipeForGitHub(r));
    }
    const allRecipes = Array.from(mergedMap.values());

    const backupEnvelope = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      totalMasterRecipes: allRecipes.length,
      activeJournalCount: currentUserRecipes.length,
      recipes: allRecipes,
    };

    const jsonContent = JSON.stringify(backupEnvelope, null, 2);
    const base64Content = encodeUtf8ToBase64(jsonContent);
    const commitMessage = `chore(backup): 同步食谱手帐快照 (共${allRecipes.length}篇) - ${new Date().toLocaleString('zh-CN')}`;

    let sha = await getFileSha(token, owner, repo, filePath, branch);
    let res = await putGitHubFile(token, owner, repo, filePath, branch, base64Content, commitMessage, sha);

    // Retry once on 409 Conflict (concurrent tab/device commit)
    if (res.status === 409) {
      sha = await getFileSha(token, owner, repo, filePath, branch);
      res = await putGitHubFile(token, owner, repo, filePath, branch, base64Content, commitMessage, sha);
    }

    if (res.ok) {
      const data = await res.json();
      const newSha = data.commit?.sha?.slice(0, 7) || 'latest';
      return {
        success: true,
        commitSha: newSha,
        message: `成功同步完整手帐快照 (${allRecipes.length}篇JSON) 至分支 ${branch}！Commit: ${newSha}`,
      };
    } else {
      const errData = await res.json().catch(() => ({}));
      return { success: false, message: errData.message || `提交失败 (HTTP ${res.status})` };
    }
  } catch (err) {
    return { success: false, message: `备份失败: ${(err as Error).message}` };
  }
}
