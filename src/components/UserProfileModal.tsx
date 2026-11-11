import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, PRESET_AVATARS } from '../types/auth';
import { Recipe } from '../types/recipe';
import { updateCurrentUserProfile, logoutUser } from '../utils/authService';
import { compressImageFile } from '../utils/storage';
import { 
  getUserLevelInfo, 
  claimTaskReward, 
  performDailyCheckin, 
  checkIsDailyCheckedIn 
} from '../utils/membershipService';
import { useI18n } from '../i18n/context';
import { ChefResumeModal } from './ChefResumeModal';
import { 
  X, User, Camera, LogOut, Check, Heart, BookOpen, 
  Award, Trophy, Star, Sparkles, ChevronRight, Gift, Flame,
  Shield, Zap, CheckCircle2, Circle, ArrowUpRight, FileText, Image as ImageIcon
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
  onNavigateToContest?: () => void;
  onNavigateToNewRecipe?: () => void;
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
  onNavigateToContest,
  onNavigateToNewRecipe
}) => {
  const { t, language } = useI18n();

  // Active view tab inside profile modal: 'level' (等级与任务) or 'edit' (资料编辑)
  const [activeTab, setActiveTab] = useState<'level' | 'edit'>('level');
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

  // Form State
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [rewardToast, setRewardToast] = useState<string | null>(null);
  const [membershipRevision, setMembershipRevision] = useState(0);

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
                {language === 'zh-CN' ? '大厨会员与等级成长' : 'Chef Membership & Level'}
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

        {/* Tab Switcher: Level & Quests vs. Edit Profile */}
        <div className="flex border-b border-[#EADBCE] bg-white/70 px-4 shrink-0 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('level')}
            className={`py-2.5 px-4 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'level'
                ? 'border-[#C85A32] text-[#C85A32]'
                : 'border-transparent text-[#7A7268] hover:text-[#2C2723]'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>{language === 'zh-CN' ? '会员等级与任务' : 'Levels & Quests'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`py-2.5 px-4 border-b-2 flex items-center gap-1.5 transition-colors ${
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

          {/* TAB 2: EDIT PROFILE FIELDS */}
          {activeTab === 'edit' && (
            <form onSubmit={handleSave} className="space-y-4">
              
              {/* Avatar Selector */}
              <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-[#EADBCE] shadow-2xs">
                <div className="relative group">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#C85A32] shadow-xs bg-[#FAF7F2]">
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
                  <h3 className="font-bold text-sm text-[#2C2723] truncate">{displayName}</h3>
                  <p className="text-[11px] text-[#7A7268] mt-0.5">
                    {language === 'zh-CN' ? '支持上传实拍头像或选择下方推荐卡通头像' : 'Upload photo or choose preset avatar'}
                  </p>
                </div>
              </div>

              {/* Pick Avatar Presets */}
              <div className="bg-white p-3 rounded-xl border border-[#EADBCE]">
                <label className="block font-semibold text-[#2C2723] mb-1.5">
                  {language === 'zh-CN' ? '精选大厨头像推荐' : 'Preset Avatars'}
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(url)}
                      className={`w-9 h-9 rounded-full overflow-hidden border-2 shrink-0 transition-transform ${
                        avatarUrl === url ? 'border-[#C85A32] scale-105 shadow-xs' : 'border-[#EADBCE] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
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
                    if (confirm(language === 'zh-CN' ? '确认退出当前登录状态吗？' : 'Log out of current account?')) {
                      logoutUser();
                      onLogout();
                      onClose();
                    }
                  }}
                  className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1 font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{language === 'zh-CN' ? '退出登录' : 'Log Out'}</span>
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C85A32] hover:bg-[#B34C26] text-white rounded-xl font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{language === 'zh-CN' ? '保存修改' : 'Save Changes'}</span>
                </button>
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
    </div>
  );
};
