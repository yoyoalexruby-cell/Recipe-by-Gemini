import React, { useRef } from 'react';
import { Recipe } from '../types/recipe';
import { exportRecipesBackup, saveStoredRecipes } from '../utils/storage';
import { getGitHubConfig } from '../utils/githubSync';
import { INITIAL_RECIPES } from '../data/initialRecipes';
import { Download, Upload, RotateCcw, Database, ShieldCheck, GitBranch, Smartphone, CheckCircle2 } from 'lucide-react';

interface BackupViewProps {
  recipes: Recipe[];
  onReloadRecipes: (recipes: Recipe[]) => void;
  onOpenGitHub?: () => void;
  onOpenInstall?: () => void;
}

export const BackupView: React.FC<BackupViewProps> = ({ 
  recipes, 
  onReloadRecipes,
  onOpenGitHub,
  onOpenInstall
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const gitHubConfig = getGitHubConfig();

  const handleExport = () => {
    exportRecipesBackup(recipes);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          saveStoredRecipes(parsed);
          onReloadRecipes(parsed);
          alert(`成功导入 ${parsed.length} 道菜谱！`);
        } else {
          alert('文件格式不正确，需为食谱数组！');
        }
      } catch {
        alert('解析 JSON 文件失败，请确认文件完整有效。');
      }
    };
    reader.readAsText(file);
  };

  const handleResetToPresets = () => {
    if (confirm('确认恢复初始经典食谱吗？（已添加的食谱将被重置）')) {
      saveStoredRecipes(INITIAL_RECIPES);
      onReloadRecipes(INITIAL_RECIPES);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-[#EADBCE]">
        <h1 className="text-2xl sm:text-3xl font-bold font-journal-title text-[#2C2723] flex items-center gap-2">
          <Database className="w-6 h-6 text-[#C85A32]" />
          <span>手帐数据、App安装与 GitHub 备份</span>
        </h1>
        <p className="text-xs text-[#7A7268] mt-1">
          手帐的所有菜谱、配图、烹饪心得与备料均安全保存在您的本地浏览器中。您可以随时导出 JSON 备份、实时同步至 GitHub，或安装为独立手机应用。
        </p>
      </div>

      {/* Top Banner: App Installation & GitHub Sync */}
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
                onClick={onOpenInstall}
                className="px-3 py-1.5 bg-[#C85A32] hover:bg-[#B34C26] text-white rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <span>📲 查看安装步骤</span>
              </button>
            </div>
          </div>
        </div>

        {/* GitHub Real-time Sync Banner */}
        <div className="bg-white border border-[#EADBCE] rounded-xl p-5 paper-shadow flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#2C2723] text-white flex items-center justify-center shrink-0">
            <GitBranch className="w-6 h-6" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-[#2C2723] font-journal-title">
                GitHub 实时代码与数据备份
              </h3>
              {gitHubConfig.token && (
                <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>已配置</span>
                </span>
              )}
            </div>
            <p className="text-xs text-[#7A7268] leading-relaxed">
              实时将新增食谱与全部前端代码自动提交并推送到您的个人 GitHub 仓库。
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenGitHub}
                className="px-3 py-1.5 bg-[#2C2723] hover:bg-[#1A1815] text-white rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <span>🐙 管理 GitHub 同步</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Source Code ZIP Download Card */}
        <div className="bg-white border border-[#EADBCE] rounded-xl p-5 paper-shadow flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-[#FAF7F2] border border-[#EADBCE] text-[#C85A32] flex items-center justify-center mb-3">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#2C2723] font-journal-title mb-1.5">
              下载完整工程源码
            </h3>
            <p className="text-xs text-[#7A7268] leading-relaxed mb-4">
              直接下载包含全部 React、TypeScript、样式与组件的 ZIP 源码压缩包到您的电脑本地。
            </p>
          </div>
          <a
            href="/food-journal-source.zip"
            download="food-journal-source.zip"
            className="w-full py-2 px-3 bg-[#C85A32] hover:bg-[#B34C26] text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 text-center shadow-2xs"
          >
            <Download className="w-4 h-4" />
            <span>下载源码 ZIP (解压即用)</span>
          </a>
        </div>

        {/* Export JSON Card */}
        <div className="bg-white border border-[#EADBCE] rounded-xl p-5 paper-shadow flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-[#FAF7F2] border border-[#EADBCE] text-[#C08A3E] flex items-center justify-center mb-3">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#2C2723] font-journal-title mb-1.5">
              导出菜谱数据备份
            </h3>
            <p className="text-xs text-[#7A7268] leading-relaxed mb-4">
              将目前手帐中的所有食谱、步骤、实拍配图及心得记录打包导出为标准 JSON 文件。
            </p>
          </div>
          <button
            onClick={handleExport}
            className="w-full py-2 px-3 bg-[#FAF7F2] border border-[#EADBCE] hover:bg-[#F0E6DC] text-[#2C2723] rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>下载菜谱 JSON ({recipes.length}篇)</span>
          </button>
        </div>

        {/* Import Card */}
        <div className="bg-white border border-[#EADBCE] rounded-xl p-6 paper-shadow flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-[#FAF7F2] border border-[#EADBCE] text-[#5F7A4D] flex items-center justify-center mb-4">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#2C2723] font-journal-title mb-2">
              导入已有手帐
            </h3>
            <p className="text-xs text-[#7A7268] leading-relaxed mb-4">
              从之前导出的 JSON 备份文件中恢复或合并菜谱，支持跨浏览器与设备迁移。
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
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 px-4 bg-white border border-[#EADBCE] hover:bg-[#FAF7F2] text-[#2C2723] rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4 text-[#5F7A4D]" />
              <span>选择 JSON 文件导入</span>
            </button>
          </div>
        </div>

        {/* Reset Presets */}
        <div className="bg-white border border-[#EADBCE] rounded-xl p-6 paper-shadow flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-[#FAF7F2] border border-[#EADBCE] text-[#C08A3E] flex items-center justify-center mb-4">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#2C2723] font-journal-title mb-2">
              恢复初始手帐示例
            </h3>
            <p className="text-xs text-[#7A7268] leading-relaxed mb-4">
              一键重置并载入包含「红烧肉、抹茶戚风、黑虎虾宽意面」的完整初始示例食谱。
            </p>
          </div>
          <button
            onClick={handleResetToPresets}
            className="w-full py-2 px-4 bg-[#FAF7F2] border border-[#EADBCE] hover:bg-[#F0E6DC] text-[#7A7268] hover:text-[#2C2723] rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>恢复初始示例</span>
          </button>
        </div>

      </div>

      {/* Safety & Storage Status Strip */}
      <div className="bg-[#FAF7F2] border border-[#EADBCE] rounded-xl p-4 flex items-center gap-3 text-xs text-[#7A7268]">
        <ShieldCheck className="w-5 h-5 text-[#5F7A4D] shrink-0" />
        <p>
          本地存储与离线 Service Worker 已启用。您的菜谱和实拍照片仅保存在您当前设备中，即便厨房没有网络信号也能无忧查阅。
        </p>
      </div>
    </div>
  );
};
