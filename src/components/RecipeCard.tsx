import React from 'react';
import { Recipe } from '../types/recipe';
import { FoodArtFallback } from './IllustrationPresets';
import { Clock, Users, Star, Heart, Share2, Flame } from 'lucide-react';
import { estimateRecipeCalories } from '../utils/nutritionCalculator';

interface RecipeCardProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
  onShare: (recipe: Recipe) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onSelect,
  onShare,
  onToggleFavorite
}) => {
  // Determine washi tape color accent based on category
  const getTapeStyle = () => {
    switch (recipe.category) {
      case '烘焙甜点':
        return 'bg-[#7A9A65]/70 text-[#20301A]'; // Matcha green
      case '西式轻餐':
        return 'bg-[#D4A373]/70 text-[#54361C]'; // Warm caramel
      case '暖胃汤羹':
        return 'bg-[#6D8A96]/70 text-[#1E323D]'; // Misty blue
      case '健康轻食':
        return 'bg-[#8FA87B]/70 text-[#28381D]'; // Sage
      default:
        return 'bg-[#C85A32]/60 text-[#3D1408]'; // Terracotta
    }
  };

  const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;
  const perServingCalories = recipe.estimatedCalories !== undefined
    ? Math.round(recipe.estimatedCalories / (recipe.baseServings || 2))
    : estimateRecipeCalories(recipe.ingredients || [], recipe.baseServings || 2).perServingCalories;

  return (
    <div 
      onClick={() => onSelect(recipe)}
      className="group relative bg-white border border-[#EADBCE] rounded-xl overflow-hidden paper-shadow hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col"
    >
      {/* Decorative Washi Tape strip across top */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className={`washi-tape px-4 py-0.5 text-[11px] font-mono tracking-wider uppercase rounded-xs ${getTapeStyle()}`}>
          {recipe.cuisine || recipe.category}
        </div>
      </div>

      {/* Visual Cover Header */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FAF7F2]">
        {recipe.coverImage ? (
          <img 
            src={recipe.coverImage} 
            alt={recipe.title} 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
          />
        ) : (
          <FoodArtFallback type={recipe.title} className="w-full h-full group-hover:scale-102 transition-transform duration-500" />
        )}

        {/* Favorite & Weather floating badges */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <button
            onClick={(e) => onToggleFavorite(recipe.id, e)}
            className={`p-1.5 rounded-full backdrop-blur-md transition-colors ${
              recipe.isFavorite 
                ? 'bg-rose-50 text-rose-500 hover:bg-rose-100' 
                : 'bg-black/30 text-white hover:bg-black/50'
            }`}
            title={recipe.isFavorite ? '已收藏' : '加入收藏'}
          >
            <Heart className={`w-4 h-4 ${recipe.isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {recipe.weatherStamp && (
          <div className="absolute bottom-2.5 left-3 text-[11px] text-white/90 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded">
            {recipe.weatherStamp}
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Unboxed Metadata (Zero-pill discipline) */}
          <div className="flex items-center gap-1.5 text-xs text-[#7A7268] mb-1.5 flex-wrap">
            <span className="font-medium text-[#2C2723]">{recipe.category}</span>
            {recipe.subCategory && (
              <>
                <span aria-hidden="true" className="text-[#C85A32]/50">/</span>
                <span className="text-[#C85A32] font-semibold">{recipe.subCategory}</span>
              </>
            )}
            <span aria-hidden="true" className="text-[#D1C3A5]">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span className="tabular-nums font-mono">{totalTime}</span>分钟
            </span>
            <span aria-hidden="true" className="text-[#D1C3A5]">·</span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span className="tabular-nums font-mono">{recipe.baseServings}</span>人份
            </span>
            {perServingCalories > 0 && (
              <>
                <span aria-hidden="true" className="text-[#D1C3A5]">·</span>
                <span className="flex items-center gap-1 text-[#C85A32]" title="单人份预估热量">
                  <Flame className="w-3.5 h-3.5" />
                  <span className="tabular-nums font-mono font-medium">{perServingCalories}</span>
                  <span className="text-[10px]">kcal</span>
                </span>
              </>
            )}
          </div>

          {/* Dish Title */}
          <h3 className="text-lg font-bold text-[#2C2723] font-journal-title leading-snug group-hover:text-[#C85A32] transition-colors mb-2">
            {recipe.title}
          </h3>

          {/* Dish Subtitle / Memoir */}
          <p className="text-xs text-[#7A7268] line-clamp-2 leading-relaxed">
            {recipe.subtitle || '在烟火与香气中，记录下这一味独属于生活的温度。'}
          </p>
        </div>

        {/* Footer: Rating & Quick Share button */}
        <div className="pt-3.5 mt-3 border-t border-[#F0E6DC] flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-[#C08A3E]">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="font-semibold text-xs text-[#2C2723]">
              {recipe.review?.ratings?.taste || 5}.0
            </span>
            <span className="text-[11px] text-[#9A9085]">
              ({recipe.ingredients?.length || 0}样食材)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {recipe.review?.stickers?.[0] && (
              <span className="text-[11px] text-[#7A7268] bg-[#FAF7F2] border border-[#EADBCE] px-1.5 py-0.5 rounded">
                {recipe.review.stickers[0]}
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShare(recipe);
              }}
              className="p-1 rounded text-[#9A9085] hover:text-[#C85A32] hover:bg-[#FAF7F2] transition-colors"
              title="生成分享手帐卡"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
