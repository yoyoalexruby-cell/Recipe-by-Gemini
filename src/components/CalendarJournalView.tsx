import React, { useState, useMemo } from 'react';
import { Recipe } from '../types/recipe';
import { CookingRecord } from '../types/cookingLog';
import { FoodArtFallback } from './IllustrationPresets';
import { MarkCookingModal } from './MarkCookingModal';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Plus, Star, Clock, Flame, Utensils, Sparkles, Trash2, 
  ChefHat, Heart, BookOpen, ExternalLink, Award
} from 'lucide-react';
import { UserProfile } from '../types/auth';
import { 
  getCookingRecords, 
  saveCookingRecord, 
  deleteCookingRecord, 
  markRecipeCookedOnDate 
} from '../utils/cookingLogStorage';
import { formatLocalDate } from '../utils/dateUtils';

interface CalendarJournalViewProps {
  recipes: Recipe[];
  currentUser: UserProfile | null;
  onOpenRecipe: (recipe: Recipe) => void;
  onNewRecipe: () => void;
}

export const CalendarJournalView: React.FC<CalendarJournalViewProps> = ({
  recipes,
  currentUser,
  onOpenRecipe,
  onNewRecipe
}) => {
  // Current calendar viewing year & month
  const today = new Date();
  const todayStr = formatLocalDate(today);

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed (10 = Nov)
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Cooking records state
  const [records, setRecords] = useState<CookingRecord[]>(() => 
    getCookingRecords(currentUser, recipes)
  );

  // Mark cooking modal state
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [markModalInitialDate, setMarkModalInitialDate] = useState<string>(todayStr);
  const [markModalRecipe, setMarkModalRecipe] = useState<Recipe | null>(null);

  // Listen to records update
  React.useEffect(() => {
    const handleUpdate = (e: CustomEvent) => {
      if (e.detail) {
        setRecords(e.detail);
      } else {
        setRecords(getCookingRecords(currentUser, recipes));
      }
    };
    window.addEventListener('cooking-records-updated', handleUpdate as EventListener);
    return () => {
      window.removeEventListener('cooking-records-updated', handleUpdate as EventListener);
    };
  }, [currentUser, recipes]);

  // Map dates to cooking records: { 'YYYY-MM-DD': CookingRecord[] }
  const recordsByDate = useMemo(() => {
    const map: Record<string, CookingRecord[]> = {};
    for (const record of records) {
      if (!map[record.cookDate]) {
        map[record.cookDate] = [];
      }
      map[record.cookDate].push(record);
    }
    return map;
  }, [records]);

  // Navigate months
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDate(formatLocalDate(now));
  };

  // Build calendar matrix (Monday-based weeks)
  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    
    // Day of week: 0 (Sun) to 6 (Sat). We want Monday=0, Sunday=6
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const totalDaysInMonth = lastDayOfMonth.getDate();

    // Previous month filler days
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    const cells: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }> = [];

    // Fill days from previous month
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const prevDate = new Date(currentYear, currentMonth - 1, dayNum);
      const dateStr = formatLocalDate(prevDate);
      cells.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateStr === todayStr
      });
    }

    // Fill current month days
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const curDate = new Date(currentYear, currentMonth, i);
      const dateStr = formatLocalDate(curDate);
      cells.push({
        dateStr,
        dayNumber: i,
        isCurrentMonth: true,
        isToday: dateStr === todayStr
      });
    }

    // Fill next month days to complete 35 or 42 grid cells
    const remainingCells = 42 - cells.length;
    if (remainingCells < 7 && cells.length > 35) {
      // Keep at 42
    } else if (cells.length <= 35) {
      const fillCount = 35 - cells.length;
      for (let i = 1; i <= fillCount; i++) {
        const nextDate = new Date(currentYear, currentMonth + 1, i);
        const dateStr = formatLocalDate(nextDate);
        cells.push({
          dateStr,
          dayNumber: i,
          isCurrentMonth: false,
          isToday: dateStr === todayStr
        });
      }
    } else {
      for (let i = 1; i <= remainingCells; i++) {
        const nextDate = new Date(currentYear, currentMonth + 1, i);
        const dateStr = formatLocalDate(nextDate);
        cells.push({
          dateStr,
          dayNumber: i,
          isCurrentMonth: false,
          isToday: dateStr === todayStr
        });
      }
    }

    return cells;
  }, [currentYear, currentMonth, todayStr]);

  // Records for currently selected date
  const selectedDateRecords = recordsByDate[selectedDate] || [];

  // Monthly stats
  const monthStats = useMemo(() => {
    const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    const monthRecords = records.filter(r => r.cookDate.startsWith(monthPrefix));
    const activeDates = new Set(monthRecords.map(r => r.cookDate));
    
    // Most cooked category
    const catCounts: Record<string, number> = {};
    monthRecords.forEach(r => {
      catCounts[r.category] = (catCounts[r.category] || 0) + 1;
    });
    let topCat = '暂无';
    let topCount = 0;
    Object.entries(catCounts).forEach(([cat, cnt]) => {
      if (cnt > topCount) {
        topCount = cnt;
        topCat = cat;
      }
    });

    const avgRating = monthRecords.length > 0 
      ? (monthRecords.reduce((acc, cur) => acc + (cur.rating || 5), 0) / monthRecords.length).toFixed(1)
      : '5.0';

    return {
      daysCount: activeDates.size,
      dishesCount: monthRecords.length,
      topCategory: topCat,
      averageRating: avgRating
    };
  }, [records, currentYear, currentMonth]);

  // Open mark modal for a specific date
  const handleOpenMarkModal = (dateStr: string, recipeToLog?: Recipe) => {
    setMarkModalInitialDate(dateStr);
    setMarkModalRecipe(recipeToLog || null);
    setIsMarkModalOpen(true);
  };

  const handleSaveMarkRecord = (data: {
    recipe: Recipe;
    date: string;
    notes: string;
    rating: number;
    dinerFeedback?: string;
    weatherStamp?: string;
  }) => {
    markRecipeCookedOnDate(
      data.recipe,
      data.date,
      data.notes,
      data.rating,
      currentUser,
      data.dinerFeedback
    );
    setSelectedDate(data.date);
    // Refresh records
    setRecords(getCookingRecords(currentUser, recipes));
  };

  const handleDeleteRecord = (recordId: string) => {
    if (window.confirm('确定要移除这天的这道烹饪打卡记录吗？')) {
      const updated = deleteCookingRecord(recordId, currentUser);
      setRecords(updated);
    }
  };

  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ];

  const weekdayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

  // Format nice display for selected date
  const selectedDateDisplay = useMemo(() => {
    try {
      const [y, m, d] = selectedDate.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const dayOfWeek = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][dateObj.getDay()];
      return `${y}年${m}月${d}日 · ${dayOfWeek}`;
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 animate-fade-in">
      
      {/* 1. Header Hero Card with Scrapbook Washi-Tape Aesthetic */}
      <div className="mb-6 p-6 sm:p-7 bg-white border border-[#EADBCE] rounded-2xl paper-shadow bg-notebook-dots relative overflow-hidden">
        <div className="absolute top-0 right-10 transform -translate-y-1/2 pointer-events-none">
          <div className="washi-tape px-6 py-1 bg-[#C85A32]/85 text-amber-50 text-xs font-mono tracking-wider uppercase">
            CULINARY TIMELINE
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-serif tracking-widest text-[#C85A32] uppercase">
                烹饪日历 · 时光手记
              </span>
              <span className="text-[11px] text-[#7A7268] bg-[#FAF7F2] border border-[#EADBCE] px-2 py-0.5 rounded-full">
                记录每一次柴米油盐的温情
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-journal-title text-[#2C2723] tracking-tight">
              在日子里，把烹饪慢煨成诗
            </h1>
            <p className="text-xs sm:text-sm text-[#7A7268] mt-1 max-w-xl">
              点击日历日期回顾当天的菜谱手账心得，或将新做过的菜品打卡标记在特定下厨日，构建属于你的饮食编年史。
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={() => handleOpenMarkModal(selectedDate)}
              className="px-4 py-2 bg-[#C85A32] text-white text-xs font-semibold rounded-lg hover:bg-[#B34C26] active:scale-[0.98] transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>标记这天下厨</span>
            </button>
          </div>
        </div>

        {/* Monthly Summary KPI Strip (Clean unboxed metrics) */}
        <div className="mt-6 pt-5 border-t border-[#EADBCE]/70 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[#7A7268] block text-[11px]">本月下厨天数</span>
            <span className="text-xl sm:text-2xl font-bold text-[#2C2723] font-mono tabular-nums">
              {monthStats.daysCount} <span className="text-xs font-normal text-[#7A7268]">天</span>
            </span>
          </div>

          <div>
            <span className="text-[#7A7268] block text-[11px]">制作出品道数</span>
            <span className="text-xl sm:text-2xl font-bold text-[#C85A32] font-mono tabular-nums">
              {monthStats.dishesCount} <span className="text-xs font-normal text-[#7A7268]">道美味</span>
            </span>
          </div>

          <div>
            <span className="text-[#7A7268] block text-[11px]">本月最爱风味</span>
            <span className="text-sm sm:text-base font-bold text-[#2C2723] truncate block mt-1">
              {monthStats.topCategory}
            </span>
          </div>

          <div>
            <span className="text-[#7A7268] block text-[11px]">发挥好评率</span>
            <span className="text-xl sm:text-2xl font-bold text-[#D97706] font-mono tabular-nums flex items-center gap-1">
              ★ {monthStats.averageRating}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Two-Column Layout: Left Calendar Grid / Right Day Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (7 cols): Monthly Calendar View */}
        <div className="lg:col-span-7 bg-white border border-[#EADBCE] rounded-2xl p-5 sm:p-6 paper-shadow">
          
          {/* Calendar Month Navigation Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold font-serif text-[#2C2723]">
                {currentYear}年 {monthNames[currentMonth]}
              </h2>
              {currentYear === today.getFullYear() && currentMonth === today.getMonth() && (
                <span className="text-[10px] font-semibold text-[#5F7A4D] bg-[#5F7A4D]/10 px-2 py-0.5 rounded-sm">
                  当前月
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleJumpToToday}
                className="px-2.5 py-1 text-xs font-semibold text-[#5A5248] hover:text-[#2C2723] bg-[#FAF7F2] hover:bg-[#EADBCE]/50 border border-[#EADBCE] rounded-md transition-colors"
                title="快速回到今天"
              >
                今天
              </button>
              <div className="flex items-center border border-[#EADBCE] rounded-md overflow-hidden bg-[#FAF7F2]">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 hover:bg-white text-[#7A7268] hover:text-[#2C2723] transition-colors"
                  title="上一月"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="w-[1px] h-4 bg-[#EADBCE]" />
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 hover:bg-white text-[#7A7268] hover:text-[#2C2723] transition-colors"
                  title="下一月"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Weekday Strip */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-xs font-semibold text-[#7A7268]">
            {weekdayNames.map((name, idx) => (
              <div 
                key={name} 
                className={`py-1.5 ${idx >= 5 ? 'text-[#C85A32]' : ''}`}
              >
                {name}
              </div>
            ))}
          </div>

          {/* Calendar Matrix Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarCells.map((cell) => {
              const dayRecords = recordsByDate[cell.dateStr] || [];
              const hasRecords = dayRecords.length > 0;
              const isSelected = cell.dateStr === selectedDate;

              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  onClick={() => setSelectedDate(cell.dateStr)}
                  className={`relative min-h-[64px] sm:min-h-[76px] p-1.5 sm:p-2 rounded-xl text-left border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#C85A32] bg-[#FAF3EC] ring-2 ring-[#C85A32]/20 shadow-xs'
                      : cell.isCurrentMonth
                        ? hasRecords
                          ? 'border-[#EADBCE] bg-[#FDFBF7] hover:border-[#C85A32]/60 hover:bg-[#FAF3EC]/40'
                          : 'border-[#EADBCE]/50 bg-white hover:border-[#C85A32]/40 hover:bg-[#FAF7F2]'
                        : 'border-transparent bg-transparent opacity-30 hover:opacity-70'
                  }`}
                >
                  {/* Top Day Header: Number + Today Pill */}
                  <div className="flex items-center justify-between w-full">
                    <span 
                      className={`text-xs sm:text-sm font-semibold font-mono tabular-nums ${
                        cell.isToday 
                          ? 'w-6 h-6 rounded-full bg-[#C85A32] text-white flex items-center justify-center font-bold text-xs' 
                          : isSelected 
                            ? 'text-[#C85A32] font-bold' 
                            : cell.isCurrentMonth 
                              ? 'text-[#2C2723]' 
                              : 'text-[#A8A29E]'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {/* Dish count indicator */}
                    {hasRecords && (
                      <span className="text-[10px] font-bold text-[#C85A32] flex items-center gap-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32]" />
                        <span className="hidden sm:inline">{dayRecords.length}道</span>
                      </span>
                    )}
                  </div>

                  {/* Bottom Dish Snippet */}
                  {hasRecords ? (
                    <div className="w-full mt-1 space-y-0.5">
                      <div className="text-[10px] font-medium text-[#5A5248] truncate leading-tight">
                        {dayRecords[0].recipeTitle}
                      </div>
                      {dayRecords.length > 1 && (
                        <div className="text-[9px] text-[#7A7268] hidden sm:block">
                          +{dayRecords.length - 1}道其他
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-4" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Legend Bar */}
          <div className="mt-4 pt-3 border-t border-[#EADBCE]/60 flex items-center justify-between text-[11px] text-[#7A7268]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C85A32]" />
                <span>下厨打卡日</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-md border border-[#C85A32] bg-[#FAF3EC]" />
                <span>当前选中日</span>
              </span>
            </div>
            <span className="text-[10px]">点击任意日期可查看与补充当天下厨记录</span>
          </div>

        </div>

        {/* Right Column (5 cols): Day Culinary Record Inspector */}
        <div className="lg:col-span-5 bg-white border border-[#EADBCE] rounded-2xl p-5 sm:p-6 paper-shadow">
          
          {/* Day Inspector Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-[#EADBCE]">
            <div>
              <span className="text-[11px] font-serif text-[#C85A32] tracking-wider uppercase block">
                当天烹饪记录
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#2C2723] font-serif">
                {selectedDateDisplay}
              </h3>
            </div>

            <button
              onClick={() => handleOpenMarkModal(selectedDate)}
              className="px-2.5 py-1.5 text-xs font-semibold text-[#C85A32] bg-[#FAF3EC] hover:bg-[#C85A32] hover:text-white border border-[#C85A32]/40 rounded-lg transition-colors flex items-center gap-1"
              title="为该日期添加烹饪记录"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>记这天</span>
            </button>
          </div>

          {/* Records List for the Selected Day */}
          <div className="mt-4 space-y-4">
            {selectedDateRecords.length === 0 ? (
              /* Empty Day State */
              <div className="py-10 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF7F2] border border-[#EADBCE] flex items-center justify-center text-[#A8A29E]">
                  <CalendarIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#5A5248]">
                    该日尚未标记烹饪记录
                  </h4>
                  <p className="text-xs text-[#7A7268] max-w-xs mx-auto mt-1">
                    今天做了什么好菜吗？或是想补记过去的某顿私房大餐，随时点击下方打卡记录。
                  </p>
                </div>
                <button
                  onClick={() => handleOpenMarkModal(selectedDate)}
                  className="px-4 py-2 bg-[#FAF3EC] text-[#C85A32] hover:bg-[#C85A32] hover:text-white border border-[#C85A32] text-xs font-semibold rounded-lg transition-all inline-flex items-center gap-1.5 shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>记录在这一天做过的菜</span>
                </button>
              </div>
            ) : (
              /* Render List of Dishes Cooked on This Day */
              selectedDateRecords.map((record, index) => {
                const matchedRecipe = recipes.find(r => r.id === record.recipeId);

                return (
                  <div
                    key={record.id}
                    className="p-4 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl relative hover:border-[#C85A32]/60 transition-colors group"
                  >
                    {/* Delete record button */}
                    <button
                      onClick={() => handleDeleteRecord(record.id)}
                      className="absolute top-3 right-3 p-1 text-[#A8A29E] hover:text-rose-600 hover:bg-white rounded-md transition-colors opacity-0 group-hover:opacity-100"
                      title="移除此条记录"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Dish Header Info */}
                    <div className="flex items-start gap-3">
                      {/* Thumbnail or Food Art */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-[#EADBCE] bg-white">
                        {record.coverImage ? (
                          <img
                            src={record.coverImage}
                            alt={record.recipeTitle}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <FoodArtFallback
                            type={record.recipeTitle + ' ' + (record.subCategory || record.category)}
                            className="w-full h-full"
                          />
                        )}
                      </div>

                      {/* Title & Metadata (Zero-Pill Discipline) */}
                      <div className="flex-1 min-w-0 pr-6">
                        <h4 className="text-sm font-bold text-[#2C2723] truncate">
                          {record.recipeTitle}
                        </h4>

                        {/* Unboxed Metadata with separators */}
                        <div className="flex items-center gap-1.5 text-xs text-[#7A7268] mt-1 flex-wrap">
                          <span>{record.category}</span>
                          {record.subCategory && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>{record.subCategory}</span>
                            </>
                          )}
                          {record.cookTimeMinutes && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>{record.cookTimeMinutes}分钟</span>
                            </>
                          )}
                          {record.servings && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>{record.servings}人份</span>
                            </>
                          )}
                        </div>

                        {/* Star Rating & Weather Stamp */}
                        <div className="flex items-center gap-2 mt-1.5 text-xs">
                          <div className="flex items-center text-[#D97706]">
                            {Array.from({ length: record.rating || 5 }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-current" />
                            ))}
                          </div>
                          {record.weatherStamp && (
                            <span className="text-[11px] text-[#7A7268]">
                              {record.weatherStamp}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Cooking Tasting Notes */}
                    {record.notes && (
                      <div className="mt-3 p-2.5 bg-white border border-[#EADBCE]/80 rounded-lg text-xs text-[#5A5248] italic font-serif leading-relaxed">
                        “{record.notes}”
                      </div>
                    )}

                    {/* Diner Feedback if present */}
                    {record.dinerFeedback && (
                      <div className="mt-2 text-[11px] text-[#7A7268] flex items-center gap-1">
                        <Heart className="w-3 h-3 text-[#C85A32]" />
                        <span>食客反馈：{record.dinerFeedback}</span>
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="mt-3 pt-2.5 border-t border-[#EADBCE]/60 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-[#7A7268]">
                        打卡记录 #{index + 1}
                      </span>
                      {matchedRecipe ? (
                        <button
                          onClick={() => onOpenRecipe(matchedRecipe)}
                          className="font-semibold text-[#C85A32] hover:text-[#B34C26] transition-colors inline-flex items-center gap-1 text-xs"
                        >
                          <span>查看食谱做法</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#7A7268]">原始菜谱已更新</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* If there are records, also show "+ 继续记录这天其他菜品" */}
            {selectedDateRecords.length > 0 && (
              <button
                onClick={() => handleOpenMarkModal(selectedDate)}
                className="w-full py-2.5 border border-dashed border-[#EADBCE] hover:border-[#C85A32] text-xs font-semibold text-[#7A7268] hover:text-[#C85A32] rounded-xl bg-white hover:bg-[#FAF3EC]/30 transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>继续为此日期标记其他菜肴</span>
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Mark Cooking Modal */}
      <MarkCookingModal
        isOpen={isMarkModalOpen}
        onClose={() => setIsMarkModalOpen(false)}
        recipes={recipes}
        initialDate={markModalInitialDate}
        initialRecipe={markModalRecipe}
        onSaveRecord={handleSaveMarkRecord}
      />

    </div>
  );
};
