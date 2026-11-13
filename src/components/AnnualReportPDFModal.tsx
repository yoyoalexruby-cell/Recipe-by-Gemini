import React, { useRef, useState } from 'react';
import { UserProfile } from '../types/auth';
import { Recipe } from '../types/recipe';
import { AnnualCookingStats } from '../utils/annualReviewStats';
import { ChefMedal } from '../utils/achievementService';
import { UserLevelInfo } from '../types/membership';
import { 
  Printer, Download, X, Check, Sparkles, Trophy, Award, 
  Calendar, Clock, Heart, Flame, BookOpen, Utensils, Star, 
  Layers, Tag, Info, AlertCircle 
} from 'lucide-react';
import { CategoryDonutChart, MonthlyLineChart, TopIngredientsList } from './AnnualReviewCharts';
import { toPng } from 'html-to-image';
import { useI18n } from '../i18n/context';

export interface AnnualReportPDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  stats: AnnualCookingStats;
  levelInfo: UserLevelInfo;
  medals: ChefMedal[];
  recipes: Recipe[];
}

export type ReportThemeMode = 'vintage' | 'kraft' | 'minimal';

export const AnnualReportPDFModal: React.FC<AnnualReportPDFModalProps> = ({
  isOpen,
  onClose,
  user,
  stats,
  levelInfo,
  medals,
  recipes
}) => {
  const { language } = useI18n();
  const [reportTheme, setReportTheme] = useState<ReportThemeMode>('vintage');
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  const reportSheetRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  const unlockedMedals = medals.filter((m) => m.isUnlocked);
  const displayMedals = medals; // show all medals with status

  // Print trigger using browser print dialog configured for vector PDF
  const handlePrint = () => {
    document.body.classList.remove('print-vintage', 'print-kraft', 'print-minimal-ink');
    if (reportTheme === 'minimal') {
      document.body.classList.add('print-minimal-ink');
    } else if (reportTheme === 'kraft') {
      document.body.classList.add('print-kraft');
    } else {
      document.body.classList.add('print-vintage');
    }

    window.print();

    setTimeout(() => {
      document.body.classList.remove('print-vintage', 'print-kraft', 'print-minimal-ink');
    }, 1200);
  };

  // Export long image
  const handleExportImage = async () => {
    if (!reportSheetRef.current) return;
    try {
      setIsExportingImage(true);
      const dataUrl = await toPng(reportSheetRef.current, {
        pixelRatio: 2,
        backgroundColor: reportTheme === 'kraft' ? '#F5EFEB' : reportTheme === 'minimal' ? '#FFFFFF' : '#FAF7F2',
        cacheBust: true
      });

      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `食味手记_${stats.year}年度烹饪手帐纪念版报告_${user.displayName}.png`;
      a.click();

      setExportSuccessMsg(language === 'zh-CN' ? '报告长图已成功保存！' : 'Report image saved successfully!');
      setTimeout(() => setExportSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Failed to export report image', err);
    } finally {
      setIsExportingImage(false);
    }
  };

  // Background styling based on selected theme
  const getThemeWrapperClass = () => {
    switch (reportTheme) {
      case 'kraft':
        return 'bg-[#F5EFEB] text-[#261910] border-[#D1C0A8]';
      case 'minimal':
        return 'bg-white text-black border-stone-300';
      default:
        return 'bg-[#FAF7F2] text-[#2C2723] border-[#EADBCE]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div 
        className="w-full max-w-4xl bg-[#FAF7F2] border border-[#EADBCE] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh] my-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Hidden in Print) */}
        <div className="px-4 sm:px-6 py-3.5 bg-white border-b border-[#EADBCE] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 no-print">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-[#C85A32]" />
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#2C2723] font-journal-title">
                {language === 'zh-CN' 
                  ? `${stats.year} 年度烹饪手帐纪念版 · 电子报告` 
                  : `${stats.year} Culinary Commemorative Report`}
              </h3>
              <p className="text-[10px] text-[#7A7268]">
                {language === 'zh-CN' ? '可直接打印或选择「另存为 PDF」永久珍藏' : 'Printable or exportable as vector PDF'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Theme switcher */}
            <div className="flex items-center bg-[#FAF7F2] p-1 rounded-xl border border-[#EADBCE] text-xs">
              <button
                type="button"
                onClick={() => setReportTheme('vintage')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  reportTheme === 'vintage' ? 'bg-[#C85A32] text-white' : 'text-[#7A7268] hover:text-[#2C2723]'
                }`}
              >
                {language === 'zh-CN' ? '复古和纸' : 'Vintage'}
              </button>
              <button
                type="button"
                onClick={() => setReportTheme('kraft')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  reportTheme === 'kraft' ? 'bg-[#B4846C] text-white' : 'text-[#7A7268] hover:text-[#2C2723]'
                }`}
              >
                {language === 'zh-CN' ? '牛皮纸' : 'Kraft'}
              </button>
              <button
                type="button"
                onClick={() => setReportTheme('minimal')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  reportTheme === 'minimal' ? 'bg-stone-800 text-white' : 'text-[#7A7268] hover:text-[#2C2723]'
                }`}
              >
                {language === 'zh-CN' ? '纯净省墨' : 'Minimal'}
              </button>
            </div>

            {/* Export PNG */}
            <button
              type="button"
              onClick={handleExportImage}
              disabled={isExportingImage}
              className="px-3 py-1.5 text-xs font-semibold text-[#5A5248] hover:text-[#2C2723] bg-white border border-[#EADBCE] rounded-xl transition-all shadow-2xs hover:bg-[#FAF7F2] flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>{isExportingImage ? '导出中...' : (language === 'zh-CN' ? '导出超清长图' : 'Export Image')}</span>
            </button>

            {/* Print / Save PDF Primary CTA */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs font-bold text-white bg-[#C85A32] hover:bg-[#B34C26] active:scale-98 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              title="在打印窗口选择「另存为 PDF」"
            >
              <Printer className="w-4 h-4" />
              <span>{language === 'zh-CN' ? '立即打印 / 存为 PDF' : 'Print / Save PDF'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#7A7268] hover:text-[#2C2723] hover:bg-[#FAF7F2] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Helpful Print Tip Bar (No Print) */}
        <div className="bg-[#FAF3EC] border-b border-[#EADBCE] px-4 sm:px-6 py-2 text-[11px] text-[#5A5248] flex items-center justify-between gap-2 shrink-0 no-print">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#C85A32] shrink-0" />
            <span>
              {language === 'zh-CN' 
                ? '打印提示：在浏览器弹出的打印窗口中，将「目标打印机」选择为「另存为 PDF」，并勾选「背景图形」，即可无损保存为矢量电子手帐报告。' 
                : 'Tip: In the print dialog, select "Save as PDF" as destination printer and enable "Background graphics" to export high-quality vector pages.'}
            </span>
          </div>
          {exportSuccessMsg && (
            <span className="text-emerald-700 font-bold flex items-center gap-1 shrink-0">
              <Check className="w-3 h-3" /> {exportSuccessMsg}
            </span>
          )}
        </div>

        {/* Scrollable Printable Document Container */}
        <div className="p-3 sm:p-6 overflow-y-auto flex-1 flex justify-center bg-stone-900/15">
          <div
            ref={reportSheetRef}
            id="annual-report-print-document"
            className={`w-full max-w-3xl rounded-2xl border-2 p-6 sm:p-10 space-y-8 relative paper-shadow bg-notebook-dots ${getThemeWrapperClass()}`}
          >
            {/* Top Washi Tape Strip */}
            <div className="text-center">
              <div className="inline-block washi-tape px-6 py-1 bg-[#C85A32] text-white text-xs font-mono font-bold tracking-widest uppercase rounded-xs shadow-xs">
                ★ 食味手记 · {stats.year} 年度烹饪手帐纪念版 · COMMEMORATIVE CULINARY REPORT ★
              </div>
            </div>

            {/* Document Header & Title */}
            <div className="text-center space-y-2 border-b border-[#EADBCE] pb-6">
              <span className="text-xs font-serif tracking-widest text-[#C85A32] uppercase block font-semibold">
                ANNUAL CHEF DOSSIER · {stats.year} 烟火手帐年鉴
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold font-journal-title text-[#2C2723] tracking-wide">
                “{stats.culinaryPersona.title}”
              </h1>
              <p className="text-xs sm:text-sm text-[#7A7268] font-serif max-w-xl mx-auto leading-relaxed">
                {stats.culinaryPersona.desc}
              </p>
            </div>

            {/* Chef Identity Card & Passport Stamp */}
            <div className="p-4 sm:p-5 bg-white/90 rounded-2xl border border-[#EADBCE] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-full border-2 border-[#C85A32] bg-[#FAF3EC] flex items-center justify-center text-3xl shrink-0 overflow-hidden shadow-xs">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{levelInfo.badge}</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold font-journal-title text-[#2C2723]">
                      {user.displayName}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      Lv.{levelInfo.level} {levelInfo.title}
                    </span>
                  </div>
                  <p className="text-xs text-[#7A7268] mt-0.5 font-mono">
                    主厨身份码：UID-{user.uid.slice(0, 10).toUpperCase()} · 经验成长：{levelInfo.currentExp} EXP
                  </p>
                </div>
              </div>

              {/* Passport Stamp */}
              <div className="w-24 h-12 border-2 border-dashed border-[#C85A32] text-[#C85A32] rounded-lg flex flex-col items-center justify-center text-center transform -rotate-2 shrink-0 select-none bg-[#FAF3EC]/60">
                <span className="text-[9px] font-bold tracking-widest font-mono uppercase">VERIFIED CHEF</span>
                <span className="text-xs font-bold font-serif">{stats.year} 年度认证</span>
              </div>
            </div>

            {/* 4 Big Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 bg-white/90 rounded-xl border border-[#EADBCE] shadow-2xs">
                <span className="text-xs text-[#7A7268] flex items-center gap-1.5 font-medium">
                  <BookOpen className="w-3.5 h-3.5 text-[#C85A32]" /> 年度收录菜谱
                </span>
                <div className="text-2xl font-bold font-journal-title text-[#C85A32] mt-1.5">
                  {stats.totalRecipes} <span className="text-xs font-normal text-[#7A7268]">篇</span>
                </div>
                <span className="text-[10px] text-[#9A9085]">私房菜谱与手作灵感</span>
              </div>

              <div className="p-4 bg-white/90 rounded-xl border border-[#EADBCE] shadow-2xs">
                <span className="text-xs text-[#7A7268] flex items-center gap-1.5 font-medium">
                  <Flame className="w-3.5 h-3.5 text-[#C85A32]" /> 累计下厨打卡
                </span>
                <div className="text-2xl font-bold font-journal-title text-[#C85A32] mt-1.5">
                  {stats.totalCookingSessions} <span className="text-xs font-normal text-[#7A7268]">次</span>
                </div>
                <span className="text-[10px] text-[#9A9085]">{stats.uniqueCookingDays} 个开火日子</span>
              </div>

              <div className="p-4 bg-white/90 rounded-xl border border-[#EADBCE] shadow-2xs">
                <span className="text-xs text-[#7A7268] flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#C85A32]" /> 厨房专注时光
                </span>
                <div className="text-2xl font-bold font-journal-title text-[#C85A32] mt-1.5">
                  {stats.totalCookHours} <span className="text-xs font-normal text-[#7A7268]">小时</span>
                </div>
                <span className="text-[10px] text-[#9A9085]">在柴米油盐中享受治愈</span>
              </div>

              <div className="p-4 bg-white/90 rounded-xl border border-[#EADBCE] shadow-2xs">
                <span className="text-xs text-[#7A7268] flex items-center gap-1.5 font-medium">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> 平均风味发挥
                </span>
                <div className="text-2xl font-bold font-journal-title text-[#C85A32] mt-1.5">
                  {stats.averageRating} <span className="text-xs font-normal text-[#7A7268]">★</span>
                </div>
                <span className="text-[10px] text-[#9A9085]">食客与家人的交口称赞</span>
              </div>
            </div>

            {/* SECTION 1: 个人年度厨神荣誉勋章殿堂 (Merges Medals Wall) */}
            <div className="p-5 sm:p-6 bg-gradient-to-br from-[#FAF3EC] via-[#FDFBF7] to-[#F5E6D8] rounded-2xl border-2 border-amber-300 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/80 pb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-600 fill-amber-500" />
                  <div>
                    <h3 className="text-base font-bold font-journal-title text-[#2C2723]">
                      个人年度厨神荣誉勋章殿堂
                    </h3>
                    <p className="text-[11px] text-[#7A7268]">
                      已点亮 {unlockedMedals.length} / {medals.length} 项厨神勋章 · 荣获【{levelInfo.title}】金牌荣誉认证
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-stone-950 font-mono shadow-xs self-start sm:self-auto">
                  CHEF HALL OF FAME
                </span>
              </div>

              {/* Medals Showcase Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {displayMedals.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3 rounded-xl border transition-all flex items-start gap-2.5 ${
                      m.isUnlocked 
                        ? 'bg-white border-amber-400 shadow-2xs' 
                        : 'bg-white/50 border-[#EADBCE] opacity-60'
                    }`}
                  >
                    <span className="text-2xl shrink-0 mt-0.5">{m.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-bold text-xs text-[#2C2723] truncate font-journal-title">
                          {m.name}
                        </h4>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-sm font-semibold uppercase ${
                          m.rarity === 'legendary' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                          m.rarity === 'epic' ? 'bg-purple-100 text-purple-900 border border-purple-300' :
                          m.rarity === 'rare' ? 'bg-blue-100 text-blue-900 border border-blue-300' :
                          'bg-stone-100 text-stone-700'
                        }`}>
                          {m.rarity === 'legendary' ? '传奇' : m.rarity === 'epic' ? '史诗' : m.rarity === 'rare' ? '稀有' : '荣誉'}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#7A7268] mt-0.5 line-clamp-2 leading-tight">
                        {m.description}
                      </p>
                      <div className="mt-1 flex items-center justify-between text-[9px]">
                        <span className={m.isUnlocked ? 'text-emerald-700 font-bold' : 'text-[#9A9085]'}>
                          {m.isUnlocked ? '✓ 认证点亮' : '挑战中'}
                        </span>
                        <span className="text-[#C85A32] font-mono font-semibold">+{m.expReward} EXP</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 2: 年度手帐数据深度可视化 (Merged Charts) */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-[#EADBCE] pb-2">
                <Utensils className="w-5 h-5 text-[#C85A32]" />
                <h3 className="text-base font-bold font-journal-title text-[#2C2723]">
                  年度手帐数据深度可视化与趋势
                </h3>
              </div>

              {/* Chart 1: Donut Category Distribution */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#2C2723]">
                    1. 菜品类型与风味分布（饼图分析）
                  </span>
                  {stats.topCategory && (
                    <span className="text-[#C85A32] font-semibold">
                      最佳主场：{stats.topCategory.label}
                    </span>
                  )}
                </div>
                <CategoryDonutChart data={stats.categoryDistribution} />
              </div>

              {/* Chart 2: Monthly Heat Line Chart */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#2C2723] block">
                  2. 12 个月做菜热度与烟火趋势折线图
                </span>
                <MonthlyLineChart data={stats.monthlyHeat} peakMonth={stats.peakMonth} />
              </div>

              {/* Chart 3: Top Ingredients Leaderboard */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#2C2723] block">
                  3. 最爱使用的食材排行榜 TOP 6
                </span>
                <TopIngredientsList ingredients={stats.topIngredients} />
              </div>
            </div>

            {/* SECTION 3: 年度高光私房菜谱精选 */}
            {stats.topDishes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#EADBCE] pb-2">
                  <h3 className="text-base font-bold font-journal-title text-[#2C2723] flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                    <span>年度高光私房菜谱精选</span>
                  </h3>
                  <span className="text-xs text-[#7A7268]">
                    综合评分与翻牌代表作
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {stats.topDishes.map((dish, i) => (
                    <div key={dish.id} className="p-3 bg-white/90 rounded-xl border border-[#EADBCE] shadow-2xs space-y-2">
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-[#FAF7F2]">
                        {dish.coverImage ? (
                          <img src={dish.coverImage} alt={dish.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">🍲</div>
                        )}
                        <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#C85A32] text-white">
                          TOP {i + 1}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-[#2C2723] truncate font-journal-title">
                          {dish.title}
                        </h4>
                        <div className="flex items-center justify-between text-[11px] text-[#7A7268] mt-1">
                          <span>{dish.category}</span>
                          <span className="text-amber-600 font-bold">★★★★★ {dish.rating}星</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Commemorative Seal & Endorsement Footer */}
            <div className="pt-6 border-t-2 border-[#EADBCE] flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center sm:text-left">
                <span className="font-journal-title font-bold text-sm text-[#2C2723] block">
                  食味手记 · 私房烹饪手帐本
                </span>
                <p className="text-xs text-[#7A7268] font-serif">
                  “人间烟火气，最抚凡人心” · 感谢这一年每一次灶火旁的温暖投入
                </p>
                <p className="text-[10px] text-[#9A9085] font-mono">
                  报告归档日期：{new Date().toISOString().slice(0, 10)} · 官方电子纪念认证
                </p>
              </div>

              {/* Vintage Seal Stamp */}
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#C85A32] text-[#C85A32] flex flex-col items-center justify-center text-center transform -rotate-6 select-none bg-[#FAF3EC]/80 shrink-0">
                <span className="text-[8px] font-bold tracking-widest font-mono uppercase">CERTIFIED</span>
                <span className="text-sm font-bold font-serif">{stats.year}</span>
                <span className="text-[9px] font-bold">主厨终身纪念</span>
                <span className="text-[8px]">★★★★★</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
