import React, { useState } from 'react';
import {
  X,
  Download,
  Check,
  Sparkles,
  Image as ImageIcon,
  Smartphone,
  Globe,
  DollarSign,
  Layers
} from 'lucide-react';

import iconTerracottaPot from '../assets/images/icon_terracotta_pot_1794551805421.jpg';
import iconScrapbookRecipe from '../assets/images/icon_scrapbook_recipe_1794551807245.jpg';
import iconMinimalBowl from '../assets/images/icon_minimal_bowl_1794551809126.jpg';
import screenshotJournalHome from '../assets/images/screenshot_journal_home_1794551811916.jpg';
import screenshotCookingWorkbench from '../assets/images/screenshot_cooking_workbench_1794551814868.jpg';
import screenshotAnnualMedals from '../assets/images/screenshot_annual_medals_1794551814179.jpg';

interface AppStoreAssetsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface IconCandidate {
  id: string;
  titleZh: string;
  titleEn: string;
  descZh: string;
  src: string;
  cropScale: number;
  bgFallback: string;
  recommended?: boolean;
}

interface ScreenshotSlide {
  id: string;
  badgeEn: string;
  badgeZh: string;
  headlineEn: string;
  headlineZh: string;
  subEn: string;
  subZh: string;
  imageSrc: string;
  theme: 'light' | 'dark';
  cropTopRatio: number;
  cropBottomRatio: number;
}

const ICON_CANDIDATES: IconCandidate[] = [
  {
    id: 'terracotta-pot',
    titleZh: '方案 A · 暖柿珐琅炖锅（主推）',
    titleEn: 'Option A · Simmering Terracotta Pot',
    descZh: '高辨识度暖橘珐琅锅配心形炊烟，在小尺寸 iPhone 桌面视觉最醒目、温暖治愈。',
    src: iconTerracottaPot,
    cropScale: 1.04,
    bgFallback: '#FAF3EC',
    recommended: true
  },
  {
    id: 'scrapbook-notebook',
    titleZh: '方案 B · 亚麻缝线食谱手帐本',
    titleEn: 'Option B · Linen Recipe Notebook',
    descZh: '亚麻布面装帧配木勺与迷迭香，突出「私房手帐记录与食谱收藏」核心定位。',
    src: iconScrapbookRecipe,
    cropScale: 1.02,
    bgFallback: '#EADBC8'
  },
  {
    id: 'ceramic-bowl',
    titleZh: '方案 C · 深咖暖汤手作陶碗',
    titleEn: 'Option C · Espresso & Ceramic Bowl',
    descZh: '深烘焙咖啡底色衬托暖釉陶碗与木筷，在浅色手机壁纸上对比度极强、质感高级。',
    src: iconMinimalBowl,
    cropScale: 1.22,
    bgFallback: '#2C2723'
  }
];

