import React, { useState, useMemo } from 'react';
import { Recipe } from '../types/recipe';
import { UserProfile } from '../types/auth';
import { UserLevelInfo } from '../types/membership';
import { ChefMedal } from '../utils/achievementService';
import { getCookingRecords } from '../utils/cookingLogStorage';
import { 
  getAvailableCookingYears, 
  calculateAnnualCookingStats 
} from '../utils/annualReviewStats';
import { 
  CategoryDonutChart, 
  MonthlyLineChart, 
  TopIngredientsList 
} from './AnnualReviewCharts';
import { AnnualPosterModal } from './AnnualPosterModal';
import { AnnualReportPDFModal } from './AnnualReportPDFModal';
import { 
  Sparkles, Trophy, Calendar, Clock, Flame, 
  Award, Heart, Share2, Download, ArrowRight, Utensils, BookOpen, Printer, FileText 
} from 'lucide-react';
import { useI18n } from '../i18n/context';

interface AnnualReviewViewProps {
  user: UserProfile;
  recipes: Recipe[];
  levelInfo: UserLevelInfo;
  medals: ChefMedal[];
  onOpenMedalsWall?: () => void;
  onNavigateToNewRecipe?: () => void;
}

export const AnnualReviewView: React.FC<AnnualReviewViewProps> = ({
  user,
  recipes,
  levelInfo,
  medals,
  onOpenMedalsWall,
  onNavigateToNewRecipe
}) => {
  const { language, getCategoryLabel } = useI18n();

  // Cooking records from local storage
  const cookingRecords = useMemo(() => getCookingRecords(user, recipes), [user, recipes]);

  // Available years
  const availableYears = useMemo(
    () => getAvailableCookingYears(recipes, cookingRecords),
    [recipes, cookingRecords]
  );

  const [selectedYear, setSelectedYear] = useState<string>(availableYears[0] || '2026');
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);
  const [isReportPDFModalOpen, setIsReportPDFModalOpen] = useState(false);

  // Compute stats for chosen year
  const stats = useMemo(
    () => calculateAnnualCookingStats(recipes, cookingRecords, selectedYear, language, getCategoryLabel),
    [recipes, cookingRecords, selectedYear, language, getCategoryLabel]
  );

  const unlockedMedals = useMemo(() => medals.filter((m) => m.isUnlocked), [medals]);

  return (
    <div className="space-y-6 animate-fade-in pb-4">
      {/* Year Selection Strip & Poster Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white/90 rounded-2xl border border-[#EADBCE]">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs font-semibold text-[#7A7268] shrink-0 mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>{language === 'zh-CN' ? '盘点年度：' : 'Select Year:'}</span>
          </span>
          {availableYears.map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => setSelectedYear(year)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedYear === year
                  ? 'bg-[#C85A32] text-white shadow-2xs'
                  : 'bg-[#FAF7F2] text-[#7A7268] hover:text-[#2C2723] border border-[#EADBCE]'
              }`}
            >
              {year}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSelectedYear('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              selectedYear === 'all'
                ? 'bg-[#C85A32] text-white shadow-2xs'
                : 'bg-[#FAF7F2] text-[#7A7268] hover:text-[#2C2723] border border-[#EADBCE]'
            }`}
          >
            {language === 'zh-CN' ? '全部历年' : 'All Years'}
          </button>
        </div>

        {/* Generate Poster and Commemorative PDF CTAs */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => setIsReportPDFModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-[#FAF7F2] hover:bg-white text-[#C85A32] border border-[#C85A32]/60 hover:border-[#C85A32] text-xs font-bold rounded-xl shadow-2xs hover:shadow-xs transition-all shrink-0 active:scale-98"
            title="生成排版好的年度完整手帐报告，可打印或导出为PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{language === 'zh-CN' ? '下载年度烹饪纪念版 PDF' : 'Download Commemorative PDF'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPosterModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-[#C85A32] to-[#B34C26] hover:from-[#B34C26] hover:to-[#9B3D1B] text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all shrink-0 active:scale-98"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'zh-CN' ? '生成年度数据海报 (PNG)' : 'Generate Chef Poster'}</span>
          </button>
        </div>
      </div>

      {/* Culinary Persona Banner */}
      <div className="relative overflow-hidden p-5 sm:p-6 bg-gradient-to-br from-[#3D261A] via-[#2C2723] to-[#1F1B18] text-amber-50 rounded-3xl shadow-lg border border-amber-500/25">
        <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 opacity-15 pointer-events-none">
          <Trophy className="w-48 h-48 text-amber-300" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono tracking-wider">
                {selectedYear === 'all' ? 'LIFETIME REVIEW' : `${selectedYear} ANNUAL FLAVOR`}
              </span>
              <span className="text-xs text-amber-200/80">
                {language === 'zh-CN' ? '年度烹饪手帐画像' : 'Annual Chef Persona'}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold font-journal-title text-amber-100 flex items-center gap-2">
              <span>{stats.culinaryPersona.icon}</span>
              <span>“{stats.culinaryPersona.title}”</span>
            </h3>

            <p className="text-xs text-amber-200/70 font-serif leading-relaxed">
              {stats.culinaryPersona.desc}
            </p>
          </div>

          <div className="shrink-0 flex sm:flex-col gap-2">
            <button
              type="button"
              onClick={() => setIsReportPDFModalOpen(true)}
              className="px-4 py-2 bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/40 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-xs"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>{language === 'zh-CN' ? '纪念版手帐 PDF' : 'Annual PDF Report'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsPosterModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs"
            >
              <Award className="w-4 h-4 text-stone-900" />
              <span>{language === 'zh-CN' ? '查看年度海报' : 'View Data Poster'}</span>
            </button>
            {onOpenMedalsWall && (
              <button
                type="button"
                onClick={onOpenMedalsWall}
                className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-amber-200 rounded-xl transition-colors text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <span>{language === 'zh-CN' ? '荣誉勋章殿堂' : 'Medal Wall'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4 Big Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white rounded-2xl border border-[#EADBCE] shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-[#7A7268] flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>{language === 'zh-CN' ? '年度收录手帐' : 'Recipes Logged'}</span>
          </span>
          <div className="text-2xl font-bold font-journal-title text-[#C85A32]">
            {stats.totalRecipes} <span className="text-xs font-normal text-[#7A7268]">{language === 'zh-CN' ? '篇' : 'dishes'}</span>
          </div>
          <span className="text-[10px] text-[#9A9085]">
            {language === 'zh-CN' ? '私房菜谱与手作灵感' : 'Private culinary journals'}
          </span>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-[#EADBCE] shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-[#7A7268] flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>{language === 'zh-CN' ? '累计下厨打卡' : 'Cooking Sessions'}</span>
          </span>
          <div className="text-2xl font-bold font-journal-title text-[#C85A32]">
            {stats.totalCookingSessions} <span className="text-xs font-normal text-[#7A7268]">{language === 'zh-CN' ? '次' : 'cooks'}</span>
          </div>
          <span className="text-[10px] text-[#9A9085]">
            {language === 'zh-CN' ? `${stats.uniqueCookingDays} 个烟火蒸腾的开火日` : `${stats.uniqueCookingDays} active cooking days`}
          </span>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-[#EADBCE] shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-[#7A7268] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>{language === 'zh-CN' ? '厨房专注时光' : 'Cooking Hours'}</span>
          </span>
          <div className="text-2xl font-bold font-journal-title text-[#C85A32]">
            {stats.totalCookHours} <span className="text-xs font-normal text-[#7A7268]">{language === 'zh-CN' ? '小时' : 'hrs'}</span>
          </div>
          <span className="text-[10px] text-[#9A9085]">
            {language === 'zh-CN' ? '在柴米油盐中享受治愈' : 'Invested in handcrafted food'}
          </span>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-[#EADBCE] shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-[#7A7268] flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>{language === 'zh-CN' ? '平均美味发挥' : 'Average Rating'}</span>
          </span>
          <div className="text-2xl font-bold font-journal-title text-[#C85A32]">
            {stats.averageRating} <span className="text-xs font-normal text-[#7A7268]">★</span>
          </div>
          <span className="text-[10px] text-[#9A9085]">
            {language === 'zh-CN' ? '来自自己与食客的盛赞' : 'High quality culinary rating'}
          </span>
        </div>
      </div>

      {/* Visual Chart 1: Donut Category Distribution */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-[#2C2723] flex items-center gap-1.5">
            <Utensils className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>{language === 'zh-CN' ? '菜品类型与风味分布（饼图分析）' : 'Dish Category & Cuisine Distribution (Donut Chart)'}</span>
          </h4>
          {stats.topCategory && (
            <span className="text-[11px] font-semibold text-[#C85A32]">
              {language === 'zh-CN' ? `最佳主场：${stats.topCategory.label}` : `Favorite: ${stats.topCategory.label}`}
            </span>
          )}
        </div>
        <CategoryDonutChart data={stats.categoryDistribution} />
      </div>

      {/* Visual Chart 2: Annual Monthly Cooking Heat Line Chart */}
      <MonthlyLineChart data={stats.monthlyHeat} peakMonth={stats.peakMonth} />

      {/* Visual Chart 3: Top Ingredients Leaderboard */}
      <TopIngredientsList ingredients={stats.topIngredients} />

      {/* Unlocked Medals Highlight Section */}
      <div className="p-4 bg-gradient-to-br from-[#FAF3EC] to-[#F5E6D8] rounded-2xl border border-amber-300 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-600 fill-amber-500" />
            <h4 className="text-xs font-bold text-[#2C2723]">
              {language === 'zh-CN' ? '个人年度厨神勋章认证' : 'Personal Annual Chef Medals'}
            </h4>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
            {unlockedMedals.length} / {medals.length} {language === 'zh-CN' ? '已达成' : 'Unlocked'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {medals.slice(0, 4).map((m) => (
            <div
              key={m.id}
              className={`p-2.5 rounded-xl border text-xs flex items-center gap-2.5 transition-all ${
                m.isUnlocked 
                  ? 'bg-white border-amber-400 shadow-xs' 
                  : 'bg-white/50 border-[#EADBCE] opacity-60'
              }`}
            >
              <span className="text-2xl shrink-0">{m.icon}</span>
              <div className="min-w-0">
                <div className="font-bold text-[#2C2723] text-xs truncate font-journal-title">
                  {m.name}
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 block">
                  {m.isUnlocked ? '✓ 荣誉已点亮' : '进行中'}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-1 flex items-center justify-between text-xs text-[#7A7268]">
          <span>
            {language === 'zh-CN' 
              ? '所有已点亮勋章已同步刻印至个人年度数据海报中'
              : 'All unlocked medals are permanently embedded in your Annual Chef Poster'}
          </span>
          <button
            type="button"
            onClick={() => setIsPosterModalOpen(true)}
            className="text-[#C85A32] hover:text-[#B34C26] font-bold inline-flex items-center gap-1"
          >
            <span>{language === 'zh-CN' ? '生成带勋章海报' : 'Generate Poster'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Annual Poster Modal */}
      {isPosterModalOpen && (
        <AnnualPosterModal
          isOpen={isPosterModalOpen}
          onClose={() => setIsPosterModalOpen(false)}
          user={user}
          stats={stats}
          levelInfo={levelInfo}
          medals={medals}
        />
      )}

      {/* Annual Commemorative Report PDF Modal */}
      {isReportPDFModalOpen && (
        <AnnualReportPDFModal
          isOpen={isReportPDFModalOpen}
          onClose={() => setIsReportPDFModalOpen(false)}
          user={user}
          stats={stats}
          levelInfo={levelInfo}
          medals={medals}
          recipes={recipes}
        />
      )}
    </div>
  );
};
