import React, { useState, useRef } from 'react';
import { Recipe, Ingredient } from '../types/recipe';
import { FoodArtFallback } from './IllustrationPresets';
import { 
  Printer, Download, X, Check, Image as ImageIcon, Sparkles, 
  Clock, Flame, ChefHat, Users, Star, Heart, AlertTriangle, 
  Tag, Calendar, Camera, BookOpen
} from 'lucide-react';
import { estimateRecipeCalories } from '../utils/nutritionCalculator';

interface RecipePDFExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe;
  servings?: number;
}

export const RecipePDFExportModal: React.FC<RecipePDFExportModalProps> = ({
  isOpen,
  onClose,
  recipe,
  servings = recipe.baseServings || 2
}) => {
  // Print options
  const [includeStepPhotos, setIncludeStepPhotos] = useState(true);
  const [includeGallery, setIncludeGallery] = useState(true);
  const [includeReview, setIncludeReview] = useState(true);
  const [includeStamps, setIncludeStamps] = useState(true);
  const [colorMode, setColorMode] = useState<'vintage' | 'minimal'>('vintage');
  const [density, setDensity] = useState<'standard' | 'compact'>('standard');
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  const printSheetRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Scale ingredient amounts based on servings
  const formatScaledAmount = (ing: Ingredient) => {
    if (typeof ing.amount === 'string') return ing.amount;
    const baseServings = recipe.baseServings || 2;
    const scaled = (Number(ing.amount) * servings) / baseServings;
    return Number.isInteger(scaled) ? scaled.toString() : scaled.toFixed(1);
  };

  const mainIngredients = recipe.ingredients.filter((i) => i.category === 'main');
  const seasoningIngredients = recipe.ingredients.filter((i) => i.category === 'seasoning');
  const garnishIngredients = recipe.ingredients.filter((i) => i.category === 'garnish');

  const perServingCalories = recipe.estimatedCalories !== undefined
    ? Math.round(recipe.estimatedCalories / (recipe.baseServings || 2))
    : estimateRecipeCalories(recipe.ingredients || [], recipe.baseServings || 2).perServingCalories;

  // Trigger print dialog
  const handlePrint = () => {
    // Add temporary class to handle ink mode
    if (colorMode === 'minimal') {
      document.body.classList.add('print-minimal-ink');
    } else {
      document.body.classList.remove('print-minimal-ink');
    }

    window.print();

    // Cleanup after print dialog
    setTimeout(() => {
      document.body.classList.remove('print-minimal-ink');
    }, 1000);
  };

  // Export as high-res PNG long image using Canvas
  const handleExportImage = async () => {
    try {
      setIsExportingImage(true);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = 900;
      // Estimate height dynamically based on content
      const stepsHeight = recipe.steps.length * (includeStepPhotos ? 140 : 80);
      const estimatedHeight = Math.max(1400, 850 + stepsHeight + (includeReview ? 320 : 0));
      
      canvas.width = width;
      canvas.height = estimatedHeight;

      // 1. Background Cream Paper
      ctx.fillStyle = colorMode === 'vintage' ? '#FAF7F2' : '#FFFFFF';
      ctx.fillRect(0, 0, width, estimatedHeight);

      // Subtle Grid Dots for vintage mode
      if (colorMode === 'vintage') {
        ctx.fillStyle = '#EBE2D5';
        for (let x = 20; x < width; x += 25) {
          for (let y = 20; y < estimatedHeight; y += 25) {
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Outer border
      ctx.strokeStyle = colorMode === 'vintage' ? '#E2D3C0' : '#CCCCCC';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 20, width - 40, estimatedHeight - 40);

      // Header Banner
      ctx.fillStyle = colorMode === 'vintage' ? '#C85A32' : '#333333';
      ctx.fillRect(width / 2 - 120, 20, 240, 28);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('RECIPE JOURNAL · 手帐文档', width / 2, 38);

      // Recipe Title
      ctx.fillStyle = '#2C2723';
      ctx.font = 'bold 28px "Noto Serif SC", serif';
      ctx.textAlign = 'center';
      ctx.fillText(recipe.title, width / 2, 85);

      // Subtitle
      ctx.fillStyle = '#7A7268';
      ctx.font = 'italic 14px "Noto Serif SC", serif';
      const sub = recipe.subtitle ? `“${recipe.subtitle}”` : '“人间烟火气，最抚凡人心”';
      ctx.fillText(sub, width / 2, 115);

      // Meta Line
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#5A5248';
      const metaText = `${recipe.category} · ${recipe.cuisine} · 备料${recipe.prepTimeMinutes}分 · 烹饪${recipe.cookTimeMinutes}分 · ${servings}人份 · 热量约${perServingCalories}kcal/份 · 难度${'★'.repeat(recipe.difficulty || 3)}`;
      ctx.fillText(metaText, width / 2, 145);

      let currentY = 175;

      // Draw Ingredients Box
      ctx.fillStyle = colorMode === 'vintage' ? '#F4EFE6' : '#FAFAFA';
      ctx.fillRect(40, currentY, width - 80, 180);
      ctx.strokeStyle = '#E2D3C0';
      ctx.strokeRect(40, currentY, width - 80, 180);

      ctx.fillStyle = '#C85A32';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`🛒 食材清单 (${servings}人份)`, 55, currentY + 25);

      ctx.fillStyle = '#2C2723';
      ctx.font = '12px sans-serif';
      let ingX = 55;
      let ingY = currentY + 50;
      recipe.ingredients.slice(0, 18).forEach((ing, index) => {
        const text = `• ${ing.name}: ${formatScaledAmount(ing)}${ing.unit}`;
        ctx.fillText(text, ingX, ingY);
        ingY += 22;
        if (ingY > currentY + 160 && ingX === 55) {
          ingY = currentY + 50;
          ingX = 330;
        } else if (ingY > currentY + 160 && ingX === 330) {
          ingY = currentY + 50;
          ingX = 600;
        }
      });

      currentY += 205;

      // Steps Title
      ctx.fillStyle = '#C85A32';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('🍳 烹饪步骤与时序', 40, currentY);
      currentY += 25;

      // Steps Content
      recipe.steps.forEach((step, idx) => {
        ctx.fillStyle = '#C85A32';
        ctx.beginPath();
        ctx.arc(52, currentY + 8, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${idx + 1}`, 52, currentY + 12);

        ctx.textAlign = 'left';
        ctx.fillStyle = '#2C2723';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(step.title, 72, currentY + 12);

        if (step.heat || step.durationMinutes) {
          ctx.fillStyle = '#7A7268';
          ctx.font = '11px sans-serif';
          ctx.fillText(`(${step.heat || ''} ${step.durationMinutes ? `${step.durationMinutes}分钟` : ''})`, 72 + ctx.measureText(step.title).width + 10, currentY + 12);
        }

        ctx.fillStyle = '#4A423B';
        ctx.font = '12px sans-serif';
        const words = step.description;
        // Simple wrap
        let line = '';
        let lineY = currentY + 32;
        for (let i = 0; i < words.length; i++) {
          line += words[i];
          if (line.length >= 52 || i === words.length - 1) {
            ctx.fillText(line, 72, lineY);
            line = '';
            lineY += 18;
          }
        }

        if (step.tip) {
          ctx.fillStyle = '#C08A3E';
          ctx.font = 'italic 11px sans-serif';
          ctx.fillText(`💡 避坑要点: ${step.tip.slice(0, 60)}`, 72, lineY);
          lineY += 20;
        }

        currentY = lineY + 15;
      });

      // Reflection Box if enabled
      if (includeReview && recipe.review?.tastingNotes) {
        ctx.fillStyle = colorMode === 'vintage' ? '#FFFDF9' : '#FAFAFA';
        ctx.fillRect(40, currentY, width - 80, 110);
        ctx.strokeStyle = '#E2D3C0';
        ctx.strokeRect(40, currentY, width - 80, 110);

        ctx.fillStyle = '#C85A32';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText('✨ 烹饪心得与手帐复盘', 55, currentY + 24);

        ctx.fillStyle = '#5A5248';
        ctx.font = '12px sans-serif';
        ctx.fillText(recipe.review.tastingNotes.slice(0, 100), 55, currentY + 48);

        if (recipe.review.pitfallsAndLessons) {
          ctx.fillStyle = '#C85A32';
          ctx.font = '11px sans-serif';
          ctx.fillText(`避坑总结: ${recipe.review.pitfallsAndLessons.slice(0, 80)}`, 55, currentY + 74);
        }

        currentY += 130;
      }

      // Watermark
      ctx.fillStyle = '#9A9085';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('—— 来自 食味手记 · 私房烹饪手帐 ——', width / 2, currentY + 15);

      // Trigger download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `食味手记_${recipe.title}_手帐卡.png`;
      link.href = dataUrl;
      link.click();

      setExportSuccessMsg('已成功生成高清手帐长图！');
      setTimeout(() => setExportSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Export error:', err);
      setExportSuccessMsg('⚠️ 导出长图遇到问题，推荐直接点击「立即打印 / 另存为 PDF」');
      setTimeout(() => setExportSuccessMsg(null), 4000);
    } finally {
      setIsExportingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto no-print">
      <div 
        className="bg-white border border-[#EADBCE] rounded-2xl shadow-2xl w-full max-w-5xl my-4 flex flex-col max-h-[92vh] overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#EADBCE] bg-[#FAF7F2] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C85A32]/10 border border-[#C85A32]/30 flex items-center justify-center text-[#C85A32]">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#2C2723] font-journal-title flex items-center gap-2">
                <span>导出精美 PDF 烹饪手帐</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#C85A32]/10 text-[#C85A32] font-sans font-medium">
                  A4 排版优化
                </span>
              </h2>
              <p className="text-xs text-[#7A7268]">
                《{recipe.title}》· 包含封面、食材明细、步骤实拍图及避坑手记
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#7A7268] hover:text-[#2C2723] hover:bg-white rounded-lg transition-colors"
            title="关闭窗口"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options & Action Control Bar */}
        <div className="px-5 py-3.5 bg-white border-b border-[#EADBCE] flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          {/* Customization checkboxes */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer text-[#2C2723] hover:text-[#C85A32] select-none">
              <input
                type="checkbox"
                checked={includeStepPhotos}
                onChange={(e) => setIncludeStepPhotos(e.target.checked)}
                className="rounded border-[#D6CBC0] text-[#C85A32] focus:ring-[#C85A32]"
              />
              <span>步骤实拍图</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-[#2C2723] hover:text-[#C85A32] select-none">
              <input
                type="checkbox"
                checked={includeGallery}
                onChange={(e) => setIncludeGallery(e.target.checked)}
                className="rounded border-[#D6CBC0] text-[#C85A32] focus:ring-[#C85A32]"
              />
              <span>实拍相册花絮</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-[#2C2723] hover:text-[#C85A32] select-none">
              <input
                type="checkbox"
                checked={includeReview}
                onChange={(e) => setIncludeReview(e.target.checked)}
                className="rounded border-[#D6CBC0] text-[#C85A32] focus:ring-[#C85A32]"
              />
              <span>心得复盘与避坑</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-[#2C2723] hover:text-[#C85A32] select-none">
              <input
                type="checkbox"
                checked={includeStamps}
                onChange={(e) => setIncludeStamps(e.target.checked)}
                className="rounded border-[#D6CBC0] text-[#C85A32] focus:ring-[#C85A32]"
              />
              <span>印章与评分</span>
            </label>

            {/* Ink Style Switcher */}
            <div className="flex items-center gap-1 bg-[#FAF7F2] p-0.5 rounded-md border border-[#EADBCE]">
              <button
                onClick={() => setColorMode('vintage')}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  colorMode === 'vintage'
                    ? 'bg-white text-[#C85A32] shadow-2xs font-semibold'
                    : 'text-[#7A7268] hover:text-[#2C2723]'
                }`}
                title="手帐经典米黄色纸张，原汁原味"
              >
                🌸 手帐全彩
              </button>
              <button
                onClick={() => setColorMode('minimal')}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  colorMode === 'minimal'
                    ? 'bg-white text-[#2C2723] shadow-2xs font-semibold'
                    : 'text-[#7A7268] hover:text-[#2C2723]'
                }`}
                title="纯白底色省墨模式，高对比度黑白打印"
              >
                🖨️ 省墨极简
              </button>
            </div>

            {/* Density Switcher */}
            <div className="flex items-center gap-1 bg-[#FAF7F2] p-0.5 rounded-md border border-[#EADBCE]">
              <button
                onClick={() => setDensity('standard')}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  density === 'standard'
                    ? 'bg-white text-[#C85A32] shadow-2xs font-semibold'
                    : 'text-[#7A7268] hover:text-[#2C2723]'
                }`}
              >
                标准舒适
              </button>
              <button
                onClick={() => setDensity('compact')}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  density === 'compact'
                    ? 'bg-white text-[#C85A32] shadow-2xs font-semibold'
                    : 'text-[#7A7268] hover:text-[#2C2723]'
                }`}
                title="紧凑字号与间距，尽可能减少打印页数"
              >
                紧凑单页
              </button>
            </div>
          </div>

          {/* Action triggers */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportImage}
              disabled={isExportingImage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#EADBCE] bg-[#FAF7F2] hover:bg-[#F3ECE4] text-[#5A5248] font-medium transition-colors"
              title="生成并下载长图（手机离线查看/微信分享）"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExportingImage ? '生成中...' : '下载长图 (PNG)'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-[#C85A32] hover:bg-[#B34C26] active:scale-[0.98] text-white font-semibold shadow-xs transition-all"
              title="调用系统打印，可选择「另存为 PDF」或连接打印机"
            >
              <Printer className="w-4 h-4" />
              <span>立即打印 / 另存为 PDF</span>
            </button>
          </div>
        </div>

        {/* Success toast if any */}
        {exportSuccessMsg && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs text-emerald-800 flex items-center justify-between animate-fade-in">
            <span>✨ {exportSuccessMsg}</span>
            <button onClick={() => setExportSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-900">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Scrollable Live A4 Sheet Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#ECE6DC] flex justify-center">
          
          {/* THE PRINT SHEET (rendered for both preview and print isolation) */}
          <div
            id="recipe-print-document"
            ref={printSheetRef}
            className={`w-full max-w-[210mm] min-h-[297mm] transition-all duration-200 ${
              colorMode === 'vintage' 
                ? 'bg-[#FAF7F2] text-[#2C2723] border border-[#E2D3C0]' 
                : 'bg-white text-[#1A1A1A] border border-gray-300'
            } p-6 sm:p-10 shadow-lg relative print-page ${
              density === 'compact' ? 'text-xs' : 'text-sm'
            }`}
            style={{ boxSizing: 'border-box' }}
          >
            {/* Washi Tape Header (Decorative) */}
            <div className="flex items-center justify-between border-b-2 border-[#C85A32]/70 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-[#C85A32] text-white text-[11px] font-mono font-bold uppercase tracking-wider rounded-xs">
                  RECIPE JOURNAL
                </span>
                <span className="text-xs text-[#7A7268] font-mono">
                  #{recipe.id.slice(-6).toUpperCase()}
                </span>
              </div>
              <div className="text-xs text-[#7A7268] flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>手帐日期：{recipe.review?.cookDate || recipe.createdAt}</span>
                {recipe.weatherStamp && (
                  <>
                    <span className="text-[#C85A32]">·</span>
                    <span>{recipe.weatherStamp}</span>
                  </>
                )}
              </div>
            </div>

            {/* Header: Title & Story */}
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#7A7268] mb-2 font-serif">
                <span className="font-semibold text-[#2C2723]">{recipe.category}</span>
                {recipe.subCategory && (
                  <>
                    <span className="text-[#C85A32]">/</span>
                    <span className="text-[#C85A32] font-semibold">{recipe.subCategory}</span>
                  </>
                )}
                <span>·</span>
                <span>{recipe.cuisine}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold font-journal-title text-[#2C2723] leading-tight mb-2">
                {recipe.title}
              </h1>

              <p className="text-sm text-[#7A7268] italic font-serif leading-relaxed mb-3">
                “{recipe.subtitle || '每一道菜都是一封写给生活的情书。'}”
              </p>

              {/* Tags */}
              {recipe.tags && recipe.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {recipe.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#FAF3EC] text-[#C85A32] border border-[#EADBCE]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Metadata parameter badge strip */}
              <div className="mt-3 py-2 px-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs text-[#5A5248] print-avoid-break">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#C85A32]" />
                    <span>备料 <strong>{recipe.prepTimeMinutes}</strong> 分钟</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-[#C85A32]" />
                    <span>烹饪 <strong>{recipe.cookTimeMinutes}</strong> 分钟</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#C85A32]" />
                    <span>适配 <strong>{servings}</strong> 人份</span>
                  </span>
                  <span className="flex items-center gap-1" title="预估单人份热量">
                    <Flame className="w-3.5 h-3.5 text-[#C85A32]" />
                    <span>热量 <strong>{perServingCalories}</strong> kcal/份</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <ChefHat className="w-3.5 h-3.5 text-[#C85A32]" />
                    <span>难度 {'★'.repeat(recipe.difficulty || 3)}</span>
                  </span>
                </div>
                {recipe.utensils && recipe.utensils.length > 0 && (
                  <div className="text-[11px] text-[#7A7268]">
                    <span>备置炊具: {recipe.utensils.join(' / ')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Featured Cover Photo (if available) */}
            {recipe.coverImage && (
              <div className="mb-6 print-avoid-break">
                <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EADBCE] shadow-xs">
                  <div className="aspect-[21/9] w-full rounded-lg overflow-hidden bg-[#EADBCE]/30">
                    <img
                      src={recipe.coverImage}
                      alt={recipe.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="mt-1 text-right text-[10px] text-[#9A9085] italic font-serif">
                    手帐私房定妆照 · {recipe.title}
                  </div>
                </div>
              </div>
            )}

            {/* Section 1: 食材清单与配比 (Ingredients Table) */}
            <div className="mb-6 print-avoid-break">
              <div className="flex items-center justify-between border-b-2 border-[#EADBCE] pb-1.5 mb-3">
                <h2 className="text-base font-bold font-journal-title text-[#2C2723] flex items-center gap-2">
                  <span>🛒 食材清单与配比</span>
                  <span className="text-xs font-normal text-[#7A7268] font-sans">
                    ({servings}人份用量)
                  </span>
                </h2>
                <span className="text-xs text-[#7A7268]">共 {recipe.ingredients.length} 种用料</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {/* Main ingredients */}
                {mainIngredients.length > 0 && (
                  <div className="bg-[#FAF7F2]/80 border border-[#EADBCE] rounded-lg p-2.5">
                    <div className="text-[11px] font-bold text-[#C85A32] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32]" />
                      <span>主料 / 生鲜禽肉蔬菜</span>
                    </div>
                    <ul className="space-y-1.5 text-xs">
                      {mainIngredients.map((ing) => (
                        <li key={ing.id} className="flex items-center justify-between border-b border-[#EADBCE]/50 pb-1">
                          <span className="text-[#2C2723] font-medium">{ing.name}</span>
                          <span className="text-[#5A5248] font-mono font-semibold">
                            {formatScaledAmount(ing)} {ing.unit}
                            {ing.note && <span className="text-[10px] text-[#9A9085] ml-1">({ing.note})</span>}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Seasoning ingredients */}
                {seasoningIngredients.length > 0 && (
                  <div className="bg-[#FAF7F2]/80 border border-[#EADBCE] rounded-lg p-2.5">
                    <div className="text-[11px] font-bold text-[#C08A3E] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C08A3E]" />
                      <span>调味 / 黄金酱汁配比</span>
                    </div>
                    <ul className="space-y-1.5 text-xs">
                      {seasoningIngredients.map((ing) => (
                        <li key={ing.id} className="flex items-center justify-between border-b border-[#EADBCE]/50 pb-1">
                          <span className="text-[#2C2723] font-medium">{ing.name}</span>
                          <span className="text-[#5A5248] font-mono font-semibold">
                            {formatScaledAmount(ing)} {ing.unit}
                            {ing.note && <span className="text-[10px] text-[#9A9085] ml-1">({ing.note})</span>}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Garnish ingredients */}
                {garnishIngredients.length > 0 && (
                  <div className="bg-[#FAF7F2]/80 border border-[#EADBCE] rounded-lg p-2.5">
                    <div className="text-[11px] font-bold text-[#5F7A4D] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5F7A4D]" />
                      <span>配菜 / 点缀提香</span>
                    </div>
                    <ul className="space-y-1.5 text-xs">
                      {garnishIngredients.map((ing) => (
                        <li key={ing.id} className="flex items-center justify-between border-b border-[#EADBCE]/50 pb-1">
                          <span className="text-[#2C2723] font-medium">{ing.name}</span>
                          <span className="text-[#5A5248] font-mono font-semibold">
                            {formatScaledAmount(ing)} {ing.unit}
                            {ing.note && <span className="text-[10px] text-[#9A9085] ml-1">({ing.note})</span>}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: 烹饪步骤与时序 (Step-by-Step Cooking Instructions) */}
            <div className="mb-6">
              <div className="flex items-center justify-between border-b-2 border-[#EADBCE] pb-1.5 mb-4">
                <h2 className="text-base font-bold font-journal-title text-[#2C2723]">
                  🍳 烹饪步骤与时序
                </h2>
                <span className="text-xs text-[#7A7268]">共 {recipe.steps.length} 个步骤</span>
              </div>

              <div className="space-y-4">
                {recipe.steps.map((step, idx) => (
                  <div
                    key={step.id || idx}
                    className="p-3.5 bg-[#FAF7F2]/70 border border-[#EADBCE] rounded-xl print-avoid-break"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#C85A32] text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                          {step.stepNumber || idx + 1}
                        </span>
                        <h3 className="font-bold text-[#2C2723] text-sm">
                          {step.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        {step.heat && (
                          <span className="px-2 py-0.5 rounded bg-white border border-[#EADBCE] text-[#C85A32] font-medium text-[11px]">
                            {step.heat}
                          </span>
                        )}
                        {step.durationMinutes && (
                          <span className="px-2 py-0.5 rounded bg-white border border-[#EADBCE] text-[#7A7268] font-mono text-[11px]">
                            ⏱️ {step.durationMinutes}分钟
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-[#4A423B] leading-relaxed mb-2 pl-7">
                      {step.description}
                    </p>

                    {/* Step tip / pitfall */}
                    {step.tip && (
                      <div className="ml-7 bg-[#FFFDF9] border border-[#E8DCC4] rounded-md p-2 text-xs text-[#6B5838] flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#C08A3E] shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-semibold text-[#8C5D1E]">避坑提示: </strong>
                          <span>{step.tip}</span>
                        </div>
                      </div>
                    )}

                    {/* Step photo if enabled and available */}
                    {includeStepPhotos && step.photoUrl && (
                      <div className="mt-2.5 ml-7 max-w-sm">
                        <div className="aspect-[16/9] rounded-lg overflow-hidden border border-[#EADBCE]">
                          <img
                            src={step.photoUrl}
                            alt={step.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: 烹饪心得与手帐复盘 (Reflections, Ratings & Stickers) */}
            {includeReview && recipe.review && (
              <div className="mb-6 p-4 sm:p-5 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl relative print-avoid-break">
                {/* Vintage Seal Stamp */}
                {includeStamps && (
                  <div className="absolute top-3 right-3 text-[#C85A32] pointer-events-none">
                    <div className="seal-stamp text-[11px] font-bold">
                      ★ 私房品鉴 ★
                    </div>
                  </div>
                )}

                <h2 className="text-sm sm:text-base font-bold font-journal-title text-[#2C2723] mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#C85A32]" />
                  <span>烹饪心得与手帐复盘</span>
                </h2>

                {/* 4-Axis Ratings */}
                {includeStamps && recipe.review.ratings && (
                  <div className="grid grid-cols-4 gap-2 mb-3 bg-white p-2.5 rounded-lg border border-[#EADBCE] text-center text-xs">
                    <div>
                      <span className="text-[10px] text-[#7A7268] block">风味口感</span>
                      <span className="font-bold text-[#C08A3E]">
                        ★ {recipe.review.ratings.taste || 5}.0
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#7A7268] block">难度系数</span>
                      <span className="font-semibold text-[#2C2723]">
                        {recipe.review.ratings.difficulty || 3}星
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#7A7268] block">翻牌推荐</span>
                      <span className="font-bold text-[#5F7A4D]">
                        ♥ {recipe.review.ratings.reproducibility || 5}.0
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#7A7268] block">出锅颜值</span>
                      <span className="font-semibold text-[#2C2723]">
                        {'★'.repeat(recipe.review.ratings.presentation || 5)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Review Notes details */}
                <div className="space-y-2 text-xs">
                  {recipe.review.tastingNotes && (
                    <div className="bg-white/80 p-2.5 rounded-md border border-[#EADBCE]/80">
                      <strong className="text-[#2C2723] block mb-0.5">💬 口感风味手记:</strong>
                      <p className="text-[#5A5248] leading-relaxed">{recipe.review.tastingNotes}</p>
                    </div>
                  )}

                  {recipe.review.pitfallsAndLessons && (
                    <div className="bg-white/80 p-2.5 rounded-md border border-[#EADBCE]/80">
                      <strong className="text-[#C85A32] block mb-0.5">💡 避坑经验与优化:</strong>
                      <p className="text-[#5A5248] leading-relaxed">{recipe.review.pitfallsAndLessons}</p>
                    </div>
                  )}

                  {recipe.review.pairingSuggestions && (
                    <div className="bg-white/80 p-2.5 rounded-md border border-[#EADBCE]/80">
                      <strong className="text-[#5F7A4D] block mb-0.5">🍷 绝佳搭档 (主食/饮品):</strong>
                      <p className="text-[#5A5248] leading-relaxed">{recipe.review.pairingSuggestions}</p>
                    </div>
                  )}

                  {recipe.review.dinerFeedback && (
                    <div className="bg-white/80 p-2.5 rounded-md border border-[#EADBCE]/80">
                      <strong className="text-[#C08A3E] block mb-0.5">👨‍👩‍👧 食客反馈:</strong>
                      <p className="text-[#5A5248] italic">{recipe.review.dinerFeedback}</p>
                    </div>
                  )}

                  {/* Stamp Tags */}
                  {includeStamps && recipe.review.stickers && recipe.review.stickers.length > 0 && (
                    <div className="pt-1 flex flex-wrap gap-1.5">
                      {recipe.review.stickers.map((stk, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-[11px] font-medium bg-white border border-[#EADBCE] text-[#2C2723] rounded-full"
                        >
                          {stk}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Section 4: 烹饪画廊相册花絮 (Gallery Photos) */}
            {includeGallery && recipe.galleryPhotos && recipe.galleryPhotos.length > 0 && (
              <div className="mb-6 print-avoid-break">
                <div className="flex items-center justify-between border-b-2 border-[#EADBCE] pb-1.5 mb-3">
                  <h2 className="text-base font-bold font-journal-title text-[#2C2723] flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-[#C85A32]" />
                    <span>实拍记录相册集锦</span>
                  </h2>
                  <span className="text-xs text-[#7A7268]">共 {recipe.galleryPhotos.length} 张花絮</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {recipe.galleryPhotos.map((photo, idx) => (
                    <div key={idx} className="bg-white p-1.5 rounded-lg border border-[#EADBCE] shadow-2xs">
                      <div className="aspect-square rounded overflow-hidden">
                        <img
                          src={photo}
                          alt={`花絮 ${idx + 1}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="block text-[10px] text-center text-[#7A7268] mt-1 font-serif">
                        花絮记录 #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Watermark & Page info */}
            <div className="pt-6 border-t border-[#EADBCE] text-center text-xs text-[#9A9085] flex flex-col items-center gap-1">
              <span className="font-serif">—— 食味手记 · 私房烹饪手帐 ——</span>
              <span className="text-[10px]">记录每一次与美食相遇的幸福时光 · 打印导出时间：{new Date().toLocaleDateString('zh-CN')}</span>
            </div>
          </div>

        </div>

        {/* Modal Bottom Tips */}
        <div className="px-5 py-3 bg-[#FAF7F2] border-t border-[#EADBCE] flex items-center justify-between text-xs text-[#7A7268] shrink-0">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-[#C85A32]" />
            <span>
              💡 打印提示：点击「立即打印 / 另存为 PDF」后，目标打印机选择<strong>「另存为 PDF」</strong>即可将整篇手帐保存为精美文档。
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md border border-[#EADBCE] bg-white hover:bg-[#FAF7F2] text-[#2C2723] font-medium transition-colors"
          >
            完成并关闭
          </button>
        </div>

      </div>
    </div>
  );
};
