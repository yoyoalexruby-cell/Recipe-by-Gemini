import React, { useState, useMemo } from 'react';
import { 
  CARTOON_CHEF_AVATARS, 
  AVATAR_FRAMES, 
  AvatarOption, 
  AvatarFrameOption 
} from '../types/avatarThemes';
import { 
  getUnlockedAvatarIds, 
  isAvatarUnlocked, 
  unlockAvatar, 
  getEquippedFrameId, 
  setEquippedFrameId 
} from '../utils/avatarStore';
import { useI18n } from '../i18n/context';
import { 
  X, Check, Lock, Sparkles, Search, Crown, 
  Smile, ShieldCheck, Tag, Info, Coins, Palette
} from 'lucide-react';

interface AvatarPickerModalProps {
  isOpen: boolean;
  currentAvatarUrl: string;
  currentFrameId?: string;
  userLevel: number;
  userExp: number;
  onClose: () => void;
  onSelectAvatar: (avatarUrl: string, frameId: string) => void;
}

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
  isOpen,
  currentAvatarUrl,
  currentFrameId = 'frame_none',
  userLevel,
  userExp,
  onClose,
  onSelectAvatar
}) => {
  const { language } = useI18n();

  // Selected avatar state (for spotlight preview before confirming equip)
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(() => {
    const match = CARTOON_CHEF_AVATARS.find((a) => a.avatarUrl === currentAvatarUrl);
    return match ? match.id : CARTOON_CHEF_AVATARS[0].id;
  });

  const [activeFrameId, setActiveFrameId] = useState<string>(currentFrameId || getEquippedFrameId());
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'cartoon_chef' | 'culinary_creature' | 'chibi_foodie' | 'base_doll' | 'master'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [unlockedIds, setUnlockedIds] = useState<string[]>(() => getUnlockedAvatarIds());
  const [confirmRedeemItem, setConfirmRedeemItem] = useState<AvatarOption | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filtered avatars
  const filteredAvatars = useMemo(() => {
    return CARTOON_CHEF_AVATARS.filter((avatar) => {
      // Category filter
      if (categoryFilter === 'master') {
        if (!avatar.requiredLevel || avatar.requiredLevel < 2) return false;
      } else if (categoryFilter !== 'all' && avatar.category !== categoryFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = avatar.name.toLowerCase().includes(q) || avatar.nameEn.toLowerCase().includes(q);
        const matchDesc = avatar.description?.toLowerCase().includes(q) || false;
        const matchTags = avatar.tags?.some((t) => t.toLowerCase().includes(q)) || false;
        return matchName || matchDesc || matchTags;
      }

      return true;
    });
  }, [categoryFilter, searchQuery]);

  // Current spotlight avatar
  const activeAvatar = useMemo(() => {
    return CARTOON_CHEF_AVATARS.find((a) => a.id === selectedAvatarId) || CARTOON_CHEF_AVATARS[0];
  }, [selectedAvatarId]);

  // Active frame option
  const activeFrame = useMemo(() => {
    return AVATAR_FRAMES.find((f) => f.id === activeFrameId) || AVATAR_FRAMES[0];
  }, [activeFrameId]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleEquip = (avatar: AvatarOption) => {
    const isUnlocked = unlockedIds.includes(avatar.id);
    const isLevelLocked = avatar.requiredLevel ? userLevel < avatar.requiredLevel : false;

    if (!isUnlocked && isLevelLocked) {
      showToast(language === 'zh-CN' ? `需达到 LV${avatar.requiredLevel} 等级解锁` : `Level ${avatar.requiredLevel} required`);
      return;
    }

    if (!isUnlocked && avatar.pointsCost > 0) {
      setConfirmRedeemItem(avatar);
      return;
    }

    // Equip
    setEquippedFrameId(activeFrameId);
    onSelectAvatar(avatar.avatarUrl, activeFrameId);
    showToast(language === 'zh-CN' ? `已换上【${avatar.name}】头像！` : `Equipped ${avatar.nameEn}!`);
    setTimeout(() => onClose(), 600);
  };

  const handleConfirmRedeem = () => {
    if (!confirmRedeemItem) return;

    if (userExp < confirmRedeemItem.pointsCost) {
      showToast(
        language === 'zh-CN'
          ? `积分不足！当前拥有 ${userExp} 积分，还差 ${confirmRedeemItem.pointsCost - userExp} 积分`
          : `Insufficient EXP! You have ${userExp}, need ${confirmRedeemItem.pointsCost}`
      );
      setConfirmRedeemItem(null);
      return;
    }

    const success = unlockAvatar(confirmRedeemItem.id);
    if (success) {
      setUnlockedIds(getUnlockedAvatarIds());
      setEquippedFrameId(activeFrameId);
      onSelectAvatar(confirmRedeemItem.avatarUrl, activeFrameId);
      showToast(
        language === 'zh-CN'
          ? `🎉 兑换成功！已佩戴【${confirmRedeemItem.name}】`
          : `🎉 Successfully unlocked & equipped ${confirmRedeemItem.nameEn}!`
      );
      setConfirmRedeemItem(null);
      setTimeout(() => onClose(), 600);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-[#FAF7F2] rounded-3xl border-2 border-[#EADBCE] shadow-2xl max-w-2xl w-full overflow-hidden relative my-4 max-h-[94vh] flex flex-col paper-shadow bg-notebook-dots">
        
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 sm:px-6 border-b border-[#EADBCE] bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#C85A32] text-white flex items-center justify-center shadow-xs">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-journal-title text-[#2C2723]">
                  {language === 'zh-CN' ? '大厨卡通形象工坊 · 20位手绘角色图鉴' : 'Chef Cartoon Character Workshop'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  20款手绘
                </span>
              </div>
              <p className="text-[11px] text-[#7A7268] mt-0.5">
                {language === 'zh-CN' 
                  ? '手绘风卡通厨师 · 萌宠助手 · Q版点心 · 人偶素体 · 支持边框装扮与积分兑换' 
                  : 'Hand-drawn chefs, culinary critters, chibi foodies & customizable base dolls'}
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

        {/* User Balance Strip */}
        <div className="bg-[#F4ECE2] px-4 sm:px-6 py-2 border-b border-[#EADBCE] flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-semibold text-[#2C2723]">
              <Crown className="w-3.5 h-3.5 text-amber-600" />
              <span>{language === 'zh-CN' ? `大厨等级 LV${userLevel}` : `Chef LV${userLevel}`}</span>
            </span>
            <span className="text-[#9A9085]">|</span>
            <span className="flex items-center gap-1 font-mono font-bold text-[#C85A32]">
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span>{userExp} {language === 'zh-CN' ? '可用等级积分' : 'Available EXP'}</span>
            </span>
          </div>
          <span className="text-[11px] text-[#7A7268]">
            {language === 'zh-CN' ? '已解锁角色：' : 'Unlocked: '}
            <strong className="text-[#2C2723] font-mono">{unlockedIds.length}</strong> / 20
          </span>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          
          {/* SPOTLIGHT INSPECTOR CARD */}
          <div className="bg-white rounded-2xl p-4 border border-[#EADBCE] shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-4">
            
            {/* Live Avatar + Frame Preview */}
            <div className="shrink-0 flex flex-col items-center">
              <div className={`w-24 h-24 rounded-full overflow-hidden shadow-md bg-[#FAF7F2] transition-all p-0.5 ${activeFrame.frameClass}`}>
                <img 
                  src={activeAvatar.avatarUrl} 
                  alt={activeAvatar.name} 
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <span className="mt-2 text-[10px] text-[#7A7268] flex items-center gap-1">
                <span>{activeFrame.icon}</span>
                <span>{language === 'zh-CN' ? activeFrame.name : activeFrame.nameEn}</span>
              </span>
            </div>

            {/* Lore & Details */}
            <div className="flex-1 min-w-0 text-center sm:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="font-bold text-base text-[#2C2723]">
                  {language === 'zh-CN' ? activeAvatar.name : activeAvatar.nameEn}
                </h3>
                <span className="text-xs text-[#9A9085] font-serif">
                  ({activeAvatar.nameEn})
                </span>
                
                {/* Rarity Badge */}
                {activeAvatar.rarity === 'legendary' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-stone-950 flex items-center gap-1 shadow-2xs">
                    <Sparkles className="w-3 h-3 text-amber-900" />
                    <span>{language === 'zh-CN' ? '殿堂传说' : 'Legendary'}</span>
                  </span>
                )}
                {activeAvatar.rarity === 'rare' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-indigo-600" />
                    <span>{language === 'zh-CN' ? '稀有名厨' : 'Rare'}</span>
                  </span>
                )}
                {activeAvatar.rarity === 'common' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-stone-700">
                    {language === 'zh-CN' ? '经典手绘' : 'Common'}
                  </span>
                )}
              </div>

              {/* Flavor Text Lore */}
              <p className="text-[12px] text-[#5A5248] italic bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EADBCE]/80 leading-relaxed">
                “{activeAvatar.description || '一位热爱美食与记录的手帐大厨'}”
              </p>

              {/* Tags */}
              {activeAvatar.tags && activeAvatar.tags.length > 0 && (
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-0.5">
                  {activeAvatar.tags.map((tag, idx) => (
                    <span 
                      key={idx} 
                      className="px-2 py-0.5 rounded-md bg-stone-100 text-[#7A7268] text-[10px] font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Action & Equip CTA */}
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                {currentAvatarUrl === activeAvatar.avatarUrl ? (
                  <span className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-xl font-bold flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    <span>{language === 'zh-CN' ? '当前佩戴中' : 'Equipped'}</span>
                  </span>
                ) : unlockedIds.includes(activeAvatar.id) ? (
                  <button
                    type="button"
                    onClick={() => handleEquip(activeAvatar)}
                    className="px-5 py-2 bg-[#C85A32] hover:bg-[#B34C26] text-white rounded-xl font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{language === 'zh-CN' ? '立即佩戴此造型' : 'Equip This Avatar'}</span>
                  </button>
                ) : activeAvatar.requiredLevel && userLevel < activeAvatar.requiredLevel ? (
                  <div className="px-4 py-2 bg-stone-200/80 text-stone-600 rounded-xl font-bold flex items-center gap-1.5 cursor-not-allowed">
                    <Lock className="w-4 h-4" />
                    <span>
                      {language === 'zh-CN' 
                        ? `等级未达标 (需达到 LV${activeAvatar.requiredLevel})` 
                        : `Level ${activeAvatar.requiredLevel} Required`}
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmRedeemItem(activeAvatar)}
                    className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-105 text-white rounded-xl font-bold shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                  >
                    <Coins className="w-4 h-4 text-amber-200" />
                    <span>
                      {language === 'zh-CN' 
                        ? `🪙 消耗 ${activeAvatar.pointsCost} 积分兑换` 
                        : `Redeem for ${activeAvatar.pointsCost} EXP`}
                    </span>
                  </button>
                )}
              </div>

            </div>

          </div>

          {/* AVATAR FRAME SELECTION ROW */}
          <div className="bg-white p-3.5 rounded-2xl border border-[#EADBCE] shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-[#2C2723]">
                <Crown className="w-4 h-4 text-amber-500" />
                <span>{language === 'zh-CN' ? '头像边框装扮' : 'Avatar Frame Accent'}</span>
              </div>
              <span className="text-[10px] text-[#7A7268]">
                {language === 'zh-CN' ? '即选即生效' : 'Instant live preview'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {AVATAR_FRAMES.map((frame) => {
                const isSelected = activeFrameId === frame.id;
                return (
                  <button
                    key={frame.id}
                    type="button"
                    onClick={() => setActiveFrameId(frame.id)}
                    className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300/40 shadow-xs'
                        : 'bg-[#FAF7F2] border-[#EADBCE] hover:bg-white'
                    }`}
                  >
                    <span className="text-base">{frame.icon}</span>
                    <div className="min-w-0">
                      <strong className="block text-[11px] text-[#2C2723] truncate">
                        {language === 'zh-CN' ? frame.name : frame.nameEn}
                      </strong>
                      <span className="text-[9px] text-[#7A7268]">
                        {frame.pointsCost === 0 ? (language === 'zh-CN' ? '免费无门槛' : 'Free') : `${frame.pointsCost} EXP`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* GALLERY BROWSER: CATEGORY TABS & SEARCH */}
          <div className="bg-white p-3.5 rounded-2xl border border-[#EADBCE] shadow-2xs space-y-3">
            
            {/* Search Bar & Stats */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-[#9A9085] absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'zh-CN' ? '搜索角色名、标签 (如: 猫、抹茶、素体、烘焙)...' : 'Search name or tags...'}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs text-[#2C2723] focus:outline-hidden focus:border-[#C85A32]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <span className="text-[11px] text-[#7A7268] text-right font-mono">
                {filteredAvatars.length} {language === 'zh-CN' ? '个可选造型' : 'avatars'}
              </span>
            </div>

            {/* Category Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-[11px]">
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap ${
                  categoryFilter === 'all'
                    ? 'bg-[#2C2723] text-white shadow-2xs'
                    : 'bg-[#FAF7F2] text-[#7A7268] hover:text-[#2C2723]'
                }`}
              >
                {language === 'zh-CN' ? '全部角色 (20)' : 'All (20)'}
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('cartoon_chef')}
                className={`px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap ${
                  categoryFilter === 'cartoon_chef'
                    ? 'bg-[#C85A32] text-white shadow-2xs'
                    : 'bg-[#FAF7F2] text-[#7A7268] hover:text-[#2C2723]'
                }`}
              >
                👨‍🍳 {language === 'zh-CN' ? '热血主厨' : 'Chefs'}
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('culinary_creature')}
                className={`px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap ${
                  categoryFilter === 'culinary_creature'
                    ? 'bg-[#C85A32] text-white shadow-2xs'
                    : 'bg-[#FAF7F2] text-[#7A7268] hover:text-[#2C2723]'
                }`}
              >
                🐱 {language === 'zh-CN' ? '料理萌宠' : 'Creatures'}
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('chibi_foodie')}
                className={`px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap ${
                  categoryFilter === 'chibi_foodie'
                    ? 'bg-[#C85A32] text-white shadow-2xs'
                    : 'bg-[#FAF7F2] text-[#7A7268] hover:text-[#2C2723]'
                }`}
              >
                🥟 {language === 'zh-CN' ? '点心食灵' : 'Chibi Foodies'}
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('base_doll')}
                className={`px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap ${
                  categoryFilter === 'base_doll'
                    ? 'bg-[#C85A32] text-white shadow-2xs'
                    : 'bg-[#FAF7F2] text-[#7A7268] hover:text-[#2C2723]'
                }`}
              >
                🧍 {language === 'zh-CN' ? '人偶素体' : 'Base Dolls'}
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('master')}
                className={`px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap ${
                  categoryFilter === 'master'
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'bg-[#FAF7F2] text-[#7A7268] hover:text-[#2C2723]'
                }`}
              >
                👑 {language === 'zh-CN' ? '高阶殿堂' : 'Master Perks'}
              </button>
            </div>

            {/* 20 AVATARS GRID */}
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 max-h-72 overflow-y-auto p-1">
              {filteredAvatars.map((avatar) => {
                const isSelected = selectedAvatarId === avatar.id;
                const isEquipped = currentAvatarUrl === avatar.avatarUrl;
                const isUnlocked = unlockedIds.includes(avatar.id);
                const isLevelLocked = avatar.requiredLevel ? userLevel < avatar.requiredLevel : false;

                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setSelectedAvatarId(avatar.id)}
                    className={`flex flex-col items-center p-2 rounded-2xl border text-center transition-all relative group ${
                      isSelected
                        ? 'bg-amber-50/80 border-[#C85A32] ring-2 ring-[#C85A32]/40 shadow-sm scale-102'
                        : 'bg-[#FAF7F2] border-[#EADBCE] hover:border-[#C85A32]/50 hover:bg-white'
                    }`}
                  >
                    {/* Equipped Badge */}
                    {isEquipped && (
                      <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 bg-emerald-600 text-white text-[8px] font-bold rounded-full shadow-xs z-10">
                        佩戴中
                      </span>
                    )}

                    {/* Avatar Thumbnail */}
                    <div className="w-14 h-14 rounded-full overflow-hidden border border-[#EADBCE] bg-white relative shadow-xs">
                      <img 
                        src={avatar.avatarUrl} 
                        alt={avatar.name} 
                        className="w-full h-full object-cover" 
                      />
                      {!isUnlocked && isLevelLocked && (
                        <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center text-white">
                          <Lock className="w-4 h-4 text-amber-300" />
                          <span className="text-[8px] font-bold mt-0.5">LV{avatar.requiredLevel}</span>
                        </div>
                      )}
                      {!isUnlocked && !isLevelLocked && avatar.pointsCost > 0 && (
                        <div className="absolute inset-0 bg-stone-900/40 flex items-center justify-center text-amber-200">
                          <Coins className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <span className="text-[11px] font-bold text-[#2C2723] mt-1.5 truncate max-w-full leading-tight">
                      {language === 'zh-CN' ? avatar.name : avatar.nameEn}
                    </span>

                    {/* Rarity or Tag Note */}
                    <div className="mt-0.5">
                      {avatar.requiredLevel && isLevelLocked ? (
                        <span className="text-[9px] text-amber-700 font-bold">
                          LV{avatar.requiredLevel}解锁
                        </span>
                      ) : !isUnlocked && avatar.pointsCost > 0 ? (
                        <span className="text-[9px] text-[#C85A32] font-semibold">
                          🪙 {avatar.pointsCost}分
                        </span>
                      ) : avatar.category === 'base_doll' ? (
                        <span className="text-[9px] text-stone-500 font-medium">
                          换装素体
                        </span>
                      ) : (
                        <span className="text-[9px] text-emerald-600 font-medium">
                          已拥有
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

          </div>

        </div>

        {/* Floating Reward / Message Toast */}
        {toastMessage && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-[#2C2723] text-amber-200 text-xs py-2 px-4 rounded-xl border border-amber-400/40 shadow-2xl flex items-center gap-2 animate-fade-in z-50">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* REDEEM CONFIRMATION DIALOG */}
        {confirmRedeemItem && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-[#FAF7F2] rounded-2xl border-2 border-[#EADBCE] p-5 max-w-sm w-full space-y-4 shadow-2xl paper-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400 shrink-0">
                  <img src={confirmRedeemItem.avatarUrl} alt={confirmRedeemItem.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#2C2723]">
                    {language === 'zh-CN' ? `确认兑换【${confirmRedeemItem.name}】？` : `Unlock ${confirmRedeemItem.nameEn}?`}
                  </h4>
                  <p className="text-[11px] text-[#7A7268] mt-0.5">
                    {language === 'zh-CN' ? '永久解锁该形象并直接佩戴' : 'Permanently unlock & equip'}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#EADBCE] text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#7A7268]">{language === 'zh-CN' ? '所需等级积分：' : 'Required EXP:'}</span>
                  <span className="font-mono font-bold text-[#C85A32]">🪙 {confirmRedeemItem.pointsCost} EXP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A7268]">{language === 'zh-CN' ? '当前拥有积分：' : 'Your Balance:'}</span>
                  <span className="font-mono font-bold text-[#2C2723]">{userExp} EXP</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setConfirmRedeemItem(null)}
                  className="px-3.5 py-1.5 text-xs text-[#7A7268] hover:text-[#2C2723] font-medium rounded-xl hover:bg-stone-200/50"
                >
                  {language === 'zh-CN' ? '暂不兑换' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRedeem}
                  disabled={userExp < confirmRedeemItem.pointsCost}
                  className={`px-4 py-1.5 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1 ${
                    userExp < confirmRedeemItem.pointsCost
                      ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                      : 'bg-[#C85A32] hover:bg-[#B34C26] text-white active:scale-95'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>{language === 'zh-CN' ? '确认兑换' : 'Confirm Unlock'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
