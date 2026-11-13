import React, { useState, useMemo } from 'react';
import { ChefMedal, AchievementSummary } from '../utils/achievementService';
import { useI18n } from '../i18n/context';
import { 
  X, Trophy, Award, Sparkles, CheckCircle2, Lock, 
  ChevronRight, ArrowRight, Star, Flame, BookOpen, Heart, 
  Filter, Check, Info, ShieldCheck, Flame as FlameIcon
} from 'lucide-react';

interface ChefMedalsWallModalProps {
  isOpen: boolean;
  achievements: AchievementSummary;
  onClose: () => void;
  onNavigateToNewRecipe?: () => void;
  onNavigateToCalendar?: () => void;
  onNavigateToContest?: () => void;
  onNavigateToSquare?: () => void;
}

export const ChefMedalsWallModal: React.FC<ChefMedalsWallModalProps> = ({
  isOpen,
  achievements,
  onClose,
  onNavigateToNewRecipe,
  onNavigateToCalendar,
  onNavigateToContest,
  onNavigateToSquare
}) => {
  const { language } = useI18n();

  const [activeCategory, setActiveCategory] = useState<'all' | 'recipe' | 'checkin' | 'contest' | 'social' | 'master'>('all');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);
  const [selectedMedal, setSelectedMedal] = useState<ChefMedal | null>(null);

  const filteredMedals = useMemo(() => {
    return achievements.medals.filter((m) => {
      if (activeCategory !== 'all' && m.category !== activeCategory) return false;
      if (showUnlockedOnly && !m.isUnlocked) return false;
      return true;
    });
  }, [achievements.medals, activeCategory, showUnlockedOnly]);

  if (!isOpen) return null;

  const handleActionClick = (medal: ChefMedal) => {
    onClose();
    if (medal.actionRoute === 'new_recipe') onNavigateToNewRecipe?.();
    else if (medal.actionRoute === 'calendar') onNavigateToCalendar?.();
    else if (medal.actionRoute === 'contest') onNavigateToContest?.();
    else if (medal.actionRoute === 'square') onNavigateToSquare?.();
  };

  const getRarityBadge = (rarity: ChefMedal['rarity']) => {
    switch (rarity) {
      case 'legendary':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-stone-950 flex items-center gap-1 shadow-2xs">
            <Sparkles className="w-2.5 h-2.5 text-stone-900" />
            <span>{language === 'zh-CN' ? '殿堂传说' : 'Legendary'}</span>
          </span>
        );
      case 'epic':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            {language === 'zh-CN' ? '史诗臻选' : 'Epic'}
          </span>
        );
      case 'rare':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            {language === 'zh-CN' ? '稀有名厨' : 'Rare'}
          </span>
        );
      case 'common':
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-stone-700">
            {language === 'zh-CN' ? '经典启航' : 'Common'}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-[#FAF7F2] rounded-3xl border-2 border-[#EADBCE] shadow-2xl max-w-3xl w-full overflow-hidden relative my-4 max-h-[94vh] flex flex-col paper-shadow bg-notebook-dots">
        
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 sm:px-6 border-b border-[#EADBCE] bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-[#C85A32] text-white flex items-center justify-center shadow-xs">
              <Trophy className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-journal-title text-[#2C2723]">
                  {language === 'zh-CN' ? '厨神荣誉成就殿堂 · 全部勋章' : 'Chef Hall of Fame · All Medals'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  {achievements.unlockedCount} / {achievements.totalCount} {language === 'zh-CN' ? '已点亮' : 'Unlocked'}
                </span>
              </div>
              <p className="text-[11px] text-[#7A7268] mt-0.5">
                {language === 'zh-CN' 
                  ? '包含菜谱百大、连续打卡、厨神大赛冠军等全维度勋章与获取条件' 
                  : 'Complete medal conditions, criteria guidelines & live progress'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#9A9085] hover:text-[#2C2723] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Overview Progress Bar */}
        <div className="bg-gradient-to-r from-[#3D261A] via-[#2C2723] to-[#1F1B18] text-amber-50 px-4 sm:px-6 py-3.5 border-b border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-200">
                {language === 'zh-CN' ? '勋章点亮进度总览' : 'Medal Achievement Progress'}
              </span>
              <span className="font-mono text-xs text-amber-400 font-bold">
                {achievements.unlockedCount} / {achievements.totalCount} ({achievements.completionPercentage}%)
              </span>
            </div>
            <p className="text-[10px] text-amber-200/60">
              {language === 'zh-CN'
                ? `已达成 ${achievements.unlockedCount} 项厨神荣誉，还差 ${achievements.lockedMedals.length} 项勋章即可达成全满贯！`
                : `${achievements.unlockedCount} unlocked, ${achievements.lockedMedals.length} remaining to complete all!`}
            </p>
          </div>

          <div className="w-full sm:w-48 space-y-1">
            <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(5, achievements.completionPercentage)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-[#F5EDE3] px-4 sm:px-6 py-2.5 border-b border-[#EADBCE] flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1 rounded-xl font-semibold transition-all whitespace-nowrap ${
                activeCategory === 'all'
                  ? 'bg-[#2C2723] text-white shadow-2xs'
                  : 'bg-white/80 text-[#7A7268] hover:text-[#2C2723]'
              }`}
            >
              {language === 'zh-CN' ? '全部勋章 (12)' : 'All (12)'}
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('recipe')}
              className={`px-3 py-1 rounded-xl font-semibold transition-all whitespace-nowrap ${
                activeCategory === 'recipe'
                  ? 'bg-[#C85A32] text-white shadow-2xs'
                  : 'bg-white/80 text-[#7A7268] hover:text-[#2C2723]'
              }`}
            >
              📜 {language === 'zh-CN' ? '菜谱手帐' : 'Recipes'}
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('checkin')}
              className={`px-3 py-1 rounded-xl font-semibold transition-all whitespace-nowrap ${
                activeCategory === 'checkin'
                  ? 'bg-[#C85A32] text-white shadow-2xs'
                  : 'bg-white/80 text-[#7A7268] hover:text-[#2C2723]'
              }`}
            >
              🔥 {language === 'zh-CN' ? '烹饪打卡' : 'Check-ins'}
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('contest')}
              className={`px-3 py-1 rounded-xl font-semibold transition-all whitespace-nowrap ${
                activeCategory === 'contest'
                  ? 'bg-[#C85A32] text-white shadow-2xs'
                  : 'bg-white/80 text-[#7A7268] hover:text-[#2C2723]'
              }`}
            >
              🏆 {language === 'zh-CN' ? '赛事荣誉' : 'Contests'}
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('social')}
              className={`px-3 py-1 rounded-xl font-semibold transition-all whitespace-nowrap ${
                activeCategory === 'social'
                  ? 'bg-[#C85A32] text-white shadow-2xs'
                  : 'bg-white/80 text-[#7A7268] hover:text-[#2C2723]'
              }`}
            >
              💖 {language === 'zh-CN' ? '社区人气' : 'Community'}
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('master')}
              className={`px-3 py-1 rounded-xl font-semibold transition-all whitespace-nowrap ${
                activeCategory === 'master'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'bg-white/80 text-[#7A7268] hover:text-[#2C2723]'
              }`}
            >
              👑 {language === 'zh-CN' ? '终极殿堂' : 'Grandmaster'}
            </button>
          </div>

          {/* Toggle Unlocked Only */}
          <button
            type="button"
            onClick={() => setShowUnlockedOnly(!showUnlockedOnly)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border flex items-center gap-1 transition-all ${
              showUnlockedOnly
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                : 'bg-white text-[#7A7268] border-[#EADBCE] hover:text-[#2C2723]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{language === 'zh-CN' ? '只看已点亮' : 'Unlocked only'}</span>
          </button>
        </div>

        {/* Scrollable Medals Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredMedals.map((medal) => {
              const isUnlocked = medal.isUnlocked;

              return (
                <div
                  key={medal.id}
                  onClick={() => setSelectedMedal(medal)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                    isUnlocked
                      ? 'bg-white border-amber-300/80 shadow-xs hover:shadow-md hover:border-amber-400'
                      : 'bg-[#FAF7F2]/80 border-[#EADBCE] hover:border-[#C85A32]/40 hover:bg-white'
                  }`}
                >
                  {/* Top Status & Rarity Row */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Medal Icon Badge with Tactile Glow */}
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-2xl transition-transform group-hover:scale-105 ${
                        isUnlocked
                          ? 'bg-gradient-to-br from-amber-100 via-amber-50 to-orange-100 border-2 border-amber-400 shadow-xs'
                          : 'bg-stone-200/70 border border-stone-300 text-stone-400 grayscale'
                      }`}>
                        {medal.icon}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className={`font-bold text-sm truncate ${
                            isUnlocked ? 'text-[#2C2723]' : 'text-stone-600'
                          }`}>
                            {language === 'zh-CN' ? medal.name : medal.nameEn}
                          </h4>
                          {getRarityBadge(medal.rarity)}
                        </div>
                        <p className="text-[11px] text-[#7A7268] mt-0.5 line-clamp-1">
                          {language === 'zh-CN' ? medal.description : medal.descriptionEn}
                        </p>
                      </div>
                    </div>

                    {/* Unlocked Stamp Badge */}
                    <div className="shrink-0">
                      {isUnlocked ? (
                        <span className="px-2 py-0.8 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-700" />
                          <span>{language === 'zh-CN' ? '已达成' : 'Unlocked'}</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.8 rounded-lg bg-stone-100 text-stone-500 text-[10px] font-medium flex items-center gap-1">
                          <Lock className="w-3 h-3 text-stone-400" />
                          <span>{language === 'zh-CN' ? '待点亮' : 'Locked'}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Criteria Box (Explicit Condition Requirement) */}
                  <div className="mt-1 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EADBCE]/80 text-[11px] space-y-1.5">
                    <div className="flex items-center justify-between text-[#7A7268]">
                      <span className="font-semibold text-[#2C2723] flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 text-[#C85A32]" />
                        <span>{language === 'zh-CN' ? '获取条件：' : 'Condition:'}</span>
                      </span>
                      <span className="font-mono text-[10px] font-bold text-amber-700">
                        +{medal.expReward} EXP
                      </span>
                    </div>
                    <p className="text-[#5A5248] leading-relaxed">
                      {language === 'zh-CN' ? medal.condition : medal.conditionEn}
                    </p>

                    {/* Live Progress Bar */}
                    <div className="pt-1 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-[#7A7268] font-mono">
                        <span>
                          {language === 'zh-CN' ? '当前进度：' : 'Progress: '}
                          <strong className="text-[#2C2723]">{medal.progress.current}</strong> / {medal.progress.target} {medal.progress.unit}
                        </span>
                        <span className="font-bold text-[#C85A32]">
                          {medal.progress.percentage}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            isUnlocked ? 'bg-emerald-500' : 'bg-[#C85A32]'
                          }`}
                          style={{ width: `${Math.min(100, medal.progress.percentage)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Click Tip */}
                  <div className="mt-2.5 pt-2 border-t border-[#F0E6DC] flex items-center justify-between text-[10px] text-[#9A9085]">
                    <span>
                      {isUnlocked 
                        ? (language === 'zh-CN' ? '✨ 勋位永久生效 · 点击查看详情' : '✨ Active · Click for details')
                        : (language === 'zh-CN' ? '🎯 点击查看快速达成攻略' : '🎯 Click for quick route')}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>

                </div>
              );
            })}
          </div>

          {filteredMedals.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-[#EADBCE] text-[#7A7268] space-y-2">
              <Trophy className="w-10 h-10 mx-auto text-stone-300" />
              <p className="font-semibold text-xs">
                {language === 'zh-CN' ? '暂无符合筛选条件的勋章' : 'No medals found in this category'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('all');
                  setShowUnlockedOnly(false);
                }}
                className="text-xs text-[#C85A32] font-bold hover:underline"
              >
                {language === 'zh-CN' ? '重置筛选查看全部' : 'Reset filters'}
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 sm:px-6 border-t border-[#EADBCE] bg-white flex items-center justify-between text-xs shrink-0">
          <div className="text-[#7A7268] text-[11px]">
            {language === 'zh-CN'
              ? '💡 提示：多写手帐、坚持下厨打卡、积极打擂即可快速点亮勋章墙'
              : 'Tip: Create scrapbooks, log meals & join contests to unlock medals'}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#2C2723] hover:bg-[#1A1715] text-white rounded-xl font-bold transition-all shadow-xs"
          >
            {language === 'zh-CN' ? '关闭成就墙' : 'Close'}
          </button>
        </div>

        {/* INDIVIDUAL MEDAL DETAIL INSPECT SHEET / POPUP */}
        {selectedMedal && (
          <div className="absolute inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-[#FAF7F2] rounded-3xl border-2 border-[#EADBCE] p-6 max-w-md w-full space-y-4 shadow-2xl paper-shadow relative">
              
              <button
                type="button"
                onClick={() => setSelectedMedal(null)}
                className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Medal Header */}
              <div className="flex flex-col items-center text-center space-y-2 pt-2">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-md ${
                  selectedMedal.isUnlocked
                    ? 'bg-gradient-to-br from-amber-100 via-amber-50 to-orange-100 border-3 border-amber-400'
                    : 'bg-stone-200 border-2 border-stone-300 text-stone-400 grayscale'
                }`}>
                  {selectedMedal.icon}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <h3 className="font-bold text-lg text-[#2C2723]">
                      {language === 'zh-CN' ? selectedMedal.name : selectedMedal.nameEn}
                    </h3>
                    {getRarityBadge(selectedMedal.rarity)}
                  </div>
                  <p className="text-xs text-[#7A7268] font-serif">
                    ({selectedMedal.nameEn})
                  </p>
                </div>

                <p className="text-xs text-[#5A5248] italic max-w-sm">
                  “{language === 'zh-CN' ? selectedMedal.description : selectedMedal.descriptionEn}”
                </p>
              </div>

              {/* Criteria & Condition Details */}
              <div className="bg-white p-4 rounded-2xl border border-[#EADBCE] space-y-3 text-xs">
                <div>
                  <span className="font-bold text-[#2C2723] block mb-1 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[#C85A32]" />
                    <span>{language === 'zh-CN' ? '荣誉获取条件' : 'Unlock Criteria'}</span>
                  </span>
                  <p className="text-stone-700 bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EADBCE]/80 leading-relaxed font-medium">
                    {language === 'zh-CN' ? selectedMedal.condition : selectedMedal.conditionEn}
                  </p>
                </div>

                {/* Live Progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-[#7A7268]">{language === 'zh-CN' ? '当前达成进度：' : 'Progress:'}</span>
                    <span className="font-bold text-[#C85A32]">
                      {selectedMedal.progress.current} / {selectedMedal.progress.target} {selectedMedal.progress.unit} ({selectedMedal.progress.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        selectedMedal.isUnlocked ? 'bg-emerald-500' : 'bg-[#C85A32]'
                      }`}
                      style={{ width: `${Math.min(100, selectedMedal.progress.percentage)}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1 text-[11px] text-[#7A7268] border-t border-[#F0E6DC]">
                  <span>{language === 'zh-CN' ? '达成奖励经验：' : 'EXP Reward:'}</span>
                  <span className="font-mono font-bold text-amber-700">+{selectedMedal.expReward} 等级积分</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedMedal(null)}
                  className="flex-1 py-2.5 text-xs text-[#7A7268] hover:text-[#2C2723] font-semibold rounded-xl bg-stone-200/60 hover:bg-stone-200"
                >
                  {language === 'zh-CN' ? '返回列表' : 'Back'}
                </button>

                {selectedMedal.actionRoute && (
                  <button
                    type="button"
                    onClick={() => handleActionClick(selectedMedal)}
                    className="flex-2 py-2.5 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 bg-[#C85A32] hover:bg-[#B34C26] text-white active:scale-95"
                  >
                    <span>
                      {selectedMedal.actionRoute === 'new_recipe' && (language === 'zh-CN' ? '立即去写新手帐' : 'Write Recipe')}
                      {selectedMedal.actionRoute === 'calendar' && (language === 'zh-CN' ? '去烹饪日历打卡' : 'Log Meal')}
                      {selectedMedal.actionRoute === 'contest' && (language === 'zh-CN' ? '去参加厨神大赛' : 'Join Contest')}
                      {selectedMedal.actionRoute === 'square' && (language === 'zh-CN' ? '前往食味广场' : 'Go to Square')}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
