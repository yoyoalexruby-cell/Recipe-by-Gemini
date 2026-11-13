import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Recipe } from '../types/recipe';
import { UserProfile } from '../types/auth';
import {
  MASTER_RECIPES_KEY,
  getAllMasterRecipes,
  getUserRecipes,
  saveAllMasterRecipes,
  resetToInitialPresets,
} from '../utils/multiUserStorage';
import { estimateTotalStorageUsage, StorageHealthMetrics } from '../utils/mediaStorage';
import { getGitHubConfig } from '../utils/githubSync';
import { formatLocalDate } from '../utils/dateUtils';
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

/**
 * 统一主存储 Key ('food_journal_master_recipes_v2') 与备份文件版本号 ('1.2.0') 定义
 */
const BACKUP_STORAGE_KEY: typeof MASTER_RECIPES_KEY = 'food_journal_master_recipes_v2';
const CURRENT_BACKUP_VERSION = '1.2.0';
const MAX_SUPPORTED_MAJOR = 2;
const SUPPORTED_VERSIONS = new Set(['1', '1.0', '1.1.0', '1.2', '1.2.0', '2', '2.0']);

export interface VersionedRecipeBackup {
  version: '1.2.0' | string;
  storageKey: typeof BACKUP_STORAGE_KEY;
  app: 'culinary-journal';
  exportedAt: string;
  scope: 'current-user' | 'master-all';
  accountUid: string;
  totalRecipes: number;
  recipes: Recipe[];
}

interface SchemaValidationResult {
  validRecipes: Recipe[];
  skippedCount: number;
  detectedVersion: string;
}

/**
 * 严格校验单条菜谱结构是否合法
 */
function validateSingleRecipeSchema(item: unknown): item is Recipe {
  if (!item || typeof item !== 'object') return false;
  const r = item as Record<string, unknown>;

  if (typeof r.id !== 'string' || r.id.trim().length === 0) return false;
  if (typeof r.title !== 'string' || r.title.trim().length === 0) return false;
  if (!Array.isArray(r.ingredients) || !Array.isArray(r.steps)) return false;

  const ingredientsValid = r.ingredients.every(
    (ing) =>
      Boolean(ing) &&
      typeof ing === 'object' &&
      typeof (ing as Record<string, unknown>).name === 'string'
  );
  const stepsValid = r.steps.every(
    (st) =>
      Boolean(st) &&
      typeof st === 'object' &&
      (typeof (st as Record<string, unknown>).title === 'string' ||
        typeof (st as Record<string, unknown>).description === 'string')
  );

  return ingredientsValid && stepsValid;
}

/**
 * 校验备份 JSON 的版本号字段与食谱数组 Schema
 */
