import React, { useState } from 'react';
import { Recipe, PRESET_STICKERS } from '../types/recipe';
import { FoodArtFallback } from './IllustrationPresets';
import { HeartHandshake, Star, Share2, ArrowRight, MessageSquare, AlertCircle, Quote } from 'lucide-react';

interface CookingNotesViewProps {
  recipes: Recipe[];
  onOpenRecipe: (recipe: Recipe) => void;
  onShareRecipe: (recipe: Recipe) => void;
}

export const CookingNotesView: React.FC<CookingNotesViewProps> = ({
  recipes,
  onOpenRecipe,
  onShareRecipe
}) => {
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Filter recipes having reviews
  const reviewedRecipes = recipes.filter((r) => r.review && (r.review.tastingNotes || r.review.pitfallsAndLessons || r.review.stickers?.length > 0));

  const filtered = selectedTag === 'all'
    ? reviewedRecipes
    : reviewedRecipes.filter((r) => r.review?.stickers?.includes(selectedTag));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24">
      {/* Header */}
      <div className="pb-4 mb-6 border-b border-[#EADBCE]">
        <h1 className="text-2xl sm:text-3xl font-bold font-journal-title text-[#2C2723] flex items-center gap-2">
          <HeartHandshake className="w-6 h-6 text-[#C85A32]" />
          <span>烹饪心得与手帐复盘墙</span>
        </h1>
        <p className="text-xs text-[#7A7268] mt-1">
          记录每次下厨的真实风味感触、避坑教训、食客真实评价与专属手帐印章。
        </p>
      </div>

      {/* Filter by sticker seal */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 text-xs no-scrollbar">
        <button
          onClick={() => setSelectedTag('all')}
          className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors border ${
            selectedTag === 'all'
              ? 'bg-[#C85A32] text-white border-[#C85A32]'
              : 'bg-white text-[#5A5248] border-[#EADBCE] hover:border-[#C85A32]'
          }`}
        >
          全部心得 ({reviewedRecipes.length})
        </button>
        {PRESET_STICKERS.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors border ${
              selectedTag === tag
                ? 'bg-[#C85A32] text-white border-[#C85A32]'
                : 'bg-white text-[#5A5248] border-[#EADBCE] hover:border-[#C85A32]'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Scrapbook Review Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((recipe) => (
          <div
            key={recipe.id}
            className="bg-white border border-[#EADBCE] rounded-xl p-5 sm:p-6 paper-shadow flex flex-col justify-between relative bg-notebook-dots"
          >
            {/* Top Row: Date & Rating */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <span className="text-[11px] font-mono text-[#9A9085] block">
                  {recipe.review?.cookDate || recipe.createdAt} · {recipe.category}
                </span>
                <h2 
                  onClick={() => onOpenRecipe(recipe)}
                  className="text-lg font-bold font-journal-title text-[#2C2723] hover:text-[#C85A32] transition-colors cursor-pointer"
                >
                  {recipe.title}
                </h2>
              </div>

              <div className="flex items-center gap-1 text-[#C08A3E] bg-[#FAF7F2] px-2 py-1 rounded border border-[#EADBCE] shrink-0">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="font-mono font-bold text-xs text-[#2C2723]">
                  {recipe.review?.ratings?.taste || 5}.0
                </span>
              </div>
            </div>

            {/* Photo & Notes snippet */}
            <div className="flex gap-4 my-3">
              <div 
                onClick={() => onOpenRecipe(recipe)}
                className="w-24 h-24 rounded-lg overflow-hidden bg-[#FAF7F2] border border-[#EADBCE] shrink-0 cursor-pointer shadow-xs group"
              >
                {recipe.coverImage ? (
                  <img src={recipe.coverImage} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <FoodArtFallback type={recipe.title} className="w-full h-full" />
                )}
              </div>

              <div className="flex-1 space-y-2 text-xs">
                {recipe.review?.tastingNotes && (
                  <p className="text-[#3A332C] leading-relaxed line-clamp-3 italic">
                    “{recipe.review.tastingNotes}”
                  </p>
                )}

                {recipe.review?.pitfallsAndLessons && (
                  <div className="text-[11px] text-[#8C5D1E] flex items-start gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">复盘：{recipe.review.pitfallsAndLessons}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Diner Feedback Quote */}
            {recipe.review?.dinerFeedback && (
              <div className="my-2 p-2.5 bg-[#FAF7F2] rounded-lg border border-[#EADBCE]/70 text-xs text-[#5A5248] flex items-start gap-2">
                <Quote className="w-3.5 h-3.5 text-[#C85A32] shrink-0 mt-0.5" />
                <span className="italic">{recipe.review.dinerFeedback}</span>
              </div>
            )}

            {/* Sticker Seals & Action buttons */}
            <div className="pt-3 mt-3 border-t border-[#F0E6DC] flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                {recipe.review?.stickers?.slice(0, 2).map((stk, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] bg-[#FAF7F2] text-[#7A7268] border border-[#EADBCE] px-2 py-0.5 rounded-full"
                  >
                    {stk}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onShareRecipe(recipe)}
                  className="p-1.5 text-[#9A9085] hover:text-[#C85A32] rounded transition-colors"
                  title="生成手帐海报"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onOpenRecipe(recipe)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#C85A32] hover:text-[#B34C26] transition-colors"
                >
                  <span>查看完整手帐</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-[#9A9085] bg-white rounded-xl border border-dashed border-[#EADBCE]">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-[#C85A32]/40" />
            <p className="text-sm">暂无包含该贴纸的心得手记</p>
          </div>
        )}
      </div>
    </div>
  );
};
