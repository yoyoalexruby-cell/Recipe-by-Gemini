import React, { useState, useEffect, useRef } from 'react';
import { Palette, Check, Sun, Moon } from 'lucide-react';
import { AppTheme, THEME_OPTIONS, getSavedTheme, applyTheme } from '../utils/themeStorage';

export const ThemeSwitcher: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(() => getSavedTheme());
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Apply on mount
  useEffect(() => {
    applyTheme(currentTheme);
    const handleThemeChange = (e: CustomEvent) => {
      setCurrentTheme(e.detail);
    };
    window.addEventListener('theme-changed', handleThemeChange as EventListener);
    return () => window.removeEventListener('theme-changed', handleThemeChange as EventListener);
  }, [currentTheme]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeOption = THEME_OPTIONS.find(t => t.id === currentTheme) || THEME_OPTIONS[0];

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-[#7A7268] hover:text-[#2C2723] hover:bg-white rounded-md transition-colors flex items-center gap-1.5"
        title="切换页面风格背景 (浅色/深色/复古/抹茶)"
      >
        <span className="text-sm">{activeOption.icon}</span>
        <span className="text-xs font-medium hidden sm:inline">{activeOption.name.split(' ')[0]}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-[#EADBCE] rounded-xl shadow-xl p-2 z-50 animate-fade-in space-y-1">
          <div className="px-2.5 py-1.5 text-[11px] font-semibold text-[#7A7268] border-b border-[#EADBCE]/60 flex items-center justify-between">
            <span>手帐纸张背景风格</span>
            <Palette className="w-3.5 h-3.5 text-[#C85A32]" />
          </div>

          <div className="space-y-1 pt-1">
            {THEME_OPTIONS.map((theme) => {
              const isSelected = theme.id === currentTheme;

              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => {
                    applyTheme(theme.id);
                    setCurrentTheme(theme.id);
                    setIsOpen(false);
                  }}
                  className={`w-full px-2.5 py-2 rounded-lg text-left transition-all flex items-center justify-between gap-2 text-xs ${
                    isSelected
                      ? 'bg-[#FAF3EC] text-[#C85A32] font-bold border border-[#C85A32]/30'
                      : 'text-[#2C2723] hover:bg-[#FAF7F2]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span 
                      className="w-4 h-4 rounded-full border border-black/10 shrink-0 shadow-2xs"
                      style={{ backgroundColor: theme.previewColor }}
                    />
                    <div className="min-w-0">
                      <div className="truncate">{theme.name}</div>
                    </div>
                  </div>

                  {isSelected && <Check className="w-3.5 h-3.5 text-[#C85A32] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
