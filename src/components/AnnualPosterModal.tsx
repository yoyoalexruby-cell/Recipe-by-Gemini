import React, { useRef, useState } from 'react';
import { UserProfile } from '../types/auth';
import { AnnualCookingStats } from '../utils/annualReviewStats';
import { ChefMedal } from '../utils/achievementService';
import { UserLevelInfo } from '../types/membership';
import { 
  X, Download, Share2, Sparkles, Trophy, Award, 
  Calendar, Clock, Heart, Flame, Check, Copy, BookOpen 
} from 'lucide-react';
import { useI18n } from '../i18n/context';

interface AnnualPosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  stats: AnnualCookingStats;
  levelInfo: UserLevelInfo;
  medals: ChefMedal[];
}

export const AnnualPosterModal: React.FC<AnnualPosterModalProps> = ({
  isOpen,
  onClose,
  user,
  stats,
  levelInfo,
  medals
}) => {
  const { language } = useI18n();
  const [isExporting, setIsExporting] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const posterRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  const unlockedMedals = medals.filter((m) => m.isUnlocked);
  const displayMedals = unlockedMedals.length > 0 ? unlockedMedals : medals.slice(0, 4);

  // Generate Canvas PNG for download
  const handleDownloadPoster = async () => {
    setIsExporting(true);
    try {
      const width = 800;
      const height = 1250;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get 2d canvas context');

      // 1. Background Parchment Texture
      ctx.fillStyle = '#FAF7F2';
      ctx.fillRect(0, 0, width, height);

      // Subtle border
      ctx.strokeStyle = '#EADBCE';
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 20, width - 40, height - 40);

      ctx.strokeStyle = '#C85A32';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(28, 28, width - 56, height - 56);
      ctx.setLineDash([]);

      // 2. Washi tape header
      ctx.fillStyle = '#C85A32';
      ctx.fillRect(width / 2 - 120, 16, 240, 26);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`★ ${stats.year} ANNUAL CHEF REPORT ★`, width / 2, 33);

      // 3. Header Branding
      ctx.fillStyle = '#C85A32';
      ctx.font = 'bold 15px "Noto Serif SC", serif';
      ctx.fillText('❖ 食味手记 · 年度烹饪手帐数据盘点', width / 2, 75);

      ctx.fillStyle = '#2C2723';
      ctx.font = 'bold 28px "Noto Serif SC", serif';
      ctx.fillText(`“${stats.culinaryPersona.title}”`, width / 2, 115);

      ctx.fillStyle = '#7A7268';
      ctx.font = '13px "Noto Serif SC", serif';
      ctx.fillText(stats.culinaryPersona.desc, width / 2, 142);

      // 4. Chef Profile Header Box
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#EADBCE';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(50, 165, width - 100, 95, 14);
      ctx.fill();
      ctx.stroke();

      // Avatar placeholder / text
      ctx.fillStyle = '#FAF3EC';
      ctx.beginPath();
      ctx.arc(105, 212, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#C85A32';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#2C2723';
      ctx.font = '32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(levelInfo.badge || '👨‍🍳', 105, 222);

      // Chef Name & Level
      ctx.textAlign = 'left';
      ctx.fillStyle = '#2C2723';
      ctx.font = 'bold 20px "Noto Serif SC", serif';
      ctx.fillText(user.displayName, 155, 203);

      ctx.fillStyle = '#C85A32';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(`Lv.${levelInfo.level} ${levelInfo.title} · ${levelInfo.currentExp} EXP`, 155, 228);

      // 5. Stat Badges Grid (4 Cards)
      const statsGrid = [
        { label: '收录菜谱手帐', val: `${stats.totalRecipes} 篇`, sub: '私房风味灵感', icon: '📖' },
        { label: '下厨打卡总计', val: `${stats.totalCookingSessions} 次`, sub: `${stats.uniqueCookingDays} 个开火日子`, icon: '🍳' },
        { label: '厨房专注时光', val: `${stats.totalCookHours} h`, sub: '烟火治愈时刻', icon: '⏳' },
        { label: '平均美味评分', val: `${stats.averageRating} ★`, sub: '食客交口称赞', icon: '⭐' }
      ];

      statsGrid.forEach((item, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const cardX = 50 + col * 360;
        const cardY = 278 + row * 105;
        const cardW = 340;
        const cardH = 92;

        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#EADBCE';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 10);
        ctx.fill();
        ctx.stroke();

        ctx.textAlign = 'left';
        ctx.fillStyle = '#7A7268';
        ctx.font = '12px sans-serif';
        ctx.fillText(`${item.icon} ${item.label}`, cardX + 16, cardY + 28);

        ctx.fillStyle = '#C85A32';
        ctx.font = 'bold 24px "Noto Serif SC", serif';
        ctx.fillText(item.val, cardX + 16, cardY + 62);

        ctx.fillStyle = '#9A9085';
        ctx.font = '11px sans-serif';
        ctx.fillText(item.sub, cardX + 16, cardY + 80);
      });

      // 6. CHEF MEDALS WALL SECTION (Highlight of the Poster)
      const medalsBoxY = 505;
      ctx.fillStyle = '#FAF3EC';
      ctx.strokeStyle = '#D4A373';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(50, medalsBoxY, width - 100, 230, 16);
      ctx.fill();
      ctx.stroke();

      // Medals Title
      ctx.textAlign = 'left';
      ctx.fillStyle = '#C85A32';
      ctx.font = 'bold 15px "Noto Serif SC", serif';
      ctx.fillText('🏆 个人年度厨神荣誉勋章墙', 75, medalsBoxY + 34);

      ctx.fillStyle = '#7A7268';
      ctx.font = '12px sans-serif';
      ctx.fillText(`已斩获 ${unlockedMedals.length} 项勋章荣誉认证`, 75, medalsBoxY + 54);

      // Render Medals (Up to 4)
      const medalItems = displayMedals.slice(0, 4);
      medalItems.forEach((m, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const mX = 75 + col * 335;
        const mY = medalsBoxY + 70 + row * 72;

        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = m.isUnlocked ? '#F59E0B' : '#EADBCE';
        ctx.lineWidth = m.isUnlocked ? 2 : 1;
        ctx.beginPath();
        ctx.roundRect(mX, mY, 315, 62, 10);
        ctx.fill();
        ctx.stroke();

        // Icon
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(m.icon, mX + 30, mY + 40);

        // Name & Description
        ctx.textAlign = 'left';
        ctx.fillStyle = '#2C2723';
        ctx.font = 'bold 13px "Noto Serif SC", serif';
        ctx.fillText(m.name, mX + 58, mY + 28);

        ctx.fillStyle = m.isUnlocked ? '#059669' : '#9A9085';
        ctx.font = '10px sans-serif';
        ctx.fillText(m.isUnlocked ? '✓ 已点亮勋章' : '进行中', mX + 58, mY + 48);
      });

      // 7. Top Ingredients & Top Category Bar
      const detailsY = 755;
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#EADBCE';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(50, detailsY, width - 100, 200, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#2C2723';
      ctx.font = 'bold 14px "Noto Serif SC", serif';
      ctx.fillText('🥢 年度灵魂食材与风味偏好', 75, detailsY + 32);

      // Top Ingredients pills
      stats.topIngredients.slice(0, 5).forEach((ing, i) => {
        const pillX = 75 + i * 130;
        const pillY = detailsY + 48;
        ctx.fillStyle = '#FAF3EC';
        ctx.strokeStyle = '#EADBCE';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(pillX, pillY, 118, 52, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#C85A32';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(ing.name, pillX + 59, pillY + 25);

        ctx.fillStyle = '#7A7268';
        ctx.font = '10px sans-serif';
        ctx.fillText(`${ing.count}次出镜 (${ing.percentage}%)`, pillX + 59, pillY + 42);
      });

      // Category text summary
      ctx.textAlign = 'left';
      ctx.fillStyle = '#5A5248';
      ctx.font = '12px "Noto Serif SC", serif';
      const catText = stats.categoryDistribution
        .slice(0, 4)
        .map((c) => `${c.icon} ${c.label} (${c.percentage}%)`)
        .join('   ·   ');
      ctx.fillText(`料理主场分布：${catText}`, 75, detailsY + 135);

      ctx.fillStyle = '#9A9085';
      ctx.font = '11px sans-serif';
      ctx.fillText(
        `年度最高光月份：${stats.peakMonth ? `${stats.peakMonth.monthLabel} (集中创作了 ${stats.peakMonth.totalActivity} 道美食)` : '四季烟火连绵'}`,
        75,
        detailsY + 165
      );

      // 8. Bottom Seal / Watermark
      const footerY = 975;
      ctx.save();
      ctx.translate(width - 150, footerY + 80);
      ctx.rotate(-0.08);
      ctx.strokeStyle = '#C85A32';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      ctx.arc(0, 0, 48, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#C85A32';
      ctx.font = 'bold 12px "Noto Serif SC", serif';
      ctx.textAlign = 'center';
      ctx.fillText('烟火生活', 0, -8);
      ctx.fillText(`${stats.year} 认证`, 0, 10);
      ctx.fillText('★★★★★', 0, 26);
      ctx.restore();

      // App text signature
      ctx.textAlign = 'left';
      ctx.fillStyle = '#7A7268';
      ctx.font = 'bold 13px "Noto Serif SC", serif';
      ctx.fillText('食味手记 · 私房烹饪手帐本', 75, footerY + 90);
      ctx.fillStyle = '#9A9085';
      ctx.font = '11px sans-serif';
      ctx.fillText('“人间烟火气，最抚凡人心” · 用手帐封存每一步舌尖记忆', 75, footerY + 112);

      // 9. Download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `食味手记_${stats.year}年度烹饪手帐数据海报_${user.displayName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate annual poster', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyText = () => {
    const medalsText = unlockedMedals.map((m) => `${m.icon} ${m.name}`).join('、') || '食界新秀勋章';
    const text = `🍳 我的 ${stats.year} 年度烹饪手帐盘点 | 食味手记
👑 料理人称号：${stats.culinaryPersona.title}
📖 年度创作菜谱：${stats.totalRecipes} 篇
🔥 累计下厨打卡：${stats.totalCookingSessions} 次
⏳ 投入烹饪时光：${stats.totalCookHours} 小时
⭐ 平均美味发挥：${stats.averageRating} 星
🏆 斩获厨神勋章：${medalsText}
🌿 最爱出镜食材：${stats.topIngredients.slice(0, 3).map((i) => i.name).join('、')}
“人间烟火气，最抚凡人心”`;

    navigator.clipboard.writeText(text);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div 
        className="w-full max-w-xl bg-[#FAF7F2] border border-[#EADBCE] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="px-5 py-3.5 bg-white border-b border-[#EADBCE] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500 fill-amber-400" />
            <h3 className="text-sm font-bold text-[#2C2723] font-journal-title">
              {language === 'zh-CN' ? `${stats.year} 年度厨神数据海报` : `${stats.year} Chef Year in Review Poster`}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="p-1.5 px-2.5 text-xs text-[#5A5248] hover:text-[#2C2723] bg-[#FAF7F2] hover:bg-white border border-[#EADBCE] rounded-lg transition-colors flex items-center gap-1"
              title="复制年度成就文本"
            >
              {copiedToast ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedToast ? '已复制' : '复制文案'}</span>
            </button>

            <button
              onClick={handleDownloadPoster}
              disabled={isExporting}
              className="p-1.5 px-3 text-xs font-semibold text-white bg-[#C85A32] hover:bg-[#B34C26] active:scale-98 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? '生成中...' : '下载高清海报 (PNG)'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-[#7A7268] hover:text-[#2C2723] hover:bg-[#FAF7F2] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Poster Visual Preview Container (Scrollable) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex justify-center bg-stone-900/10">
          <div
            ref={posterRef}
            className="w-full max-w-md bg-[#FAF7F2] border-2 border-[#EADBCE] rounded-2xl shadow-xl p-5 sm:p-6 space-y-4 relative select-none paper-shadow"
          >
            {/* Washi tape stamp */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="washi-tape px-4 py-0.5 bg-[#C85A32] text-white text-[10px] font-mono tracking-widest uppercase rounded-xs shadow-xs">
                ★ {stats.year} ANNUAL CHEF REPORT ★
              </span>
            </div>

            {/* Poster Header */}
            <div className="text-center pt-2 space-y-1">
              <span className="text-[11px] font-serif tracking-widest text-[#C85A32] uppercase block">
                ❖ 食味手记 · 年度烹饪手帐盘点
              </span>
              <h2 className="text-2xl font-bold font-journal-title text-[#2C2723]">
                “{stats.culinaryPersona.title}”
              </h2>
              <p className="text-xs text-[#7A7268] font-serif max-w-xs mx-auto">
                {stats.culinaryPersona.desc}
              </p>
            </div>

            {/* Chef Identity Strip */}
            <div className="p-3 bg-white rounded-xl border border-[#EADBCE] flex items-center gap-3 shadow-2xs">
              <div className="w-12 h-12 rounded-full border-2 border-[#C85A32] bg-[#FAF3EC] flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
                ) : (
                  <span>{levelInfo.badge}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-sm text-[#2C2723] truncate font-journal-title">
                    {user.displayName}
                  </h4>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    Lv.{levelInfo.level}
                  </span>
                </div>
                <p className="text-[11px] text-[#C85A32] font-medium">
                  {levelInfo.title} · {levelInfo.currentExp} EXP
                </p>
              </div>
            </div>

            {/* 4 Stat Badges Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 bg-white rounded-xl border border-[#EADBCE] shadow-2xs">
                <span className="text-[11px] text-[#7A7268] flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-[#C85A32]" /> 收录菜谱
                </span>
                <div className="text-lg font-bold font-journal-title text-[#C85A32] mt-1">
                  {stats.totalRecipes} <span className="text-xs font-normal text-[#7A7268]">篇</span>
                </div>
                <span className="text-[10px] text-[#9A9085]">私房风味灵感</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#EADBCE] shadow-2xs">
                <span className="text-[11px] text-[#7A7268] flex items-center gap-1">
                  <Flame className="w-3 h-3 text-[#C85A32]" /> 下厨打卡
                </span>
                <div className="text-lg font-bold font-journal-title text-[#C85A32] mt-1">
                  {stats.totalCookingSessions} <span className="text-xs font-normal text-[#7A7268]">次</span>
                </div>
                <span className="text-[10px] text-[#9A9085]">{stats.uniqueCookingDays} 个开火日子</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#EADBCE] shadow-2xs">
                <span className="text-[11px] text-[#7A7268] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#C85A32]" /> 厨房时光
                </span>
                <div className="text-lg font-bold font-journal-title text-[#C85A32] mt-1">
                  {stats.totalCookHours} <span className="text-xs font-normal text-[#7A7268]">小时</span>
                </div>
                <span className="text-[10px] text-[#9A9085]">烟火治愈时刻</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#EADBCE] shadow-2xs">
                <span className="text-[11px] text-[#7A7268] flex items-center gap-1">
                  <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> 美味星级
                </span>
                <div className="text-lg font-bold font-journal-title text-[#C85A32] mt-1">
                  {stats.averageRating} <span className="text-xs font-normal text-[#7A7268]">★</span>
                </div>
                <span className="text-[10px] text-[#9A9085]">食客交口称赞</span>
              </div>
            </div>

            {/* Personal Annual Chef Medals Showcase */}
            <div className="p-3.5 bg-gradient-to-br from-[#FAF3EC] to-[#F5E6D8] rounded-xl border border-amber-300/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#C85A32] flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span>个人年度厨神荣誉勋章</span>
                </span>
                <span className="text-[10px] font-bold text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded-full">
                  已点亮 {unlockedMedals.length} 项
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {displayMedals.slice(0, 4).map((m) => (
                  <div
                    key={m.id}
                    className={`p-2 rounded-lg border text-xs flex items-center gap-2 ${
                      m.isUnlocked 
                        ? 'bg-white border-amber-400 shadow-2xs' 
                        : 'bg-white/60 border-[#EADBCE] opacity-60'
                    }`}
                  >
                    <span className="text-xl shrink-0">{m.icon}</span>
                    <div className="min-w-0">
                      <div className="font-bold text-[#2C2723] text-[11px] truncate">{m.name}</div>
                      <span className="text-[9px] text-emerald-700 font-semibold block">
                        {m.isUnlocked ? '✓ 认证获得' : '探索中'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Ingredients Strip */}
            <div className="p-3 bg-white rounded-xl border border-[#EADBCE] space-y-1.5 shadow-2xs">
              <span className="text-[11px] font-bold text-[#2C2723] block">
                🌿 最爱出镜食材 TOP 5
              </span>
              <div className="flex flex-wrap gap-1.5">
                {stats.topIngredients.slice(0, 5).map((ing) => (
                  <span
                    key={ing.name}
                    className="px-2 py-1 rounded-md text-[11px] font-medium bg-[#FAF7F2] border border-[#EADBCE] text-[#5A5248]"
                  >
                    {ing.name} <span className="text-[#C85A32] font-semibold">({ing.count}次)</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Seal & App Branding */}
            <div className="pt-2 border-t border-[#EADBCE]/80 flex items-center justify-between">
              <div>
                <span className="font-journal-title font-bold text-xs text-[#2C2723] block">
                  食味手记 · 私房烹饪手帐
                </span>
                <span className="text-[10px] text-[#9A9085]">
                  “人间烟火气，最抚凡人心”
                </span>
              </div>

              <div className="w-14 h-14 rounded-full border-2 border-dashed border-[#C85A32] text-[#C85A32] flex flex-col items-center justify-center text-center transform -rotate-12 select-none">
                <span className="text-[8px] font-bold uppercase tracking-widest">CERTIFIED</span>
                <span className="text-[10px] font-bold font-serif">{stats.year}</span>
                <span className="text-[7px]">主厨认证</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