const SCREENSHOT_SLIDES: ScreenshotSlide[] = [
  {
    id: 'slide-1-journal',
    badgeEn: 'COZY RECIPE SCRAPBOOK',
    badgeZh: '私房烹饪手帐本',
    headlineEn: 'Preserve Every Home-Cooked Memory',
    headlineZh: '把每一顿热气腾腾，写成私房手帐',
    subEn: 'Organize ingredients, heat levels & tasting notes offline',
    subZh: '详尽记录食材配比、火候时序与复盘心得，断网亦可随时翻阅',
    imageSrc: screenshotJournalHome,
    theme: 'light',
    cropTopRatio: 0.16,
    cropBottomRatio: 0.92
  },
  {
    id: 'slide-2-workbench',
    badgeEn: 'HANDS-FREE KITCHEN MODE',
    badgeZh: '沉浸式下厨工作台',
    headlineEn: 'Step-by-Step Timers & Voice Control',
    headlineZh: '备料打勾 · 火候计时 · 语音免触伴厨',
    subEn: 'Navigate steps hands-free even with wet or floury hands',
    subZh: '双手沾水沾面也能语音切换步骤，从容掌控每一道关键火候',
    imageSrc: screenshotCookingWorkbench,
    theme: 'dark',
    cropTopRatio: 0.05,
    cropBottomRatio: 0.94
  },
  {
    id: 'slide-3-annual',
    badgeEn: 'CHEF MEDALS & YEAR IN REVIEW',
    badgeZh: '年度烹饪回顾与勋章墙',
    headlineEn: 'Visualize Your Culinary Journey',
    headlineZh: '年度做菜大数据与荣誉厨神海报',
    subEn: 'Unlock 12 chef medals & export printable PDF cookbooks',
    subZh: '生成月度下厨热度图表、点亮12枚厨神勋章并导出纪念版 PDF',
    imageSrc: screenshotAnnualMedals,
    theme: 'light',
    cropTopRatio: 0.10,
    cropBottomRatio: 0.88
  }
];

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export const AppStoreAssetsModal: React.FC<AppStoreAssetsModalProps> = ({ isOpen, onClose }) => {
  const [captionLang, setCaptionLang] = useState<'en' | 'zh'>('en');
  const [targetResolution, setTargetResolution] = useState<'1290x2796' | '1242x2688'>('1290x2796');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const notify = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  /**
   * Export exact 1024x1024 RGB PNG (no alpha channel — required by Apple App Store Connect)
   */
  const handleDownloadAppIcon = async (candidate: IconCandidate) => {
    try {
      setDownloadingId(candidate.id);
      const img = await loadImageElement(candidate.src);
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;

      // Solid opaque background fill so zero transparency exists
      ctx.fillStyle = candidate.bgFallback;
      ctx.fillRect(0, 0, 1024, 1024);

      const scale = candidate.cropScale;
      const drawW = 1024 * scale;
      const drawH = 1024 * scale;
      const offsetX = (1024 - drawW) / 2;
      const offsetY = (1024 - drawH) / 2;
      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `CulinaryJournal-AppIcon-1024x1024-${candidate.id}.png`;
      a.click();
      notify(`已导出 1024×1024 无透明通道苹果标准图标 (${candidate.titleZh})`);
    } catch (err) {
      console.error('Icon export error', err);
    } finally {
      setDownloadingId(null);
    }
  };

  /**
   * Export exact 1290x2796 (6.7"/6.9") or 1242x2688 (6.5") App Store Connect Screenshot PNG
   */
  const handleDownloadScreenshot = async (slide: ScreenshotSlide, index: number) => {
    try {
      setDownloadingId(slide.id);
      const img = await loadImageElement(slide.imageSrc);
      const [W, H] = targetResolution === '1290x2796' ? [1290, 2796] : [1242, 2688];

      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;

      // 1. Studio Backdrop
      if (slide.theme === 'dark') {
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#2C2723');
        grad.addColorStop(1, '#1E1A17');
        ctx.fillStyle = grad;
      } else {
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#FAF7F2');
        grad.addColorStop(1, '#EFE5D8');
        ctx.fillStyle = grad;
      }
      ctx.fillRect(0, 0, W, H);

      // 2. Top Editorial Copy Block
      const isEn = captionLang === 'en';
      const badge = isEn ? slide.badgeEn : slide.badgeZh;
      const headline = isEn ? slide.headlineEn : slide.headlineZh;
      const sub = isEn ? slide.subEn : slide.subZh;

      ctx.textAlign = 'center';
      ctx.fillStyle = slide.theme === 'dark' ? '#F4A261' : '#C85A32';
      ctx.font = `700 ${Math.round(W * 0.028)}px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif`;
      ctx.fillText(`CULINARY JOURNAL · ${badge}`, W / 2, Math.round(H * 0.068));

      // Headline (auto two-line wrap if needed)
      ctx.fillStyle = slide.theme === 'dark' ? '#FAF7F2' : '#2C2723';
      const headlineFontPx = isEn ? Math.round(W * 0.056) : Math.round(W * 0.058);
      ctx.font = `800 ${headlineFontPx}px -apple-system, BlinkMacSystemFont, "PingFang SC", Georgia, serif`;

      const maxTextWidth = W * 0.86;
      const words = isEn ? headline.split(' ') : headline.split('');
      const lines: string[] = [];
      let currentLine = '';
      for (const token of words) {
        const sep = isEn && currentLine ? ' ' : '';
        const testLine = currentLine + sep + token;
        if (ctx.measureText(testLine).width > maxTextWidth && currentLine) {
          lines.push(currentLine);
          currentLine = token;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);

      let yCursor = Math.round(H * 0.118);
      for (const line of lines.slice(0, 2)) {
        ctx.fillText(line, W / 2, yCursor);
        yCursor += Math.round(headlineFontPx * 1.28);
      }

      // Subtitle
      ctx.fillStyle = slide.theme === 'dark' ? '#D6CBC0' : '#6E655C';
      ctx.font = `500 ${Math.round(W * 0.031)}px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif`;
      ctx.fillText(sub, W / 2, yCursor + Math.round(H * 0.01));

      // 3. Framed App UI Card Below
      const cardX = Math.round(W * 0.075);
      const cardY = Math.round(H * 0.235);
      const cardW = W - cardX * 2;
      const cardH = H - cardY - Math.round(H * 0.045);
      const radius = Math.round(W * 0.052);

      // Soft shadow
      ctx.save();
      ctx.shadowColor = 'rgba(20, 15, 10, 0.28)';
      ctx.shadowBlur = 56;
      ctx.shadowOffsetY = 24;
      drawRoundedRectPath(ctx, cardX, cardY, cardW, cardH, radius);
      ctx.fillStyle = '#FAF7F2';
      ctx.fill();
      ctx.restore();

      // Clip inside rounded device viewport and draw cropped clean UI region
      ctx.save();
      drawRoundedRectPath(ctx, cardX, cardY, cardW, cardH, radius);
      ctx.clip();

      const sy = Math.round(img.height * slide.cropTopRatio);
      const sh = Math.round(img.height * (slide.cropBottomRatio - slide.cropTopRatio));
      const sx = Math.round(img.width * 0.08);
      const sw = Math.round(img.width * 0.84);
      ctx.drawImage(img, sx, sy, sw, sh, cardX, cardY, cardW, cardH);
      ctx.restore();

      // Subtle hairline frame
      ctx.save();
      drawRoundedRectPath(ctx, cardX, cardY, cardW, cardH, radius);
      ctx.lineWidth = 4;
      ctx.strokeStyle = slide.theme === 'dark' ? 'rgba(255,255,255,0.16)' : 'rgba(44,39,35,0.10)';
      ctx.stroke();
      ctx.restore();

      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `AppStore-Screenshot-0${index + 1}-${captionLang.toUpperCase()}-${targetResolution}.png`;
      a.click();
      notify(`已导出第 ${index + 1} 张过审尺寸截图 (${targetResolution} px)`);
    } catch (err) {
      console.error('Screenshot export error', err);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadAllScreenshots = async () => {
    for (let i = 0; i < SCREENSHOT_SLIDES.length; i++) {
      await handleDownloadScreenshot(SCREENSHOT_SLIDES[i], i);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-xs overflow-y-auto no-print"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF7F2] border border-[#EADBCE] rounded-2xl shadow-2xl w-full max-w-5xl my-4 flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-white border-b border-[#EADBCE] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C85A32]/10 border border-[#C85A32]/25 flex items-center justify-center text-[#C85A32]">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-journal-title text-[#2C2723]">
                App Store 专属图标库、过审截图与定价指南
              </h2>
              <p className="text-xs text-[#7A7268]">
                一键导出 1024×1024 无透明通道图标与 1290×2796 官方标准尺寸宣传图
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#7A7268] hover:text-[#2C2723] rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Feedback */}
        {toastMsg && (
          <div className="mx-6 mt-4 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900 flex items-center gap-2 shrink-0">
            <Check className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-8 text-xs sm:text-sm">
          {/* PART 1: 3 APP ICON CANDIDATES */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#EADBCE] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#2C2723]">
                  01. 三款专属 App 图标候选（自动转换 1024×1024 零透明通道 PNG）
                </h3>
                <p className="text-xs text-[#7A7268] mt-0.5">
                  苹果要求上传直角正方形且不含透明通道（RGB）的 1024×1024 PNG，iOS 系统会自动裁切圆角。
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {ICON_CANDIDATES.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-[#EADBCE] rounded-2xl p-5 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    {/* Dual Preview: iOS Squircle Preview + Full Square */}
                    <div className="flex items-center justify-center gap-4 py-3 bg-[#FAF7F2] rounded-xl border border-[#F0E6DC]">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-24 h-24 rounded-[22%] overflow-hidden shadow-md border border-black/5 bg-[#FAF3EC]">
                          <img
                            src={item.src}
                            alt={item.titleZh}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                            style={{ transform: `scale(${item.cropScale})` }}
                          />
                        </div>
                        <span className="text-[11px] text-[#7A7268]">iPhone 桌面圆角预览</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs text-[#C85A32] font-medium">
                        {item.recommended ? '主推高转化视觉 · ' : ''}1024 × 1024 px
                      </div>
                      <h4 className="font-bold text-sm text-[#2C2723]">{item.titleZh}</h4>
                      <p className="text-xs text-[#5A5248] leading-relaxed">{item.descZh}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownloadAppIcon(item)}
                    disabled={downloadingId === item.id}
                    className="w-full py-2.5 px-4 bg-[#2C2723] hover:bg-[#3E3731] text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 min-h-[44px] whitespace-nowrap"
                  >
                    <Download className="w-4 h-4 text-amber-300" />
                    <span>
                      {downloadingId === item.id ? '正在渲染导出...' : '下载 1024×1024 标准图标'}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* PART 2: APP STORE SCREENSHOTS */}
          <section className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#EADBCE] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#2C2723]">
                  02. App Store 预览宣传图（精准适配苹果审核像素尺寸）
                </h3>
                <p className="text-xs text-[#7A7268] mt-0.5">
                  可切换英文版（推荐海外主语言）或中文版标题海报，导出的 PNG 像素严格符合 App Store Connect 校验要求。
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Language Switcher */}
                <div className="flex items-center gap-1 p-1 bg-[#EFE7DC] rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setCaptionLang('en')}
                    className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap ${
                      captionLang === 'en' ? 'bg-white text-[#2C2723] font-semibold shadow-2xs' : 'text-[#5A5248]'
                    }`}
                  >
                    English 海外版
                  </button>
                  <button
                    type="button"
                    onClick={() => setCaptionLang('zh')}
                    className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap ${
                      captionLang === 'zh' ? 'bg-white text-[#2C2723] font-semibold shadow-2xs' : 'text-[#5A5248]'
                    }`}
                  >
                    中文海报版
                  </button>
                </div>

                {/* Resolution Switcher */}
                <select
                  value={targetResolution}
                  onChange={(e) => setTargetResolution(e.target.value as '1290x2796' | '1242x2688')}
                  className="px-3 py-2 bg-white border border-[#EADBCE] rounded-xl text-xs font-semibold text-[#2C2723]"
                >
                  <option value="1290x2796">1290 × 2796 (6.7"/6.9" 标准)</option>
                  <option value="1242x2688">1242 × 2688 (6.5" 兼容)</option>
                </select>

                <button
                  type="button"
                  onClick={handleDownloadAllScreenshots}
                  className="px-3.5 py-2 bg-[#C85A32] hover:bg-[#B34C26] text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap min-h-[38px]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>一键下载全套 3 张</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {SCREENSHOT_SLIDES.map((slide, idx) => {
                const isEn = captionLang === 'en';
                const isDark = slide.theme === 'dark';
                return (
                  <div
                    key={slide.id}
                    className="bg-white border border-[#EADBCE] rounded-2xl p-4 flex flex-col justify-between gap-3"
                  >
                    {/* Visual Poster Preview */}
                    <div
                      className={`rounded-xl p-4 pb-0 overflow-hidden border flex flex-col items-center text-center aspect-[9/19.5] justify-between ${
                        isDark
                          ? 'bg-gradient-to-b from-[#2C2723] to-[#1E1A17] border-[#3E3731] text-[#FAF7F2]'
                          : 'bg-gradient-to-b from-[#FAF7F2] to-[#EFE5D8] border-[#EADBCE] text-[#2C2723]'
                      }`}
                    >
                      <div className="pt-2 px-1 space-y-1">
                        <div className={`text-[10px] font-bold tracking-wider ${isDark ? 'text-amber-300' : 'text-[#C85A32]'}`}>
                          {isEn ? slide.badgeEn : slide.badgeZh}
                        </div>
                        <h4 className="text-sm font-bold font-journal-title leading-snug text-balance">
                          {isEn ? slide.headlineEn : slide.headlineZh}
                        </h4>
                        <p className={`text-[11px] leading-tight ${isDark ? 'text-stone-300' : 'text-[#6E655C]'}`}>
                          {isEn ? slide.subEn : slide.subZh}
                        </p>
                      </div>

                      <div className="w-[88%] h-[74%] rounded-t-2xl overflow-hidden shadow-xl border-x border-t border-black/10 bg-[#FAF7F2] mt-3">
                        <img
                          src={slide.imageSrc}
                          alt={slide.headlineZh}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDownloadScreenshot(slide, idx)}
                      disabled={downloadingId === slide.id}
                      className="w-full py-2.5 px-3 bg-[#FAF7F2] hover:bg-[#EFE7DC] border border-[#EADBCE] text-[#2C2723] rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 min-h-[42px] whitespace-nowrap"
                    >
                      <Download className="w-3.5 h-3.5 text-[#C85A32]" />
                      <span>
                        导出图 {idx + 1} ({targetResolution})
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* PART 3: COMMERCIAL PRICING STRATEGY SUMMARY */}
          <section className="bg-white border border-[#EADBCE] rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#F0E6DC] pb-3">
              <DollarSign className="w-4 h-4 text-[#5F7A4D]" />
              <h3 className="text-base font-bold text-[#2C2723]">
                03. 海外 App Store 定价与变现黄金方案（推荐：免费下载 + Pro 内购解锁）
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl space-y-1.5">
                <div className="text-[#5F7A4D] font-bold">第一阶段（首版冷启动）· 强烈推荐</div>
                <div className="text-sm font-bold text-[#2C2723]">$0.00 免费下载上架</div>
                <p className="text-[#5A5248] leading-relaxed">
                  首版勾选 Free（免费）上线：1) 免签复杂银行卡税表即可最快过审发布；2) 零门槛获取海外首批真实下载、评分与种子手帐用户（付费下载新 App 转化率通常不足免费的 3%）。
                </p>
              </div>

              <div className="p-4 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl space-y-1.5">
                <div className="text-[#C85A32] font-bold">第二阶段（1.1 版本加内购）· 核心营收</div>
                <div className="text-sm font-bold text-[#2C2723]">Freemium 订阅 + 买断双轨制</div>
                <p className="text-[#5A5248] leading-relaxed">
                  基础记菜谱免费（如限 15 篇手帐），解锁 <strong>Culinary Pro 主厨会员</strong>：月付 <strong>$1.99/月</strong> · 年付 <strong>$12.99/年</strong> · 终身买断 <strong>$24.99</strong>（解锁无限私房菜谱、高清纪念版 PDF 导出、20款限定主厨皮肤与云同步）。
                </p>
              </div>

              <div className="p-4 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl space-y-1.5">
                <div className="text-[#2C2723] font-bold">苹果抽成减半红利（必领）</div>
                <div className="text-sm font-bold text-[#2C2723]">15% 小型企业计划佣金</div>
                <p className="text-[#5A5248] leading-relaxed">
                  账号开通后报名 Apple Small Business Program（年营收百万美元以内自动获批），苹果内购抽成直接从 30% 降至 <strong>15%</strong>，每卖出一份 $24.99 终身会员你可净拿约 ¥150 元！
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
