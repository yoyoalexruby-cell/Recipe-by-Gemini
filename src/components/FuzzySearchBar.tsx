import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Sparkles, ArrowRight, Tag, BookOpen } from 'lucide-react';
import { Recipe } from '../types/recipe';
import { getSearchSuggestions } from '../utils/fuzzySearch';

interface FuzzySearchBarProps {
  value: string;
  onChange: (val: string) => void;
  recipes: Recipe[];
  onSelectRecipe?: (recipe: Recipe) => void;
  placeholder?: string;
  className?: string;
}

export const FuzzySearchBar: React.FC<FuzzySearchBarProps> = ({
  value,
  onChange,
  recipes,
  onSelectRecipe,
  placeholder = '搜索菜名、食材 (支持模糊与近义词联想，如：肉、虾、抹茶、蛋)...',
  className = ''
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Suggestions computed from fuzzy engine
  const suggestions = getSearchSuggestions(value, recipes);

  // Click outside to close suggestion dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasSuggestions = isFocused && value.trim().length > 0 && 
    (suggestions.synonyms.length > 0 || suggestions.matchedDishes.length > 0);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="w-4 h-4 text-[#9A9085] absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onFocus={() => setIsFocused(true)}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-9 pr-8 py-2 text-xs bg-[#FAF7F2] border border-[#EADBCE] rounded-lg focus:outline-hidden focus:border-[#C85A32] focus:bg-white transition-colors text-[#2C2723]"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#9A9085] hover:text-[#2C2723] p-0.5 rounded"
            title="清空搜索"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Fuzzy & Synonym Associations Dropdown */}
      {hasSuggestions && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#EADBCE] rounded-xl shadow-xl p-3 z-40 animate-fade-in space-y-3">
          
          {/* 1. Synonym & Semantic Association Tags */}
          {suggestions.synonyms.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#7A7268] mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>相近词与相关食材联想：</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.synonyms.map((syn) => (
                  <button
                    key={syn}
                    type="button"
                    onClick={() => {
                      onChange(syn);
                      setIsFocused(false);
                    }}
                    className="px-2.5 py-1 text-xs bg-[#FAF7F2] hover:bg-[#FAF3EC] border border-[#EADBCE] hover:border-[#C85A32] text-[#2C2723] rounded-md transition-colors flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3 text-[#C85A32]" />
                    <span>{syn}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. Direct Matched Dish Shortcuts */}
          {suggestions.matchedDishes.length > 0 && (
            <div className="pt-2 border-t border-[#F0E6DC]">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#7A7268] mb-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#5F7A4D]" />
                <span>模糊智能匹配菜谱：</span>
              </div>
              <div className="space-y-1">
                {suggestions.matchedDishes.map((dish) => {
                  const fullRecipe = recipes.find(r => r.id === dish.id);
                  return (
                    <button
                      key={dish.id}
                      type="button"
                      onClick={() => {
                        if (fullRecipe && onSelectRecipe) {
                          onSelectRecipe(fullRecipe);
                          setIsFocused(false);
                        } else {
                          onChange(dish.title);
                          setIsFocused(false);
                        }
                      }}
                      className="w-full px-2.5 py-1.5 text-left rounded-lg hover:bg-[#FAF7F2] transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-bold text-[#2C2723] group-hover:text-[#C85A32] truncate">
                          {dish.title}
                        </span>
                        <span className="text-[10px] text-[#7A7268] shrink-0">
                          {dish.subCategory || dish.category}
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#A8A29E] group-hover:text-[#C85A32] group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-1.5 border-t border-[#F0E6DC] text-[10px] text-[#A8A29E] flex items-center justify-between">
            <span>✨ 已启用美食近义词库与模糊语义容错检索</span>
            <span>按 ESC 或点击空白处收起</span>
          </div>
        </div>
      )}
    </div>
  );
};
