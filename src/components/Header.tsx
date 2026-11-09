import React from 'react';
import { Plus, BookOpen, ShoppingBag, HeartHandshake, Database, Sparkles, User, LogIn, Calendar, ChefHat } from 'lucide-react';
import { UserProfile } from '../types/auth';
import { ThemeSwitcher } from './ThemeSwitcher';

interface HeaderProps {
  activeView: 'journal' | 'calendar' | 'square' | 'pantry' | 'notes' | 'backup';
  setActiveView: (view: 'journal' | 'calendar' | 'square' | 'pantry' | 'notes' | 'backup') => void;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onNewRecipe: () => void;
  onOpenInstall: () => void;
  onOpenGitHub: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  currentUser,
  onOpenAuth,
  onOpenProfile,
  onNewRecipe,
  onOpenInstall,
  onOpenGitHub
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#EADBCE]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-6">
        
        {/* Zone 1: Brand Wordmark (Single text element in display face) */}
        <a 
          href="#journal"
          onClick={(e) => { e.preventDefault(); setActiveView('journal'); }}
          className="text-lg sm:text-xl font-bold tracking-tight text-[#2C2723] font-journal-title whitespace-nowrap shrink-0 hover:text-[#C85A32] transition-colors flex items-center gap-2"
        >
          <span className="text-[#C85A32] text-xl sm:text-2xl font-normal">❖</span>
          <span>食味手记 · 做菜手帐</span>
        </a>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-6 text-sm font-medium text-[#7A7268]">
          <button
            onClick={() => setActiveView('journal')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
              activeView === 'journal' 
                ? 'text-[#C85A32] font-semibold border-b-2 border-[#C85A32]' 
                : 'hover:text-[#2C2723]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>我的手帐</span>
          </button>

          <button
            onClick={() => setActiveView('calendar')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
              activeView === 'calendar' 
                ? 'text-[#C85A32] font-semibold border-b-2 border-[#C85A32]' 
                : 'hover:text-[#2C2723]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>烹饪日历</span>
          </button>

          <button
            onClick={() => setActiveView('square')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
              activeView === 'square' 
                ? 'text-[#C85A32] font-semibold border-b-2 border-[#C85A32]' 
                : 'hover:text-[#2C2723]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#C85A32]" />
            <span>食味广场</span>
          </button>

          <button
            onClick={() => setActiveView('pantry')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
              activeView === 'pantry' 
                ? 'text-[#C85A32] font-semibold border-b-2 border-[#C85A32]' 
                : 'hover:text-[#2C2723]'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>下厨制作</span>
          </button>

          <button
            onClick={() => setActiveView('notes')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
              activeView === 'notes' 
                ? 'text-[#C85A32] font-semibold border-b-2 border-[#C85A32]' 
                : 'hover:text-[#2C2723]'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>心得墙</span>
          </button>

          <button
            onClick={() => setActiveView('backup')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
              activeView === 'backup' 
                ? 'text-[#C85A32] font-semibold border-b-2 border-[#C85A32]' 
                : 'hover:text-[#2C2723]'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>备份管理</span>
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Theme switcher */}
          <ThemeSwitcher />

          {/* GitHub Sync Button */}
          <button
            onClick={onOpenGitHub}
            className="p-2 text-[#7A7268] hover:text-[#2C2723] hover:bg-white rounded-md transition-colors"
            title="GitHub 实时代码备份"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </button>

          {/* Install PWA Button */}
          <button
            onClick={onOpenInstall}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-[#5A5248] hover:text-[#2C2723] bg-white border border-[#EADBCE] hover:bg-[#FAF7F2] rounded-md transition-all shadow-2xs whitespace-nowrap shrink-0"
            title="将手帐安装为独立手机/桌面App"
          >
            <span>📲 安装App</span>
          </button>

          {/* New Recipe Primary Button */}
          <button
            onClick={onNewRecipe}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-[#C85A32] hover:bg-[#B34C26] active:scale-[0.98] rounded-md shadow-sm transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>记新菜谱</span>
          </button>

          {/* User Auth or Profile Button */}
          {currentUser ? (
            <button
              onClick={onOpenProfile}
              className="inline-flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border border-[#EADBCE] bg-white hover:border-[#C85A32] transition-colors shadow-2xs shrink-0 max-w-[140px]"
              title="查看与修改个人资料"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden border border-[#EADBCE] bg-[#FAF7F2] shrink-0">
                <img src={currentUser.avatarUrl} alt={currentUser.displayName} className="w-full h-full object-cover" />
              </div>
              <span className="text-xs font-semibold text-[#2C2723] truncate">
                {currentUser.displayName}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#C85A32] hover:text-white bg-white hover:bg-[#C85A32] border border-[#C85A32] rounded-md transition-colors shadow-2xs shrink-0"
              title="登录或注册账号"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>登录 / 注册</span>
            </button>
          )}
        </div>

      </div>

      {/* Mobile nav bar row for small screens */}
      <div className="md:hidden flex items-center justify-around border-t border-[#EADBCE]/60 bg-[#FAF7F2] py-2 px-2 text-xs text-[#7A7268]">
        <button
          onClick={() => setActiveView('journal')}
          className={`flex flex-col items-center gap-1 ${activeView === 'journal' ? 'text-[#C85A32] font-semibold' : ''}`}
        >
          <BookOpen className="w-4 h-4" />
          <span>手帐</span>
        </button>
        <button
          onClick={() => setActiveView('calendar')}
          className={`flex flex-col items-center gap-1 ${activeView === 'calendar' ? 'text-[#C85A32] font-semibold' : ''}`}
        >
          <Calendar className="w-4 h-4" />
          <span>日历</span>
        </button>
        <button
          onClick={() => setActiveView('pantry')}
          className={`flex flex-col items-center gap-1 ${activeView === 'pantry' ? 'text-[#C85A32] font-semibold' : ''}`}
        >
          <ChefHat className="w-4 h-4" />
          <span>制作</span>
        </button>
        <button
          onClick={() => setActiveView('square')}
          className={`flex flex-col items-center gap-1 ${activeView === 'square' ? 'text-[#C85A32] font-semibold' : ''}`}
        >
          <Sparkles className="w-4 h-4 text-[#C85A32]" />
          <span>广场</span>
        </button>
        <button
          onClick={() => setActiveView('notes')}
          className={`flex flex-col items-center gap-1 ${activeView === 'notes' ? 'text-[#C85A32] font-semibold' : ''}`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>心得</span>
        </button>
        <button
          onClick={currentUser ? onOpenProfile : onOpenAuth}
          className="flex flex-col items-center gap-1 text-[#2C2723] font-semibold"
        >
          {currentUser ? (
            <div className="w-4 h-4 rounded-full overflow-hidden border border-[#C85A32]">
              <img src={currentUser.avatarUrl} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <User className="w-4 h-4 text-[#C85A32]" />
          )}
          <span>{currentUser ? '我的' : '登录'}</span>
        </button>
      </div>
    </header>
  );
};