function parseAndValidateBackupPayload(rawJson: unknown): SchemaValidationResult {
  // 兼容旧版 v1 纯数组备份
  if (Array.isArray(rawJson)) {
    const validRecipes: Recipe[] = [];
    let skippedCount = 0;
    for (const entry of rawJson) {
      if (validateSingleRecipeSchema(entry)) {
        validRecipes.push(entry);
      } else {
        skippedCount++;
      }
    }
    return {
      validRecipes,
      skippedCount,
      detectedVersion: '1.0 (legacy-array)',
    };
  }

  if (!rawJson || typeof rawJson !== 'object') {
    throw new Error('备份文件格式错误：根节点必须是包含 version 与 recipes 字段的 JSON 对象或食谱数组。');
  }

  const envelope = rawJson as Record<string, unknown>;
  const rawVersion =
    envelope.version !== undefined
      ? String(envelope.version)
      : envelope.schemaVersion !== undefined
      ? String(envelope.schemaVersion)
      : '';

  if (!rawVersion) {
    throw new Error('备份文件缺少 version 版本号字段，无法通过 Schema 校验。');
  }

  const majorNum = parseInt(rawVersion.split('.')[0] || '0', 10);
  if (
    Number.isNaN(majorNum) ||
    majorNum > MAX_SUPPORTED_MAJOR ||
    (!SUPPORTED_VERSIONS.has(rawVersion) && majorNum < 1)
  ) {
    throw new Error(
      `不支持的备份版本号 (version: ${rawVersion})，当前应用支持的版本为 1.0 – ${CURRENT_BACKUP_VERSION}。`
    );
  }

  const listCandidate = Array.isArray(envelope.recipes)
    ? envelope.recipes
    : Array.isArray(envelope.masterRecipes)
    ? envelope.masterRecipes
    : null;

  if (!listCandidate) {
    throw new Error('备份文件缺少有效的 recipes 食谱列表数组。');
  }

  const validRecipes: Recipe[] = [];
  let skippedCount = 0;
  for (const entry of listCandidate) {
    if (validateSingleRecipeSchema(entry)) {
      validRecipes.push(entry);
    } else {
      skippedCount++;
    }
  }

  return {
    validRecipes,
    skippedCount,
    detectedVersion: rawVersion,
  };
}

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

  /**
   * 导出带 'version': '1.2.0' 与 storageKey 元信息的标准备份 JSON
   */
  const handleExport = () => {
    const backupPayload: VersionedRecipeBackup = {
      version: CURRENT_BACKUP_VERSION,
      storageKey: BACKUP_STORAGE_KEY,
      app: 'culinary-journal',
      exportedAt: new Date().toISOString(),
      scope: 'current-user',
      accountUid: currentUser?.uid || 'guest',
      totalRecipes: recipes.length,
      recipes,
    };

    const jsonStr = JSON.stringify(backupPayload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `食味手记_食谱备份_v${CURRENT_BACKUP_VERSION}_${formatLocalDate()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showBanner(
      'success',
      `已生成并下载备份文件 (version: ${CURRENT_BACKUP_VERSION}, key: ${BACKUP_STORAGE_KEY}，共 ${recipes.length} 篇食谱)。`
    );
  };

  /**
   * 导入备份文件：执行版本号与字段 Schema 校验后，按 ID 合并写入统一主存储 'food_journal_master_recipes_v2'
   */
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsedJson = JSON.parse(event.target?.result as string);
        const { validRecipes, skippedCount, detectedVersion } =
          parseAndValidateBackupPayload(parsedJson);

        if (validRecipes.length === 0) {
          showBanner(
            'error',
            `Schema 校验未通过：备份文件 (v${detectedVersion}) 中没有符合规范的有效食谱（共跳过 ${skippedCount} 条异常记录）。`
          );
          return;
        }

        // 读取主存储 'food_journal_master_recipes_v2' 并按 ID 合并
        const currentMaster = getAllMasterRecipes();
        const masterMap = new Map<string, Recipe>(currentMaster.map((r) => [r.id, r]));
        const targetOwnerId = currentUser ? currentUser.uid : 'guest';
        const targetAuthorName = currentUser ? currentUser.displayName : '本机主厨';
        const today = formatLocalDate();

        let addedCount = 0;
        let updatedCount = 0;

        for (const item of validRecipes) {
          const normalized: Recipe = {
            ...item,
            category: item.category || '家常中餐',
            ownerId:
              currentUser && (!item.ownerId || item.ownerId === 'guest')
                ? currentUser.uid
                : item.ownerId || targetOwnerId,
            authorName: item.authorName || targetAuthorName,
            createdAt: item.createdAt || today,
            updatedAt: item.updatedAt || today,
          };

          if (masterMap.has(normalized.id)) {
            masterMap.set(normalized.id, normalized);
            updatedCount++;
          } else {
            masterMap.set(normalized.id, normalized);
            addedCount++;
          }
        }

        const mergedMasterList = Array.from(masterMap.values());
        // 统一通过 saveAllMasterRecipes 写入 'food_journal_master_recipes_v2'
        const persisted = saveAllMasterRecipes(mergedMasterList);
        const refreshedUserRecipes = getUserRecipes(currentUser);
        onReloadRecipes(refreshedUserRecipes);
        refreshStorageMetrics();

        if (!persisted) {
          showBanner(
            'error',
            `写入主存储 (${BACKUP_STORAGE_KEY}) 失败：超出浏览器 localStorage 容量上限，请清理超大图文后重试。`
          );
        } else {
          showBanner(
            'success',
            `Schema v${detectedVersion} 校验通过并已写入主库 (${BACKUP_STORAGE_KEY})：新增 ${addedCount} 道、合并更新 ${updatedCount} 道食谱${
              skippedCount > 0 ? `（自动拦截无效数据 ${skippedCount} 条）` : ''
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
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
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
            <span>手帐数据安全、Schema 校验备份与迁移</span>
          </h1>
          <span className="text-[11px] font-mono text-[#7A7268] bg-[#FAF7F2] border border-[#EADBCE] px-2.5 py-1 rounded-md">
            Master Key: {BACKUP_STORAGE_KEY} · Schema v{CURRENT_BACKUP_VERSION}
          </span>
        </div>
        <p className="text-xs text-[#7A7268] mt-1.5">
          所有导入导出均统一读写主数据存储库（<code className="font-mono text-[#5A5248]">{BACKUP_STORAGE_KEY}</code>），支持带版本号的 JSON Schema 结构校验与按 ID 无损合并。
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
              主菜谱库与实拍缩略图存于 localStorage，高清视频独立存于 IndexedDB 大容量库。
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

        {/* Card 2: Export Versioned JSON Card */}
        <div className="bg-white border border-[#EADBCE] rounded-xl p-5 paper-shadow flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-[#FAF7F2] border border-[#EADBCE] text-[#C08A3E] flex items-center justify-center mb-3">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#2C2723] font-journal-title mb-1.5">
              导出 v{CURRENT_BACKUP_VERSION} 备份 JSON
            </h3>
            <p className="text-xs text-[#7A7268] leading-relaxed mb-4">
              将当前手帐中的所有食谱、步骤、实拍图及版本号（<code className="font-mono">version: "{CURRENT_BACKUP_VERSION}"</code>）打包导出。
            </p>
          </div>
          <button
            type="button"
            onClick={handleExport}
            className="w-full py-2 px-3 bg-[#FAF7F2] border border-[#EADBCE] hover:bg-[#F0E6DC] text-[#2C2723] rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>导出 JSON ({recipes.length}篇)</span>
          </button>
        </div>

        {/* Card 3: Import & Schema Validate Card */}
        <div className="bg-white border border-[#EADBCE] rounded-xl p-5 paper-shadow flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-[#FAF7F2] border border-[#EADBCE] text-[#5F7A4D] flex items-center justify-center mb-3">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#2C2723] font-journal-title mb-1.5">
              Schema 校验并导入手帐
            </h3>
            <p className="text-xs text-[#7A7268] leading-relaxed mb-4">
              自动校验备份版本号（<code className="font-mono">version: "{CURRENT_BACKUP_VERSION}"</code>）与食谱字段完整性，兼容旧版数组并按 ID 合并至主存储库。
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
          主存储库已统一锁定至 <code className="font-mono text-[#5A5248]">{BACKUP_STORAGE_KEY}</code>，彻底告别旧版存储键回退问题；导入时自动拦截残缺 JSON 与不兼容版本。
        </p>
      </div>
    </div>
  );
};
