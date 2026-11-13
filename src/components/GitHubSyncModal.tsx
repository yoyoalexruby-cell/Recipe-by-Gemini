import React, { useState } from 'react';
import { Recipe } from '../types/recipe';
import {
  GitHubConfig,
  getGitHubConfig,
  saveGitHubConfig,
  testGitHubRepo,
  syncRecipesToGitHub,
} from '../utils/githubSync';
import {
  GitBranch,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Key,
  Terminal,
  Copy,
  Check,
  X,
  ShieldCheck,
} from 'lucide-react';

interface GitHubSyncModalProps {
  isOpen: boolean;
  recipes: Recipe[];
  onClose: () => void;
  onConfigUpdated: (config: GitHubConfig) => void;
}

export const GitHubSyncModal: React.FC<GitHubSyncModalProps> = ({
  isOpen,
  recipes,
  onClose,
  onConfigUpdated,
}) => {
  const [config, setConfig] = useState<GitHubConfig>(() => getGitHubConfig());
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const [copiedCli, setCopiedCli] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setStatusMessage({ type: 'info', text: '正在验证 GitHub 仓库与 Token 权限...' });
    const res = await testGitHubRepo(config.token, config.owner, config.repo);
    setIsTesting(false);
    if (res.success) {
      setStatusMessage({ type: 'success', text: res.message });
      saveGitHubConfig(config);
      onConfigUpdated(config);
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setStatusMessage({ type: 'info', text: '正在合并全量快照并推送 data/recipes.json 到 GitHub...' });
    const res = await syncRecipesToGitHub(config, recipes);
    setIsSyncing(false);
    if (res.success) {
      const updatedConfig = {
        ...config,
        lastSyncedAt: new Date().toLocaleString('zh-CN'),
        lastCommitSha: res.commitSha,
      };
      setConfig(updatedConfig);
      saveGitHubConfig(updatedConfig);
      onConfigUpdated(updatedConfig);
      setStatusMessage({ type: 'success', text: res.message });
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  const handleToggleAutoSync = (checked: boolean) => {
    const updated = { ...config, autoSync: checked };
    setConfig(updated);
    saveGitHubConfig(updated);
    onConfigUpdated(updated);
  };

  const gitCliCommand = `git remote add origin https://github.com/${config.owner || 'YOUR_USERNAME'}/${config.repo || 'food-journal'}.git\ngit branch -M main\ngit push -u origin main`;

  const copyGitCli = () => {
    navigator.clipboard.writeText(gitCliCommand);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="GitHub 手帐数据备份配置"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-[#FAF7F2] rounded-2xl border border-[#EADBCE] shadow-2xl max-w-xl w-full overflow-hidden relative my-6">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:px-6 border-b border-[#EADBCE] bg-white">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-[#2C2723]" />
            <h2 className="text-base font-bold font-journal-title text-[#2C2723]">
              GitHub 仓库手帐 JSON 快照同步
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#9A9085] hover:text-[#2C2723] rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs">
          {/* Status Message Banner */}
          {statusMessage && (
            <div
              className={`p-3 rounded-lg border flex items-start gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span className="flex-1">{statusMessage.text}</span>
            </div>
          )}

          {/* Configuration Inputs */}
          <div className="bg-white p-4 rounded-xl border border-[#EADBCE] space-y-3.5 shadow-2xs">
            <h3 className="font-bold text-[#2C2723] text-sm flex items-center gap-1.5">
              <Key className="w-4 h-4 text-[#C85A32]" />
              <span>数据备份仓库配置 (`data/recipes.json`)</span>
            </h3>

            {/* Owner & Repo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#7A7268] mb-1 font-semibold">
                  GitHub 用户名 / 组织名
                </label>
                <input
                  type="text"
                  placeholder="例如: yoyoalexruby"
                  value={config.owner}
                  onChange={(e) => setConfig({ ...config, owner: e.target.value.trim() })}
                  className="w-full px-2.5 py-1.5 border border-[#EADBCE] rounded-md focus:outline-hidden focus:border-[#C85A32]"
                />
              </div>

              <div>
                <label className="block text-[#7A7268] mb-1 font-semibold">
                  备份仓库名称 (Repository)
                </label>
                <input
                  type="text"
                  placeholder="例如: food-journal-backup"
                  value={config.repo}
                  onChange={(e) => setConfig({ ...config, repo: e.target.value.trim() })}
                  className="w-full px-2.5 py-1.5 border border-[#EADBCE] rounded-md focus:outline-hidden focus:border-[#C85A32]"
                />
              </div>
            </div>

            {/* Branch & Token */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[#7A7268] mb-1 font-semibold">
                  同步分支 (Branch)
                </label>
                <input
                  type="text"
                  placeholder="main"
                  value={config.branch}
                  onChange={(e) =>
                    setConfig({ ...config, branch: e.target.value.trim() || 'main' })
                  }
                  className="w-full px-2.5 py-1.5 font-mono border border-[#EADBCE] rounded-md focus:outline-hidden focus:border-[#C85A32]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[#7A7268] mb-1 font-semibold flex items-center justify-between">
                  <span>Fine-grained PAT (仅需 Contents: Write)</span>
                  <a
                    href="https://github.com/settings/personal-access-tokens/new"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#C85A32] hover:underline flex items-center gap-0.5 font-normal"
                  >
                    <span>创建细粒度令牌</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </label>
                <input
                  type="password"
                  placeholder="github_pat_xxxxxxxxxxxx"
                  value={config.token}
                  onChange={(e) => setConfig({ ...config, token: e.target.value.trim() })}
                  className="w-full px-2.5 py-1.5 font-mono border border-[#EADBCE] rounded-md focus:outline-hidden focus:border-[#C85A32]"
                />
              </div>
            </div>

            {/* Test Connection Button */}
            <div className="pt-1 flex items-center justify-between gap-2">
              <span className="text-[11px] text-[#9A9085]">
                建议使用单仓库细粒度 Token（仅勾选 Repository permissions → Contents: Read and write）。
              </span>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !config.token}
                className="px-3 py-1.5 bg-[#FAF7F2] border border-[#EADBCE] hover:border-[#2C2723] rounded-md text-[#2C2723] font-medium transition-colors shrink-0 disabled:opacity-50"
              >
                {isTesting ? '正在验证...' : '测试连接'}
              </button>
            </div>
          </div>

          {/* Auto-sync & Manual Action */}
          <div className="bg-white p-4 rounded-xl border border-[#EADBCE] space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-[#2C2723] text-sm">防抖自动备份 (3秒静默合并)</h4>
                <p className="text-[#7A7268] text-[11px] mt-0.5">
                  开启后，新增或修改菜谱将在 3 秒防抖后合并完整快照推送到 `data/recipes.json`，并支持 409 冲突自动重试。
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.autoSync}
                  onChange={(e) => handleToggleAutoSync(e.target.checked)}
                  className="sr-only peer"
                  disabled={!config.token}
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C85A32]"></div>
              </label>
            </div>

            {/* Manual Sync Trigger */}
            <div className="pt-2 border-t border-[#F0E6DC] flex items-center justify-between">
              <div>
                {config.lastSyncedAt && (
                  <span className="text-[11px] text-[#5F7A4D] block">
                    ✓ 上次同步：{config.lastSyncedAt} ({config.lastCommitSha})
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleSyncNow}
                disabled={isSyncing || !config.token}
                className="px-4 py-2 bg-[#2C2723] hover:bg-[#1A1815] text-white rounded-lg font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? '正在同步...' : '立即推送全量手帐 JSON 快照'}</span>
              </button>
            </div>
          </div>

          {/* Terminal CLI instructions for full git repo */}
          <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#EADBCE] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#5A5248] flex items-center gap-1 text-[11px]">
                <Terminal className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>工程源码请使用 Git 命令行从当前仓库分支拉取或推送</span>
              </span>
              <button
                type="button"
                onClick={copyGitCli}
                className="text-[11px] text-[#C85A32] hover:underline flex items-center gap-1"
              >
                {copiedCli ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>{copiedCli ? '已复制命令' : '复制代码'}</span>
              </button>
            </div>
            <pre className="bg-[#24201D] text-[#EADBCE] p-2.5 rounded font-mono text-[11px] overflow-x-auto leading-relaxed">
              {gitCliCommand}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#EADBCE] bg-white flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-[#5F7A4D]">
            <ShieldCheck className="w-4 h-4" />
            <span>直接与 GitHub REST API 通信 · 自动剔除超大内嵌视频防止提交超限</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#2C2723] bg-[#FAF7F2] border border-[#EADBCE] hover:bg-[#F0E6DC] rounded-lg transition-colors"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
