import React, { useState } from 'react';
import { UserProfile } from '../types/auth';
import {
  loginWithPassword,
  registerWithPassword,
  loginAsGuest
} from '../utils/authService';
import { migrateGuestRecipesToUser } from '../utils/multiUserStorage';
import {
  X,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useI18n } from '../i18n/context';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  onOpenLegalPage?: (section: 'privacy' | 'terms' | 'support') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onOpenLegalPage
}) => {
  const { language } = useI18n();
  const isZh = language === 'zh-CN';

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const completeLogin = (user: UserProfile) => {
    const migrated = migrateGuestRecipesToUser(user);
    if (migrated > 0) {
      setStatusNotice(
        isZh
          ? `欢迎，${user.displayName}！已将本机记录的 ${migrated} 篇手帐合并至您的账号。`
          : `Welcome, ${user.displayName}! Merged ${migrated} local recipes into your account.`
      );
      setTimeout(() => {
        onLoginSuccess(user);
        onClose();
      }, 900);
    } else {
      onLoginSuccess(user);
      onClose();
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!agreedToTerms) {
      setErrorMessage(
        isZh
          ? '请先阅读并勾选同意《隐私保护政策》与《用户服务协议》'
          : 'Please agree to the Privacy Policy and Terms of Use first'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      if (isRegisterMode) {
        if (!username.trim() || password.trim().length < 6) {
          throw new Error(
            isZh
              ? '请输入用户名，且密码长度不少于 6 位'
              : 'Please enter a username and a password of at least 6 characters'
          );
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

  const handleGuestLogin = () => {
    const user = loginAsGuest();
    completeLogin(user);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF7F2] rounded-2xl border border-[#EADBCE] shadow-2xl max-w-md w-full overflow-hidden relative my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:px-6 border-b border-[#EADBCE] bg-white">
          <h2 className="text-base font-bold font-journal-title text-[#2C2723]">
            {isRegisterMode
              ? isZh
                ? '注册「食味手记」账号'
                : 'Create Culinary Journal Account'
              : isZh
              ? '登录「食味手记」手帐空间'
              : 'Sign In to Culinary Journal'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#9A9085] hover:text-[#2C2723] rounded-md transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Segmented Switcher */}
        <div className="px-6 pt-5">
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#EFE7DC] rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(false);
                setErrorMessage(null);
              }}
              className={`py-2 rounded-lg transition-colors whitespace-nowrap ${
                !isRegisterMode
                  ? 'bg-white text-[#2C2723] shadow-2xs'
                  : 'text-[#6E655C] hover:text-[#2C2723]'
              }`}
            >
              {isZh ? '账号登录' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(true);
                setErrorMessage(null);
              }}
              className={`py-2 rounded-lg transition-colors whitespace-nowrap ${
                isRegisterMode
                  ? 'bg-white text-[#2C2723] shadow-2xs'
                  : 'text-[#6E655C] hover:text-[#2C2723]'
              }`}
            >
              {isZh ? '免费注册新账号' : 'Create Account'}
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {errorMessage}
            </div>
          )}

          {statusNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{statusNotice}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#2C2723] mb-1">
                {isZh ? '用户名或电子邮箱' : 'Username or Email'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#9A9085] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  placeholder={isZh ? '请输入用户名或邮箱' : 'Enter username or email'}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-[#EADBCE] rounded-xl focus:outline-hidden focus:border-[#C85A32]"
                />
              </div>
            </div>

            {isRegisterMode && (
              <div>
                <label className="block text-xs font-semibold text-[#2C2723] mb-1">
                  {isZh ? '联系邮箱（选填，用于账号联络）' : 'Contact Email (Optional)'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#9A9085] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-[#EADBCE] rounded-xl focus:outline-hidden focus:border-[#C85A32]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#2C2723] mb-1">
                {isZh ? '密码（不少于 6 位）' : 'Password (min 6 characters)'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#9A9085] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
                  placeholder={isZh ? '请输入登录密码' : 'Enter password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-[#EADBCE] rounded-xl focus:outline-hidden focus:border-[#C85A32]"
                />
              </div>
            </div>

            {/* Mandatory Privacy & Terms Consent Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2 text-[11px] text-[#5A5248] cursor-pointer select-none leading-relaxed">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#C85A32] rounded shrink-0"
                />
                <span>
                  {isZh ? '我已阅读并同意 ' : 'I have read and agree to the '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      onClose();
                      onOpenLegalPage?.('privacy');
                    }}
                    className="text-[#C85A32] font-semibold hover:underline"
                  >
                    {isZh ? '《隐私保护政策》' : 'Privacy Policy'}
                  </button>
                  {isZh ? ' 与 ' : ' & '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      onClose();
                      onOpenLegalPage?.('terms');
                    }}
                    className="text-[#C85A32] font-semibold hover:underline"
                  >
                    {isZh ? '《用户服务协议》' : 'Terms of Use'}
                  </button>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-[#C85A32] hover:bg-[#B34C26] text-white rounded-xl text-xs font-bold transition-colors shadow-2xs flex items-center justify-center gap-1.5 disabled:opacity-50 min-h-[44px]"
            >
              <span>
                {isRegisterMode
                  ? isZh
                    ? '立即创建手帐账号'
                    : 'Create Account & Continue'
                  : isZh
                  ? '登录我的手帐'
                  : 'Sign In'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Guest Mode Trigger (Apple Guideline 5.1.1 Non-gated Core Features) */}
          <div className="pt-3 border-t border-[#EADBCE]/70 flex items-center justify-between text-xs">
            <span className="text-[#7A7268]">
              {isZh ? '暂不注册账号？' : 'Prefer offline local use?'}
            </span>
            <button
              type="button"
              onClick={handleGuestLogin}
              className="text-[#2C2723] hover:text-[#C85A32] font-semibold hover:underline py-1"
            >
              {isZh ? '免注册本机直接体验 →' : 'Continue as Guest →'}
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3.5 bg-white border-t border-[#EADBCE] text-center text-[11px] text-[#7A7268] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#5F7A4D] shrink-0" />
          <span>
            {isZh
              ? '本地优先加密隔离 · 支持随时导出备份或一键注销账号'
              : 'Local-first storage · Export or delete account anytime'}
          </span>
        </div>
      </div>
    </div>
  );
};
