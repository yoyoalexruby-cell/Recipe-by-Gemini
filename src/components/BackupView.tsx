import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Recipe } from '../types/recipe';
import { UserProfile } from '../types/auth';
import {
  MASTER_RECIPES_KEY,
  getUserRecipes,
  resetToInitialPresets,
} from '../utils/multiUserStorage';
import {
  CURRENT_BACKUP_VERSION,
  MAX_IMPORT_FILE_BYTES,
  MAX_INLINE_MEDIA_BACKUP_BYTES,
  downloadFullBackupJson,
  estimateBackupMediaSize,
  restoreFullBackupBundle,
} from '../utils/fullBackupService';
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
  Loader2,
} from 'lucide-react';

/**
 * 统一主存储 Key ('food_journal_master_recipes_v2') 与全量备份版本号 ('1.2.0')
 */
const BACKUP_STORAGE_KEY: typeof MASTER_RECIPES_KEY = 'food_journal_master_recipes_v2';

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
  const gitHubConfig = getGitHubConfig(currentUser);

  const [banner, setBanner] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [storageMetrics, setStorageMetrics] = useState<StorageHealthMetrics | null>(null);
  const [mediaEstimate, setMediaEstimate] = useState<{
    mediaCount: number;
    rawBytes: number;
    estimatedJsonBytes: number;
    exceedsSafeLimit: boolean;
  } | null>(null);
  const [includeMediaBlobs, setIncludeMediaBlobs] = useState(false);
  const [remapToCurrentAccount, setRemapToCurrentAccount] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const refreshStorageMetrics = useCallback(() => {
    estimateTotalStorageUsage()
      .then(setStorageMetrics)
      .catch(() => {});
    estimateBackupMediaSize(currentUser)
      .then(setMediaEstimate)
      .catch(() => {});
  }, [currentUser]);

  useEffect(() => {
    refreshStorageMetrics();
  }, [recipes, refreshStorageMetrics]);

  const showBanner = (type: 'success' | 'error' | 'info', text: string) => {
    setBanner({ type, text });
  };

  /**
   * 导出全量手帐状态包（含食谱、烹饪日历打卡、自定义分类、采购清单、广场收藏、大赛作品、成长成就及可选离线视频包）
   */
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { recipeCount, mediaCount, cookingLogCount } = await downloadFullBackupJson(
        currentUser,
        { includeMediaBlobs }
      );
      showBanner(
        'success',
        `全量备份已生成 (version: ${CURRENT_BACKUP_VERSION}, key: ${BACKUP_STORAGE_KEY})：含 ${recipeCount} 篇食谱、${cookingLogCount} 条烹饪日历记录、自定义分类、采购偏好、收藏夹${
          includeMediaBlobs ? `及 ${mediaCount} 段离线视频媒体` : '（未包含离线视频二进制）'
        }。`
      );
    } catch (err) {
      showBanner(
        'error',
        err instanceof Error ? err.message : '生成全量备份文件失败，请稍后重试。'
      );
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * 导入全量或旧版备份：执行 Schema 校验、恢复离线视频至 IndexedDB、并将跨设备旧账号 ownerId 自动映射至当前账号
   */
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMPORT_FILE_BYTES) {
      showBanner(
        'error',
        `备份文件体积过大（${formatBytes(file.size)}），超过 ${formatBytes(MAX_IMPORT_FILE_BYTES)} 导入上限，为防止浏览器内存溢出已拦截读取。`
      );
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsedJson = JSON.parse(event.target?.result as string);
        const res = await restoreFullBackupBundle(parsedJson, currentUser, {
          remapToCurrentAccount,
        });

        const refreshedUserRecipes = getUserRecipes(currentUser);
        onReloadRecipes(refreshedUserRecipes);
        refreshStorageMetrics();

        if (!res.persisted) {
          showBanner(
            'error',
            `写入主存储 (${BACKUP_STORAGE_KEY}) 失败：超出浏览器 localStorage 容量上限，请清理超大图文后重试。`
          );
        } else if (res.domainStatus.failedDomains.length > 0) {
          showBanner(
            'info',
            `部分数据恢复成功（新增 ${res.addedRecipes} 道、更新 ${res.updatedRecipes} 道食谱），但以下数据域因容量或格式受限未完全写入：${res.domainStatus.failedDomains.join('、')}。`
          );
        } else if (res.addedRecipes === 0 && res.updatedRecipes === 0) {
          showBanner(
            'error',
            `Schema v${res.detectedVersion} 校验完成，但未找到可导入的有效食谱（跳过无效项 ${res.skippedRecipes} 条）。`
          );
        } else {
          const extras: string[] = [];
          if (res.remappedOwnerCount > 0) {
            extras.push(`跨设备归属重映射 ${res.remappedOwnerCount} 道至当前账号`);
          }
          if (res.restoredLogs > 0) {
            extras.push(`恢复日历打卡 ${res.restoredLogs} 条`);
          }
          if (res.restoredMediaCount > 0) {
            extras.push(`还原离线视频 ${res.restoredMediaCount} 段`);
          }
          if (res.skippedRecipes > 0) {
            extras.push(`拦截异常记录 ${res.skippedRecipes} 条`);
          }
          showBanner(
            'success',
            `Schema v${res.detectedVersion} 全量还原成功：新增 ${res.addedRecipes} 道、合并更新 ${res.updatedRecipes} 道食谱${
              extras.length > 0 ? `（${extras.join(' · ')}）` : ''
            }。`
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
        setIsImporting(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.onerror = () => {
      setIsImporting(false);
      showBanner('error', '读取本地备份文件失败。');
    };
    reader.readAsText(file);
  };

  /**
   * 恢复初始示例：直接重置回填至主存储 'food_journal_master_recipes_v2'
   */
  const handleConfirmReset = () => {
    const restored = resetToInitialPresets(currentUser);
    onReloadRecipes(restored);
    setConfirmingReset(false);
    refreshStorageMetrics();
    showBanner(
      'success',
      `已将初始示例食谱恢复至主存储 (${BACKUP_STORAGE_KEY})，您自建的私房食谱已无损保留！`
    );
  };

  const lsPercent = storageMetrics
    ? Math.min(
        100,
        Math.round(
          (storageMetrics.localStorageBytes / storageMetrics.localStorageLimitBytes) * 100
        )
      )
    : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-[#EADBCE]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold font-journal-title text-[#2C2723] flex items-center gap-2">
            <Database className="w-6 h-6 text-[#C85A32]" />
            <span>全量手帐数据备份、跨设备迁移与恢复</span>
          </h1>
          <span className="text-[11px] font-mono text-[#7A7268] bg-[#FAF7F2] border border-[#EADBCE] px-2.5 py-1 rounded-md">
            Master Key: {BACKUP_STORAGE_KEY} · Schema v{CURRENT_BACKUP_VERSION}
          </span>
        </div>
        <p className="text-xs text-[#7A7268] mt-1.5">
          全量覆盖食谱主库（<code className="font-mono text-[#5A5248]">{BACKUP_STORAGE_KEY}</code>）、烹饪日历打卡、自定义分类、生鲜采购清单、广场收藏、厨神大赛作品、成长等级及 IndexedDB 离线视频包；跨设备导入自动重映射账号归属。
        </p>
      </div>

      {/* Inline Feedback Banner */}
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
        <div className="bg-white border border-[#EADBCE] rounded-xl p-5 paper-shadow flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-[#EADBCE] text-[#C85A32] flex items-center justify-center shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="font-bold text-sm text-[#2C2723] font-journal-title">
              安装为手机/桌面独立 App
            </h3>
            <p className="text-xs text-[#7A7268] leading-relaxed">
              支持添加到 iOS / Android 主屏幕，内置图文离线缓存，断网亦可全屏翻阅。
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
              主菜谱与个人偏好存于 localStorage，实拍高清视频独立存于 IndexedDB 大容量库。
            </p>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-[#F0E6DC] text-[11px]">
            <div>
              <div className="flex items-center justify-between text-[#5A5248] mb-1">
                <span>主库占用</span>
                <span className="font-mono font-semibold">
                  {storageMetrics ? formatBytes(storageMetrics.localStorageBytes) : '...'} / 5 MB
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#FAF7F2] rounded-full overflow-hidden border border-[#EADBCE]">
                <div
                  className={`h-full transition-all ${
                    lsPercent > 80
                      ? 'bg-rose-500'
                      : lsPercent > 50
                      ? 'bg-amber-500'
                      : 'bg-[#5F7A4D]'
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

        {/* Card 2: Export Full Bundle Card */}
        <div className="bg-white border border-[#EADBCE] rounded-xl p-5 paper-shadow flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-[#FAF7F2] border border-[#EADBCE] text-[#C08A3E] flex items-center justify-center mb-3">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#2C2723] font-journal-title mb-1.5">
              导出 v{CURRENT_BACKUP_VERSION} 全量备份包
            </h3>
            <p className="text-xs text-[#7A7268] leading-relaxed mb-3">
              打包食谱、烹饪日历、分类、采购偏好、收藏、成就及可选离线视频包。
            </p>
            <label className="flex items-start gap-2 text-[11px] text-[#5A5248] mb-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeMediaBlobs}
                disabled={Boolean(mediaEstimate?.exceedsSafeLimit)}
                onChange={(e) => setIncludeMediaBlobs(e.target.checked)}
                className="mt-0.5 accent-[#C85A32] rounded"
              />
              <span>
                附带内嵌离线视频包
                {mediaEstimate && mediaEstimate.mediaCount > 0
                  ? `（${mediaEstimate.mediaCount} 段，预计约 ${formatBytes(mediaEstimate.estimatedJsonBytes)}）`
                  : '（当前无离线视频）'}
              </span>
            </label>
            {mediaEstimate?.exceedsSafeLimit && (
              <p className="text-[10px] text-amber-700 mb-3 leading-snug">
                当前视频超过 {formatBytes(MAX_INLINE_MEDIA_BACKUP_BYTES)} 内嵌安全上限，已自动切换为轻量化文本备份以保护移动端内存。
              </p>
            )}
          </div>
          <button
            type="button"
            disabled={isExporting}
            onClick={handleExport}
            className="w-full py-2 px-3 bg-[#FAF7F2] border border-[#EADBCE] hover:bg-[#F0E6DC] disabled:opacity-60 text-[#2C2723] rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{isExporting ? '正在打包全量数据...' : `导出全量 JSON (${recipes.length}篇)`}</span>
          </button>
        </div>

        {/* Card 3: Import & Cross-Device Account Remap Card */}
        <div className="bg-white border border-[#EADBCE] rounded-xl p-5 paper-shadow flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-[#FAF7F2] border border-[#EADBCE] text-[#5F7A4D] flex items-center justify-center mb-3">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#2C2723] font-journal-title mb-1.5">
              跨设备校验并还原手帐
            </h3>
            <p className="text-xs text-[#7A7268] leading-relaxed mb-3">
              自动校验版本号与字段结构，恢复全部个人记录及视频库。
            </p>
            <label className="flex items-start gap-2 text-[11px] text-[#5A5248] mb-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remapToCurrentAccount}
                onChange={(e) => setRemapToCurrentAccount(e.target.checked)}
                className="mt-0.5 accent-[#5F7A4D] rounded"
              />
              <span>归属到当前账号（解决换新设备登录后看不见旧食谱）</span>
            </label>
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
              disabled={isImporting}
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 px-3 bg-white border border-[#EADBCE] hover:bg-[#FAF7F2] disabled:opacity-60 text-[#2C2723] rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              {isImporting ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#5F7A4D]" />
              ) : (
                <Upload className="w-4 h-4 text-[#5F7A4D]" />
              )}
              <span>{isImporting ? '正在还原数据...' : '选择 JSON 文件导入'}</span>
            </button>
          </div>
        </div>

        {/* Card 4: Reset Presets */}
        <div className="bg-white border border-[#EADBCE] rounded-xl p-5 paper-shadow flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-[#FAF7F2] border border-[#EADBCE] text-[#C08A3E] flex items-center justify-center mb-3">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#2C2723] font-journal-title mb-1.5">
              恢复初始手帐示例
            </h3>
            <p className="text-xs text-[#7A7268] leading-relaxed mb-4">
              将曾删除的初始示例食谱（红烧肉、抹茶戚风、黑虎虾宽意面等）补齐写回主存储库，不覆盖自建食谱。
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
          主存储库统一锁定至 <code className="font-mono text-[#5A5248]">{BACKUP_STORAGE_KEY}</code>；开启「归属到当前账号」后，从旧手机或旧浏览器导出的备份在新账号下导入即可 100% 立即显示。
        </p>
      </div>
    </div>
  );
};
