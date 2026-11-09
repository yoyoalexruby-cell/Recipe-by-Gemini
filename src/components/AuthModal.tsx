import React, { useState, useEffect } from 'react';
import { UserProfile, LoginMethod } from '../types/auth';
import { 
  loginWithPhone, loginWithPassword, registerWithPassword, 
  loginWithGoogle, loginWithWeChat, loginWithAlipay, loginAsGuest 
} from '../utils/authService';
import { migrateGuestRecipesToUser } from '../utils/multiUserStorage';
import { 
  X, Smartphone, Key, Mail, Lock, User, 
  QrCode, ArrowRight, ShieldCheck, CheckCircle2, Sparkles 
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'password' | 'phone' | 'wechat' | 'alipay' | 'google'>('password');
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [smsCountdown, setSmsCountdown] = useState(0);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // SMS Timer
  useEffect(() => {
    if (smsCountdown > 0) {
      const timer = setTimeout(() => setSmsCountdown(smsCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [smsCountdown]);

  if (!isOpen) return null;

  const handleSendSms = () => {
    if (!phone || phone.length < 11) {
      setErrorMessage('请输入正确的11位手机号码');
      return;
    }
    setErrorMessage(null);
    setSmsCountdown(60);
    // Prefill demo code
    setSmsCode('1234');
    alert(`【食味手记】短信验证码已发送至 ${phone}：1234 (5分钟内有效)`);
  };

  const completeLogin = (user: UserProfile) => {
    // Automatically migrate any guest recipes to the newly logged-in account
    const migrated = migrateGuestRecipesToUser(user);
    onLoginSuccess(user);
    onClose();
    if (migrated > 0) {
      alert(`欢迎回来，${user.displayName}！已将您在本地记录的 ${migrated} 篇手帐同步合并至您的云端账号。`);
    }
  };

  // Submit Password Login / Register
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      if (isRegisterMode) {
        if (!username.trim() || !password.trim()) {
          throw new Error('请输入完整的用户名和密码');
        }
        const user = registerWithPassword(username, password, email);
        completeLogin(user);
      } else {
        const user = loginWithPassword(username, password);
        completeLogin(user);
      }
    } catch (err) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Phone SMS Login
  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const user = loginWithPhone(phone, smsCode);
      completeLogin(user);
    } catch (err) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3P Logins
  const handleSocialLogin = (type: 'wechat' | 'alipay' | 'google') => {
    setIsSubmitting(true);
    setTimeout(() => {
      let user: UserProfile;
      if (type === 'wechat') user = loginWithWeChat();
      else if (type === 'alipay') user = loginWithAlipay();
      else user = loginWithGoogle();
      setIsSubmitting(false);
      completeLogin(user);
    }, 600);
  };

  const handleGuestLogin = () => {
    const user = loginAsGuest();
    completeLogin(user);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF7F2] rounded-2xl border border-[#EADBCE] shadow-2xl max-w-md w-full overflow-hidden relative my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:px-6 border-b border-[#EADBCE] bg-white">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C85A32]" />
            <h2 className="text-base font-bold font-journal-title text-[#2C2723]">
              {isRegisterMode ? '注册「食味手记」新账号' : '登录「食味手记」手帐空间'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#9A9085] hover:text-[#2C2723] rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-channel Nav Tabs */}
        <div className="flex border-b border-[#EADBCE] bg-white text-xs font-medium">
          <button
            onClick={() => { setActiveTab('password'); setErrorMessage(null); }}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
              activeTab === 'password'
                ? 'border-[#C85A32] text-[#C85A32] font-bold'
                : 'border-transparent text-[#7A7268] hover:text-[#2C2723]'
            }`}
          >
            账号密码
          </button>

          <button
            onClick={() => { setActiveTab('phone'); setErrorMessage(null); }}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
              activeTab === 'phone'
                ? 'border-[#C85A32] text-[#C85A32] font-bold'
                : 'border-transparent text-[#7A7268] hover:text-[#2C2723]'
            }`}
          >
            手机验证码
          </button>

          <button
            onClick={() => { setActiveTab('wechat'); setErrorMessage(null); }}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
              activeTab === 'wechat'
                ? 'border-[#C85A32] text-[#C85A32] font-bold'
                : 'border-transparent text-[#7A7268] hover:text-[#2C2723]'
            }`}
          >
            微信
          </button>

          <button
            onClick={() => { setActiveTab('alipay'); setErrorMessage(null); }}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
              activeTab === 'alipay'
                ? 'border-[#C85A32] text-[#C85A32] font-bold'
                : 'border-transparent text-[#7A7268] hover:text-[#2C2723]'
            }`}
          >
            支付宝
          </button>

          <button
            onClick={() => { setActiveTab('google'); setErrorMessage(null); }}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
              activeTab === 'google'
                ? 'border-[#C85A32] text-[#C85A32] font-bold'
                : 'border-transparent text-[#7A7268] hover:text-[#2C2723]'
            }`}
          >
            Google
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          
          {/* Error Message */}
          {errorMessage && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {errorMessage}
            </div>
          )}

          {/* TAB 1: USERNAME / EMAIL & PASSWORD */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#2C2723] mb-1">
                  用户名或注册邮箱
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#9A9085] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="请输入您的用户名或邮箱"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#EADBCE] rounded-lg focus:outline-hidden focus:border-[#C85A32]"
                  />
                </div>
              </div>

              {isRegisterMode && (
                <div>
                  <label className="block text-xs font-semibold text-[#2C2723] mb-1">
                    电子邮箱 (选填，用于密码找回)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#9A9085] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#EADBCE] rounded-lg focus:outline-hidden focus:border-[#C85A32]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#2C2723] mb-1">
                  登录密码
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#9A9085] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="请输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#EADBCE] rounded-lg focus:outline-hidden focus:border-[#C85A32]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-[#C85A32] hover:bg-[#B34C26] text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <span>{isRegisterMode ? '立即注册并进入手帐' : '登录我的手帐'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center justify-between pt-1 text-[11px] text-[#7A7268]">
                <span>
                  {isRegisterMode ? '已有账号？' : '还没有账号？'}
                  <button
                    type="button"
                    onClick={() => { setIsRegisterMode(!isRegisterMode); setErrorMessage(null); }}
                    className="text-[#C85A32] font-semibold hover:underline ml-1"
                  >
                    {isRegisterMode ? '直接登录' : '免费注册一个'}
                  </button>
                </span>
                <span className="text-[#9A9085]">首次输入将自动建档</span>
              </div>
            </form>
          )}

          {/* TAB 2: PHONE SMS LOGIN */}
          {activeTab === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#2C2723] mb-1">
                  手机号码
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-[#9A9085] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="输入11位大陆手机号"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#EADBCE] rounded-lg focus:outline-hidden focus:border-[#C85A32]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C2723] mb-1">
                  短信验证码
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="4位或6位验证码"
                    value={smsCode}
                    onChange={(e) => setSmsCode(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs font-mono bg-white border border-[#EADBCE] rounded-lg focus:outline-hidden focus:border-[#C85A32]"
                  />
                  <button
                    type="button"
                    onClick={handleSendSms}
                    disabled={smsCountdown > 0}
                    className="px-3 py-2 bg-[#FAF7F2] border border-[#EADBCE] hover:border-[#C85A32] text-[#2C2723] text-xs font-medium rounded-lg transition-colors shrink-0 disabled:opacity-50"
                  >
                    {smsCountdown > 0 ? `${smsCountdown}秒后重发` : '获取验证码'}
                  </button>
                </div>
                <p className="text-[10px] text-[#9A9085] mt-1">未注册手机验证通过后将自动创建新账户</p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-[#C85A32] hover:bg-[#B34C26] text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <span>手机号一键登录</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* TAB 3: WECHAT LOGIN */}
          {activeTab === 'wechat' && (
            <div className="text-center py-3 space-y-4">
              <div className="w-44 h-44 bg-white p-2.5 mx-auto rounded-xl border border-[#EADBCE] shadow-xs flex flex-col items-center justify-center relative">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=WECHAT_LOGIN_FOOD_JOURNAL"
                  alt="微信扫码"
                  className="w-36 h-36"
                />
                <span className="text-[10px] text-[#7A7268] mt-1 flex items-center gap-1">
                  <QrCode className="w-3 h-3 text-emerald-600" />
                  <span>使用微信扫一扫授权登录</span>
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleSocialLogin('wechat')}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <span>微信一键授权快捷登录</span>
              </button>
            </div>
          )}

          {/* TAB 4: ALIPAY LOGIN */}
          {activeTab === 'alipay' && (
            <div className="text-center py-3 space-y-4">
              <div className="w-44 h-44 bg-white p-2.5 mx-auto rounded-xl border border-[#EADBCE] shadow-xs flex flex-col items-center justify-center relative">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ALIPAY_LOGIN_FOOD_JOURNAL"
                  alt="支付宝扫码"
                  className="w-36 h-36"
                />
                <span className="text-[10px] text-[#7A7268] mt-1 flex items-center gap-1">
                  <QrCode className="w-3 h-3 text-blue-600" />
                  <span>使用支付宝扫一扫快捷登录</span>
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleSocialLogin('alipay')}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <span>支付宝一键授权快捷登录</span>
              </button>
            </div>
          )}

          {/* TAB 5: GOOGLE LOGIN */}
          {activeTab === 'google' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-white border border-[#EADBCE] flex items-center justify-center mx-auto shadow-2xs">
                <svg className="w-8 h-8" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>

              <p className="text-xs text-[#5A5248]">
                使用您的 Google 账号极速登录，数据多端自动安全同步。
              </p>

              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-white hover:bg-[#FAF7F2] text-[#2C2723] border border-[#EADBCE] rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <span>通过 Google 账号直接登录</span>
              </button>
            </div>
          )}

          {/* Guest Mode Trigger */}
          <div className="pt-2 border-t border-[#EADBCE]/60 flex items-center justify-between text-xs">
            <span className="text-[#9A9085]">只想先试试？</span>
            <button
              type="button"
              onClick={handleGuestLogin}
              className="text-[#C85A32] font-semibold hover:underline"
            >
              游客免密快速体验 →
            </button>
          </div>

        </div>

        {/* Footer info */}
        <div className="p-3.5 bg-white border-t border-[#EADBCE] text-center text-[11px] text-[#9A9085] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#5F7A4D]" />
          <span>每个账户手帐独立隔离 · 登录即享云端多端同步</span>
        </div>

      </div>
    </div>
  );
};
