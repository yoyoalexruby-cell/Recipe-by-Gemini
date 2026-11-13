import React, { useState } from 'react';
import { Recipe } from '../types/recipe';
import { CookingRecord } from '../types/cookingLog';
import { X, Calendar, Star, Sparkles, ChefHat, Check } from 'lucide-react';
import { PRESET_WEATHER } from '../types/recipe';
import { formatLocalDate } from '../utils/dateUtils';

interface MarkCookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipes: Recipe[];
  initialDate?: string;
  initialRecipe?: Recipe | null;
  onSaveRecord: (data: {
    recipe: Recipe;
    date: string;
    notes: string;
    rating: number;
    dinerFeedback?: string;
    weatherStamp?: string;
  }) => void;
}

export const MarkCookingModal: React.FC<MarkCookingModalProps> = ({
  isOpen,
  onClose,
  recipes,
  initialDate,
  initialRecipe,
  onSaveRecord
}) => {
  if (!isOpen) return null;

  const todayStr = initialDate || formatLocalDate();
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(
    initialRecipe?.id || (recipes.length > 0 ? recipes[0].id : '')
  );
  const [cookDate, setCookDate] = useState<string>(todayStr);
  const [notes, setNotes] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [dinerFeedback, setDinerFeedback] = useState<string>('');
  const [weatherStamp, setWeatherStamp] = useState<string>('☀️ 晴朗微风');
  const [recipeSearch, setRecipeSearch] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  const currentSelectedRecipe = recipes.find(r => r.id === selectedRecipeId) || recipes[0];

  const filteredRecipes = recipes.filter(r => 
    r.title.toLowerCase().includes(recipeSearch.toLowerCase()) ||
    r.category.toLowerCase().includes(recipeSearch.toLowerCase()) ||
    (r.subCategory && r.subCategory.toLowerCase().includes(recipeSearch.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSelectedRecipe) {
      setFormError('请先选择一道要标记的菜谱！');
      return;
    }
    if (!cookDate) {
      setFormError('请选择烹饪日期！');
      return;
    }
    setFormError(null);

    onSaveRecord({
      recipe: currentSelectedRecipe,
      date: cookDate,
      notes: notes.trim() || currentSelectedRecipe.review?.tastingNotes || '今天按手帐用心做了一道佳肴，风味甚佳。',
      rating,
      dinerFeedback: dinerFeedback.trim(),
      weatherStamp
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="打卡烹饪记录"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-fade-in"
    >
      <div 
        className="w-full max-w-lg bg-[#FAF7F2] border border-[#EADBCE] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {formError && (
          <div role="alert" className="px-4 py-2 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs flex items-center justify-between">
            <span>⚠️ {formError}</span>
            <button type="button" onClick={() => setFormError(null)} className="font-bold">✕</button>
          </div>
        )}
        {/* Modal Header */}
        <div className="px-6 py-4 bg-white border-b border-[#EADBCE] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FAF3EC] border border-[#EADBCE] flex items-center justify-center text-[#C85A32]">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#2C2723] font-serif">
                标记烹饪打卡 · 记录下厨日
              </h2>
              <p className="text-xs text-[#7A7268]">
                记录在特定的日子烹饪的心仪美味，沉淀岁月餐桌回忆
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-[#7A7268] hover:text-[#2C2723] hover:bg-[#FAF7F2] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* 1. Date Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#2C2723] mb-1.5">
              烹饪日期 <span className="text-[#C85A32]">*</span>
            </label>
            <input
              type="date"
              value={cookDate}
              onChange={(e) => setCookDate(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#EADBCE] rounded-lg focus:outline-hidden focus:border-[#C85A32] text-[#2C2723]"
              required
            />
          </div>

          {/* 2. Recipe Picker */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#2C2723]">
                选择烹饪的菜谱 <span className="text-[#C85A32]">*</span>
              </label>
              <span className="text-[11px] text-[#7A7268]">
                共 {recipes.length} 道私房食谱
              </span>
            </div>

            {/* Quick search if many recipes */}
            {recipes.length > 5 && (
              <input
                type="text"
                placeholder="快速搜索菜名或分类..."
                value={recipeSearch}
                onChange={(e) => setRecipeSearch(e.target.value)}
                className="w-full mb-2 px-3 py-1.5 text-xs bg-white border border-[#EADBCE] rounded-md focus:outline-hidden focus:border-[#C85A32]"
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-[#EADBCE] rounded-lg bg-white">
              {filteredRecipes.length === 0 ? (
                <div className="col-span-2 py-4 text-center text-xs text-[#7A7268]">
                  未找到匹配的菜谱
                </div>
              ) : (
                filteredRecipes.map((r) => {
                  const isSelected = r.id === selectedRecipeId;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRecipeId(r.id)}
                      className={`text-left p-2.5 rounded-lg border transition-all flex items-start gap-2 ${
                        isSelected 
                          ? 'border-[#C85A32] bg-[#FAF3EC] text-[#2C2723]' 
                          : 'border-[#EADBCE]/80 hover:border-[#C85A32]/60 bg-[#FAF7F2]/40 text-[#5A5248]'
                      }`}
                    >
                      <div className="w-4 h-4 mt-0.5 rounded-full border flex items-center justify-center shrink-0 border-[#C85A32]">
                        {isSelected && <div className="w-2 h-2 rounded-full bg-[#C85A32]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold truncate">
                          {r.title}
                        </div>
                        <div className="text-[10px] text-[#7A7268] flex items-center gap-1.5 mt-0.5">
                          <span>{r.category}</span>
                          {r.subCategory && (
                            <>
                              <span>·</span>
                              <span>{r.subCategory}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* 3. Rating & Weather */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#2C2723] mb-1.5">
                当天发挥评分 ({rating} 星)
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform focus:outline-hidden"
                  >
                    <Star 
                      className={`w-6 h-6 ${
                        star <= rating 
                          ? 'fill-[#D97706] text-[#D97706]' 
                          : 'text-[#E5DACE]'
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2C2723] mb-1.5">
                天气印章
              </label>
              <select
                value={weatherStamp}
                onChange={(e) => setWeatherStamp(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#EADBCE] rounded-lg focus:outline-hidden focus:border-[#C85A32] text-[#2C2723]"
              >
                {PRESET_WEATHER.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#2C2723] mb-1.5">
              当天烹饪心得 / 风味复盘（可选）
            </label>
            <textarea
              rows={3}
              placeholder="例：今天火候掌握得格外好，收汁晶莹剔透；家人直夸好吃，下次可以少放一点糖。"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-[#EADBCE] rounded-lg focus:outline-hidden focus:border-[#C85A32] text-[#2C2723] resize-none"
            />
          </div>

          {/* 5. Diner Feedback */}
          <div>
            <label className="block text-xs font-semibold text-[#2C2723] mb-1.5">
              食客评价（可选）
            </label>
            <input
              type="text"
              placeholder="例：全家人一致好评，连汤汁都没剩下！"
              value={dinerFeedback}
              onChange={(e) => setDinerFeedback(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-[#EADBCE] rounded-lg focus:outline-hidden focus:border-[#C85A32] text-[#2C2723]"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#EADBCE]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#7A7268] hover:text-[#2C2723] hover:bg-[#EADBCE]/30 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-[#C85A32] hover:bg-[#B34C26] active:scale-[0.98] rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>确认标记下厨</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
