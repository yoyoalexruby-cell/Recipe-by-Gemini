import React, { useState, useRef } from 'react';
import { Recipe, Ingredient } from '../types/recipe';
import { 
  Printer, Download, X, Check, Image as ImageIcon, Sparkles, 
  Clock, Flame, ChefHat, Users, Star, Heart, AlertTriangle, 
  Tag, Calendar, Camera, BookOpen, Layers, Feather, Stamp, Scroll, Coffee, RefreshCw
} from 'lucide-react';
import { estimateRecipeCalories } from '../utils/nutritionCalculator';
import { toPng } from 'html-to-image';

interface RecipePDFExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe;
  servings?: number;
}

export type JournalBorderStyle = 'vintage' | 'kraft' | 'botanical' | 'minimal';
export type VintageTextureVibe = 'parchment' | 'tea-stain' | 'deckle-fiber';
export type VintageTextureIntensity = 'subtle' | 'authentic' | 'antique';
export type PhotoLayoutMode = 'hero' | 'collage' | 'polaroid-grid' | 'filmstrip';

export const RecipePDFExportModal: React.FC<RecipePDFExportModalProps> = ({
  isOpen,
  onClose,
  recipe,
  servings = recipe.baseServings || 2
}) => {
  // Border & Typesetting style choices
  const [borderStyle, setBorderStyle] = useState<JournalBorderStyle>('vintage');
  const [photoLayout, setPhotoLayout] = useState<PhotoLayoutMode>('hero');
  const [includeStepPhotos, setIncludeStepPhotos] = useState(true);
  const [includeGallery, setIncludeGallery] = useState(true);
  const [includeReview, setIncludeReview] = useState(true);
  const [includeStamps, setIncludeStamps] = useState(true);
  const [density, setDensity] = useState<'standard' | 'compact'>('standard');
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  // Vintage Paper Texture Overlay Settings
  const [vintagePaperTexture, setVintagePaperTexture] = useState<boolean>(true);
  const [textureVibe, setTextureVibe] = useState<VintageTextureVibe>('parchment');
  const [textureIntensity, setTextureIntensity] = useState<VintageTextureIntensity>('authentic');

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
    // Set active print style on document body for print isolation
    document.body.classList.remove('print-vintage', 'print-kraft', 'print-botanical', 'print-minimal-ink', 'print-vintage-paper');
    if (borderStyle === 'minimal') {
      document.body.classList.add('print-minimal-ink');
    } else if (borderStyle === 'kraft') {
      document.body.classList.add('print-kraft');
    } else if (borderStyle === 'botanical') {
      document.body.classList.add('print-botanical');
    } else {
      document.body.classList.add('print-vintage');
    }

    if (vintagePaperTexture) {
      document.body.classList.add('print-vintage-paper');
    }

    window.print();

    // Cleanup after print dialog
    setTimeout(() => {
      document.body.classList.remove('print-vintage', 'print-kraft', 'print-botanical', 'print-minimal-ink', 'print-vintage-paper');
    }, 1200);
  };

  // Export as high-res PNG long image directly from the DOM sheet (capturing cover photo, step photos, gallery and textures)
  const handleExportImage = async () => {
    if (!printSheetRef.current) return;
    try {
      setIsExportingImage(true);

      // Pre-load all images inside the sheet to avoid blank frames
      const imgElements = printSheetRef.current.querySelectorAll('img');
      await Promise.all(
        Array.from(imgElements).map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = () => resolve(true);
            img.onerror = () => resolve(true); // Don't block export if one fails
          });
        })
      );

      // Render crisp retina PNG using html-to-image
      const dataUrl = await toPng(printSheetRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        quality: 0.98,
        filter: (node) => {
          // Do not export modal control bars or elements tagged no-print
          if (node instanceof HTMLElement && node.classList.contains('no-print')) {
            return false;
          }
          return true;
        }
      });

      const link = document.createElement('a');
      link.download = `食味手记_${recipe.title}_A4手帐长图.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportSuccessMsg('已成功生成包含高清实拍图的精美手帐长图！');
      setTimeout(() => setExportSuccessMsg(null), 3500);
    } catch (err) {
      console.error('Export image error:', err);
      // Fallback: suggest print or alert
      setExportSuccessMsg('⚠️ 生成长图遇到跨域或网络问题，可点击右侧「立即打印 / 另存为 PDF」无损导出');
      setTimeout(() => setExportSuccessMsg(null), 4500);
    } finally {
      setIsExportingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-xs overflow-y-auto no-print">
      <div 
        className="bg-white border border-[#EADBCE] rounded-2xl shadow-2xl w-full max-w-6xl my-4 flex flex-col max-h-[94vh] overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="px-5 py-4 border-b border-[#EADBCE] bg-[#FAF7F2] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C85A32]/10 border border-[#C85A32]/30 flex items-center justify-center text-[#C85A32]">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#2C2723] font-journal-title flex items-center gap-2">
                <span>生成打印版手帐</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#C85A32]/10 text-[#C85A32] font-sans font-medium">
                  A4 边框手帐排版
                </span>
              </h2>
              <p className="text-xs text-[#7A7268]">
                《{recipe.title}》· 预览精致边框装饰与排版效果，可直接连接打印机或另存为高清矢量 PDF
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

        {/* Options & Decoration Toolbar */}
        <div className="px-5 py-3.5 bg-white border-b border-[#EADBCE] flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          
          {/* 1. Border Style Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-[#7A7268] flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>边框装帧：</span>
            </span>

            <div className="flex items-center gap-1 bg-[#FAF7F2] p-0.5 rounded-lg border border-[#EADBCE]">
              <button
                type="button"
                onClick={() => setBorderStyle('vintage')}
                className={`px-2.5 py-1 rounded text-xs transition-all flex items-center gap-1 ${
                  borderStyle === 'vintage'
                    ? 'bg-white text-[#C85A32] shadow-2xs font-bold'
                    : 'text-[#7A7268] hover:text-[#2C2723]'
                }`}
                title="古典复古双线边框 + 转角雕花与胶带"
              >
                <span>📜 古典双线</span>
              </button>

              <button
                type="button"
                onClick={() => setBorderStyle('kraft')}
                className={`px-2.5 py-1 rounded text-xs transition-all flex items-center gap-1 ${
                  borderStyle === 'kraft'
                    ? 'bg-white text-[#9E6438] shadow-2xs font-bold'
                    : 'text-[#7A7268] hover:text-[#2C2723]'
                }`}
                title="牛皮纸色调 + 火漆印章与邮政缝线边框"
              >
                <span>🏷️ 牛皮纸火漆</span>
              </button>

              <button
                type="button"
                onClick={() => setBorderStyle('botanical')}
                className={`px-2.5 py-1 rounded text-xs transition-all flex items-center gap-1 ${
                  borderStyle === 'botanical'
                    ? 'bg-white text-[#5F7A4D] shadow-2xs font-bold'
                    : 'text-[#7A7268] hover:text-[#2C2723]'
                }`}
                title="清新草木绿色调 + 手绘植物枝叶边角"
              >
                <span>🌿 清新草木</span>
              </button>

              <button
                type="button"
                onClick={() => setBorderStyle('minimal')}
                className={`px-2.5 py-1 rounded text-xs transition-all flex items-center gap-1 ${
                  borderStyle === 'minimal'
                    ? 'bg-white text-[#1A1A1A] shadow-2xs font-bold'
                    : 'text-[#7A7268] hover:text-[#2C2723]'
                }`}
                title="黑白高对比度极简双线，家庭黑白打印最省墨"
              >
                <span>🖨️ 极简省墨</span>
              </button>
            </div>
          </div>

          {/* 2. Vintage Paper Texture Overlay Settings */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border transition-all ${
              vintagePaperTexture 
                ? 'bg-amber-50/90 border-amber-300/80 text-amber-950 shadow-2xs' 
                : 'bg-[#FAF7F2] border-[#EADBCE] text-[#7A7268]'
            }`}>
              <label className="flex items-center gap-1.5 cursor-pointer select-none font-semibold text-xs">
                <input
                  type="checkbox"
                  checked={vintagePaperTexture}
                  onChange={(e) => setVintagePaperTexture(e.target.checked)}
                  className="rounded border-[#D6CBC0] text-[#C85A32] focus:ring-[#C85A32]"
                />
                <Scroll className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>复古做旧纸纹 (Vintage Paper)</span>
              </label>

              {vintagePaperTexture && (
                <div className="flex items-center gap-1.5 pl-2 border-l border-amber-300/70">
                  <select
                    value={textureVibe}
                    onChange={(e) => setTextureVibe(e.target.value as VintageTextureVibe)}
                    className="bg-white border border-[#EADBCE] rounded px-1.5 py-0.5 text-[11px] text-[#4A423B] focus:outline-hidden"
                    title="选择复古纸张质感风格"
                  >
                    <option value="parchment">📜 羊皮纸纹 (Parchment)</option>
                    <option value="tea-stain">☕ 茶渍浸润 (Tea-Stained)</option>
                    <option value="deckle-fiber">🌾 亚麻纤维 (Linen Fiber)</option>
                  </select>

                  <select
                    value={textureIntensity}
                    onChange={(e) => setTextureIntensity(e.target.value as VintageTextureIntensity)}
                    className="bg-white border border-[#EADBCE] rounded px-1.5 py-0.5 text-[11px] text-[#4A423B] focus:outline-hidden"
                    title="选择做旧色调与纹理浓度"
                  >
                    <option value="subtle">淡雅 (Subtle)</option>
                    <option value="authentic">标准 (Authentic)</option>
                    <option value="antique">浓郁沧桑 (Antique)</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* 3. Photo Layout Mode (大图模式 / 多图拼贴模式 / 拍立得矩阵 / 胶卷画报) */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-[#7A7268] flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>图片布局：</span>
            </span>

            <div className="flex items-center gap-1 bg-[#FAF7F2] p-0.5 rounded-lg border border-[#EADBCE]">
              <button
                type="button"
                onClick={() => setPhotoLayout('hero')}
                className={`px-2.5 py-1 rounded text-xs transition-all flex items-center gap-1 ${
                  photoLayout === 'hero'
                    ? 'bg-white text-[#C85A32] shadow-2xs font-bold'
                    : 'text-[#7A7268] hover:text-[#2C2723]'
                }`}
                title="经典单张横幅大图，凸显菜品定妆照美感"
              >
                <span>🖼️ 大图焦点</span>
              </button>

              <button
                type="button"
                onClick={() => setPhotoLayout('collage')}
                className={`px-2.5 py-1 rounded text-xs transition-all flex items-center gap-1 ${
                  photoLayout === 'collage'
                    ? 'bg-white text-[#C85A32] shadow-2xs font-bold'
                    : 'text-[#7A7268] hover:text-[#2C2723]'
                }`}
                title="主图与花絮高低错落杂志感拼接，视觉层次丰富"
              >
                <span>🎨 多图拼贴</span>
              </button>

              <button
                type="button"
                onClick={() => setPhotoLayout('polaroid-grid')}
                className={`px-2.5 py-1 rounded text-xs transition-all flex items-center gap-1 ${
                  photoLayout === 'polaroid-grid'
                    ? 'bg-white text-[#C85A32] shadow-2xs font-bold'
                    : 'text-[#7A7268] hover:text-[#2C2723]'
                }`}
                title="微倾斜拍立得相框矩阵，带有浓厚手帐贴纸氛围"
              >
                <span>📷 拍立得矩阵</span>
              </button>

              <button
                type="button"
                onClick={() => setPhotoLayout('filmstrip')}
                className={`px-2.5 py-1 rounded text-xs transition-all flex items-center gap-1 ${
                  photoLayout === 'filmstrip'
                    ? 'bg-white text-[#C85A32] shadow-2xs font-bold'
                    : 'text-[#7A7268] hover:text-[#2C2723]'
                }`}
                title="复古胶卷连环画廊，展现烹饪过程与出锅高光"
              >
                <span>🎞️ 胶卷连环</span>
              </button>
            </div>
          </div>

          {/* 3. Content inclusion checkboxes */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer text-[#2C2723] hover:text-[#C85A32] select-none">
              <input
                type="checkbox"
                checked={includeStepPhotos}
                onChange={(e) => setIncludeStepPhotos(e.target.checked)}
                className="rounded border-[#D6CBC0] text-[#C85A32] focus:ring-[#C85A32]"
              />
              <span>步骤实拍</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-[#2C2723] hover:text-[#C85A32] select-none">
              <input
                type="checkbox"
                checked={includeGallery}
                onChange={(e) => setIncludeGallery(e.target.checked)}
                className="rounded border-[#D6CBC0] text-[#C85A32] focus:ring-[#C85A32]"
              />
              <span>相册花絮</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-[#2C2723] hover:text-[#C85A32] select-none">
              <input
                type="checkbox"
                checked={includeReview}
                onChange={(e) => setIncludeReview(e.target.checked)}
                className="rounded border-[#D6CBC0] text-[#C85A32] focus:ring-[#C85A32]"
              />
              <span>复盘避坑</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-[#2C2723] hover:text-[#C85A32] select-none">
              <input
                type="checkbox"
                checked={includeStamps}
                onChange={(e) => setIncludeStamps(e.target.checked)}
                className="rounded border-[#D6CBC0] text-[#C85A32] focus:ring-[#C85A32]"
              />
              <span>火漆印章</span>
            </label>

            {/* Density Switcher */}
            <div className="flex items-center gap-1 bg-[#FAF7F2] p-0.5 rounded-md border border-[#EADBCE]">
              <button
                type="button"
                onClick={() => setDensity('standard')}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  density === 'standard'
                    ? 'bg-white text-[#C85A32] shadow-2xs font-semibold'
                    : 'text-[#7A7268] hover:text-[#2C2723]'
                }`}
              >
                标准舒朗
              </button>
              <button
                type="button"
                onClick={() => setDensity('compact')}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  density === 'compact'
                    ? 'bg-white text-[#C85A32] shadow-2xs font-semibold'
                    : 'text-[#7A7268] hover:text-[#2C2723]'
                }`}
                title="紧凑字号与间距，尽可能单页排布"
              >
                紧凑单页
              </button>
            </div>
          </div>

          {/* 4. Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportImage}
              disabled={isExportingImage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#EADBCE] bg-[#FAF7F2] hover:bg-[#F3ECE4] text-[#5A5248] font-medium transition-colors"
              title="生成并下载长图（手机离线查看/微信分享）"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExportingImage ? '生成中...' : '下载手帐长图'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#C85A32] hover:bg-[#B34C26] active:scale-[0.98] text-white font-bold shadow-xs transition-all"
              title="调用系统打印，目标打印机选择「另存为 PDF」即可导出"
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
            className={`w-full max-w-[210mm] min-h-[297mm] transition-all duration-200 shadow-xl relative print-page ${
              density === 'compact' ? 'text-xs' : 'text-sm'
            } ${
              vintagePaperTexture
                ? borderStyle === 'kraft'
                  ? 'bg-[#EFE6DC] text-[#261910]'
                  : borderStyle === 'botanical'
                  ? 'bg-[#F2F5ED] text-[#1E281C]'
                  : borderStyle === 'minimal'
                  ? 'bg-[#FAF9F6] text-[#1A1A1A]'
                  : 'bg-[#F6EFE3] text-[#2C2723]'
                : borderStyle === 'kraft'
                ? 'bg-[#F5EFEB] text-[#261910]'
                : borderStyle === 'botanical'
                ? 'bg-[#F8FAF7] text-[#1E281C]'
                : borderStyle === 'minimal'
                ? 'bg-white text-[#1A1A1A]'
                : 'bg-[#FAF7F2] text-[#2C2723]'
            } ${vintagePaperTexture ? 'has-vintage-paper' : ''} p-8 sm:p-12`}
            style={{ boxSizing: 'border-box' }}
          >
            {/* ================= VINTAGE PAPER TEXTURE OVERLAY ================= */}
            {vintagePaperTexture && (
              <div 
                className="vintage-paper-overlay absolute inset-0 pointer-events-none overflow-hidden select-none z-0"
                aria-hidden="true"
              >
                {/* 1. Radial Aging Vignette Gradient (Antiqued sepia perimeter) */}
                <div 
                  className={`absolute inset-0 transition-opacity ${
                    textureIntensity === 'antique' 
                      ? 'opacity-95' 
                      : textureIntensity === 'subtle' 
                        ? 'opacity-45' 
                        : 'opacity-70'
                  }`}
                  style={{
                    background: 'radial-gradient(ellipse at center, transparent 48%, rgba(200, 165, 125, 0.14) 75%, rgba(160, 115, 70, 0.28) 100%)'
                  }}
                />

                {/* 2. Top & Bottom Edge Aging Patina Bands */}
                <div 
                  className="absolute top-0 left-0 right-0 h-16 pointer-events-none"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(165, 120, 75, 0.18), transparent)'
                  }}
                />
                <div 
                  className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
                  style={{
                    background: 'linear-gradient(to top, rgba(165, 120, 75, 0.22), transparent)'
                  }}
                />
                <div 
                  className="absolute top-0 bottom-0 left-0 w-8 pointer-events-none"
                  style={{
                    background: 'linear-gradient(to right, rgba(165, 120, 75, 0.12), transparent)'
                  }}
                />
                <div 
                  className="absolute top-0 bottom-0 right-0 w-8 pointer-events-none"
                  style={{
                    background: 'linear-gradient(to left, rgba(165, 120, 75, 0.12), transparent)'
                  }}
                />

                {/* 3. SVG Paper Fiber & Pulp Grain Pattern */}
                <svg className="absolute inset-0 w-full h-full opacity-60 mix-blend-multiply pointer-events-none">
                  <defs>
                    <pattern id="vintage-fiber-tile" width="140" height="140" patternUnits="userSpaceOnUse">
                      {/* Randomized paper pulp flecks and micro strokes */}
                      <rect x="14" y="22" width="3" height="1" rx="0.5" fill="#8C6542" opacity="0.18" />
                      <rect x="85" y="44" width="4" height="1" rx="0.5" fill="#8C6542" opacity="0.15" />
                      <rect x="52" y="96" width="3.5" height="1" rx="0.5" fill="#8C6542" opacity="0.2" />
                      <rect x="110" y="118" width="2.5" height="1" rx="0.5" fill="#8C6542" opacity="0.16" />
                      <circle cx="34" cy="72" r="0.8" fill="#7A5535" opacity="0.22" />
                      <circle cx="98" cy="18" r="0.7" fill="#7A5535" opacity="0.19" />
                      <circle cx="124" cy="82" r="0.9" fill="#7A5535" opacity="0.18" />
                      <circle cx="68" cy="132" r="0.7" fill="#7A5535" opacity="0.21" />
                      {/* Organic woven fibers */}
                      <path d="M25 45 Q 32 47, 40 44" stroke="#8C6542" strokeWidth="0.6" fill="none" opacity="0.14" />
                      <path d="M78 88 Q 85 86, 92 89" stroke="#8C6542" strokeWidth="0.6" fill="none" opacity="0.12" />
                      <path d="M105 38 Q 112 41, 118 39" stroke="#8C6542" strokeWidth="0.6" fill="none" opacity="0.15" />
                      {textureVibe === 'deckle-fiber' && (
                        <>
                          <path d="M10 110 Q 18 113, 26 109" stroke="#8C6542" strokeWidth="0.75" fill="none" opacity="0.18" />
                          <path d="M60 20 Q 68 23, 76 19" stroke="#8C6542" strokeWidth="0.75" fill="none" opacity="0.16" />
                          <circle cx="70" cy="60" r="1.1" fill="#7A5535" opacity="0.24" />
                        </>
                      )}
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#vintage-fiber-tile)" />
                </svg>

                {/* 4. Subtle Scrapbook Fold / Aging Creases */}
                <div 
                  className="absolute left-0 right-0 top-[34%] h-px pointer-events-none opacity-40"
                  style={{
                    background: 'linear-gradient(to right, transparent 5%, rgba(255,255,255,0.7) 15%, rgba(140, 100, 60, 0.22) 50%, rgba(255,255,255,0.7) 85%, transparent 95%)'
                  }}
                />
                <div 
                  className="absolute left-0 right-0 top-[68%] h-px pointer-events-none opacity-35"
                  style={{
                    background: 'linear-gradient(to right, transparent 8%, rgba(255,255,255,0.6) 20%, rgba(140, 100, 60, 0.2) 55%, rgba(255,255,255,0.6) 80%, transparent 92%)'
                  }}
                />

                {/* 5. Authentic Faux Tea/Coffee Watermark Ring */}
                {(textureVibe === 'tea-stain' || textureVibe === 'parchment') && (
                  <div className="absolute -bottom-8 -right-8 w-44 h-44 pointer-events-none opacity-40">
                    <svg viewBox="0 0 120 120" className="w-full h-full">
                      {/* Outer tea stain ring */}
                      <circle 
                        cx="60" cy="60" r="48" 
                        fill="none" 
                        stroke="#A67B4F" 
                        strokeWidth="2.5" 
                        strokeDasharray="36 6 18 4 50 8" 
                        opacity="0.35" 
                      />
                      {/* Inner tea bleed watermark */}
                      <circle 
                        cx="60" cy="60" r="45" 
                        fill="rgba(195, 150, 100, 0.04)" 
                        stroke="#8C6036" 
                        strokeWidth="0.9" 
                        strokeDasharray="22 5 12 3" 
                        opacity="0.25" 
                      />
                      {/* Faint splash dots */}
                      <circle cx="28" cy="38" r="1.5" fill="#8C6036" opacity="0.3" />
                      <circle cx="92" cy="78" r="2" fill="#8C6036" opacity="0.25" />
                    </svg>
                  </div>
                )}

                {/* 6. Scrapbook Faux Washi Tape Accents (Top corners) */}
                <div 
                  className="absolute top-1 left-10 w-24 h-5 pointer-events-none rotate-[-2deg] opacity-75 shadow-xs"
                  style={{
                    background: 'rgba(235, 218, 195, 0.75)',
                    borderLeft: '1px dashed rgba(160, 120, 80, 0.4)',
                    borderRight: '1px dashed rgba(160, 120, 80, 0.4)',
                    backdropFilter: 'blur(1px)'
                  }}
                />
                <div 
                  className="absolute top-1 right-12 w-20 h-5 pointer-events-none rotate-[2.5deg] opacity-75 shadow-xs"
                  style={{
                    background: 'rgba(235, 218, 195, 0.75)',
                    borderLeft: '1px dashed rgba(160, 120, 80, 0.4)',
                    borderRight: '1px dashed rgba(160, 120, 80, 0.4)',
                    backdropFilter: 'blur(1px)'
                  }}
                />
              </div>
            )}
            {/* ================= BORDER DECORATION OVERLAYS ================= */}

            {/* 1. Vintage Double Border & Filigree Corner Ornaments */}
            {borderStyle === 'vintage' && (
              <>
                {/* Outer frame border */}
                <div className="absolute inset-3 sm:inset-4 border-2 border-[#C85A32]/65 pointer-events-none rounded-xs" />
                {/* Inset hairline frame */}
                <div className="absolute inset-5 sm:inset-6 border border-[#D6CBC0] pointer-events-none rounded-xs" />

                {/* 4 Corner Vintage Filigree SVGs */}
                <div className="absolute top-4 left-4 pointer-events-none text-[#C85A32]/70">
                  <svg className="w-7 h-7" viewBox="0 0 36 36" fill="none">
                    <path d="M3 33 V10 C3 6.13 6.13 3 10 3 H33" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M8 33 V13 C8 10.24 10.24 8 13 8 H33" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2"/>
                    <circle cx="10" cy="10" r="2.5" fill="currentColor"/>
                  </svg>
                </div>
                <div className="absolute top-4 right-4 pointer-events-none text-[#C85A32]/70">
                  <svg className="w-7 h-7" viewBox="0 0 36 36" fill="none">
                    <path d="M33 33 V10 C33 6.13 29.87 3 26 3 H3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M28 33 V13 C28 10.24 25.76 8 23 8 H3" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2"/>
                    <circle cx="26" cy="10" r="2.5" fill="currentColor"/>
                  </svg>
                </div>
                <div className="absolute bottom-4 left-4 pointer-events-none text-[#C85A32]/70">
                  <svg className="w-7 h-7" viewBox="0 0 36 36" fill="none">
                    <path d="M3 3 V26 C3 29.87 6.13 33 10 33 H33" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M8 3 V23 C8 25.76 10.24 28 13 28 H33" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2"/>
                    <circle cx="10" cy="26" r="2.5" fill="currentColor"/>
                  </svg>
                </div>
                <div className="absolute bottom-4 right-4 pointer-events-none text-[#C85A32]/70">
                  <svg className="w-7 h-7" viewBox="0 0 36 36" fill="none">
                    <path d="M33 3 V26 C33 29.87 29.87 33 26 33 H3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M28 3 V23 C28 25.76 25.76 28 23 28 H3" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2"/>
                    <circle cx="26" cy="26" r="2.5" fill="currentColor"/>
                  </svg>
                </div>
              </>
            )}

            {/* 2. Kraft Paper Postal Stitched Border */}
            {borderStyle === 'kraft' && (
              <>
                <div className="absolute inset-3 sm:inset-4 border-2 border-dashed border-[#BFA98F] pointer-events-none" />
                <div className="absolute inset-5 sm:inset-6 border border-[#D5C2A5]/60 pointer-events-none" />

                {/* Postal Cancellation Stamp Mark in Corner */}
                <div className="absolute top-5 right-7 pointer-events-none rotate-[-6deg] opacity-75">
                  <div className="border-2 border-[#A88B70] rounded-full px-2.5 py-1 text-[#A88B70] text-center font-mono text-[9px] uppercase tracking-wider">
                    <div>AIR MAIL · CULINARY</div>
                    <div className="border-t border-b border-[#A88B70] my-0.5 py-0.5 font-bold tracking-widest">
                      RECIPE POST
                    </div>
                    <div>★ VERIFIED ★</div>
                  </div>
                </div>
              </>
            )}

            {/* 3. Botanical Herb Frame */}
            {borderStyle === 'botanical' && (
              <>
                <div className="absolute inset-3 sm:inset-4 border-2 border-[#5F7A4D]/60 pointer-events-none" />
                <div className="absolute inset-5 sm:inset-6 border border-[#D1DCC8] pointer-events-none" />

                {/* 4 Botanical Leaves Corner SVGs */}
                <div className="absolute top-4 left-4 pointer-events-none text-[#5F7A4D]/80">
                  <svg className="w-8 h-8" viewBox="0 0 36 36" fill="none">
                    <path d="M4 32 C4 18 14 8 32 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M11 21 C7 18 7 14 11 12 C14 14 14 18 11 21 Z" fill="currentColor" opacity="0.6"/>
                    <path d="M20 12 C16 9 16 5 20 3 C24 5 24 9 20 12 Z" fill="currentColor" opacity="0.6"/>
                  </svg>
                </div>
                <div className="absolute top-4 right-4 pointer-events-none text-[#5F7A4D]/80">
                  <svg className="w-8 h-8 -scale-x-100" viewBox="0 0 36 36" fill="none">
                    <path d="M4 32 C4 18 14 8 32 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M11 21 C7 18 7 14 11 12 C14 14 14 18 11 21 Z" fill="currentColor" opacity="0.6"/>
                    <path d="M20 12 C16 9 16 5 20 3 C24 5 24 9 20 12 Z" fill="currentColor" opacity="0.6"/>
                  </svg>
                </div>
                <div className="absolute bottom-4 left-4 pointer-events-none text-[#5F7A4D]/80">
                  <svg className="w-8 h-8 -scale-y-100" viewBox="0 0 36 36" fill="none">
                    <path d="M4 32 C4 18 14 8 32 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M11 21 C7 18 7 14 11 12 C14 14 14 18 11 21 Z" fill="currentColor" opacity="0.6"/>
                    <path d="M20 12 C16 9 16 5 20 3 C24 5 24 9 20 12 Z" fill="currentColor" opacity="0.6"/>
                  </svg>
                </div>
                <div className="absolute bottom-4 right-4 pointer-events-none text-[#5F7A4D]/80">
                  <svg className="w-8 h-8 -scale-x-100 -scale-y-100" viewBox="0 0 36 36" fill="none">
                    <path d="M4 32 C4 18 14 8 32 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M11 21 C7 18 7 14 11 12 C14 14 14 18 11 21 Z" fill="currentColor" opacity="0.6"/>
                    <path d="M20 12 C16 9 16 5 20 3 C24 5 24 9 20 12 Z" fill="currentColor" opacity="0.6"/>
                  </svg>
                </div>
              </>
            )}

            {/* 4. Minimal Ink Double Border */}
            {borderStyle === 'minimal' && (
              <>
                <div className="absolute inset-3 sm:inset-4 border-2 border-neutral-900 pointer-events-none" />
                <div className="absolute inset-5 sm:inset-6 border border-neutral-300 pointer-events-none" />
              </>
            )}

            {/* ================= RECIPE SHEET CONTENT LAYER ================= */}
            <div className="relative z-10">

              {/* ================= HEADER SECTION ================= */}
              <div className="flex items-center justify-between border-b-2 border-[#C85A32]/70 pb-3 mb-5">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 text-white text-[10px] font-mono font-bold uppercase tracking-wider rounded-xs ${
                  borderStyle === 'botanical' ? 'bg-[#5F7A4D]' : borderStyle === 'minimal' ? 'bg-neutral-900' : 'bg-[#C85A32]'
                }`}>
                  RECIPE JOURNAL
                </span>
                <span className="text-xs text-[#7A7268] font-mono">
                  #{recipe.id.slice(-6).toUpperCase()}
                </span>
              </div>
              <div className="text-xs text-[#7A7268] flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>记录于：{recipe.review?.cookDate || recipe.createdAt}</span>
                {recipe.weatherStamp && (
                  <>
                    <span className="text-[#C85A32]">·</span>
                    <span>{recipe.weatherStamp}</span>
                  </>
                )}
              </div>
            </div>

            {/* Title & Mood Quote */}
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#7A7268] mb-1.5 font-serif">
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
                <div className="flex flex-wrap gap-1.5 mb-2.5">
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
                <div className="flex items-center gap-4 flex-wrap">
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

            {/* ================= DYNAMIC PHOTO GRID LAYOUT (大图焦点 / 多图拼贴 / 拍立得矩阵 / 胶卷连环) ================= */}
            {recipe.coverImage && (
              <div className="mb-6 print-avoid-break">
                {/* 1. HERO / 大图焦点模式 */}
                {photoLayout === 'hero' && (
                  <div className="flex justify-center">
                    <div className="bg-white p-2.5 pb-3 rounded-xl border border-[#EADBCE] shadow-sm max-w-xl w-full relative -rotate-0.5">
                      <div className="absolute -top-2 left-6 washi-tape px-4 py-0.5 bg-[#C85A32]/80 text-white text-[9px] font-mono tracking-widest uppercase">
                        POLAROID · 定妆大照
                      </div>

                      <div className="aspect-[21/9] w-full rounded-lg overflow-hidden bg-[#FAF7F2]">
                        <img
                          src={recipe.coverImage}
                          alt={recipe.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="mt-1.5 text-center text-[10px] text-[#7A7268] italic font-serif flex items-center justify-center gap-2">
                        <span>✨ 私房手作定妆照 · {recipe.title}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. COLLAGE / 多图拼贴模式 (杂志感错落主副图并置) */}
                {photoLayout === 'collage' && (
                  <div className="grid grid-cols-12 gap-3 items-stretch max-w-2xl mx-auto">
                    {/* Left large main photo */}
                    <div className="col-span-7 bg-white p-2.5 pb-3 rounded-xl border border-[#EADBCE] shadow-sm relative -rotate-1 flex flex-col">
                      <div className="absolute -top-2 left-5 washi-tape px-3 py-0.5 bg-[#C85A32] text-white text-[8px] font-mono uppercase">
                        MAIN DISH
                      </div>
                      <div className="aspect-[4/3] w-full rounded-lg overflow-hidden bg-[#FAF7F2] flex-1">
                        <img
                          src={recipe.coverImage}
                          alt={recipe.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[10px] text-center text-[#7A7268] mt-1.5 font-serif italic truncate">
                        定妆成菜 · {recipe.title}
                      </span>
                    </div>

                    {/* Right column: 2 auxiliary photos from steps or gallery */}
                    <div className="col-span-5 flex flex-col justify-between gap-2.5">
                      {/* Secondary photo 1 */}
                      <div className="bg-white p-2 pb-2.5 rounded-xl border border-[#EADBCE] shadow-xs relative rotate-1 flex-1 flex flex-col">
                        <div className="absolute -top-1.5 right-4 washi-tape px-2 py-0.5 bg-amber-600 text-white text-[7px] font-mono uppercase">
                          DETAIL
                        </div>
                        <div className="aspect-[16/9] w-full rounded-md overflow-hidden bg-[#FAF7F2] flex-1">
                          <img
                            src={
                              recipe.galleryPhotos?.[0] || 
                              recipe.steps.find((s) => s.photoUrl)?.photoUrl || 
                              recipe.coverImage
                            }
                            alt="精选特写"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-[9px] text-center text-[#7A7268] mt-1 font-serif">
                          火候特写 · 质感肌理
                        </span>
                      </div>

                      {/* Secondary photo 2 */}
                      <div className="bg-white p-2 pb-2.5 rounded-xl border border-[#EADBCE] shadow-xs relative -rotate-0.5 flex-1 flex flex-col">
                        <div className="aspect-[16/9] w-full rounded-md overflow-hidden bg-[#FAF7F2] flex-1">
                          <img
                            src={
                              recipe.galleryPhotos?.[1] || 
                              recipe.steps.filter((s) => s.photoUrl)[1]?.photoUrl || 
                              recipe.coverImage
                            }
                            alt="出锅花絮"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-[9px] text-center text-[#7A7268] mt-1 font-serif">
                          出锅热气 · 美味瞬间
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. POLAROID-GRID / 拍立得矩阵模式 (三连拍立得卡片手帐) */}
                {photoLayout === 'polaroid-grid' && (
                  <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto">
                    {/* Polaroid 1: Cover */}
                    <div className="bg-white p-2 pb-3 rounded-xl border border-[#EADBCE] shadow-sm transform -rotate-2">
                      <div className="washi-tape px-2 py-0.5 bg-[#C85A32]/80 text-white text-[8px] font-mono uppercase text-center mb-1">
                        SNAPSHOT 01
                      </div>
                      <div className="aspect-square w-full rounded-lg overflow-hidden bg-[#FAF7F2]">
                        <img
                          src={recipe.coverImage}
                          alt={recipe.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="block text-[10px] text-center text-[#5A5248] font-serif font-bold mt-1.5 truncate">
                        定妆定格
                      </span>
                    </div>

                    {/* Polaroid 2: Cooking in Action */}
                    <div className="bg-white p-2 pb-3 rounded-xl border border-[#EADBCE] shadow-sm transform rotate-1">
                      <div className="washi-tape px-2 py-0.5 bg-[#5F7A4D]/80 text-white text-[8px] font-mono uppercase text-center mb-1">
                        IN THE PAN
                      </div>
                      <div className="aspect-square w-full rounded-lg overflow-hidden bg-[#FAF7F2]">
                        <img
                          src={
                            recipe.steps.find((s) => s.photoUrl)?.photoUrl || 
                            recipe.galleryPhotos?.[0] || 
                            recipe.coverImage
                          }
                          alt="烹饪过程"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="block text-[10px] text-center text-[#5A5248] font-serif font-bold mt-1.5 truncate">
                        下锅微沸
                      </span>
                    </div>

                    {/* Polaroid 3: Plating / Table */}
                    <div className="bg-white p-2 pb-3 rounded-xl border border-[#EADBCE] shadow-sm transform -rotate-1">
                      <div className="washi-tape px-2 py-0.5 bg-[#C08A3E]/80 text-white text-[8px] font-mono uppercase text-center mb-1">
                        AT TABLE
                      </div>
                      <div className="aspect-square w-full rounded-lg overflow-hidden bg-[#FAF7F2]">
                        <img
                          src={
                            recipe.galleryPhotos?.[1] || 
                            recipe.steps.filter((s) => s.photoUrl)[1]?.photoUrl || 
                            recipe.coverImage
                          }
                          alt="餐桌食客"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="block text-[10px] text-center text-[#5A5248] font-serif font-bold mt-1.5 truncate">
                        食指大动
                      </span>
                    </div>
                  </div>
                )}

                {/* 4. FILMSTRIP / 复古胶卷连环画廊 */}
                {photoLayout === 'filmstrip' && (
                  <div className="bg-[#1C1815] text-[#ECE6DC] p-2.5 rounded-xl border border-stone-800 shadow-md max-w-2xl mx-auto">
                    {/* Sprocket holes top */}
                    <div className="flex justify-between items-center px-2 pb-2">
                      <div className="flex gap-2">
                        {Array.from({ length: 14 }).map((_, i) => (
                          <div key={i} className="w-2.5 h-1.5 bg-white/20 rounded-xs" />
                        ))}
                      </div>
                      <span className="text-[8px] font-mono tracking-widest opacity-60">KODAK 400 · RECIPE FILM</span>
                    </div>

                    {/* Film frames */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="aspect-[4/3] rounded overflow-hidden bg-stone-900 border border-white/10 relative">
                        <img
                          src={recipe.coverImage}
                          alt="帧1"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 px-1 bg-black/60 text-[8px] font-mono rounded">#01 成菜</span>
                      </div>
                      <div className="aspect-[4/3] rounded overflow-hidden bg-stone-900 border border-white/10 relative">
                        <img
                          src={
                            recipe.steps.find((s) => s.photoUrl)?.photoUrl || 
                            recipe.galleryPhotos?.[0] || 
                            recipe.coverImage
                          }
                          alt="帧2"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 px-1 bg-black/60 text-[8px] font-mono rounded">#02 火候</span>
                      </div>
                      <div className="aspect-[4/3] rounded overflow-hidden bg-stone-900 border border-white/10 relative">
                        <img
                          src={
                            recipe.galleryPhotos?.[1] || 
                            recipe.steps.filter((s) => s.photoUrl)[1]?.photoUrl || 
                            recipe.coverImage
                          }
                          alt="帧3"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 px-1 bg-black/60 text-[8px] font-mono rounded">#03 出锅</span>
                      </div>
                    </div>

                    {/* Sprocket holes bottom */}
                    <div className="flex justify-between items-center px-2 pt-2">
                      <span className="text-[8px] font-mono opacity-60">FRAME 24A • 25A • 26A</span>
                      <div className="flex gap-2">
                        {Array.from({ length: 14 }).map((_, i) => (
                          <div key={i} className="w-2.5 h-1.5 bg-white/20 rounded-xs" />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ================= SECTION 1: 食材清单与配比 ================= */}
            <div className="mb-6 print-avoid-break">
              <div className="flex items-center justify-between border-b-2 border-[#EADBCE] pb-1.5 mb-3">
                <h2 className="text-base font-bold font-journal-title text-[#2C2723] flex items-center gap-2">
                  <span>🛒 食材用量清单与配比</span>
                  <span className="text-xs font-normal text-[#7A7268] font-sans">
                    ({servings}人份用量)
                  </span>
                </h2>
                <span className="text-xs text-[#7A7268]">共 {recipe.ingredients.length} 种用料</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {/* Main ingredients */}
                {mainIngredients.length > 0 && (
                  <div className="bg-[#FAF7F2]/80 border border-[#EADBCE] rounded-lg p-3">
                    <div className="text-[11px] font-bold text-[#C85A32] uppercase tracking-wider mb-2 flex items-center gap-1.5">
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
                  <div className="bg-[#FAF7F2]/80 border border-[#EADBCE] rounded-lg p-3">
                    <div className="text-[11px] font-bold text-[#C08A3E] uppercase tracking-wider mb-2 flex items-center gap-1.5">
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
                  <div className="bg-[#FAF7F2]/80 border border-[#EADBCE] rounded-lg p-3">
                    <div className="text-[11px] font-bold text-[#5F7A4D] uppercase tracking-wider mb-2 flex items-center gap-1.5">
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

            {/* ================= SECTION 2: 烹饪步骤与时序 ================= */}
            <div className="mb-6">
              <div className="flex items-center justify-between border-b-2 border-[#EADBCE] pb-1.5 mb-4">
                <h2 className="text-base font-bold font-journal-title text-[#2C2723]">
                  🍳 烹饪步骤与时序清关
                </h2>
                <span className="text-xs text-[#7A7268]">共 {recipe.steps.length} 个步骤</span>
              </div>

              <div className="space-y-4">
                {recipe.steps.map((step, idx) => (
                  <div
                    key={step.id || idx}
                    className="p-3.5 bg-[#FAF7F2]/75 border border-[#EADBCE] rounded-xl print-avoid-break"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                          borderStyle === 'botanical' ? 'bg-[#5F7A4D]' : 'bg-[#C85A32]'
                        }`}>
                          {step.stepNumber || idx + 1}
                        </span>
                        <h3 className="font-bold text-[#2C2723] text-sm">
                          {step.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        {step.heat && (
                          <span className="px-2 py-0.5 rounded bg-white border border-[#EADBCE] text-[#C85A32] font-semibold text-[11px] flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            <span>{step.heat}</span>
                          </span>
                        )}
                        {step.durationMinutes && (
                          <span className="px-2 py-0.5 rounded bg-white border border-[#EADBCE] text-[#7A7268] font-mono text-[11px] flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#C85A32]" />
                            <span>{step.durationMinutes}分钟</span>
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
                          <strong className="font-semibold text-[#8C5D1E]">避坑要领: </strong>
                          <span>{step.tip}</span>
                        </div>
                      </div>
                    )}

                    {/* Step photo if enabled and available */}
                    {includeStepPhotos && step.photoUrl && (
                      <div className="mt-2.5 ml-7 max-w-sm">
                        <div className="aspect-[16/9] rounded-lg overflow-hidden border border-[#EADBCE] shadow-2xs">
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

            {/* ================= SECTION 3: 烹饪心得与手帐复盘 ================= */}
            {includeReview && recipe.review && (
              <div className="mb-6 p-4 sm:p-5 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl relative print-avoid-break">
                
                {/* Wax Seal Stamp in Top Right */}
                {includeStamps && (
                  <div className="absolute top-3 right-4 text-[#C85A32] pointer-events-none rotate-3">
                    <div className="seal-stamp text-[11px] font-bold tracking-wider">
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
                      <strong className="text-[#5F7A4D] block mb-0.5">🍷 绝佳搭档 (主食/佐餐饮品):</strong>
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
                          className="px-2 py-0.5 text-[11px] font-medium bg-white border border-[#EADBCE] text-[#2C2723] rounded-full shadow-2xs"
                        >
                          {stk}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ================= SECTION 4: 烹饪画廊相册花絮 ================= */}
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

            {/* ================= FOOTER COLOPHON ================= */}
            <div className="pt-6 border-t border-[#EADBCE] text-center text-xs text-[#9A9085] flex flex-col items-center gap-1">
              <span className="font-serif tracking-wider">—— 食味手记 · 私房烹饪手帐 ——</span>
              <span className="text-[10px]">记录每一次与美食相遇的幸福时光 · 宜烹饪 宜欢聚 · 打印导出时间：{new Date().toLocaleDateString('zh-CN')}</span>
            </div>

            </div>

          </div>

        </div>

        {/* Modal Bottom Tips */}
        <div className="px-5 py-3 bg-[#FAF7F2] border-t border-[#EADBCE] flex items-center justify-between text-xs text-[#7A7268] shrink-0">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-[#C85A32]" />
            <span>
              💡 打印贴士：点击「立即打印 / 另存为 PDF」后，目标打印机选择<strong>「另存为 PDF」</strong>即可将整篇带有手帐精美边框的排版保存为矢量文档。
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-[#EADBCE] bg-white hover:bg-[#FAF7F2] text-[#2C2723] font-medium transition-colors"
          >
            完成并关闭
          </button>
        </div>

      </div>
    </div>
  );
};
