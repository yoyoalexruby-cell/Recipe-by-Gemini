import React, { useState } from 'react';
import { CategoryStatItem, MonthlyHeatItem, IngredientStatItem } from '../utils/annualReviewStats';
import { Flame, Sparkles, TrendingUp, Award, Utensils } from 'lucide-react';
import { useI18n } from '../i18n/context';

interface CategoryDonutChartProps {
  data: CategoryStatItem[];
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({ data }) => {
  const { language } = useI18n();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-[#9A9085]">
        {language === 'zh-CN' ? '暂无该年度分类分布数据' : 'No category data for this year'}
      </div>
    );
  }

  // Calculate SVG donut stroke arcs
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  const activeItem = hoveredIndex !== null ? data[hoveredIndex] : data[0];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 bg-white/80 rounded-2xl border border-[#EADBCE]">
      {/* SVG Donut */}
      <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="transparent"
            stroke="#F5EFE6"
            strokeWidth="24"
          />
          {data.map((item, idx) => {
            const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
            accumulatedPercent += item.percentage;
            const isHovered = hoveredIndex === idx;

            return (
              <circle
                key={item.category}
                cx="100"
                cy="100"
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={isHovered ? 28 : 24}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          <span className="text-xl mb-0.5">{activeItem.icon}</span>
          <span className="text-xs font-bold text-[#2C2723] truncate max-w-[90px]">
            {activeItem.label}
          </span>
          <span className="text-sm font-extrabold text-[#C85A32] font-mono">
            {activeItem.percentage}%
          </span>
          <span className="text-[10px] text-[#9A9085]">
            {activeItem.count} {language === 'zh-CN' ? '道菜' : 'dishes'}
          </span>
        </div>
      </div>

      {/* Legend & Breakdown Bars */}
      <div className="flex-1 w-full space-y-2">
        <div className="text-[11px] font-semibold text-[#7A7268] flex items-center justify-between pb-1 border-b border-[#F0E6DC]">
          <span>{language === 'zh-CN' ? '菜系大类占比' : 'Cuisine Breakdown'}</span>
          <span>{language === 'zh-CN' ? '菜品数量 / 占比' : 'Dishes / Ratio'}</span>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {data.map((item, idx) => {
            const isSelected = hoveredIndex === idx;
            return (
              <div
                key={item.category}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between gap-3 text-xs ${
                  isSelected ? 'bg-[#FAF3EC]' : 'hover:bg-[#FAF7F2]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.icon}</span>
                  <span className="font-medium text-[#2C2723] truncate">
                    {item.label}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-16 h-1.5 bg-stone-100 rounded-full overflow-hidden hidden sm:block">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                    />
                  </div>
                  <span className="font-mono text-[11px] font-bold text-[#2C2723]">
                    {item.count} <span className="text-[#9A9085] font-normal">({item.percentage}%)</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface MonthlyLineChartProps {
  data: MonthlyHeatItem[];
  peakMonth?: { month: number; monthLabel: string; totalActivity: number } | null;
}

export const MonthlyLineChart: React.FC<MonthlyLineChartProps> = ({ data, peakMonth }) => {
  const { language } = useI18n();
  const [activeMonthIdx, setActiveMonthIdx] = useState<number | null>(null);

  const maxVal = Math.max(...data.map((d) => d.cookCount + d.recipeCount), 4);
  const chartHeight = 120;
  const chartWidth = 500;
  const paddingX = 25;
  const paddingY = 20;

  const points = data.map((d, idx) => {
    const val = d.cookCount + d.recipeCount;
    const x = paddingX + (idx / (data.length - 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - (val / maxVal) * (chartHeight - paddingY * 2);
    return { x, y, val, item: d };
  });

  // Build SVG path
  const linePath = points.reduce((acc, pt, idx, arr) => {
    if (idx === 0) return `M ${pt.x} ${pt.y}`;
    const prev = arr[idx - 1];
    const cpX1 = prev.x + (pt.x - prev.x) / 2;
    const cpX2 = cpX1;
    return `${acc} C ${cpX1} ${prev.y}, ${cpX2} ${pt.y}, ${pt.x} ${pt.y}`;
  }, '');

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;

  const hoveredPoint = activeMonthIdx !== null ? points[activeMonthIdx] : null;

  return (
    <div className="p-4 bg-white/80 rounded-2xl border border-[#EADBCE] space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-[#C85A32]" />
          <h4 className="text-xs font-bold text-[#2C2723]">
            {language === 'zh-CN' ? '年度烹饪热度趋势（按月份）' : 'Annual Cooking Heat & Activity Trend'}
          </h4>
        </div>
        {peakMonth && peakMonth.totalActivity > 0 && (
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs">
            <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            <span>
              {language === 'zh-CN' 
                ? `巅峰烟火月：${peakMonth.monthLabel} (${peakMonth.totalActivity}次制作)`
                : `Peak Month: ${peakMonth.monthLabel} (${peakMonth.totalActivity} activities)`}
            </span>
          </div>
        )}
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-36 overflow-visible select-none"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C85A32" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#C85A32" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#D4A373" />
              <stop offset="50%" stopColor="#C85A32" />
              <stop offset="100%" stopColor="#B34C26" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          {[0, 0.5, 1].map((ratio) => {
            const y = chartHeight - paddingY - ratio * (chartHeight - paddingY * 2);
            return (
              <line
                key={ratio}
                x1={paddingX}
                y1={y}
                x2={chartWidth - paddingX}
                y2={y}
                stroke="#F0E6DC"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            );
          })}

          {/* Area Fill */}
          <path d={areaPath} fill="url(#areaGradient)" />

          {/* Line Path */}
          <path
            d={linePath}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Interactive points */}
          {points.map((pt, idx) => {
            const isHovered = activeMonthIdx === idx;
            const isPeak = peakMonth && peakMonth.month === pt.item.month && pt.val > 0;

            return (
              <g
                key={pt.item.month}
                className="cursor-pointer transition-transform"
                onMouseEnter={() => setActiveMonthIdx(idx)}
                onMouseLeave={() => setActiveMonthIdx(null)}
              >
                {/* Outer halo */}
                {(isHovered || isPeak) && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 9 : 7}
                    fill={isPeak ? '#F59E0B' : '#C85A32'}
                    fillOpacity="0.25"
                    className="animate-pulse"
                  />
                )}
                {/* Core dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 5 : isPeak ? 4.5 : 3}
                  fill={isPeak ? '#D97706' : '#C85A32'}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div
            className="absolute -top-1 pointer-events-none transform -translate-x-1/2 bg-[#2C2723] text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-20"
            style={{
              left: `${(hoveredPoint.x / chartWidth) * 100}%`
            }}
          >
            <div className="font-bold text-amber-300">{hoveredPoint.item.monthLabel}</div>
            <div>
              {language === 'zh-CN' 
                ? `下厨打卡 ${hoveredPoint.item.cookCount} 次 · 新记菜谱 ${hoveredPoint.item.recipeCount} 篇`
                : `${hoveredPoint.item.cookCount} cooks · ${hoveredPoint.item.recipeCount} recipes`}
            </div>
          </div>
        )}
      </div>

      {/* X-axis Month Labels */}
      <div className="grid grid-cols-12 gap-1 text-center text-[10px] text-[#9A9085] pt-1">
        {data.map((d, idx) => (
          <span
            key={d.month}
            className={`cursor-pointer transition-colors ${
              activeMonthIdx === idx ? 'text-[#C85A32] font-bold' : ''
            }`}
            onMouseEnter={() => setActiveMonthIdx(idx)}
            onMouseLeave={() => setActiveMonthIdx(null)}
          >
            {d.monthLabel}
          </span>
        ))}
      </div>
    </div>
  );
};

interface TopIngredientsListProps {
  ingredients: IngredientStatItem[];
}

export const TopIngredientsList: React.FC<TopIngredientsListProps> = ({ ingredients }) => {
  const { language } = useI18n();

  if (!ingredients || ingredients.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-[#9A9085]">
        {language === 'zh-CN' ? '暂无食材统计记录' : 'No ingredient stats available'}
      </div>
    );
  }

  const medals = ['🥇', '🥈', '🥉', '4', '5', '6'];

  return (
    <div className="p-4 bg-white/80 rounded-2xl border border-[#EADBCE] space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Utensils className="w-4 h-4 text-[#C85A32]" />
          <h4 className="text-xs font-bold text-[#2C2723]">
            {language === 'zh-CN' ? '年度最爱使用的食材榜单 TOP 6' : 'Most Frequently Used Ingredients TOP 6'}
          </h4>
        </div>
        <span className="text-[10px] text-[#9A9085]">
          {language === 'zh-CN' ? '按菜品出现频次统计' : 'By recipe frequency'}
        </span>
      </div>

      <div className="space-y-2.5 pt-1">
        {ingredients.map((item, idx) => (
          <div key={item.name} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-5 text-center font-bold text-xs">{medals[idx]}</span>
                <span className="font-bold text-[#2C2723]">{item.name}</span>
                <span className="text-[10px] text-[#C85A32] bg-[#FAF3EC] px-1.5 py-0.2 rounded-sm border border-[#C85A32]/20 font-medium">
                  {item.roleBadge}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#7A7268] font-mono">
                <span>{item.count} {language === 'zh-CN' ? '次出镜' : 'times'}</span>
                <span className="text-[#C85A32] font-semibold">({item.percentage}%)</span>
              </div>
            </div>

            {/* Proportional Bar */}
            <div className="w-full h-2 bg-[#F5EFE6] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#D4A373] to-[#C85A32] transition-all duration-700"
                style={{ width: `${Math.min(100, Math.max(8, item.percentage))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
