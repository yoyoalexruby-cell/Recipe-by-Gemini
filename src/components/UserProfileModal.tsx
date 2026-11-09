import React, { useState } from 'react';
import { UserProfile, PRESET_AVATARS } from '../types/auth';
import { updateCurrentUserProfile, logoutUser } from '../utils/authService';
import { compressImageFile } from '../utils/storage';
import { X, User, Camera, LogOut, Check, Heart, BookOpen, Share2, Shield } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  user: UserProfile;
  userRecipeCount: number;
  publicRecipeCount: number;
  totalLikesReceived: number;
  onClose: () => void;
  onUserUpdated: (user: UserProfile) => void;
  onLogout: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  user,
  userRecipeCount,
  publicRecipeCount,
  totalLikesReceived,
  onClose,
  onUserUpdated,
  onLogout
}) => {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [isUploading, setIsUploading] = useState(false);

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
    onClose();
  };

  const getMethodBadge = () => {
    switch (user.loginMethod) {
      case 'phone': return '📱 手机验证码绑定';
      case 'wechat': return '💬 微信账号授权';
      case 'alipay': return '💰 支付宝授权';
      case 'google': return '🌐 Google 账户授权';
      case 'password': return '🔑 密码独立账户';
      default: return '👤 游客体验模式';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF7F2] rounded-2xl border border-[#EADBCE] shadow-2xl max-w-md w-full overflow-hidden relative my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:px-6 border-b border-[#EADBCE] bg-white">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#C85A32]" />
            <h2 className="text-base font-bold font-journal-title text-[#2C2723]">
              个人手帐名片与资料
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#9A9085] hover:text-[#2C2723] rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-5 text-xs">
          
          {/* Avatar & Basic Card */}
          <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-[#EADBCE] shadow-2xs">
            <div className="relative group">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#C85A32] shadow-xs bg-[#FAF7F2]">
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              </div>
              <label className="absolute bottom-0 right-0 p-1 rounded-full bg-[#C85A32] text-white hover:bg-[#B34C26] cursor-pointer shadow-xs transition-transform active:scale-95">
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
              <span className="inline-block text-[10px] text-[#7A7268] bg-[#FAF7F2] border border-[#EADBCE] px-2 py-0.5 rounded-full mt-1">
                {getMethodBadge()}
              </span>
              <p className="text-[10px] font-mono text-[#9A9085] mt-1">UID: {user.uid.slice(0, 14)}...</p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 bg-white rounded-lg border border-[#EADBCE]">
              <span className="text-base font-mono font-bold text-[#C85A32] block tabular-nums">
                {userRecipeCount}
              </span>
              <span className="text-[10px] text-[#7A7268]">我的私密手帐</span>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-[#EADBCE]">
              <span className="text-base font-mono font-bold text-[#5F7A4D] block tabular-nums">
                {publicRecipeCount}
              </span>
              <span className="text-[10px] text-[#7A7268]">已公开发布</span>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-[#EADBCE]">
              <span className="text-base font-mono font-bold text-[#C08A3E] block tabular-nums">
                {totalLikesReceived}
              </span>
              <span className="text-[10px] text-[#7A7268]">累计收到暖心赞</span>
            </div>
          </div>

          {/* Edit Fields */}
          <div className="space-y-3 bg-white p-4 rounded-xl border border-[#EADBCE]">
            <div>
              <label className="block font-semibold text-[#2C2723] mb-1">
                大厨昵称
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#EADBCE] rounded-lg focus:outline-hidden focus:border-[#C85A32]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#2C2723] mb-1">
                烹饪个性签名 / 座右铭
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="写一句属于你厨房的烟火气签名..."
                className="w-full p-2.5 border border-[#EADBCE] rounded-lg focus:outline-hidden focus:border-[#C85A32]"
              />
            </div>

            {/* Pick Avatar Presets */}
            <div>
              <label className="block font-semibold text-[#2C2723] mb-1.5">
                精选大厨头像
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
                    <img src={url} alt={`头像 ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                if (confirm('确认退出当前登录状态吗？')) {
                  logoutUser();
                  onLogout();
                  onClose();
                }
              }}
              className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>退出登录</span>
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-[#C85A32] hover:bg-[#B34C26] text-white rounded-lg font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>保存修改</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
