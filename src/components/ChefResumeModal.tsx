import React, { useRef, useState, useMemo } from 'react';
import { UserProfile } from '../types/auth';
import { Recipe } from '../types/recipe';
import { UserLevelInfo } from '../types/membership';
import { buildChefResumeData, ChefResumeData } from '../utils/chefResumeHelper';
import { useI18n } from '../i18n/context';
import { 
  X, Download, Sparkles, Trophy, Award, Star, Flame, Calendar, 
  ChefHat, Heart, BookOpen, Share2, Check, RefreshCw, Layers
} from 'lucide-react';
import { toPng } from 'html-to-image';

interface ChefResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  recipes: Recipe[];
  levelInfo: UserLevelInfo;
  totalLikesReceived: number;
}

export const ChefResumeModal: React.FC<ChefResumeModalProps> = ({
  isOpen,
  onClose,
  user,
  recipes,
  levelInfo,
  totalLikesReceived
}) => {
  const { language } = useI18n();
  const posterRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [posterTheme, setPosterTheme] = useState<'warmParchment' | 'goldObsidian' | 'vintageKraft'>('warmParchment');

  // Compute resume details
  const resumeData: ChefResumeData = useMemo(() => {
    return buildChefResumeData(user, recipes, levelInfo, totalLikesReceived);
  }, [user, recipes, levelInfo, totalLikesReceived]);

  if (!isOpen) return null;

  const unlockedMedals = resumeData.medals.filter((m) => m.isUnlocked);

  // Save / Download High Resolution Poster Image
  const handleSavePoster = async () => {
    if (!posterRef.current) return;
    try {
      setIsExporting(true);
      
      // Allow DOM to settle, apply pixel ratio 2 for crisp retina rendering
      const dataUrl = await toPng(posterRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        quality: 0.98,
        filter: (node) => {
          // Exclude any interactive tooltips
          if (node instanceof HTMLElement && node.dataset.excludeFromExport) {
            return false;
          }
          return true;
        }
      });

      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `厨神履历_${resumeData.user.displayName}_${resumeData.levelInfo.title.replace(/\s+/g, '')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to export resume poster', err);
      // Fallback: simple print or alert
      alert(language === 'zh-CN' ? '保存海报失败，请稍后重试' : 'Failed to save poster image.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopySummary = () => {
    const medalsStr = unlockedMedals.map((m) => `[${m.name}]`).join(' ');
    const text = `🍳【食味手记 · 厨神履历档案】
主厨：${resumeData.user.displayName}（${resumeData.levelInfo.title}）
📜 累计私房手帐：${resumeData.stats.totalRecipes} 篇
🔥 连续烟火烹饪：${resumeData.stats.totalCookDays} 天
💖 收获厨友点赞：${resumeData.stats.totalLikes} 次
🏅 解锁厨神勋章：${unlockedMedals.length} 枚 ${medalsStr}
🌟 拿手代表作：${resumeData.masterpieces.map((r) => `《${r.title}》`).join('、')}
格言：${resumeData.culinaryMotto}
—— 来自食味手记·私房烹饪手帐`;

    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#FAF7F2] rounded-3xl border border-[#EADBCE] shadow-2xl max-w-xl w-full my-6 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EADBCE] bg-[#FFFDF9] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-[#2C2723] flex items-center gap-1.5 font-serif">
                <span>{language === 'zh-CN' ? '我的厨神履历档案' : 'My Culinary Master Resume'}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-sans font-semibold">
                  {resumeData.levelInfo.badge} {language === 'zh-CN' ? resumeData.levelInfo.title : resumeData.levelInfo.titleEn}
                </span>
              </h2>
              <p className="text-[11px] text-[#7A7268]">
                {language === 'zh-CN' ? '一键生成高颜值复古手帐风长海报' : 'Export vintage scrapbook poster to photo album'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-[#EADBCE]/50 flex items-center justify-center text-[#7A7268] hover:text-[#2C2723] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Style Selector Strip */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-[#F4EFE6] border-b border-[#EADBCE] text-xs shrink-0">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-[#7A7268]" />
            <span className="text-[#5A5248] font-medium">{language === 'zh-CN' ? '海报质感：' : 'Poster Theme:'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPosterTheme('warmParchment')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                posterTheme === 'warmParchment'
                  ? 'bg-[#C85A32] text-white shadow-xs'
                  : 'bg-white text-[#5A5248] hover:bg-stone-100'
              }`}
            >
              📜 {language === 'zh-CN' ? '温暖羊皮纸' : 'Parchment'}
            </button>
            <button
              type="button"
              onClick={() => setPosterTheme('goldObsidian')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                posterTheme === 'goldObsidian'
                  ? 'bg-[#2C2723] text-amber-300 shadow-xs border border-amber-400/30'
                  : 'bg-white text-[#5A5248] hover:bg-stone-100'
              }`}
            >
              ✨ {language === 'zh-CN' ? '黑金殿堂' : 'Black Gold'}
            </button>
            <button
              type="button"
              onClick={() => setPosterTheme('vintageKraft')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                posterTheme === 'vintageKraft'
                  ? 'bg-[#8C5D1E] text-white shadow-xs'
                  : 'bg-white text-[#5A5248] hover:bg-stone-100'
              }`}
            >
              🏷️ {language === 'zh-CN' ? '复古牛皮纸' : 'Vintage Kraft'}
            </button>
          </div>
        </div>

        {/* Scrollable Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-100/70 flex justify-center">
          
          {/* THE GENERATED POSTER CANVAS (Export Target) */}
          <div 
            ref={posterRef}
            className={`w-full max-w-[480px] rounded-2xl shadow-xl transition-all duration-300 relative overflow-hidden text-xs select-none ${
              posterTheme === 'goldObsidian'
                ? 'bg-gradient-to-b from-[#1F1B18] via-[#2A2420] to-[#171412] text-amber-100 border-2 border-amber-500/40'
                : posterTheme === 'vintageKraft'
                ? 'bg-[#EAD8BF] text-[#2C2723] border-2 border-[#C9B394]'
                : 'bg-[#FFFDF9] text-[#2C2723] border-2 border-[#EADBCE]'
            }`}
            style={{
              backgroundImage: posterTheme === 'warmParchment'
                ? 'radial-gradient(#E8DEC8 0.75px, transparent 0.75px)'
                : undefined,
              backgroundSize: '16px 16px'
            }}
          >
            {/* Washi Tape Header Decoration */}
            <div className="flex justify-center pt-3 pb-1">
              <div 
                className={`px-6 py-1 text-[10px] font-mono tracking-widest uppercase font-bold shadow-xs transform -rotate-1 ${
                  posterTheme === 'goldObsidian'
                    ? 'bg-amber-400 text-stone-950'
                    : posterTheme === 'vintageKraft'
                    ? 'bg-[#A65B32] text-white'
                    : 'bg-[#C85A32] text-white'
                }`}
              >
                ★ CULINARY MASTER PORTFOLIO ★
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              
              {/* Masthead Header & Profile Intro */}
              <div className="flex items-center gap-4 pb-4 border-b border-current/15">
                <div className="relative shrink-0">
                  <div className={`w-18 h-18 rounded-full overflow-hidden p-1 shadow-md ${
                    posterTheme === 'goldObsidian'
                      ? 'border-2 border-amber-400 bg-stone-900'
                      : 'border-2 border-[#C85A32] bg-white'
                  }`}>
                    <img 
                      src={resumeData.user.avatarUrl} 
                      alt={resumeData.user.displayName}
                      className="w-full h-full object-cover rounded-full"
                      crossOrigin="anonymous"
                    />
                  </div>
                  {/* Badge Stamp on Avatar */}
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center text-sm shadow-md font-bold">
                    {resumeData.levelInfo.badge}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-lg font-serif truncate">
                      {resumeData.user.displayName}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${
                      posterTheme === 'goldObsidian'
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                        : 'bg-[#C85A32]/10 text-[#C85A32] border border-[#C85A32]/30'
                    }`}>
                      {language === 'zh-CN' ? resumeData.levelInfo.title : resumeData.levelInfo.titleEn}
                    </span>
                  </div>

                  <p className="text-[11px] opacity-75 mt-1 font-serif italic line-clamp-2">
                    {resumeData.culinaryMotto}
                  </p>

                  <div className="flex items-center gap-2 mt-2 text-[10px] opacity-60 font-mono">
                    <span>UID: {resumeData.user.uid.slice(0, 10)}</span>
                    <span>•</span>
                    <span>档案编号: #{resumeData.levelInfo.currentExp}EXP</span>
                  </div>
                </div>
              </div>

              {/* CORE FOUR STATS CARDS */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className={`p-2.5 rounded-xl border ${
                  posterTheme === 'goldObsidian'
                    ? 'bg-white/5 border-white/10'
                    : 'bg-white/80 border-black/10 shadow-2xs'
                }`}>
                  <span className="block text-base sm:text-lg font-mono font-bold text-[#C85A32] tabular-nums">
                    {resumeData.stats.totalRecipes}
                  </span>
                  <span className="text-[10px] opacity-70 block mt-0.5">
                    {language === 'zh-CN' ? '私房手帐' : 'Recipes'}
                  </span>
                </div>

                <div className={`p-2.5 rounded-xl border ${
                  posterTheme === 'goldObsidian'
                    ? 'bg-white/5 border-white/10'
                    : 'bg-white/80 border-black/10 shadow-2xs'
                }`}>
                  <span className="block text-base sm:text-lg font-mono font-bold text-[#5F7A4D] tabular-nums">
                    {resumeData.stats.totalCookDays}
                  </span>
                  <span className="text-[10px] opacity-70 block mt-0.5">
                    {language === 'zh-CN' ? '烟火打卡' : 'Cook Days'}
                  </span>
                </div>

                <div className={`p-2.5 rounded-xl border ${
                  posterTheme === 'goldObsidian'
                    ? 'bg-white/5 border-white/10'
                    : 'bg-white/80 border-black/10 shadow-2xs'
                }`}>
                  <span className="block text-base sm:text-lg font-mono font-bold text-[#C08A3E] tabular-nums">
                    {resumeData.stats.totalLikes}
                  </span>
                  <span className="text-[10px] opacity-70 block mt-0.5">
                    {language === 'zh-CN' ? '收获暖赞' : 'Likes'}
                  </span>
                </div>

                <div className={`p-2.5 rounded-xl border ${
                  posterTheme === 'goldObsidian'
                    ? 'bg-white/5 border-white/10'
                    : 'bg-white/80 border-black/10 shadow-2xs'
                }`}>
                  <span className="block text-base sm:text-lg font-mono font-bold text-amber-500 tabular-nums">
                    {unlockedMedals.length}
                  </span>
                  <span className="text-[10px] opacity-70 block mt-0.5">
                    {language === 'zh-CN' ? '解锁勋章' : 'Medals'}
                  </span>
                </div>
              </div>

              {/* MEDALS & HONORS WALL */}
              <div className={`p-3.5 rounded-2xl border ${
                posterTheme === 'goldObsidian'
                  ? 'bg-white/5 border-white/10'
                  : 'bg-white/90 border-[#EADBCE] shadow-2xs'
              }`}>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5 font-bold font-serif text-xs">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>{language === 'zh-CN' ? '主厨勋章与专属荣誉' : 'Chef Medals & Honors'}</span>
                  </div>
                  <span className="text-[10px] opacity-60 font-mono">
                    {unlockedMedals.length} / {resumeData.medals.length}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {resumeData.medals.map((medal) => (
                    <div 
                      key={medal.id}
                      className={`flex flex-col items-center p-2 rounded-xl text-center border transition-all ${
                        medal.isUnlocked
                          ? posterTheme === 'goldObsidian'
                            ? 'bg-amber-400/10 border-amber-400/30 text-amber-200'
                            : 'bg-amber-50 border-amber-200/80 text-amber-900 shadow-2xs'
                          : 'opacity-35 grayscale border-dashed border-current/20'
                      }`}
                    >
                      <span className="text-xl sm:text-2xl mb-1">{medal.icon}</span>
                      <span className="text-[10px] font-bold truncate max-w-full leading-tight">
                        {language === 'zh-CN' ? medal.name : medal.nameEn}
                      </span>
                      <span className="text-[8px] opacity-75 scale-90 origin-top mt-0.5 truncate max-w-full">
                        {medal.isUnlocked ? (language === 'zh-CN' ? '已点亮' : 'Unlocked') : (language === 'zh-CN' ? '未点亮' : 'Locked')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* MASTERPIECES SECTION (Representative Works) */}
              <div className={`p-3.5 rounded-2xl border ${
                posterTheme === 'goldObsidian'
                  ? 'bg-white/5 border-white/10'
                  : 'bg-white/90 border-[#EADBCE] shadow-2xs'
              }`}>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5 font-bold font-serif text-xs">
                    <Star className="w-3.5 h-3.5 text-[#C85A32]" />
                    <span>{language === 'zh-CN' ? '主厨传家代表作 (Masterpieces)' : 'Signature Masterpieces'}</span>
                  </div>
                  <span className="text-[10px] opacity-60">
                    {language === 'zh-CN' ? `拿手菜系：${resumeData.stats.favoriteCategory}` : `Style: ${resumeData.stats.favoriteCategory}`}
                  </span>
                </div>

                {resumeData.masterpieces.length > 0 ? (
                  <div className="space-y-2">
                    {resumeData.masterpieces.map((rec, idx) => (
                      <div 
                        key={rec.id}
                        className={`flex items-center gap-3 p-2 rounded-xl border ${
                          posterTheme === 'goldObsidian'
                            ? 'bg-white/5 border-white/10'
                            : 'bg-[#FAF7F2] border-[#EADBCE]'
                        }`}
                      >
                        {/* Number or thumbnail */}
                        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-current/10 bg-stone-800">
                          {rec.coverImage ? (
                            <img 
                              src={rec.coverImage} 
                              alt={rec.title}
                              className="w-full h-full object-cover"
                              crossOrigin="anonymous"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-amber-400 font-serif">
                              #{idx + 1}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-xs truncate font-serif">
                              {rec.title}
                            </h4>
                            <span className="text-[10px] text-amber-500 font-mono font-bold shrink-0">
                              {'★'.repeat(rec.difficulty || 3)}
                            </span>
                          </div>
                          <p className="text-[10px] opacity-70 truncate mt-0.5">
                            {rec.subtitle || rec.review?.tastingNotes || (language === 'zh-CN' ? '私房手作，人间烟火。' : 'Culinary masterpiece')}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[9px] opacity-60">
                            <span>{rec.category}</span>
                            <span>•</span>
                            <span>{rec.prepTimeMinutes + rec.cookTimeMinutes} {language === 'zh-CN' ? '分钟' : 'mins'}</span>
                            {rec.likesCount ? <span>• ❤️ {rec.likesCount}</span> : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center opacity-50 text-xs italic">
                    {language === 'zh-CN' ? '暂无代表作，开始记录你的第一道拿手菜吧！' : 'No recipes yet. Start recording your masterpieces!'}
                  </div>
                )}
              </div>

              {/* POSTER FOOTER / OFFICIAL CERTIFICATE SEAL */}
              <div className="pt-2 flex items-center justify-between border-t border-current/15">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-serif font-bold text-[11px]">
                    <ChefHat className="w-3.5 h-3.5 text-[#C85A32]" />
                    <span>食味手记 · 私房烹饪手帐本</span>
                  </div>
                  <p className="text-[9px] opacity-60 font-mono">
                    认证日期：{resumeData.generatedDate} · 官方防伪履历
                  </p>
                </div>

                {/* Wax / Circular Seal */}
                <div className={`w-14 h-14 rounded-full border-2 border-dashed flex flex-col items-center justify-center text-center transform -rotate-12 select-none ${
                  posterTheme === 'goldObsidian'
                    ? 'border-amber-400 text-amber-300'
                    : 'border-[#C85A32] text-[#C85A32]'
                }`}>
                  <span className="text-[8px] font-bold tracking-tighter uppercase font-mono">VERIFIED</span>
                  <span className="text-[10px] font-serif font-bold">厨神认证</span>
                  <span className="text-[7px] font-mono leading-none">★★★★★</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Action Buttons Toolbar at Bottom */}
        <div className="p-4 bg-[#FFFDF9] border-t border-[#EADBCE] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-[#7A7268] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>
              {language === 'zh-CN' 
                ? '已自动聚合手帐、等级、勋章与拿手菜' 
                : 'Aggregated recipes, ranks, medals & works'}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Copy Text Summary */}
            <button
              type="button"
              onClick={handleCopySummary}
              className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl border border-[#EADBCE] bg-white text-[#5A5248] font-bold hover:bg-[#FAF7F2] active:scale-95 transition-all text-xs flex items-center justify-center gap-1.5"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedLink ? (language === 'zh-CN' ? '已复制文字' : 'Copied') : (language === 'zh-CN' ? '复制文字版' : 'Copy Text')}</span>
            </button>

            {/* Save High-Res Image to Local Photo Album */}
            <button
              type="button"
              onClick={handleSavePoster}
              disabled={isExporting}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 ${
                downloadSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-[#C85A32] to-[#B24823] text-white hover:brightness-105'
              }`}
            >
              {isExporting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : downloadSuccess ? (
                <Check className="w-4 h-4" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>
                {isExporting
                  ? (language === 'zh-CN' ? '正在渲染生成高清图片...' : 'Generating Image...')
                  : downloadSuccess
                  ? (language === 'zh-CN' ? '海报已保存到相册！' : 'Saved to Album!')
                  : (language === 'zh-CN' ? '一键保存海报到本地相册' : 'Save Poster to Album')}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
