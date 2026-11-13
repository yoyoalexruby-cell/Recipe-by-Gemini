import React, { useState, useEffect, useMemo } from 'react';
import { ContestTheme, ContestSubmission } from '../types/contest';
import { Recipe } from '../types/recipe';
import { UserProfile } from '../types/auth';
import { FoodArtFallback } from './IllustrationPresets';
import { 
  CONTEST_THEMES, 
  getContestSubmissions, 
  saveContestSubmission, 
  rateContestSubmission, 
  cloneContestToUserJournal 
} from '../utils/contestStorage';
import { compressImageFile } from '../utils/storage';
import { useI18n } from '../i18n/context';
import { 
  Trophy, Award, Star, Flame, Sparkles, Plus, 
  Camera, Check, MessageSquare, ArrowRight, Heart, 
  Share2, BookOpen, Clock, Users, X, Send, ChevronRight, Flag
} from 'lucide-react';
import { UGCReportModal } from './UGCReportModal';
import { getBlockedUserIds } from '../utils/ugcModeration';

interface MasterChefContestViewProps {
  currentUser: UserProfile | null;
  userRecipes: Recipe[];
  onOpenRecipe: (recipe: Recipe) => void;
  onOpenAuth: () => void;
  onRecipeCloned: (cloned: Recipe) => void;
}

