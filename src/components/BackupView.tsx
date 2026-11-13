import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Recipe } from '../types/recipe';
import { UserProfile } from '../types/auth';
import { exportRecipesBackup } from '../utils/storage';
import {
  getUserRecipes,
  importRecipesToMasterStorage,
  resetToInitialPresets,
} from '../utils/multiUserStorage';
import { estimateTotalStorageUsage, StorageHealthMetrics } from '../utils/mediaStorage';
import { getGitHubConfig } from '../utils/githubSync';
import {
  Download,
  Upload,
  RotateCcw,
  Database,
  ShieldCheck,
  GitBranch,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Film,
} from 'lucide-react';

interface BackupViewProps {
  recipes: Recipe[];
  currentUser?: UserProfile | null;
  onReloadRecipes: (recipes: Recipe[]) => void;
  onOpenGitHub?: () => void;
  onOpenInstall?: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const BackupView: React.FC<BackupViewProps> = ({
  recipes,
  currentUser = null,
  onReloadRecipes,
  onOpenGitHub,
  onOpenInstall,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const gitHubConfig = getGitHubConfig();

  const [banner, setBanner] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [storageMetrics, setStorageMetrics] = useState<StorageHealthMetrics | null>(null);

  const refreshStorageMetrics = useCallback(() => {
    estimateTotalStorageUsage()
      .then(setStorageMetrics)
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshStorageMetrics();
  }, [recipes, refreshStorageMetrics]);

  const showBanner = (type: 'success' | 'error' | 'info', text: string) => {
    setBanner({ type, text });
  };

  const handleExport = () => {
    exportRecipesBackup(recipes);
    showBanner(
      'success',
      `已导出当前手帐共 ${recipes.length} 篇食谱的标准备份文件 (Schema v2.0)。`
    );
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const result = importRecipesToMasterStorage(parsed, currentUser);
        const updatedUserRecipes = getUserRecipes(currentUser);
        onReloadRecipes(updatedUserRecipes);
        refreshStorageMetrics();

        if (!result.persisted) {
          showBanner(
            'error',
            '导入数据过大，超出浏览器 localStorage 容量上限，请精简内嵌大图后重试。'
          );
        } else if (result.importedCount === 0 && result.updatedCount === 0) {
          showBanner(
            'error',
            `未能导入有效菜谱（跳过 ${result.skippedCount} 条不符合食谱结构的数据）。`
          );
        } else {
          showBanner(
            'success',
            `导入完成：新增 ${result.importedCount} 道、合并更新 ${result.updatedCount} 道食谱${
              result.skippedCount > 0 ? `（跳过无效项 ${result.skippedCount} 条）` : ''
            }，刷新页面后依然持久保留！`
          );
        }
      } catch (err) {
        showBanner(
          'error',
          err instanceof Error
            ? err.message
            : '解析 JSON 备份文件失败，请确认文件完整有效。'
        );
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmReset = () => {
    const restored = resetToInitialPresets(currentUser);
    onReloadRecipes(restored);
    setConfirmingReset(false);
    refreshStorageMetrics();
    showBanner(
      'success',
      '已恢复初始经典食谱与官方广场精选示例，您自建的私房菜谱同样得以安全保留！'
    );
  };

  const lsPercent = storageMetrics
    ? Math.min(100, Math.round((storageMetrics.localStorageBytes / storageMetrics.localStorageLimitBytes) * 100))
    : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-[#EADBCE]">
        <h1 className="text-2xl sm:text-3xl font-bold font-journal-title text-[#2C2723] flex items-center gap-2">
          <Database className="w-6 h-6 text-[#C85A32]" />
          <span>手帐数据安全、存储监测与备份迁移</span>
        </h1>
        <p className="text-xs text-[#7A7268] mt-1">
          食谱文本采用本地多用户视图存储，高清烹饪视频自动分流至大容量 IndexedDB 媒体库。您可以随时导出 v2.0 标准 JSON 备份或同步至 GitHub 数据仓库。
        </p>
      </div>

      {/* Inline Feedback Banner (Replaces window.alert) */}
      {banner && (
        <div
          role="status"
          className={`p-3.5 rounded-xl border text-xs flex items-start justify-between gap-3 animate-fade-in ${
            banner.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : banner.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-start gap-2">
            {banner.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <span className="leading-relaxed">{banner.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setBanner(null)}
            className="text-[#7A7268] hover:text-[#2C2723] font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Banner: App Installation & GitHub Data Sync */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* PWA App Banner */}
        <div className="bg-white border border-[#EADBCE] rounded-xl p-5 paper-shadow flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-[#EADBCE] text-[#C85A32] flex items-center justify-center shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="font-bold text-sm text-[#2C2723] font-journal-title">
              安装为手机/桌面独立 App
            </h3>
            <p className="text-xs text-[#7A7268] leading-relaxed">
              支持添加到 iOS / Android 主屏幕，离线断网亦可全屏翻阅。
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onOpenInstall}
                className="px-3 py-1.5 bg-[#C85A32] hover:bg-[#B34C26] text-white rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <span>📲 查看安装步骤</span>
              </button>
            </div>
          </div>
        </div>

        {/* GitHub JSON Snapshot Sync Banner */}
        <div className="bg-white border border-[#EADBCE] rounded-xl p-5 paper-shadow flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#2C2723] text-white flex items-center justify-center shrink-0">
            <GitBranch className="w-6 h-6" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-[#2C2723] font-journal-title">
                GitHub 仓库 JSON 快照同步
              </h3>
              {gitHubConfig.token && (
                <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>已配置</span>
                </span>
              )}
            </div>
            <p className="text-xs text-[#7A7268] leading-relaxed">
              防抖合并推送完整手帐数据快照 (`data/recipes.json`) 至您的私有 GitHub 仓库，自动保留广场与其他本机档案数据。
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onOpenGitHub}
                className="px-3 py-1.5 bg-[#2C2723] hover:bg-[#1A1815] text-white rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <span>🐙 配置 GitHub 数据备份</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Storage Health & IndexedDB Media Meter */}
        <div className="bg-white border border-[#EADBCE] rounded-xl p-5 paper-shadow flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-[#FAF7F2] border border-[#EADBCE] text-[#C85A32] flex items-center justify-center mb-3">
              <HardDrive className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#2C2723] font-journal-title mb-1.5">
              本机存储健康度监测
            </h3>
            <p className="text-xs text-[#7A7268] leading-relaxed mb-3">
              食谱文本与实拍缩略图存于 localStorage，高清视频独立存于 IndexedDB 大容量库。
            </p>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-[#F0E6DC] text-[11px]">
            <div>
              <div className="flex items-center justify-between text-[#5A5248] mb-1">
                <span>菜谱库占用</span>
                <span className="font-mono font-semibold">
                  {storageMetrics ? formatBytes(storageMetrics.localStorageBytes) : '...'} / 5 MB
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#FAF7F2] rounded-full overflow-hidden border border-[#EADBCE]">
                <div
                  className={`h-full transition-all ${
                    lsPercent > 80 ? 'bg-rose-500' : lsPercent > 50 ? 'bg-amber-500' : 'bg-[#5F7A4D]'
                  }`}
                  style={{ width: `${Math.max(3, lsPercent)}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[#5A5248] pt-0.5">
              <span className="flex items-center gap-1">
                <Film className="w-3 h-3 text-[#5F7A4D]" />
                <span>IndexedDB 视频库</span>
              </span>
              <span className="font-mono font-semibold text-[#2C2723]">
                {storageMetrics
                  ? `${formatBytes(storageMetrics.indexedDBBytes)} (${storageMetrics.indexedDBItemCount}段)`
                  : '0 B'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Export JSON Card */}
        <div className="bg-white border border-[#EADBCE] rounded-xl p-5 paper-shadow flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-[#FAF7F2] border border-[#EADBCE] text-[#C08A3E] flex items-center justify-center mb-3">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#2C2723] font-journal-title mb-1.5">
              导出菜谱数据备份
            </h3>
            <p className="text-xs text-[#7A7268] leading-relaxed mb-4">
              将当前账号手帐中的所有食谱、步骤、实拍配图及心得打包导出为带版本号的 v2.0 JSON 文件。
            </p>
          </div>
          <button
            type="button"
            onClick={handleExport}
            className="w-full py-2 px-3 bg-[#FAF7F2] border border-[#EADBCE] hover:bg-[#F0E6DC] text-[#2C2723] rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>下载菜谱 JSON ({recipes.length}篇)</span>
          </button>
        </div>

        {/* Card 3: Import Card */}
        <div className="bg-white border border-[#EADBCE] rounded-xl p-5 paper-shadow flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-[#FAF7F2] border border-[#EADBCE] text-[#5F7A4D] flex items-center justify-center mb-3">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#2C2723] font-journal-title mb-1.5">
              导入与合并已有手帐
            </h3>
            <p className="text-xs text-[#7A7268] leading-relaxed mb-4">
              支持导入 v1 数组格式或 v2 标准备份文件，自动校验结构并按食谱 ID 智能无损合并至主数据库。
            </p>
          </div>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 px-3 bg-white border border-[#EADBCE] hover:bg-[#FAF7F2] text-[#2C2723] rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <Upload className="w-4 h-4 text-[#5F7A4D]" />
              <span>选择 JSON 文件导入</span>
            </button>
          </div>
        </div>

        {/* Card 4: Reset Presets (Inline Confirmation without window.confirm) */}
        <div className="bg-white border border-[#EADBCE] rounded-xl p-5 paper-shadow flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-[#FAF7F2] border border-[#EADBCE] text-[#C08A3E] flex items-center justify-center mb-3">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#2C2723] font-journal-title mb-1.5">
              恢复初始手帐示例
            </h3>
            <p className="text-xs text-[#7A7268] leading-relaxed mb-4">
              重新补齐曾被您删除的初始示例食谱（红烧肉、抹茶戚风、黑虎虾宽意面等），不覆盖您自建的菜谱。
            </p>
          </div>

          {!confirmingReset ? (
            <button
              type="button"
              onClick={() => setConfirmingReset(true)}
              className="w-full py-2 px-3 bg-[#FAF7F2] border border-[#EADBCE] hover:bg-[#F0E6DC] text-[#7A7268] hover:text-[#2C2723] rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>恢复初始示例</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleConfirmReset}
                className="flex-1 py-2 px-2 bg-[#C85A32] hover:bg-[#B34C26] text-white rounded-lg text-xs font-semibold transition-colors"
              >
                确认恢复
              </button>
              <button
                type="button"
                onClick={() => setConfirmingReset(false)}
                className="py-2 px-2.5 bg-[#FAF7F2] border border-[#EADBCE] text-[#7A7268] rounded-lg text-xs font-medium"
              >
                取消
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Safety & Storage Status Strip */}
      <div className="bg-[#FAF7F2] border border-[#EADBCE] rounded-xl p-4 flex items-center gap-3 text-xs text-[#7A7268]">
        <ShieldCheck className="w-5 h-5 text-[#5F7A4D] shrink-0" />
        <p>
          离线 Service Worker 与双层存储引擎已启用：即使厨房没有网络信号也能流畅查阅食谱、播放本地 IndexedDB 烹饪实拍视频。
        </p>
      </div>
    </div>
  );
};
