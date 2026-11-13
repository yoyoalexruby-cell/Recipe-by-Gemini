import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, PRESET_AVATARS } from '../types/auth';
import { Recipe } from '../types/recipe';
import { CARTOON_CHEF_AVATARS, AVATAR_FRAMES, AvatarOption, AvatarFrameOption } from '../types/avatarThemes';
import { updateCurrentUserProfile, logoutUser } from '../utils/authService';
import { compressImageFile } from '../utils/storage';
import { 
  getUserLevelInfo, 
  claimTaskReward, 
  performDailyCheckin, 
  checkIsDailyCheckedIn 
} from '../utils/membershipService';
import { getEquippedFrameId, setEquippedFrameId } from '../utils/avatarStore';
import { getChefAchievements } from '../utils/achievementService';
import { useI18n } from '../i18n/context';
import { ChefResumeModal } from './ChefResumeModal';
import { AvatarPickerModal } from './AvatarPickerModal';
import { ChefMedalsWallModal } from './ChefMedalsWallModal';
import { AnnualReviewView } from './AnnualReviewView';
import { 
  X, User, Camera, LogOut, Check, Heart, BookOpen, 
  Award, Trophy, Star, Sparkles, ChevronRight, Gift, Flame,
  Shield, Zap, CheckCircle2, Circle, ArrowUpRight, FileText, Image as ImageIcon,
  Smile, Lock, Crown, Palette, Medal, ArrowRight, Calendar, UserX, Download, ShieldCheck, HelpCircle
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  user: UserProfile;
  recipes?: Recipe[];
  userRecipeCount: number;
  publicRecipeCount: number;
  totalLikesReceived: number;
  onClose: () => void;
  onUserUpdated: (user: UserProfile) => void;
  onLogout: () => void;
  onDeleteAccount?: () => void;
  onExportAllData?: () => void;
  onOpenLegalPage?: (section: 'privacy' | 'support' | 'terms' | 'delete-account') => void;
  onNavigateToContest?: () => void;
  onNavigateToNewRecipe?: () => void;
  onNavigateToCalendar?: () => void;
  onNavigateToSquare?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  user,
  recipes = [],
  userRecipeCount,
  publicRecipeCount,
  totalLikesReceived,
  onClose,
  onUserUpdated,
  onLogout,
  onDeleteAccount,
  onExportAllData,
  onOpenLegalPage,
  onNavigateToContest,
  onNavigateToNewRecipe,
  onNavigateToCalendar,
  onNavigateToSquare
}) => {
  const { t, language } = useI18n();

  // Active view tab inside profile modal: 'level', 'achievements', 'year_review' (年度烹饪回顾), or 'edit' (资料编辑)
  const [activeTab, setActiveTab] = useState<'level' | 'achievements' | 'year_review' | 'edit'>('level');
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [isMedalsModalOpen, setIsMedalsModalOpen] = useState(false);

  // Form State
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [selectedFrame, setSelectedFrame] = useState<string>(() => getEquippedFrameId());
  const [avatarCategory, setAvatarCategory] = useState<'all' | 'cartoon_chef' | 'culinary_creature' | 'chibi_foodie' | 'base_doll'>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [rewardToast, setRewardToast] = useState<string | null>(null);
  const [membershipRevision, setMembershipRevision] = useState(0);
  const [showDeleteConfirmBox, setShowDeleteConfirmBox] = useState(false);
  const [deleteConsentChecked, setDeleteConsentChecked] = useState(false);

  // Listen to membership updates
  useEffect(() => {
    const handleUpdate = () => setMembershipRevision((p) => p + 1);
    window.addEventListener('membership-updated', handleUpdate);
    return () => window.removeEventListener('membership-updated', handleUpdate);
  }, []);

  // Compute Level & Tasks
  const { levelInfo, tasks } = useMemo(() => {
    return getUserLevelInfo(user, userRecipeCount, publicRecipeCount, totalLikesReceived);
  }, [user, userRecipeCount, publicRecipeCount, totalLikesReceived, membershipRevision]);

  // Compute Chef Achievements & Medals
  const achievements = useMemo(() => {
    return getChefAchievements(user, recipes, levelInfo, totalLikesReceived);
  }, [user, recipes, levelInfo, totalLikesReceived, membershipRevision]);

  const isCheckedIn = checkIsDailyCheckedIn();

  if (!isOpen) return null;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const base64 = await compressImageFile(file, 400, 0.85);
      setAvatarUrl(base64);
    } catch (err) {
      console.error('Failed to compress avatar', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = updateCurrentUserProfile({
      displayName: displayName.trim() || '美食手帐家',
      bio: bio.trim(),
      avatarUrl
    });
    onUserUpdated(updated);
    setRewardToast(language === 'zh-CN' ? '资料已成功保存！' : 'Profile updated successfully!');
    setTimeout(() => setRewardToast(null), 2500);
  };

  // Claim quest reward
  const handleClaim = (taskId: string, rewardExp: number, title: string) => {
    const ok = claimTaskReward(taskId);
    if (ok) {
      setRewardToast(
        language === 'zh-CN'
          ? `🎉 领取成功！+${rewardExp} 等级积分已到账`
          : `🎉 Claimed! +${rewardExp} EXP added`
      );
      setTimeout(() => setRewardToast(null), 3000);
    }
  };

  // Perform daily check-in
  const handleCheckin = () => {
    const res = performDailyCheckin();
    if (res.success) {
      setRewardToast(
        language === 'zh-CN'
          ? `🔥 签到成功！+${res.expGained} 今日活跃积分已到账`
          : `🔥 Daily Check-in complete! +${res.expGained} EXP`
      );
      setTimeout(() => setRewardToast(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-[#FAF7F2] rounded-3xl border border-[#EADBCE] shadow-2xl max-w-lg w-full overflow-hidden relative my-6 max-h-[92vh] flex flex-col paper-shadow bg-notebook-dots">
        
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 sm:px-6 border-b border-[#EADBCE] bg-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">{levelInfo.badge}</span>
            <div>
              <h2 className="text-base font-bold font-journal-title text-[#2C2723]">
                {language === 'zh-CN' ? '个人中心 · 大厨会员与等级成长' : 'Personal Center · Chef Membership & Level'}
              </h2>
              <p className="text-[10px] text-[#7A7268]">
                {language === 'zh-CN' ? '做任务·攒积分·解锁专属主厨特权' : 'Complete Quests · Gain EXP · Unlock Master Privileges'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#9A9085] hover:text-[#2C2723] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Level & Quests vs. Achievement Wall vs. Edit Profile */}
        <div className="flex border-b border-[#EADBCE] bg-white/70 px-4 shrink-0 text-xs font-semibold overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('level')}
            className={`py-2.5 px-3 sm:px-4 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'level'
                ? 'border-[#C85A32] text-[#C85A32]'
                : 'border-transparent text-[#7A7268] hover:text-[#2C2723]'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>{language === 'zh-CN' ? '等级与成长' : 'Levels & Growth'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('achievements')}
            className={`py-2.5 px-3 sm:px-4 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'achievements'
                ? 'border-[#C85A32] text-[#C85A32]'
                : 'border-transparent text-[#7A7268] hover:text-[#2C2723]'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>{language === 'zh-CN' ? '厨神成就墙' : 'Medal Wall'}</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-amber-100 text-amber-800 font-mono font-bold">
              {achievements.unlockedCount}/{achievements.totalCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('year_review')}
            className={`py-2.5 px-3 sm:px-4 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'year_review'
                ? 'border-[#C85A32] text-[#C85A32]'
                : 'border-transparent text-[#7A7268] hover:text-[#2C2723]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span>{language === 'zh-CN' ? '年度烹饪回顾' : 'Year in Review'}</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-rose-100 text-rose-700 font-bold">
              NEW
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`py-2.5 px-3 sm:px-4 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'edit'
                ? 'border-[#C85A32] text-[#C85A32]'
                : 'border-transparent text-[#7A7268] hover:text-[#2C2723]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{language === 'zh-CN' ? '修改个人资料' : 'Edit Profile'}</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* TAB 1: MEMBERSHIP LEVEL, EXP & QUEST SYSTEM */}
          {activeTab === 'level' && (
            <div className="space-y-5">
              
              {/* Level & VIP Master Card (Tactile Warm Gold/Leather style) */}
              <div className="bg-gradient-to-br from-[#3D261A] via-[#2C2723] to-[#1F1B18] text-amber-50 rounded-2xl p-5 border border-amber-500/30 shadow-xl relative overflow-hidden">
                {/* Decorative Background Stamp */}
                <div className="absolute top-2 right-3 opacity-15 pointer-events-none">
                  <Trophy className="w-32 h-32 text-amber-300" />
                </div>

                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-400/80 shadow-md bg-stone-800">
                      <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-amber-100">{displayName}</h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-stone-950 flex items-center gap-1 shadow-2xs">
                          <span>{levelInfo.badge}</span>
                          <span>{language === 'zh-CN' ? levelInfo.title : levelInfo.titleEn}</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-200/70 mt-0.5 font-mono">
                        UID: {user.uid.slice(0, 12)}...
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons: Check-in & Chef Resume */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsResumeModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm bg-gradient-to-r from-amber-200 to-amber-100 text-stone-900 hover:brightness-105 active:scale-95 border border-amber-300"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>{language === 'zh-CN' ? '生成厨神履历' : 'Chef Resume'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('year_review')}
                      className="px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm bg-gradient-to-r from-[#C85A32] to-[#B34C26] text-white hover:brightness-105 active:scale-95 border border-amber-400/40"
                      title={language === 'zh-CN' ? '查看年度烹饪手帐回顾与数据海报' : 'View Annual Cooking Review & Poster'}
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                      <span>{language === 'zh-CN' ? '年度回顾' : 'Year in Review'}</span>
                    </button>

                    {/* Daily Check-in Action Button */}
                    <button
                      type="button"
                      onClick={handleCheckin}
                      disabled={isCheckedIn}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm ${
                        isCheckedIn
                          ? 'bg-white/10 text-amber-300/60 border border-white/10 cursor-default'
                          : 'bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 hover:brightness-105 active:scale-95'
                      }`}
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>{isCheckedIn ? (language === 'zh-CN' ? '已签到' : 'Checked In') : (language === 'zh-CN' ? '签到 +20' : '+20 EXP')}</span>
                    </button>
                  </div>
                </div>

                {/* Level EXP Progress Bar */}
                <div className="space-y-1.5 relative z-10">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-amber-200/80 font-medium">
                      {language === 'zh-CN' ? '当前等级经验值' : 'Level Experience'}
                    </span>
                    <span className="font-mono text-amber-300 font-bold">
                      {levelInfo.currentExp} / {levelInfo.nextLevelExp} EXP ({levelInfo.progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 via-amber-300 to-orange-400 rounded-full transition-all duration-500 shadow-sm"
                      style={{ width: `${Math.min(100, Math.max(5, levelInfo.progressPercent))}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-amber-200/60 text-right">
                    {language === 'zh-CN' 
                      ? `距离下一等级还需 ${Math.max(0, levelInfo.nextLevelExp - levelInfo.currentExp)} 经验积分`
                      : `${Math.max(0, levelInfo.nextLevelExp - levelInfo.currentExp)} EXP to next level`}
                  </p>
                </div>
              </div>

              {/* Highlighting Chef Resume Poster Entry Card */}
              <div 
                onClick={() => setIsResumeModalOpen(true)}
                className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/70 p-3.5 rounded-2xl border border-amber-300/80 shadow-2xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between group active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C85A32] to-[#A8421D] text-white flex items-center justify-center shadow-sm shrink-0">
                    <Award className="w-5 h-5 text-amber-200" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-xs text-[#2C2723]">
                        {language === 'zh-CN' ? '我的厨神履历档案 · 分享海报' : 'My Master Chef Resume Poster'}
                      </h4>
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-red-500 text-white font-bold animate-pulse">
                        HOT
                      </span>
                    </div>
                    <p className="text-[11px] text-[#7A7268] mt-0.5">
                      {language === 'zh-CN' 
                        ? '自动聚合手帐数量、等级头衔、解锁勋章与代表作，一键存相册' 
                        : 'Generate aesthetic scrapbook poster with medals & signature dishes'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="px-3 py-1.5 bg-[#C85A32] text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 group-hover:bg-[#B34C26] transition-colors shadow-2xs"
                >
                  <span>{language === 'zh-CN' ? '立即生成' : 'Generate'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Stats Counters */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-white rounded-xl border border-[#EADBCE] shadow-2xs">
                  <span className="text-lg font-mono font-bold text-[#C85A32] block tabular-nums">
                    {userRecipeCount}
                  </span>
                  <span className="text-[10px] text-[#7A7268]">{language === 'zh-CN' ? '我的手帐' : 'My Recipes'}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#EADBCE] shadow-2xs">
                  <span className="text-lg font-mono font-bold text-[#5F7A4D] block tabular-nums">
                    {publicRecipeCount}
                  </span>
                  <span className="text-[10px] text-[#7A7268]">{language === 'zh-CN' ? '公开发布' : 'Public'}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#EADBCE] shadow-2xs">
                  <span className="text-lg font-mono font-bold text-[#C08A3E] block tabular-nums">
                    {totalLikesReceived}
                  </span>
                  <span className="text-[10px] text-[#7A7268]">{language === 'zh-CN' ? '收获暖心赞' : 'Likes'}</span>
                </div>
              </div>

              {/* CHEF ACHIEVEMENT WALL SHOWCASE SECTION (厨神成就墙板块) */}
              <div className="bg-white p-4 rounded-2xl border border-[#EADBCE] shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#F0E6DC]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-[#C85A32] text-white flex items-center justify-center shadow-xs">
                      <Award className="w-4 h-4 text-amber-100" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-xs text-[#2C2723]">
                          {language === 'zh-CN' ? '厨神成就墙' : 'Chef Achievement Wall'}
                        </h4>
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          {achievements.unlockedCount} / {achievements.totalCount} {language === 'zh-CN' ? '已达成' : 'Unlocked'}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#7A7268] mt-0.5">
                        {language === 'zh-CN' 
                          ? '菜谱百大、连续打卡、大赛冠军等专属荣誉' 
                          : 'Milestone medals: Recipe Centurion, Streak & Contest Champ'}
                      </p>
                    </div>
                  </div>

                  {/* Jump button to view all medals with criteria */}
                  <button
                    type="button"
                    onClick={() => setIsMedalsModalOpen(true)}
                    className="px-2.5 py-1 text-xs font-bold text-[#C85A32] hover:text-[#B34C26] bg-amber-50 hover:bg-amber-100/70 border border-amber-200/90 rounded-xl flex items-center gap-1 transition-all shadow-2xs active:scale-95 shrink-0"
                  >
                    <span>{language === 'zh-CN' ? '查看全部勋章' : 'View All'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Grid of completed medals */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-[#7A7268]">
                    <span className="font-medium text-[#2C2723]">
                      {language === 'zh-CN' ? '已点亮荣誉勋章：' : 'Unlocked Medals:'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsMedalsModalOpen(true)}
                      className="text-[10px] text-[#C85A32] hover:underline flex items-center gap-0.5 font-medium"
                    >
                      <span>{language === 'zh-CN' ? '点击查看获取条件与进度' : 'View conditions'}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  {achievements.unlockedMedals.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {achievements.unlockedMedals.map((medal) => (
                        <div
                          key={medal.id}
                          onClick={() => setIsMedalsModalOpen(true)}
                          className="p-2.5 rounded-xl border border-amber-300/80 bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-white hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer flex flex-col items-center text-center relative group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-300 flex items-center justify-center text-2xl shadow-2xs group-hover:scale-110 transition-transform">
                            {medal.icon}
                          </div>
                          <strong className="text-[11px] font-bold text-[#2C2723] mt-1.5 truncate max-w-full">
                            {language === 'zh-CN' ? medal.name : medal.nameEn}
                          </strong>
                          <span className="text-[9px] text-amber-800 font-semibold scale-90">
                            {language === 'zh-CN' ? '已达成' : 'Unlocked'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 text-center bg-[#FAF7F2] rounded-xl border border-[#EADBCE] text-stone-500 text-[11px]">
                      {language === 'zh-CN' ? '记录首篇美食手帐或打卡下厨即可点亮第一枚厨神勋章！' : 'Create a recipe or log meals to unlock your first medal!'}
                    </div>
                  )}

                  {/* Next Locked Medal Teaser with Live Progress */}
                  {achievements.lockedMedals.length > 0 && (
                    <div 
                      onClick={() => setIsMedalsModalOpen(true)}
                      className="p-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#FAF3EC] border border-[#EADBCE] flex items-center justify-between gap-2.5 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-stone-200/80 border border-stone-300 text-stone-400 flex items-center justify-center text-lg shrink-0 grayscale">
                          {achievements.lockedMedals[0].icon}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold text-[#2C2723] truncate">
                              {language === 'zh-CN' ? `即将达成：【${achievements.lockedMedals[0].name}】` : `Next: ${achievements.lockedMedals[0].nameEn}`}
                            </span>
                            <span className="text-[10px] text-amber-700 font-mono font-semibold">
                              +{achievements.lockedMedals[0].expReward} EXP
                            </span>
                          </div>
                          <p className="text-[10px] text-[#7A7268] truncate">
                            {language === 'zh-CN' ? achievements.lockedMedals[0].condition : achievements.lockedMedals[0].conditionEn}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-[#C85A32]">
                        <span>{achievements.lockedMedals[0].progress.percentage}%</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  )}

                  {/* Full Action Button at bottom */}
                  <button
                    type="button"
                    onClick={() => setIsMedalsModalOpen(true)}
                    className="w-full py-2 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/60 hover:from-amber-100 hover:to-orange-100 text-[#C85A32] rounded-xl text-xs font-bold border border-amber-300/80 transition-all shadow-2xs flex items-center justify-center gap-1.5 active:scale-[0.99]"
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-600" />
                    <span>{language === 'zh-CN' ? '查看全部 12 枚勋章与获取条件' : 'Inspect All 12 Medals & Criteria'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Level Perks Unlocked */}
              <div className="bg-white p-4 rounded-2xl border border-[#EADBCE] shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-[#2C2723] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>{language === 'zh-CN' ? '当前等级专属特权' : 'Current Level Perks'}</span>
                  </h4>
                  <span className="text-[10px] text-[#C85A32] font-semibold">
                    {language === 'zh-CN' ? `已解锁 ${levelInfo.perks.length} 项主厨特权` : `${levelInfo.perks.length} Perks Unlocked`}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {levelInfo.perks.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-[#FAF7F2] border border-[#EADBCE]/80 text-[11px] text-[#5A5248]">
                      <span className="text-base">{p.icon}</span>
                      <span className="font-medium leading-snug">{language === 'zh-CN' ? p.text : p.textEn}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* QUEST TASK SYSTEM: MULTI-TASK EXP EARNING */}
              <div className="bg-white p-4 rounded-2xl border border-[#EADBCE] shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#F0E6DC]">
                  <div className="flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-[#C85A32]" />
                    <h4 className="font-bold text-xs text-[#2C2723]">
                      {language === 'zh-CN' ? '升级任务清单 · 叠加等级积分' : 'Level Quests · Earn Bonus EXP'}
                    </h4>
                  </div>
                  <span className="text-[10px] text-[#7A7268]">
                    {language === 'zh-CN' ? '多写多评多参赛，快速升厨神' : 'Publish, rate & enter contests'}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-xl border border-[#EADBCE] bg-[#FAF7F2] hover:bg-[#FAF3EC]/60 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span className="text-xl mt-0.5">{task.icon}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs text-[#2C2723]">
                              {language === 'zh-CN' ? task.title : task.titleEn}
                            </span>
                            <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[10px] font-mono font-bold rounded-md">
                              +{task.expReward} EXP
                            </span>
                          </div>
                          <p className="text-[11px] text-[#7A7268] mt-0.5 line-clamp-1">
                            {language === 'zh-CN' ? task.description : task.descriptionEn}
                          </p>
                          <div className="text-[10px] text-[#9A9085] mt-1 font-mono">
                            {language === 'zh-CN' ? '进度：' : 'Progress: '}
                            {Math.min(task.targetProgress, task.currentProgress)} / {task.targetProgress}
                          </div>
                        </div>
                      </div>

                      {/* Task Action State Button */}
                      <div className="shrink-0">
                        {task.isClaimed ? (
                          <span className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 rounded-lg flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>{language === 'zh-CN' ? '已领取' : 'Claimed'}</span>
                          </span>
                        ) : task.isCompleted ? (
                          <button
                            type="button"
                            onClick={() => handleClaim(task.id, task.expReward, task.title)}
                            className="px-3 py-1.5 bg-[#C85A32] hover:bg-[#B34C26] text-white text-[11px] font-bold rounded-lg shadow-sm animate-bounce flex items-center gap-1"
                          >
                            <Gift className="w-3.5 h-3.5" />
                            <span>{language === 'zh-CN' ? '领取积分' : 'Claim'}</span>
                          </button>
                        ) : task.category === 'contest' ? (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onNavigateToContest?.();
                            }}
                            className="px-2.5 py-1 text-[11px] font-medium text-[#C85A32] bg-white border border-[#C85A32]/40 rounded-lg hover:bg-[#FAF3EC] flex items-center gap-1"
                          >
                            <span>{language === 'zh-CN' ? '去参赛' : 'Enter'}</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        ) : task.category === 'publish' ? (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onNavigateToNewRecipe?.();
                            }}
                            className="px-2.5 py-1 text-[11px] font-medium text-[#C85A32] bg-white border border-[#C85A32]/40 rounded-lg hover:bg-[#FAF3EC] flex items-center gap-1"
                          >
                            <span>{language === 'zh-CN' ? '写手帐' : 'Write'}</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-[#9A9085] bg-stone-200/60 px-2 py-1 rounded-md">
                            {language === 'zh-CN' ? '未完成' : 'In Progress'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB: CHEF ACHIEVEMENT WALL VIEW (厨神成就墙视图) */}
          {activeTab === 'achievements' && (
            <div className="space-y-4">
              
              {/* Achievement Wall Summary Card */}
              <div className="bg-gradient-to-br from-[#3D261A] via-[#2C2723] to-[#1F1B18] text-amber-50 rounded-2xl p-5 border border-amber-500/30 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-[#C85A32] flex items-center justify-center text-2xl shadow-md">
                      🏆
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-amber-100">
                        {language === 'zh-CN' ? '厨神荣誉成就殿堂' : 'Chef Hall of Fame'}
                      </h3>
                      <p className="text-[11px] text-amber-200/70 mt-0.5">
                        {language === 'zh-CN' ? '点亮勋章勋位 · 见证每一道下厨手帐' : 'Celebrate your culinary journey & milestones'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsMedalsModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 bg-gradient-to-r from-amber-200 to-amber-100 text-stone-900 hover:brightness-105 active:scale-95 border border-amber-300 shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>{language === 'zh-CN' ? '查看获取条件' : 'Medal Criteria'}</span>
                  </button>
                </div>

                <div className="space-y-1.5 relative z-10">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-amber-200/80 font-medium">
                      {language === 'zh-CN' ? '勋章点亮进度' : 'Medal Progress'}
                    </span>
                    <span className="font-mono text-amber-300 font-bold">
                      {achievements.unlockedCount} / {achievements.totalCount} ({achievements.completionPercentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 via-amber-300 to-orange-400 rounded-full transition-all duration-500 shadow-sm"
                      style={{ width: `${Math.max(5, achievements.completionPercentage)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Medals List with Detailed Conditions and Live Progress */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h4 className="font-bold text-xs text-[#2C2723] flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[#C85A32]" />
                    <span>{language === 'zh-CN' ? '全部勋章获取条件与达成进度' : 'All Medals & Unlock Criteria'}</span>
                  </h4>
                  <span className="text-[10px] text-[#7A7268]">
                    {language === 'zh-CN' ? '包含菜谱百大、连续打卡、大赛冠军' : 'Includes Centurion, Streak & Champ'}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {achievements.medals.map((medal) => (
                    <div
                      key={medal.id}
                      onClick={() => setIsMedalsModalOpen(true)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                        medal.isUnlocked
                          ? 'bg-white border-amber-300/80 shadow-2xs hover:shadow-xs'
                          : 'bg-[#FAF7F2] border-[#EADBCE] hover:border-[#C85A32]/50 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-2xl ${
                            medal.isUnlocked
                              ? 'bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-300 shadow-2xs'
                              : 'bg-stone-200/70 border border-stone-300 text-stone-400 grayscale'
                          }`}>
                            {medal.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-xs text-[#2C2723]">
                                {language === 'zh-CN' ? medal.name : medal.nameEn}
                              </span>
                              <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                +{medal.expReward} EXP
                              </span>
                              {medal.rarity === 'legendary' && (
                                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-400 text-stone-950">
                                  {language === 'zh-CN' ? '殿堂' : 'Legendary'}
                                </span>
                              )}
                              {medal.rarity === 'epic' && (
                                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-rose-100 text-rose-800">
                                  {language === 'zh-CN' ? '史诗' : 'Epic'}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#7A7268] mt-0.5 line-clamp-1">
                              {language === 'zh-CN' ? medal.description : medal.descriptionEn}
                            </p>
                            <div className="mt-1.5 p-2 rounded-xl bg-[#FAF7F2] border border-[#EADBCE]/80 text-[10px] text-[#5A5248]">
                              <strong className="text-[#2C2723]">{language === 'zh-CN' ? '获取条件：' : 'Condition: '}</strong>
                              <span>{language === 'zh-CN' ? medal.condition : medal.conditionEn}</span>
                            </div>
                            <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#7A7268] font-mono">
                              <span>
                                {language === 'zh-CN' ? '进度：' : 'Progress: '}
                                <strong className="text-[#2C2723]">{medal.progress.current}</strong> / {medal.progress.target} {medal.progress.unit}
                              </span>
                              <span className="font-bold text-[#C85A32]">{medal.progress.percentage}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 pt-0.5">
                          {medal.isUnlocked ? (
                            <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-700" />
                              <span>{language === 'zh-CN' ? '已达成' : 'Unlocked'}</span>
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-lg bg-stone-100 text-stone-500 text-[10px] font-medium flex items-center gap-1">
                              <Lock className="w-3 h-3 text-stone-400" />
                              <span>{language === 'zh-CN' ? '未达成' : 'Locked'}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: ANNUAL COOKING REVIEW & DATA POSTER */}
          {activeTab === 'year_review' && (
            <AnnualReviewView
              user={user}
              recipes={recipes}
              levelInfo={levelInfo}
              medals={achievements.medals}
              onOpenMedalsWall={() => setIsMedalsModalOpen(true)}
              onNavigateToNewRecipe={() => {
                onClose();
                if (onNavigateToNewRecipe) onNavigateToNewRecipe();
              }}
            />
          )}

          {/* TAB 4: EDIT PROFILE FIELDS */}
          {activeTab === 'edit' && (
            <form onSubmit={handleSave} className="space-y-4">
              
              {/* Avatar & Frame Live Preview */}
              <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-[#EADBCE] shadow-2xs">
                <div className="relative group">
                  <div className={`w-18 h-18 rounded-full overflow-hidden shadow-xs bg-[#FAF7F2] transition-all ${
                    AVATAR_FRAMES.find((f) => f.id === selectedFrame)?.frameClass || 'border-2 border-[#C85A32]'
                  }`}>
                    <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                  </div>
                  <label className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#C85A32] text-white hover:bg-[#B34C26] cursor-pointer shadow-xs transition-transform active:scale-95">
                    <Camera className="w-3.5 h-3.5" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={isUploading}
                    />
                  </label>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-[#2C2723] truncate">{displayName}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                      {levelInfo.badge} {language === 'zh-CN' ? levelInfo.title : levelInfo.titleEn}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#7A7268] mt-1">
                    {language === 'zh-CN' 
                      ? '可选择卡通主厨、萌趣食客、人偶素体或专属装扮边框' 
                      : 'Choose cartoon chefs, chibi foodies, base dolls or avatar frames'}
                  </p>
                  
                  {/* Open Avatar Workshop CTA */}
                  <button
                    type="button"
                    onClick={() => setIsAvatarPickerOpen(true)}
                    className="mt-2.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 via-[#C85A32] to-[#B34C26] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:brightness-105 active:scale-95 transition-all"
                  >
                    <Palette className="w-3.5 h-3.5" />
                    <span>{language === 'zh-CN' ? '打开20位卡通大厨工坊 (积分兑换)' : 'Open Avatar Workshop (20 Chefs)'}</span>
                  </button>
                </div>
              </div>

              {/* AVATAR WORKSHOP: CATEGORIZED CARTOON & BASE DOLL AVATARS */}
              <div className="bg-white p-4 rounded-xl border border-[#EADBCE] space-y-3">
                <div className="flex items-center justify-between border-b border-[#F0E6DC] pb-2">
                  <div className="flex items-center gap-1.5 font-bold text-[#2C2723]">
                    <Smile className="w-4 h-4 text-[#C85A32]" />
                    <span>{language === 'zh-CN' ? '大厨卡通形象与人偶造型库' : 'Chef Cartoon & Doll Avatars'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAvatarPickerOpen(true)}
                    className="text-[11px] font-bold text-[#C85A32] hover:text-[#B34C26] flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>{language === 'zh-CN' ? '浏览全屏图鉴与兑换' : 'Inspect All & Redeem'}</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setAvatarCategory('all')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors whitespace-nowrap ${
                      avatarCategory === 'all'
                        ? 'bg-[#2C2723] text-white shadow-2xs'
                        : 'bg-[#FAF7F2] text-[#7A7268] hover:text-[#2C2723]'
                    }`}
                  >
                    全部造型 ({CARTOON_CHEF_AVATARS.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarCategory('cartoon_chef')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors whitespace-nowrap ${
                      avatarCategory === 'cartoon_chef'
                        ? 'bg-[#C85A32] text-white shadow-2xs'
                        : 'bg-[#FAF7F2] text-[#7A7268] hover:text-[#2C2723]'
                    }`}
                  >
                    👨‍🍳 卡通主厨
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarCategory('culinary_creature')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors whitespace-nowrap ${
                      avatarCategory === 'culinary_creature'
                        ? 'bg-[#C85A32] text-white shadow-2xs'
                        : 'bg-[#FAF7F2] text-[#7A7268] hover:text-[#2C2723]'
                    }`}
                  >
                    🐱 料理萌宠
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarCategory('chibi_foodie')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors whitespace-nowrap ${
                      avatarCategory === 'chibi_foodie'
                        ? 'bg-[#C85A32] text-white shadow-2xs'
                        : 'bg-[#FAF7F2] text-[#7A7268] hover:text-[#2C2723]'
                    }`}
                  >
                    🥟 点心食客
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarCategory('base_doll')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors whitespace-nowrap ${
                      avatarCategory === 'base_doll'
                        ? 'bg-[#C85A32] text-white shadow-2xs'
                        : 'bg-[#FAF7F2] text-[#7A7268] hover:text-[#2C2723]'
                    }`}
                  >
                    🧍 人偶素体 (换装原胚)
                  </button>
                </div>

                {/* Avatar Options Grid */}
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 pt-1 max-h-48 overflow-y-auto p-1">
                  {CARTOON_CHEF_AVATARS.filter((a) => avatarCategory === 'all' || a.category === avatarCategory).map((item) => {
                    const isSelected = avatarUrl === item.avatarUrl;
                    const isLocked = item.requiredLevel ? levelInfo.level < item.requiredLevel : false;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          if (isLocked) {
                            setRewardToast(`需达到 LV${item.requiredLevel} 等级解锁`);
                            setTimeout(() => setRewardToast(null), 2500);
                            return;
                          }
                          setAvatarUrl(item.avatarUrl);
                        }}
                        className={`flex flex-col items-center p-1.5 rounded-xl border text-center transition-all relative ${
                          isSelected
                            ? 'bg-amber-50 border-[#C85A32] ring-2 ring-[#C85A32]/30 scale-102 shadow-xs'
                            : 'bg-[#FAF7F2] border-[#EADBCE] hover:border-[#C85A32]/50 hover:bg-white'
                        }`}
                      >
                        <div className="w-11 h-11 rounded-full overflow-hidden border border-[#EADBCE] bg-white relative">
                          <img src={item.avatarUrl} alt={item.name} className="w-full h-full object-cover" />
                          {isLocked && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                              <Lock className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-medium text-[#2C2723] mt-1 truncate max-w-full leading-tight">
                          {language === 'zh-CN' ? item.name : item.nameEn}
                        </span>
                        {item.requiredLevel && isLocked ? (
                          <span className="text-[8px] text-amber-700 font-bold scale-90">
                            LV{item.requiredLevel}解锁
                          </span>
                        ) : item.pointsCost > 0 ? (
                          <span className="text-[8px] text-[#C85A32] font-semibold scale-90">
                            🪙 {item.pointsCost}分
                          </span>
                        ) : (
                          <span className="text-[8px] text-emerald-600 font-semibold scale-90">
                            免费造型
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AVATAR FRAME & SKIN WORKSHOP (边框与皮肤预览) */}
              <div className="bg-white p-4 rounded-xl border border-[#EADBCE] space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#F0E6DC] pb-2">
                  <div className="flex items-center gap-1.5 font-bold text-[#2C2723]">
                    <Crown className="w-4 h-4 text-amber-500" />
                    <span>{language === 'zh-CN' ? '主厨装扮：头像框与皮肤气韵' : 'Avatar Frames & Skin Accents'}</span>
                  </div>
                  <span className="text-[10px] text-[#7A7268]">
                    {language === 'zh-CN' ? '等级特权 / 积分商城兑换' : 'Level Perk / Points Reward'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {AVATAR_FRAMES.map((frame) => {
                    const isSelected = selectedFrame === frame.id;
                    return (
                      <button
                        key={frame.id}
                        type="button"
                        onClick={() => setSelectedFrame(frame.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                          isSelected
                            ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300/40 shadow-2xs'
                            : 'bg-[#FAF7F2] border-[#EADBCE] hover:bg-white'
                        }`}
                      >
                        <span className="text-lg">{frame.icon}</span>
                        <div className="min-w-0">
                          <strong className="block text-[11px] text-[#2C2723] truncate">
                            {language === 'zh-CN' ? frame.name : frame.nameEn}
                          </strong>
                          <span className="text-[9px] text-[#7A7268]">
                            {frame.pointsCost === 0 ? (language === 'zh-CN' ? '默认佩戴' : 'Default') : (language === 'zh-CN' ? `${frame.pointsCost} 等级分` : `${frame.pointsCost} EXP`)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Display Name */}
              <div className="bg-white p-4 rounded-xl border border-[#EADBCE] space-y-3">
                <div>
                  <label className="block font-semibold text-[#2C2723] mb-1">
                    {language === 'zh-CN' ? '大厨昵称' : 'Chef Display Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs text-[#2C2723] focus:outline-hidden focus:border-[#C85A32]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2C2723] mb-1">
                    {language === 'zh-CN' ? '烹饪个性签名 / 座右铭' : 'Chef Bio / Cooking Motto'}
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder={language === 'zh-CN' ? '写一句属于你厨房的烟火气签名...' : 'Your culinary motto...'}
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs text-[#2C2723] focus:outline-hidden focus:border-[#C85A32]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    logoutUser();
                    onLogout();
                    onClose();
                  }}
                  className="px-3.5 py-2 text-[#5A5248] hover:text-[#2C2723] hover:bg-white border border-[#EADBCE] rounded-xl transition-colors flex items-center gap-1.5 font-medium min-h-[40px]"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{language === 'zh-CN' ? '退出登录' : 'Log Out'}</span>
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C85A32] hover:bg-[#B34C26] text-white rounded-xl font-bold transition-all shadow-sm flex items-center gap-1.5 min-h-[40px]"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{language === 'zh-CN' ? '保存修改' : 'Save Changes'}</span>
                </button>
              </div>

              {/* Privacy, Support & Account Deletion Section (Apple Guideline 5.1.1(v) Mandatory) */}
              <div className="mt-4 pt-4 border-t border-[#EADBCE] space-y-3">
                <div className="bg-white p-4 rounded-xl border border-[#EADBCE] space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 font-bold text-[#2C2723]">
                      <ShieldCheck className="w-4 h-4 text-[#5F7A4D]" />
                      <span>
                        {language === 'zh-CN'
                          ? '隐私合规、用户支持与账号安全'
                          : 'Privacy, Support & Account Security'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenLegalPage?.('privacy');
                      }}
                      className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#EFE7DC] border border-[#EADBCE] rounded-lg text-[#2C2723] font-medium transition-colors"
                    >
                      {language === 'zh-CN' ? '隐私保护政策' : 'Privacy Policy'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenLegalPage?.('support');
                      }}
                      className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#EFE7DC] border border-[#EADBCE] rounded-lg text-[#2C2723] font-medium transition-colors inline-flex items-center gap-1"
                    >
                      <HelpCircle className="w-3 h-3 text-[#C85A32]" />
                      <span>{language === 'zh-CN' ? '技术支持与反馈' : 'App Support'}</span>
                    </button>
                    {onExportAllData && (
                      <button
                        type="button"
                        onClick={onExportAllData}
                        className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#EFE7DC] border border-[#EADBCE] rounded-lg text-[#2C2723] font-medium transition-colors inline-flex items-center gap-1"
                      >
                        <Download className="w-3 h-3 text-[#5F7A4D]" />
                        <span>{language === 'zh-CN' ? '导出全部手帐数据' : 'Export Data (JSON)'}</span>
                      </button>
                    )}
                  </div>

                  {/* Permanent Account Deletion Flow */}
                  {!showDeleteConfirmBox ? (
                    <div className="pt-2 border-t border-[#F0E6DC] flex items-center justify-between gap-3">
                      <span className="text-[11px] text-[#7A7268]">
                        {language === 'zh-CN'
                          ? '需要彻底移除账号与关联的个人数据？'
                          : 'Need to permanently remove your account and data?'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setShowDeleteConfirmBox(true);
                          setDeleteConsentChecked(false);
                        }}
                        className="px-3 py-1.5 text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg text-[11px] font-semibold transition-colors inline-flex items-center gap-1 shrink-0"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>{language === 'zh-CN' ? '注销并删除账号' : 'Delete Account'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2.5">
                      <div className="font-bold text-rose-900 text-xs flex items-center gap-1.5">
                        <UserX className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>
                          {language === 'zh-CN'
                            ? '确认永久注销账号并清除全部数据'
                            : 'Confirm Permanent Account Deletion'}
                        </span>
                      </div>
                      <p className="text-[11px] text-rose-800 leading-relaxed">
                        {language === 'zh-CN'
                          ? '此操作不可撤销：您的登录凭证、个人资料、名下创建的全部菜谱手帐与收藏记录将立即从设备中彻底抹除。'
                          : 'This action is irreversible: your credentials, profile, created recipes, and saved bookmarks will be permanently erased immediately.'}
                      </p>
                      <label className="flex items-start gap-2 text-[11px] text-rose-950 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={deleteConsentChecked}
                          onChange={(e) => setDeleteConsentChecked(e.target.checked)}
                          className="mt-0.5 w-4 h-4 accent-rose-600 rounded shrink-0"
                        />
                        <span>
                          {language === 'zh-CN'
                            ? '我确认永久注销此账号并彻底删除关联数据'
                            : 'I confirm permanent deletion of my account and all associated data'}
                        </span>
                      </label>
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirmBox(false)}
                          className="px-3 py-1.5 bg-white border border-rose-200 text-[#5A5248] rounded-lg text-[11px] font-medium"
                        >
                          {language === 'zh-CN' ? '取消' : 'Cancel'}
                        </button>
                        <button
                          type="button"
                          disabled={!deleteConsentChecked}
                          onClick={() => {
                            onDeleteAccount?.();
                            setShowDeleteConfirmBox(false);
                            onClose();
                          }}
                          className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:pointer-events-none text-white rounded-lg text-[11px] font-bold transition-colors"
                        >
                          {language === 'zh-CN' ? '立即永久注销' : 'Delete Permanently'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </form>
          )}

        </div>

        {/* Floating Reward Toast */}
        {rewardToast && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-[#2C2723] text-amber-200 text-xs py-2 px-4 rounded-xl border border-amber-400/40 shadow-2xl flex items-center gap-2 animate-fade-in z-50">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{rewardToast}</span>
          </div>
        )}

      </div>

      {/* Chef Resume High-Res Poster Modal */}
      <ChefResumeModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        user={user}
        recipes={recipes}
        levelInfo={levelInfo}
        totalLikesReceived={totalLikesReceived}
      />

      {/* Interactive Avatar & Skin Workshop Modal (20 Hand-Drawn Cartoon Chefs) */}
      <AvatarPickerModal
        isOpen={isAvatarPickerOpen}
        currentAvatarUrl={avatarUrl}
        currentFrameId={selectedFrame}
        userLevel={levelInfo.level}
        userExp={levelInfo.currentExp}
        onClose={() => setIsAvatarPickerOpen(false)}
        onSelectAvatar={(newUrl, newFrameId) => {
          setAvatarUrl(newUrl);
          setSelectedFrame(newFrameId);
          setEquippedFrameId(newFrameId);
          const updated = updateCurrentUserProfile({ avatarUrl: newUrl });
          onUserUpdated(updated);
          setRewardToast(language === 'zh-CN' ? '🎉 头像与边框已成功换装并佩戴！' : 'Avatar & frame equipped!');
          setTimeout(() => setRewardToast(null), 2500);
        }}
      />

      {/* Chef Medals & Achievements Wall Modal (All 12 Medals with Conditions & Live Progress) */}
      <ChefMedalsWallModal
        isOpen={isMedalsModalOpen}
        achievements={achievements}
        onClose={() => setIsMedalsModalOpen(false)}
        onNavigateToNewRecipe={() => {
          onClose();
          onNavigateToNewRecipe?.();
        }}
        onNavigateToCalendar={() => {
          onClose();
          onNavigateToCalendar?.();
        }}
        onNavigateToContest={() => {
          onClose();
          onNavigateToContest?.();
        }}
        onNavigateToSquare={() => {
          onClose();
          onNavigateToSquare?.();
        }}
      />
    </div>
  );
};
