import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useI18n } from '../i18n/context';
import { SupportedLanguage } from '../i18n/types';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, currentOption, languages } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 sm:px-2.5 sm:py-1 text-[#7A7268] hover:text-[#2C2723] hover:bg-white rounded-md transition-colors flex items-center gap-1.5 border border-transparent hover:border-[#EADBCE]"
        title="切换语言 / Switch Language"
      >
        <span className="text-sm">{currentOption.flag}</span>
        <span className="text-xs font-medium hidden sm:inline">{currentOption.nativeName}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-[#EADBCE] rounded-xl shadow-xl p-1.5 z-50 animate-fade-in space-y-1">
          <div className="px-2.5 py-1.5 text-[11px] font-semibold text-[#7A7268] border-b border-[#EADBCE]/60 flex items-center justify-between">
            <span>选择语言 / Language</span>
            <Globe className="w-3.5 h-3.5 text-[#C85A32]" />
          </div>

          <div className="space-y-0.5 pt-1">
            {languages.map((item) => {
              const isSelected = item.code === language;

              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    setLanguage(item.code);
                    setIsOpen(false);
                  }}
                  className={`w-full px-2.5 py-2 rounded-lg text-left transition-all flex items-center justify-between gap-2 text-xs ${
                    isSelected
                      ? 'bg-[#FAF3EC] text-[#C85A32] font-bold border border-[#C85A32]/30'
                      : 'text-[#2C2723] hover:bg-[#FAF7F2]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base">{item.flag}</span>
                    <div className="min-w-0">
                      <div className="truncate font-medium">{item.nativeName}</div>
                      <div className="text-[10px] text-[#7A7268] truncate">{item.name}</div>
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