export const MasterChefContestView: React.FC<MasterChefContestViewProps> = ({
  currentUser,
  userRecipes,
  onOpenRecipe,
  onOpenAuth,
  onRecipeCloned
}) => {
  const { t, language, formatMinutes, formatServings } = useI18n();

  // Selected Challenge Dish Theme
  const [selectedThemeId, setSelectedThemeId] = useState<string>(CONTEST_THEMES[0].id);
  const activeTheme = useMemo(() => {
    return CONTEST_THEMES.find((th) => th.id === selectedThemeId) || CONTEST_THEMES[0];
  }, [selectedThemeId]);

  // Submissions State
  const [submissions, setSubmissions] = useState<ContestSubmission[]>(() => 
    getContestSubmissions()
  );

  // Listen to contest storage updates across tabs
  useEffect(() => {
    const handleUpdate = (e: CustomEvent) => {
      if (e.detail) {
        setSubmissions(e.detail);
      } else {
        setSubmissions(getContestSubmissions());
      }
    };
    window.addEventListener('contest-updated', handleUpdate as EventListener);
    return () => {
      window.removeEventListener('contest-updated', handleUpdate as EventListener);
    };
  }, []);

  // Filtered submissions for currently selected dish (Excluding blocked authors per Apple Guideline 1.2)
  const [reportModalData, setReportModalData] = useState<{
    targetId: string;
    targetTitle: string;
    authorId: string;
    authorName: string;
  } | null>(null);
  const [blockedUsersRevision, setBlockedUsersRevision] = useState(0);

  // Listen to block updates
  useEffect(() => {
    const handleMod = () => setBlockedUsersRevision((p) => p + 1);
    window.addEventListener('ugc-moderation-updated', handleMod);
    return () => window.removeEventListener('ugc-moderation-updated', handleMod);
  }, []);

  const currentDishSubmissions = useMemo(() => {
    const blocked = getBlockedUserIds();
    return submissions
      .filter((s) => s.dishId === activeTheme.id)
      .filter((s) => !blocked.includes(s.authorId) && !blocked.includes(s.authorName))
      .sort((a, b) => b.totalScore - a.totalScore); // Highest rated first
  }, [submissions, activeTheme.id, blockedUsersRevision]);

  // Modals state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [ratingTarget, setRatingTarget] = useState<ContestSubmission | null>(null);
  const [inspectTarget, setInspectTarget] = useState<ContestSubmission | null>(null);
  const [clonedSuccessId, setClonedSuccessId] = useState<string | null>(null);
  const [actionToast, setActionToast] = useState<string | null>(null);

  // New submission form fields
  const [submitTitle, setSubmitTitle] = useState('');
  const [submitStory, setSubmitStory] = useState('');
  const [submitTip, setSubmitTip] = useState('');
  const [submitCoverImage, setSubmitCoverImage] = useState('');
  const [submitSelectedRecipeId, setSubmitSelectedRecipeId] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Rating modal form fields
  const [rateTaste, setRateTaste] = useState(5);
  const [ratePlating, setRatePlating] = useState(5);
  const [rateHeat, setRateHeat] = useState(5);
  const [rateComment, setRateComment] = useState('');

  // Handle Photo Upload in Submit Modal
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingPhoto(true);
      const base64 = await compressImageFile(file);
      setSubmitCoverImage(base64);
    } catch (err) {
      console.error('Photo compression error', err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Submit entry handler
  const handleSubmitEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitTitle.trim() || !submitStory.trim()) {
      alert(language === 'zh-CN' ? '请填写作品标题与下厨复盘心得！' : 'Please provide a title and cooking story!');
      return;
    }

    const linkedRecipe = userRecipes.find((r) => r.id === submitSelectedRecipeId);
    const coverToUse = submitCoverImage || linkedRecipe?.coverImage || activeTheme.coverImage;

    saveContestSubmission(
      activeTheme,
      {
        title: submitTitle.trim(),
        story: submitStory.trim(),
        coverImage: coverToUse,
        secretTip: submitTip.trim() || undefined,
        recipeData: linkedRecipe
      },
      currentUser
    );

    setIsSubmitModalOpen(false);
    setSubmitTitle('');
    setSubmitStory('');
    setSubmitTip('');
    setSubmitCoverImage('');
    setSubmitSelectedRecipeId('');

    setActionToast(
      language === 'zh-CN' 
        ? `🎉 参赛手帐《${submitTitle}》已成功提交至【${activeTheme.dishName}】擂台！`
        : `🎉 Entry successfully submitted to the ${activeTheme.dishName} Challenge!`
    );
    setTimeout(() => setActionToast(null), 3500);
  };

  // Submit rating handler
  const handleConfirmVote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingTarget) return;

    const res = rateContestSubmission(
      ratingTarget.id,
      {
        taste: rateTaste,
        plating: ratePlating,
        heat: rateHeat,
        comment: rateComment
      },
      currentUser
    );

    if (res.success) {
      setActionToast(
        language === 'zh-CN'
          ? `⭐ 感谢您的评分！当前作品综合评分为 ${res.newScore} 分 (${res.newCount}人评分)`
          : `⭐ Thank you for rating! Current overall score: ${res.newScore} (${res.newCount} votes)`
      );
      setTimeout(() => setActionToast(null), 3500);
    }

    setRatingTarget(null);
    setRateTaste(5);
    setRatePlating(5);
    setRateHeat(5);
    setRateComment('');
  };

  // One-Click Clone to My Journal
  const handleCloneToMyJournal = (submission: ContestSubmission) => {
    const cloned = cloneContestToUserJournal(submission, currentUser);
    onRecipeCloned(cloned);
    setClonedSuccessId(submission.id);
    setActionToast(
      language === 'zh-CN'
        ? `📖 已成功将 @${submission.authorName} 的参赛作品收录到您的私房手帐中！`
        : `📖 Successfully cloned @${submission.authorName}'s contest recipe to your personal journal!`
    );
    setTimeout(() => {
      setClonedSuccessId(null);
      setActionToast(null);
    }, 3500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6 animate-fade-in">

      {/* 1. Masthead Banner: Master Chef Contest Hero */}
      <div className="bg-white border border-[#EADBCE] rounded-2xl p-6 sm:p-8 paper-shadow bg-notebook-dots relative overflow-hidden">
        {/* Washi Tape Ribbon */}
        <div className="absolute top-0 right-10 transform -translate-y-1/2 pointer-events-none">
          <div className="washi-tape px-6 py-1 bg-[#C85A32] text-amber-50 text-xs font-mono tracking-widest uppercase shadow-xs">
            MASTER CHEF ARENA · LIVE
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-serif tracking-widest text-[#C85A32] uppercase font-bold flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span>{language === 'zh-CN' ? '厨神大赛 · 金牌挑战赛' : 'Master Chef Contest · Culinary Championship'}</span>
              </span>
              <span className="text-[11px] text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full font-semibold">
                {language === 'zh-CN' ? '进行中 · 网友公投' : 'Active Voting'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold font-journal-title text-[#2C2723] leading-tight mb-2">
              {language === 'zh-CN' ? '同道名菜百家争鸣，谁是当季掌勺厨神？' : 'Same Iconic Dish, Infinite Flavors: Who Reigns Supreme?'}
            </h1>

            <p className="text-xs sm:text-sm text-[#7A7268] leading-relaxed font-serif">
              {language === 'zh-CN' 
                ? '每期指定一道经典挑战菜品。在同一道菜品下提交您的私房做法与实拍图，由广大厨友从「味道口感、摆盘美感、火候把握」三重维度打分；心仪好菜一键收录进私房手帐！'
                : 'Each season features an iconic signature dish. Submit your personal variation and food photos under the same dish, receive community ratings, and clone your favorite winning recipes into your own journal with one click!'}
            </p>
          </div>

          {/* Action: Submit Entry CTA */}
          <div className="shrink-0 flex flex-col gap-2">
            <button
              onClick={() => {
                if (!currentUser) {
                  onOpenAuth();
                  return;
                }
                setIsSubmitModalOpen(true);
              }}
              className="px-5 py-3 bg-[#C85A32] hover:bg-[#B34C26] text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 min-h-[44px]"
            >
              <Camera className="w-4 h-4" />
              <span>{language === 'zh-CN' ? '参与打擂 · 提交我的参赛手帐' : 'Submit My Contest Entry'}</span>
            </button>
            <span className="text-[11px] text-center text-[#7A7268]">
              {language === 'zh-CN' ? `本期赛题：${activeTheme.dishName}` : `Current Theme: ${activeTheme.dishEnglishName || activeTheme.dishName}`}
            </span>
          </div>
        </div>

        {/* Challenge Dish Selector Tabs */}
        <div className="mt-8 pt-5 border-t border-[#F0E6DC]">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-[11px] font-semibold text-[#7A7268] shrink-0 mr-1">
              {language === 'zh-CN' ? '选择本期擂台菜题：' : 'Select Challenge Dish:'}
            </span>
            {CONTEST_THEMES.map((th) => {
              const isSelected = th.id === activeTheme.id;
              const count = submissions.filter((s) => s.dishId === th.id).length;
              return (
                <button
                  key={th.id}
                  onClick={() => setSelectedThemeId(th.id)}
                  className={`px-3.5 py-2 rounded-xl whitespace-nowrap font-medium transition-all flex items-center gap-2 border min-h-[40px] ${
                    isSelected
                      ? 'bg-[#2C2723] text-white border-[#2C2723] shadow-sm'
                      : 'bg-[#FAF7F2] text-[#7A7268] border-[#EADBCE] hover:text-[#2C2723] hover:border-[#C85A32]/40'
                  }`}
                >
                  <span className="font-semibold">{language === 'zh-CN' ? th.dishName : th.dishEnglishName}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-stone-200 text-[#7A7268]'
                  }`}>
                    {count} {language === 'zh-CN' ? '篇打擂' : 'entries'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Challenge Dish Details & Standards Spotlight */}
      <div className="bg-[#FAF7F2] border border-[#EADBCE] rounded-2xl p-5 sm:p-6 polaroid-shadow relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="w-full lg:w-48 h-36 rounded-xl overflow-hidden shrink-0 border border-[#EADBCE] shadow-2xs relative">
            <img 
              src={activeTheme.coverImage} 
              alt={activeTheme.dishName} 
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 bg-[#2C2723]/80 backdrop-blur-xs text-amber-200 text-[10px] px-2 py-0.5 rounded font-mono">
              {activeTheme.seasonTag}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className="text-xl sm:text-2xl font-bold font-journal-title text-[#2C2723]">
                {language === 'zh-CN' ? activeTheme.dishName : activeTheme.dishEnglishName}
              </h2>
              <span className="text-xs bg-[#FAF3EC] text-[#C85A32] border border-[#EADBCE] px-2.5 py-0.5 rounded-full font-medium">
                {activeTheme.category}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#7A7268] leading-relaxed mb-3">
              {activeTheme.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-white/80 p-2.5 rounded-lg border border-[#EADBCE]/80 flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#C85A32] shrink-0" />
                <span className="text-[#5A5248] text-[11px] leading-snug">{activeTheme.rules}</span>
              </div>
              <div className="bg-white/80 p-2.5 rounded-lg border border-[#EADBCE]/80 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-[#5A5248] text-[11px] leading-snug">
                  {language === 'zh-CN' ? `评选截止：${activeTheme.deadline} · ${activeTheme.prizeNote}` : `Deadline: ${activeTheme.deadline}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Contestants Submissions Feed & Leaderboard */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold font-journal-title text-[#2C2723] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C85A32]" />
              <span>{language === 'zh-CN' ? `【${activeTheme.dishName}】打擂作品榜单` : `Contest Leaderboard · ${activeTheme.dishName}`}</span>
            </h3>
            <span className="text-xs text-[#7A7268]">
              ({currentDishSubmissions.length} {language === 'zh-CN' ? '位厨友参与' : 'entries'})
            </span>
          </div>
        </div>

        {currentDishSubmissions.length === 0 ? (
          <div className="bg-white border border-dashed border-[#EADBCE] rounded-2xl p-12 text-center max-w-md mx-auto">
            <Trophy className="w-10 h-10 text-amber-400/50 mx-auto mb-3" />
            <h4 className="text-base font-bold text-[#2C2723] font-journal-title mb-1">
              {language === 'zh-CN' ? '暂无打擂作品，成为首位擂主！' : 'No entries yet. Be the first contender!'}
            </h4>
            <p className="text-xs text-[#7A7268] mb-4">
              {language === 'zh-CN' 
                ? '上传您制作的实拍图与火候心得，即可开启网友打分，角逐本季金牌手帐奖章！' 
                : 'Upload your food photos and secret tips to start receiving votes!'}
            </p>
            <button
              onClick={() => {
                if (!currentUser) { onOpenAuth(); return; }
                setIsSubmitModalOpen(true);
              }}
              className="px-4 py-2 bg-[#C85A32] text-white text-xs font-semibold rounded-lg hover:bg-[#B34C26] transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'zh-CN' ? '立即提交我的手帐' : 'Submit My Entry'}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentDishSubmissions.map((sub, idx) => {
              const isGold = idx === 0;
              const isSilver = idx === 1;
              const isBronze = idx === 2;

              return (
                <div
                  key={sub.id}
                  className="bg-white border border-[#EADBCE] rounded-2xl overflow-hidden paper-shadow hover:shadow-lg transition-all flex flex-col justify-between relative group"
                >
                  {/* Rank Ribbon Badge */}
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-1">
                    {isGold ? (
                      <span className="px-2.5 py-1 bg-amber-400 text-amber-950 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1">
                        <span>🥇</span>
                        <span>{language === 'zh-CN' ? '榜首第1名' : '#1 Gold'}</span>
                      </span>
                    ) : isSilver ? (
                      <span className="px-2 py-0.5 bg-stone-200 text-stone-800 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1">
                        <span>🥈</span>
                        <span>{language === 'zh-CN' ? '第2名' : '#2 Silver'}</span>
                      </span>
                    ) : isBronze ? (
                      <span className="px-2 py-0.5 bg-amber-700/80 text-amber-50 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1">
                        <span>🥉</span>
                        <span>{language === 'zh-CN' ? '第3名' : '#3 Bronze'}</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-black/40 backdrop-blur-sm text-white text-xs font-mono rounded">
                        #{idx + 1}
                      </span>
                    )}
                  </div>

                  {/* Visual Cover Photo with Food Art Fallback */}
                  <div 
                    onClick={() => setInspectTarget(sub)}
                    className="relative aspect-[4/3] w-full overflow-hidden bg-[#FAF7F2] cursor-pointer"
                  >
                    {sub.coverImage ? (
                      <img 
                        src={sub.coverImage} 
                        alt={sub.title} 
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" 
                      />
                    ) : (
                      <FoodArtFallback type={sub.title} className="w-full h-full" />
                    )}

                    {/* Overall Score Badge Overlay */}
                    <div className="absolute bottom-2.5 right-3 bg-[#2C2723]/90 backdrop-blur-sm border border-amber-300/40 text-amber-300 px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-md">
                      <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
                      <span className="text-sm font-bold font-mono">{sub.totalScore.toFixed(1)}</span>
                      <span className="text-[10px] text-amber-200/80 font-normal">
                        ({sub.voteCount} {language === 'zh-CN' ? '人打分' : 'votes'})
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Author Header */}
                      <div className="flex items-center gap-2 mb-2">
                        <img 
                          src={sub.authorAvatar} 
                          alt={sub.authorName} 
                          className="w-6 h-6 rounded-full object-cover border border-[#EADBCE]" 
                        />
                        <span className="text-xs font-semibold text-[#2C2723]">{sub.authorName}</span>
                        <div className="flex items-center gap-1.5 ml-auto">
                          <span className="text-[10px] text-[#9A9085] font-mono">{sub.createdAt}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setReportModalData({
                                targetId: sub.id,
                                targetTitle: sub.title,
                                authorId: sub.authorId,
                                authorName: sub.authorName
                              });
                            }}
                            className="p-1 text-[#9A9085] hover:text-rose-600 rounded-md transition-colors"
                            title={language === 'zh-CN' ? '举报违规或屏蔽作者' : 'Report or Block'}
                          >
                            <Flag className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Entry Title */}
                      <h4 
                        onClick={() => setInspectTarget(sub)}
                        className="text-base font-bold text-[#2C2723] font-journal-title leading-snug hover:text-[#C85A32] cursor-pointer transition-colors mb-2 line-clamp-2"
                      >
                        {sub.title}
                      </h4>

                      {/* Cooking Story Snippet */}
                      <p className="text-xs text-[#7A7268] line-clamp-3 leading-relaxed mb-3 font-serif">
                        “{sub.story}”
                      </p>

                      {/* Secret Tip Callout if present */}
                      {sub.secretTip && (
                        <div className="bg-[#FAF3EC] border border-[#EADBCE] rounded-lg p-2.5 mb-3 text-xs text-[#C85A32] flex items-start gap-1.5">
                          <Flame className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#C85A32]" />
                          <span className="text-[11px] leading-snug line-clamp-2">
                            <strong>{language === 'zh-CN' ? '掌勺绝招：' : 'Secret Tip: '}</strong>
                            {sub.secretTip}
                          </span>
                        </div>
                      )}

                      {/* Three-Dimensional Rating Breakdown */}
                      <div className="grid grid-cols-3 gap-1.5 py-2.5 px-3 bg-[#FAF7F2] rounded-xl border border-[#EADBCE]/70 text-[11px] text-center mb-3">
                        <div>
                          <div className="text-[10px] text-[#7A7268]">{language === 'zh-CN' ? '味道口感' : 'Taste'}</div>
                          <div className="font-mono font-bold text-[#C85A32] text-xs">{(sub.ratings.taste || 4.8).toFixed(1)}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-[#7A7268]">{language === 'zh-CN' ? '摆盘视觉' : 'Plating'}</div>
                          <div className="font-mono font-bold text-[#C85A32] text-xs">{(sub.ratings.plating || 4.8).toFixed(1)}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-[#7A7268]">{language === 'zh-CN' ? '火候拿捏' : 'Heat'}</div>
                          <div className="font-mono font-bold text-[#C85A32] text-xs">{(sub.ratings.heat || 4.8).toFixed(1)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions: Rate & One-Click Clone to My Journal */}
                    <div className="pt-3 border-t border-[#F0E6DC] flex items-center justify-between gap-2">
                      {/* Community Rate Button */}
                      <button
                        type="button"
                        onClick={() => setRatingTarget(sub)}
                        className="flex-1 min-h-[38px] px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#FAF3EC] text-[#2C2723] hover:text-[#C85A32] border border-[#EADBCE] hover:border-[#C85A32]/40 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                        title={language === 'zh-CN' ? '给这位厨友的作品打分评价' : 'Rate this submission'}
                      >
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                        <span>{language === 'zh-CN' ? '网友打分' : 'Rate Entry'}</span>
                      </button>

                      {/* One-Click Clone into Personal Journal */}
                      <button
                        type="button"
                        onClick={() => handleCloneToMyJournal(sub)}
                        className={`flex-1 min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs ${
                          clonedSuccessId === sub.id
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#C85A32] hover:bg-[#B34C26] text-white active:scale-98'
                        }`}
                        title={language === 'zh-CN' ? '一键将这道参赛手帐收录进您的私房食谱库' : 'Clone this recipe into your personal journal'}
                      >
                        {clonedSuccessId === sub.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>{language === 'zh-CN' ? '已成功收录' : 'Imported!'}</span>
                          </>
                        ) : (
                          <>
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>{language === 'zh-CN' ? '一键收录手帐' : 'Import to Journal'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Submission Modal: Upload own recipe / photos */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-[#EADBCE] rounded-2xl max-w-lg w-full p-6 paper-shadow bg-notebook-dots relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADBCE] mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500 fill-amber-400" />
                <h3 className="text-lg font-bold font-journal-title text-[#2C2723]">
                  {language === 'zh-CN' ? `参与【${activeTheme.dishName}】打擂` : `Submit Entry · ${activeTheme.dishName}`}
                </h3>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1 rounded-lg text-[#9A9085] hover:text-[#2C2723]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEntry} className="space-y-4 text-xs">
              {/* Option to link an existing recipe from user recipes */}
              {userRecipes.length > 0 && (
                <div>
                  <label className="block font-medium text-[#2C2723] mb-1">
                    {language === 'zh-CN' ? '关联我手帐里的现有食谱 (可选，自动提取食材与步骤)' : 'Link an existing recipe from your journal (Optional)'}
                  </label>
                  <select
                    value={submitSelectedRecipeId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSubmitSelectedRecipeId(id);
                      const found = userRecipes.find((r) => r.id === id);
                      if (found) {
                        if (!submitTitle) setSubmitTitle(found.title);
                        if (!submitStory && found.subtitle) setSubmitStory(found.subtitle);
                        if (!submitCoverImage && found.coverImage) setSubmitCoverImage(found.coverImage);
                      }
                    }}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs text-[#2C2723] focus:outline-hidden focus:border-[#C85A32]"
                  >
                    <option value="">{language === 'zh-CN' ? '-- 不关联，直接填写新打擂手帐 --' : '-- Direct entry without linking --'}</option>
                    {userRecipes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title} ({r.category})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block font-medium text-[#2C2723] mb-1">
                  {language === 'zh-CN' ? '参赛作品标题 * (突出您的调味特色与手法)' : 'Contest Entry Title *'}
                </label>
                <input
                  type="text"
                  required
                  value={submitTitle}
                  onChange={(e) => setSubmitTitle(e.target.value)}
                  placeholder={language === 'zh-CN' ? '例如：古法花雕慢煨90分钟 · 冰糖红亮挂汁版' : 'e.g. 90-Min Slow Braised with Floral Shaoxing Wine'}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs text-[#2C2723] focus:outline-hidden focus:border-[#C85A32]"
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block font-medium text-[#2C2723] mb-1">
                  {language === 'zh-CN' ? '菜品实拍图片' : 'Food Photo'}
                </label>
                <div className="flex items-center gap-3">
                  {submitCoverImage ? (
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-[#EADBCE] shrink-0">
                      <img src={submitCoverImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-[#FAF7F2] border border-dashed border-[#EADBCE] flex items-center justify-center text-[#9A9085] shrink-0">
                      <Camera className="w-6 h-6" />
                    </div>
                  )}
                  <label className="px-3 py-2 bg-[#FAF7F2] hover:bg-[#FAF3EC] text-[#C85A32] border border-[#C85A32]/40 rounded-xl cursor-pointer font-medium transition-colors">
                    <span>{isUploadingPhoto ? '上传压缩中...' : submitCoverImage ? '更换照片' : '上传我的实拍照片'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handlePhotoUpload} 
                      disabled={isUploadingPhoto} 
                    />
                  </label>
                </div>
              </div>

              {/* Story & Review */}
              <div>
                <label className="block font-medium text-[#2C2723] mb-1">
                  {language === 'zh-CN' ? '做菜手记与心得故事 *' : 'Cooking Story & Reflections *'}
                </label>
                <textarea
                  required
                  rows={4}
                  value={submitStory}
                  onChange={(e) => setSubmitStory(e.target.value)}
                  placeholder={language === 'zh-CN' ? '分享您对这道菜的改良、火候的感悟或制作时难忘的细节...' : 'Share your adjustments, heat control experience, or memories...'}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs text-[#2C2723] focus:outline-hidden focus:border-[#C85A32] leading-relaxed"
                />
              </div>

              {/* Secret Tip */}
              <div>
                <label className="block font-medium text-[#2C2723] mb-1">
                  {language === 'zh-CN' ? '主厨不传绝招 (可选，如特殊配料或避坑技巧)' : 'Secret Chef Tip (Optional)'}
                </label>
                <input
                  type="text"
                  value={submitTip}
                  onChange={(e) => setSubmitTip(e.target.value)}
                  placeholder={language === 'zh-CN' ? '例如：加两颗干山楂天然软肉解腻 / 出炉后震两下倒扣晾凉' : 'e.g. Add dried hawthorn for tender texture'}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs text-[#2C2723] focus:outline-hidden focus:border-[#C85A32]"
                />
              </div>

              <div className="pt-3 border-t border-[#EADBCE] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 border border-[#EADBCE] text-[#7A7268] hover:text-[#2C2723] rounded-xl font-medium"
                >
                  {language === 'zh-CN' ? '取消' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C85A32] hover:bg-[#B34C26] text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{language === 'zh-CN' ? '确认提交参赛' : 'Confirm Submission'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Rating & Voting Modal */}
      {ratingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-[#EADBCE] rounded-2xl max-w-md w-full p-6 paper-shadow bg-notebook-dots relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADBCE] mb-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                <h3 className="text-base font-bold font-journal-title text-[#2C2723]">
                  {language === 'zh-CN' ? '网友评审打分' : 'Rate Submission'}
                </h3>
              </div>
              <button
                onClick={() => setRatingTarget(null)}
                className="p-1 rounded-lg text-[#9A9085] hover:text-[#2C2723]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 bg-[#FAF7F2] p-3 rounded-xl border border-[#EADBCE] flex items-center gap-3">
              <img 
                src={ratingTarget.coverImage} 
                alt={ratingTarget.title} 
                className="w-14 h-14 rounded-lg object-cover shrink-0 border border-[#EADBCE]" 
              />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#2C2723] truncate">{ratingTarget.title}</h4>
                <p className="text-[11px] text-[#7A7268]">@{ratingTarget.authorName}</p>
                <p className="text-[10px] text-amber-600 font-mono font-semibold">
                  {language === 'zh-CN' ? `当前得分：${ratingTarget.totalScore.toFixed(1)} 分 (${ratingTarget.voteCount}人打分)` : `Score: ${ratingTarget.totalScore.toFixed(1)}`}
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmVote} className="space-y-4 text-xs">
              {/* Dimension 1: Taste */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-[#2C2723] flex items-center gap-1">
                    <span>👅</span>
                    <span>{language === 'zh-CN' ? '味道口感 (40%)' : 'Taste & Flavor (40%)'}</span>
                  </span>
                  <span className="font-mono font-bold text-[#C85A32]">{rateTaste} 星</span>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setRateTaste(s)}
                      className="p-1 focus:outline-hidden"
                    >
                      <Star className={`w-6 h-6 transition-transform hover:scale-110 ${s <= rateTaste ? 'text-amber-400 fill-amber-400' : 'text-stone-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Dimension 2: Plating */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-[#2C2723] flex items-center gap-1">
                    <span>🎨</span>
                    <span>{language === 'zh-CN' ? '摆盘视觉 (30%)' : 'Plating & Presentation (30%)'}</span>
                  </span>
                  <span className="font-mono font-bold text-[#C85A32]">{ratePlating} 星</span>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setRatePlating(s)}
                      className="p-1 focus:outline-hidden"
                    >
                      <Star className={`w-6 h-6 transition-transform hover:scale-110 ${s <= ratePlating ? 'text-amber-400 fill-amber-400' : 'text-stone-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Dimension 3: Heat */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-[#2C2723] flex items-center gap-1">
                    <span>🔥</span>
                    <span>{language === 'zh-CN' ? '火候拿捏 (30%)' : 'Heat & Technique (30%)'}</span>
                  </span>
                  <span className="font-mono font-bold text-[#C85A32]">{rateHeat} 星</span>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setRateHeat(s)}
                      className="p-1 focus:outline-hidden"
                    >
                      <Star className={`w-6 h-6 transition-transform hover:scale-110 ${s <= rateHeat ? 'text-amber-400 fill-amber-400' : 'text-stone-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Comment */}
              <div>
                <label className="block font-medium text-[#2C2723] mb-1">
                  {language === 'zh-CN' ? '大众评审品鉴评语 (可选)' : 'Review Comment (Optional)'}
                </label>
                <input
                  type="text"
                  value={rateComment}
                  onChange={(e) => setRateComment(e.target.value)}
                  placeholder={language === 'zh-CN' ? '写一句鼓励或品鉴点评...' : 'Leave a comment...'}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs text-[#2C2723] focus:outline-hidden focus:border-[#C85A32]"
                />
              </div>

              {/* Total preview calculation */}
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200/60 flex items-center justify-between text-xs">
                <span className="text-amber-900 font-medium">{language === 'zh-CN' ? '预估您给出的综合加权分：' : 'Calculated Weighted Score:'}</span>
                <span className="font-mono font-bold text-amber-700 text-sm">
                  {(((rateTaste + ratePlating + rateHeat) / 15) * 10).toFixed(1)} / 10
                </span>
              </div>

              <div className="pt-3 border-t border-[#EADBCE] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRatingTarget(null)}
                  className="px-4 py-2 border border-[#EADBCE] text-[#7A7268] hover:text-[#2C2723] rounded-xl font-medium"
                >
                  {language === 'zh-CN' ? '取消' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C85A32] hover:bg-[#B34C26] text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{language === 'zh-CN' ? '确认打分投票' : 'Submit Rating'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Inspect Contest Submission Full Recipe Modal */}
      {inspectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-[#EADBCE] rounded-2xl max-w-2xl w-full p-6 sm:p-8 paper-shadow bg-notebook-dots relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setInspectTarget(null)}
              className="absolute top-5 right-5 p-1 rounded-lg text-[#9A9085] hover:text-[#2C2723]"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header info */}
            <div className="flex items-center gap-3 mb-4">
              <img 
                src={inspectTarget.authorAvatar} 
                alt={inspectTarget.authorName} 
                className="w-10 h-10 rounded-full object-cover border border-[#EADBCE]" 
              />
              <div>
                <h3 className="text-xl font-bold font-journal-title text-[#2C2723]">
                  {inspectTarget.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-[#7A7268]">
                  <span>@{inspectTarget.authorName}</span>
                  <span>·</span>
                  <span>{inspectTarget.dishName}</span>
                  <span>·</span>
                  <span className="font-mono text-[#C85A32] font-semibold">★ {inspectTarget.totalScore.toFixed(1)} 分</span>
                </div>
              </div>
            </div>

            {/* Cover image */}
            <div className="aspect-[16/9] w-full rounded-xl overflow-hidden mb-5 border border-[#EADBCE]">
              <img src={inspectTarget.coverImage} alt={inspectTarget.title} className="w-full h-full object-cover" />
            </div>

            {/* Story & Tips */}
            <div className="mb-6 space-y-3">
              <h4 className="text-xs font-semibold text-[#C85A32] uppercase tracking-wider">
                {language === 'zh-CN' ? '下厨故事与复盘心得' : 'Cooking Story'}
              </h4>
              <p className="text-xs sm:text-sm text-[#5A5248] leading-relaxed font-serif italic bg-[#FAF7F2] p-4 rounded-xl border border-[#EADBCE]">
                “{inspectTarget.story}”
              </p>
              {inspectTarget.secretTip && (
                <div className="bg-[#FAF3EC] p-3 rounded-xl border border-[#EADBCE] text-xs text-[#C85A32] flex items-center gap-2">
                  <Flame className="w-4 h-4 shrink-0" />
                  <span><strong>{language === 'zh-CN' ? '掌勺绝招：' : 'Secret Tip: '}</strong>{inspectTarget.secretTip}</span>
                </div>
              )}
            </div>

            {/* Ingredients & Steps preview */}
            {inspectTarget.recipeData && (
              <div className="mb-6 space-y-4">
                <h4 className="text-xs font-semibold text-[#C85A32] uppercase tracking-wider">
                  {language === 'zh-CN' ? '参赛配料与制作时序' : 'Ingredients & Steps'}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {inspectTarget.recipeData.ingredients?.map((ing) => (
                    <div key={ing.id} className="p-2 bg-[#FAF7F2] rounded-lg border border-[#EADBCE] text-xs flex justify-between">
                      <span className="font-medium text-[#2C2723]">{ing.name}</span>
                      <span className="text-[#7A7268]">{ing.amount}{ing.unit}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-2">
                  {inspectTarget.recipeData.steps?.map((st, idx) => (
                    <div key={st.id || idx} className="p-3 bg-white rounded-xl border border-[#EADBCE] text-xs flex gap-3">
                      <span className="font-bold text-[#C85A32] shrink-0">#{idx + 1}</span>
                      <div>
                        <div className="font-semibold text-[#2C2723] mb-0.5">{st.title}</div>
                        <div className="text-[#7A7268] leading-relaxed">{st.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Community Comments */}
            {inspectTarget.comments && inspectTarget.comments.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xs font-semibold text-[#7A7268] uppercase tracking-wider mb-2">
                  {language === 'zh-CN' ? '大众评审品鉴留言' : 'Community Reviews'}
                </h4>
                <div className="space-y-2">
                  {inspectTarget.comments.map((cm) => (
                    <div key={cm.id} className="p-2.5 bg-[#FAF7F2] rounded-lg border border-[#EADBCE] text-xs">
                      <div className="flex items-center justify-between text-[#7A7268] mb-1">
                        <span className="font-semibold text-[#2C2723]">{cm.authorName}</span>
                        <span className="font-mono text-[10px] text-amber-600">★ {cm.score} 分 · {cm.createdAt}</span>
                      </div>
                      <p className="text-[#5A5248]">{cm.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="pt-4 border-t border-[#EADBCE] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  const target = inspectTarget;
                  setInspectTarget(null);
                  setRatingTarget(target);
                }}
                className="px-4 py-2 bg-[#FAF7F2] hover:bg-[#FAF3EC] text-[#2C2723] border border-[#EADBCE] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>{language === 'zh-CN' ? '参与打分' : 'Rate this Entry'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleCloneToMyJournal(inspectTarget);
                  setInspectTarget(null);
                }}
                className="px-5 py-2.5 bg-[#C85A32] hover:bg-[#B34C26] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
              >
                <BookOpen className="w-4 h-4" />
                <span>{language === 'zh-CN' ? '一键收录到我的手帐' : 'Import to My Journal'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UGC Content Safety Report & Block Modal */}
      {reportModalData && (
        <UGCReportModal
          isOpen={Boolean(reportModalData)}
          onClose={() => setReportModalData(null)}
          targetId={reportModalData.targetId}
          targetType="contest_submission"
          targetTitle={reportModalData.targetTitle}
          authorId={reportModalData.authorId}
          authorName={reportModalData.authorName}
          onSuccess={() => {
            setActionToast(language === 'zh-CN' ? '举报已受理，已从您的榜单中屏蔽该作者' : 'Report submitted and author blocked');
            setTimeout(() => setActionToast(null), 3500);
          }}
        />
      )}

    </div>
  );
};
