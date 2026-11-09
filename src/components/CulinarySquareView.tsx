import React, { useState } from 'react';
import { Recipe } from '../types/recipe';
import { UserProfile } from '../types/auth';
import { FoodArtFallback } from './IllustrationPresets';
import { 
  CATEGORY_TAXONOMY, 
  ALL_CATEGORIES_LIST, 
  getSubcategoriesForCategory,
  getAllSubcategories
} from '../types/categories';
import { 
  Sparkles, Heart, Share2, Search, Clock, Users, 
  ChefHat, GitFork, MessageSquare, Check, ArrowRight, Layers, Tag
} from 'lucide-react';

import { SquareReviewModal } from './SquareReviewModal';

interface CulinarySquareViewProps {
  recipes: Recipe[];
  currentUser: UserProfile | null;
  onOpenRecipe: (recipe: Recipe) => void;
  onCloneRecipe: (recipe: Recipe) => void;
  onToggleLike: (recipeId: string) => void;
  onShareRecipe: (recipe: Recipe) => void;
  onRequireLogin: () => void;
  onAddComment: (recipeId: string, content: string) => void;
}

export const CulinarySquareView: React.FC<CulinarySquareViewProps> = ({
  recipes,
  currentUser,
  onOpenRecipe,
  onCloneRecipe,
  onToggleLike,
  onShareRecipe,
  onRequireLogin,
  onAddComment
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [clonedSuccessId, setClonedSuccessId] = useState<string | null>(null);
  const [reviewModalRecipe, setReviewModalRecipe] = useState<Recipe | null>(null);

  const categories = [
    { id: 'all', label: '全部美食', icon: '🍽️' },
    ...ALL_CATEGORIES_LIST.map((c) => ({
      id: c,
      label: c,
      icon: CATEGORY_TAXONOMY[c].icon
    }))
  ];

  // Active subcategories list
  const activeSubcategories = selectedCategory !== 'all' 
    ? getSubcategoriesForCategory(selectedCategory as any) 
    : [];

  // Filter recipes
  const filtered = recipes.filter((r) => {
    if (selectedCategory !== 'all' && r.category !== selectedCategory) return false;
    if (selectedSubCategory !== 'all' && r.subCategory !== selectedSubCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const inTitle = r.title.toLowerCase().includes(q);
      const inAuthor = r.authorName?.toLowerCase().includes(q);
      const inCuisine = r.cuisine?.toLowerCase().includes(q);
      const inCategory = r.category?.toLowerCase().includes(q);
      const inSubCategory = r.subCategory?.toLowerCase().includes(q);
      const inIng = r.ingredients.some((i) => i.name.toLowerCase().includes(q));
      if (!inTitle && !inAuthor && !inCuisine && !inCategory && !inSubCategory && !inIng) return false;
    }
    return true;
  });

  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    setSelectedSubCategory('all');
  };

  const handleCloneClick = (e: React.MouseEvent, recipe: Recipe) => {
    e.stopPropagation();
    if (!currentUser) {
      onRequireLogin();
      return;
    }
    onCloneRecipe(recipe);
    setClonedSuccessId(recipe.id);
    setTimeout(() => setClonedSuccessId(null), 2500);
  };

  const handleLikeClick = (e: React.MouseEvent, recipeId: string) => {
    e.stopPropagation();
    onToggleLike(recipeId);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6">
      
      {/* Masthead Banner */}
      <div className="bg-white border border-[#EADBCE] rounded-2xl p-6 sm:p-8 paper-shadow bg-notebook-dots relative overflow-hidden">
        <div className="absolute top-0 right-10 transform -translate-y-1/2 pointer-events-none">
          <div className="washi-tape px-6 py-1 bg-[#C85A32] text-amber-50 text-xs font-mono tracking-wider uppercase">
            PUBLIC CULINARY SQUARE
          </div>
        </div>

        <div className="max-w-2xl">
          <span className="text-xs font-serif tracking-widest text-[#C85A32] uppercase mb-1 block">
            厨友灵感广场 · 烟火人间
          </span>
          <h1 className="text-2xl sm:text-4xl font-bold font-journal-title text-[#2C2723] leading-tight mb-3">
            食味广场：看大家今天都在做什么好吃的
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7268] leading-relaxed font-serif">
            浏览来自全国各地手帐作者公开分享的私房菜谱与烘焙手作。看到心动的食谱，可以<strong>一键收录到自己的手帐本</strong>中自由改版复刻！
          </p>
        </div>

        {/* Search & Category toolbar */}
        <div className="mt-6 pt-5 border-t border-[#F0E6DC] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#9A9085] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索广场公开菜谱、作者、食材..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAF7F2] border border-[#EADBCE] rounded-lg focus:outline-hidden focus:border-[#C85A32]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-[#2C2723] text-white shadow-xs'
                    : 'text-[#7A7268] hover:text-[#2C2723] hover:bg-[#FAF7F2]'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Subcategories Strip */}
        {selectedCategory !== 'all' ? (
          <div className="mt-3.5 pt-3 border-t border-[#F0E6DC]/80 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
            <span className="text-[11px] font-semibold text-[#7A7268] shrink-0 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>{selectedCategory}细分：</span>
            </span>
            <button
              onClick={() => setSelectedSubCategory('all')}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium transition-colors ${
                selectedSubCategory === 'all'
                  ? 'bg-[#C85A32] text-white'
                  : 'bg-[#FAF7F2] text-[#7A7268] hover:text-[#2C2723] border border-[#EADBCE]'
              }`}
            >
              全部细分
            </button>
            {activeSubcategories.map((sub) => {
              const count = recipes.filter(
                (r) => r.category === selectedCategory && r.subCategory === sub.id
              ).length;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubCategory(sub.id)}
                  title={sub.desc}
                  className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium transition-colors flex items-center gap-1 ${
                    selectedSubCategory === sub.id
                      ? 'bg-[#C85A32] text-white font-bold shadow-2xs'
                      : 'bg-[#FAF7F2] text-[#7A7268] hover:text-[#2C2723] border border-[#EADBCE]'
                  }`}
                >
                  <span>{sub.icon}</span>
                  <span>{sub.label}</span>
                  {count > 0 && (
                    <span className={`text-[10px] ml-0.5 px-1 py-0.2 rounded-full ${
                      selectedSubCategory === sub.id ? 'bg-white/25 text-white' : 'bg-stone-200/60 text-[#7A7268]'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-3.5 pt-3 border-t border-[#F0E6DC]/80 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
            <span className="text-[11px] font-semibold text-[#7A7268] shrink-0 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>甜点细分直达：</span>
            </span>
            {CATEGORY_TAXONOMY['烘焙甜点'].subcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => {
                  setSelectedCategory('烘焙甜点');
                  setSelectedSubCategory(sub.id);
                }}
                className="px-2.5 py-1 rounded-md whitespace-nowrap font-medium bg-[#FAF7F2] hover:bg-white text-[#7A7268] hover:text-[#C85A32] border border-[#EADBCE] transition-colors flex items-center gap-1 shrink-0"
              >
                <span>{sub.icon}</span>
                <span>{sub.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid of Public Recipe Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((recipe) => {
          const isLikedByMe = currentUser && recipe.likedBy?.includes(currentUser.uid);
          const isCloned = clonedSuccessId === recipe.id;

          return (
            <div
              key={recipe.id}
              onClick={() => onOpenRecipe(recipe)}
              className="group bg-white border border-[#EADBCE] rounded-xl overflow-hidden paper-shadow hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Author Card Top Strip */}
                <div className="p-3 bg-[#FAF7F2] border-b border-[#EADBCE]/80 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full overflow-hidden border border-[#EADBCE] shrink-0 bg-white">
                      {recipe.authorAvatar ? (
                        <img src={recipe.authorAvatar} alt={recipe.authorName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[#C85A32] text-white flex items-center justify-center text-[10px] font-bold">
                          {recipe.authorName?.[0] || '厨'}
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-[#2C2723] truncate">
                      {recipe.authorName || '热心厨友'}
                    </span>
                  </div>

                  <span className="text-[11px] text-[#9A9085] shrink-0">
                    {recipe.review?.cookDate || recipe.createdAt}
                  </span>
                </div>

                {/* Recipe Cover Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#FAF7F2]">
                  {recipe.coverImage ? (
                    <img 
                      src={recipe.coverImage} 
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" 
                    />
                  ) : (
                    <FoodArtFallback type={recipe.title} className="w-full h-full" />
                  )}

                  {recipe.originalSource && (
                    <div className="absolute bottom-2 left-2 text-[10px] text-white bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1">
                      <GitFork className="w-3 h-3" />
                      <span>收录改版自 @{recipe.originalSource.authorName}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5">
                  <div className="flex items-center gap-1.5 text-xs text-[#7A7268] mb-1.5 flex-wrap">
                    <span className="font-medium text-[#2C2723]">{recipe.category}</span>
                    {recipe.subCategory && (
                      <>
                        <span aria-hidden="true" className="text-[#C85A32]/60">/</span>
                        <span className="text-[#C85A32] font-semibold">{recipe.subCategory}</span>
                      </>
                    )}
                    <span aria-hidden="true">·</span>
                    <span>{recipe.cuisine}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums font-mono">{recipe.prepTimeMinutes + recipe.cookTimeMinutes}分钟</span>
                  </div>

                  <h3 className="text-base font-bold text-[#2C2723] font-journal-title leading-snug group-hover:text-[#C85A32] transition-colors mb-2">
                    {recipe.title}
                  </h3>

                  <p className="text-xs text-[#7A7268] line-clamp-2 leading-relaxed">
                    {recipe.subtitle || recipe.review?.tastingNotes || '认真做菜，用手帐记录餐桌的四季温度。'}
                  </p>
                </div>
              </div>

              {/* Bottom Social Bar */}
              <div className="p-3 sm:px-5 sm:py-3 border-t border-[#F0E6DC] bg-[#FAF7F2]/50 flex items-center justify-between">
                
                <div className="flex items-center gap-1.5">
                  {/* Likes / Kudos */}
                  <button
                    onClick={(e) => handleLikeClick(e, recipe.id)}
                    className={`flex items-center gap-1 text-xs font-semibold py-1 px-2 rounded-md transition-colors ${
                      isLikedByMe 
                        ? 'text-rose-600 bg-rose-50' 
                        : 'text-[#7A7268] hover:text-rose-600 hover:bg-white'
                    }`}
                    title="暖胃点赞"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLikedByMe ? 'fill-current' : ''}`} />
                    <span className="font-mono tabular-nums">{recipe.likesCount || 0}</span>
                  </button>

                  {/* Comments / Reviews button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setReviewModalRecipe(recipe);
                    }}
                    className="flex items-center gap-1 text-xs font-semibold py-1 px-2 text-[#7A7268] hover:text-[#C85A32] hover:bg-white rounded-md transition-colors"
                    title="查看与发表食客点评"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span className="font-mono tabular-nums">{recipe.comments?.length || 0}</span>
                  </button>
                </div>

                {/* Actions: Fork/Clone to My Journal + Share */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onShareRecipe(recipe);
                    }}
                    className="p-1.5 text-[#9A9085] hover:text-[#C85A32] rounded transition-colors"
                    title="分享手帐卡"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => handleCloneClick(e, recipe)}
                    disabled={isCloned}
                    className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${
                      isCloned
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#C85A32] hover:bg-[#B34C26] text-white shadow-2xs'
                    }`}
                    title="将本篇菜谱克隆存入我的专属手帐"
                  >
                    {isCloned ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>已收录！</span>
                      </>
                    ) : (
                      <>
                        <GitFork className="w-3.5 h-3.5" />
                        <span>收进手帐</span>
                      </>
                    )}
                  </button>
                </div>

              </div>

            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-[#EADBCE]">
            <Sparkles className="w-8 h-8 text-[#C85A32]/40 mx-auto mb-2" />
            <p className="text-xs text-[#7A7268]">暂无匹配的广场菜谱，快去记录并将你的拿手好菜公开分享吧！</p>
          </div>
        )}
      </div>

      {/* Community Recipe Review & Share Modal */}
      <SquareReviewModal
        isOpen={Boolean(reviewModalRecipe)}
        onClose={() => setReviewModalRecipe(null)}
        recipe={reviewModalRecipe}
        currentUser={currentUser}
        onAddComment={(recipeId, content) => {
          onAddComment(recipeId, content);
          if (reviewModalRecipe && reviewModalRecipe.id === recipeId) {
            setReviewModalRecipe({
              ...reviewModalRecipe,
              comments: [
                ...(reviewModalRecipe.comments || []),
                {
                  id: 'cm_' + Date.now(),
                  authorName: currentUser?.displayName || '我',
                  authorAvatar: currentUser?.avatarUrl,
                  content,
                  createdAt: new Date().toISOString().slice(0, 10)
                }
              ]
            });
          }
        }}
        onCloneRecipe={(rec) => {
          onCloneRecipe(rec);
          setClonedSuccessId(rec.id);
          setTimeout(() => setClonedSuccessId(null), 2500);
        }}
        onShareRecipe={onShareRecipe}
        onRequireLogin={onRequireLogin}
        onToggleLike={(id) => {
          onToggleLike(id);
          if (reviewModalRecipe && reviewModalRecipe.id === id) {
            const wasLiked = currentUser && reviewModalRecipe.likedBy?.includes(currentUser.uid);
            setReviewModalRecipe({
              ...reviewModalRecipe,
              likesCount: (reviewModalRecipe.likesCount || 0) + (wasLiked ? -1 : 1),
              likedBy: wasLiked 
                ? (reviewModalRecipe.likedBy || []).filter(u => u !== currentUser?.uid)
                : [...(reviewModalRecipe.likedBy || []), currentUser?.uid || '']
            });
          }
        }}
      />

    </div>
  );
};
