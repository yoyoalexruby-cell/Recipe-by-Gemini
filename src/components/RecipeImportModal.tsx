import React, { useState, useMemo, useEffect } from 'react';
import { Recipe, RecipeCategory } from '../types/recipe';
import { UserProfile } from '../types/auth';
import { FoodArtFallback } from './IllustrationPresets';
import { 
  X, Search, Sparkles, ChefHat, Clock, Users, Star, 
  ArrowRight, Check, Edit3, Eye, EyeOff, BookOpen, Heart, 
  Bookmark, GitFork, Utensils, Flame, ChevronRight, Layers, Tag
} from 'lucide-react';
import { 
  getSquareFavoritesAndClones, 
  getBookmarkedSquareRecipeIds, 
  toggleBookmarkSquareRecipe 
} from '../utils/multiUserStorage';
import { useI18n } from '../i18n/context';

export interface RecipeImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRecipes: Recipe[];
  publicRecipes: Recipe[];
  currentUser: UserProfile | null;
  onSelectRecipe: (recipe: Recipe) => void;
  onSelectAndEditRecipe: (recipe: Recipe) => void;
  currentActiveRecipeId?: string;
}

export type ImportTabMode = 'mine' | 'saved' | 'square';

export const RecipeImportModal: React.FC<RecipeImportModalProps> = ({
  isOpen,
  onClose,
  userRecipes,
  publicRecipes,
  currentUser,
  onSelectRecipe,
  onSelectAndEditRecipe,
  currentActiveRecipeId
}) => {
  const { t, language, getCategoryLabel, getSubcategoryLabel, formatMinutes, formatServings } = useI18n();

  const [activeTab, setActiveTab] = useState<ImportTabMode>('mine');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewRecipeId, setPreviewRecipeId] = useState<string | null>(null);
  const [bookmarkRevision, setBookmarkRevision] = useState(0);

  // Listen to bookmark updates
  useEffect(() => {
    const handleBookmarkUpdate = () => setBookmarkRevision((p) => p + 1);
    window.addEventListener('square-bookmarks-updated', handleBookmarkUpdate);
    return () => window.removeEventListener('square-bookmarks-updated', handleBookmarkUpdate);
  }, []);

  // Compute saved & cloned recipes from others
  const savedAndClonedRecipes = useMemo(() => {
    return getSquareFavoritesAndClones(currentUser);
  }, [currentUser, bookmarkRevision, publicRecipes, userRecipes]);

  // Bookmarked IDs
  const bookmarkedIds = useMemo(() => {
    return new Set(getBookmarkedSquareRecipeIds(currentUser));
  }, [currentUser, bookmarkRevision]);

  if (!isOpen) return null;

  // Filter recipes based on active tab, search, category
  const targetRecipeList = activeTab === 'mine' 
    ? userRecipes 
    : activeTab === 'saved' 
      ? savedAndClonedRecipes 
      : publicRecipes;

  const filteredRecipes = targetRecipeList.filter((r) => {
    // Category filter
    if (selectedCategory !== 'all' && r.category !== selectedCategory) {
      return false;
    }
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const inTitle = r.title.toLowerCase().includes(q);
      const inCuisine = r.cuisine?.toLowerCase().includes(q);
      const inAuthor = r.authorName?.toLowerCase().includes(q);
      const inCategory = r.category?.toLowerCase().includes(q);
      const inSubCategory = r.subCategory?.toLowerCase().includes(q);
      const inIngredients = r.ingredients.some((ing) => ing.name.toLowerCase().includes(q));
      if (!inTitle && !inCuisine && !inAuthor && !inCategory && !inSubCategory && !inIngredients) {
        return false;
      }
    }
    return true;
  });

  const handleToggleBookmark = (e: React.MouseEvent, recipeId: string) => {
    e.stopPropagation();
    toggleBookmarkSquareRecipe(recipeId, currentUser);
    setBookmarkRevision((p) => p + 1);
  };

  const categories = [
    { id: 'all', label: language === 'zh-CN' ? '全部' : 'All' },
    { id: '家常中餐', label: getCategoryLabel('家常中餐') },
    { id: '烘焙甜点', label: getCategoryLabel('烘焙甜点') },
    { id: '西式轻餐', label: getCategoryLabel('西式轻餐') },
    { id: '日韩和风', label: getCategoryLabel('日韩和风') },
    { id: '暖胃汤羹', label: getCategoryLabel('暖胃汤羹') },
    { id: '健康轻食', label: getCategoryLabel('健康轻食') }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-[#FAF7F2] border border-[#EADBCE] rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Washi Tape */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 transform -translate-y-1/2 pointer-events-none z-20">
          <div className="washi-tape px-6 py-1 bg-[#C85A32] text-amber-50 text-xs font-mono uppercase tracking-widest shadow-xs">
            WORKBENCH RECIPE IMPORTER
          </div>
        </div>

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-[#EADBCE] bg-white/80 backdrop-blur-xs relative">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#C85A32] bg-[#C85A32]/10 px-2 py-0.5 rounded-full font-bold">
                  {language === 'zh-CN' ? '下厨制作 · 菜谱导入器' : 'Cooking Workbench · Importer'}
                </span>
                <span className="text-xs text-[#7A7268]">
                  {language === 'zh-CN' ? '支持导入私房与广场菜谱并自由编辑' : 'Import & Edit Any Recipe'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-journal-title text-[#2C2723]">
                {language === 'zh-CN' ? '导入手帐进入下厨工作台' : 'Import Recipe into Workbench'}
              </h2>
              <p className="text-xs text-[#7A7268] font-serif leading-relaxed">
                {language === 'zh-CN' 
                  ? '挑选您自己的私房手帐，或从食味广场收藏的他人家常菜中导入。导入后可在工作台逐步打勾备料、听语音步骤，并自由进行定制修改！'
                  : 'Choose your own journal recipes or saved community dishes from others. Import directly to track steps, listen to audio guide, and edit freely!'}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-[#7A7268] hover:text-[#2C2723] hover:bg-[#FAF7F2] rounded-full transition-colors shrink-0"
              title={language === 'zh-CN' ? '关闭' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 3 Main Tabs */}
          <div className="flex items-center gap-2 mt-4 border-b border-[#F0E6DC] -mb-4 pb-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => {
                setActiveTab('mine');
                setSelectedCategory('all');
              }}
              className={`min-h-[40px] px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'mine'
                  ? 'bg-[#C85A32] text-white shadow-2xs'
                  : 'text-[#7A7268] hover:text-[#2C2723] hover:bg-[#FAF7F2]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{language === 'zh-CN' ? '我的私房手帐' : 'My Handbooks'}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === 'mine' ? 'bg-white/20 text-white' : 'bg-[#EADBCE]/60 text-[#5A5248]'
              }`}>
                {userRecipes.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('saved');
                setSelectedCategory('all');
              }}
              className={`min-h-[40px] px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'saved'
                  ? 'bg-[#C85A32] text-white shadow-2xs'
                  : 'text-[#7A7268] hover:text-[#2C2723] hover:bg-[#FAF7F2]'
              }`}
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>{language === 'zh-CN' ? '广场收藏与收录' : 'Saved Community Dishes'}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === 'saved' ? 'bg-white/20 text-white' : 'bg-[#EADBCE]/60 text-[#5A5248]'
              }`}>
                {savedAndClonedRecipes.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('square');
                setSelectedCategory('all');
              }}
              className={`min-h-[40px] px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'square'
                  ? 'bg-[#C85A32] text-white shadow-2xs'
                  : 'text-[#7A7268] hover:text-[#2C2723] hover:bg-[#FAF7F2]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'zh-CN' ? '食味广场精选' : 'Explore Food Square'}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === 'square' ? 'bg-white/20 text-white' : 'bg-[#EADBCE]/60 text-[#5A5248]'
              }`}>
                {publicRecipes.length}
              </span>
            </button>
          </div>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="p-4 bg-[#FAF7F2] border-b border-[#EADBCE] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#7A7268] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'mine'
                  ? (language === 'zh-CN' ? '搜索我的私房菜名、主要食材、菜系...' : 'Search my recipes, ingredients...')
                  : (language === 'zh-CN' ? '搜索广场菜谱、大厨作者、食材、风味...' : 'Search community recipes, chefs, ingredients...')
              }
              className="w-full pl-9 pr-8 py-2 bg-white text-xs border border-[#EADBCE] rounded-xl focus:outline-hidden focus:border-[#C85A32] text-[#2C2723] placeholder-[#A89F91]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#7A7268] hover:text-[#2C2723] p-1"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === c.id
                    ? 'bg-[#2C2723] text-white shadow-2xs font-semibold'
                    : 'bg-white text-[#7A7268] hover:text-[#2C2723] border border-[#EADBCE]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recipe Cards List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {filteredRecipes.length === 0 ? (
            <div className="text-center py-12 px-4 bg-white/70 rounded-2xl border border-dashed border-[#EADBCE] space-y-3">
              <ChefHat className="w-10 h-10 text-[#C85A32]/40 mx-auto" />
              <div className="space-y-1 max-w-sm mx-auto">
                <h4 className="text-sm font-bold text-[#2C2723]">
                  {activeTab === 'saved'
                    ? (language === 'zh-CN' ? '暂无收藏的广场手帐' : 'No Saved Community Dishes Yet')
                    : (language === 'zh-CN' ? '未找到符合条件的菜谱' : 'No Matching Recipes Found')}
                </h4>
                <p className="text-xs text-[#7A7268] leading-relaxed">
                  {activeTab === 'saved'
                    ? (language === 'zh-CN' 
                        ? '您在食味广场上点击“收藏”或“收录”的菜谱都会展示在这里，随时导入下厨工作台制作！'
                        : 'Dishes you bookmark or clone in the Food Square will appear here.')
                    : (language === 'zh-CN'
                        ? '尝试更换关键词或清除分类筛选。'
                        : 'Try searching with different keywords or clearing filters.')}
                </p>
              </div>

              {activeTab === 'saved' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('square')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#C85A32] text-white text-xs font-bold rounded-xl hover:bg-[#B34C26] transition-colors shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{language === 'zh-CN' ? '浏览食味广场精选' : 'Browse Food Square'}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRecipes.map((recipe) => {
                const isActive = recipe.id === currentActiveRecipeId;
                const isBookmarked = bookmarkedIds.has(recipe.id);
                const isPreviewOpen = previewRecipeId === recipe.id;
                const totalMinutes = (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);

                return (
                  <div
                    key={recipe.id}
                    className={`bg-white border rounded-2xl p-4 transition-all paper-shadow flex flex-col justify-between relative group ${
                      isActive 
                        ? 'border-[#C85A32] ring-2 ring-[#C85A32]/20 shadow-md bg-amber-50/20' 
                        : 'border-[#EADBCE] hover:border-[#C85A32]/50 hover:shadow-md'
                    }`}
                  >
                    {/* Active Ribbon */}
                    {isActive && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#C85A32] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs z-10">
                        <Check className="w-3 h-3" />
                        <span>{language === 'zh-CN' ? '当前工作台制作中' : 'Current Active'}</span>
                      </div>
                    )}

                    <div>
                      {/* Top Row: Thumbnail + Title & Tags */}
                      <div className="flex gap-3.5 items-start">
                        {/* Thumbnail */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-[#FAF7F2] shrink-0 border border-[#EADBCE] relative">
                          {recipe.coverImage ? (
                            <img
                              src={recipe.coverImage}
                              alt={recipe.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <FoodArtFallback type={recipe.title} className="w-full h-full" />
                          )}
                          <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-xs rounded text-[9px] font-mono text-white">
                            {formatMinutes(totalMinutes)}
                          </div>
                        </div>

                        {/* Title & Metadata */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FAF7F2] border border-[#EADBCE] text-[#7A7268]">
                              {getCategoryLabel(recipe.category)}
                            </span>
                            {recipe.subCategory && (
                              <span className="text-[10px] font-semibold text-[#C85A32]">
                                {getSubcategoryLabel(recipe.subCategory)}
                              </span>
                            )}
                            {recipe.cuisine && (
                              <span className="text-[10px] text-[#5A5248]">
                                · {recipe.cuisine}
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-bold font-journal-title text-[#2C2723] line-clamp-1 group-hover:text-[#C85A32] transition-colors">
                            {recipe.title}
                          </h3>

                          {recipe.subtitle && (
                            <p className="text-xs text-[#7A7268] font-serif line-clamp-1">
                              {recipe.subtitle}
                            </p>
                          )}

                          {/* Author & Source attribution */}
                          <div className="flex items-center gap-2 pt-0.5 text-xs text-[#7A7268] flex-wrap">
                            {recipe.originalSource ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-[#5F7A4D] font-semibold bg-[#5F7A4D]/10 px-2 py-0.5 rounded-full">
                                <GitFork className="w-3 h-3" />
                                <span>{language === 'zh-CN' ? `来自 @${recipe.originalSource.authorName}` : `Forked from @${recipe.originalSource.authorName}`}</span>
                              </span>
                            ) : recipe.authorName && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-[#7A7268]">
                                {recipe.authorAvatar && (
                                  <img 
                                    src={recipe.authorAvatar} 
                                    alt="" 
                                    className="w-3.5 h-3.5 rounded-full object-cover border border-[#EADBCE]" 
                                  />
                                )}
                                <span>@{recipe.authorName}</span>
                              </span>
                            )}

                            <span className="text-[11px] text-[#A89F91]">
                              {recipe.ingredients.length} {language === 'zh-CN' ? '味食材' : 'items'} · {recipe.steps.length} {language === 'zh-CN' ? '步' : 'steps'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Ingredient tags quick peek */}
                      <div className="mt-3 flex items-center gap-1.5 flex-wrap overflow-hidden h-6">
                        {recipe.ingredients.slice(0, 4).map((ing) => (
                          <span
                            key={ing.id}
                            className="text-[10px] px-1.5 py-0.5 bg-[#FAF7F2] text-[#5A5248] rounded border border-[#EADBCE]/80"
                          >
                            {ing.name} {ing.amount ? `${ing.amount}${ing.unit}` : ''}
                          </span>
                        ))}
                        {recipe.ingredients.length > 4 && (
                          <span className="text-[10px] text-[#A89F91]">
                            +{recipe.ingredients.length - 4}
                          </span>
                        )}
                      </div>

                      {/* Expandable Quick Preview Drawer */}
                      {isPreviewOpen && (
                        <div className="mt-3 pt-3 border-t border-[#F0E6DC] text-xs space-y-2 bg-[#FAF7F2]/60 p-3 rounded-xl animate-fade-in">
                          <div>
                            <span className="font-bold text-[#2C2723] block mb-1">
                              {language === 'zh-CN' ? '食材备料清单：' : 'Ingredients Checklist:'}
                            </span>
                            <div className="grid grid-cols-2 gap-1 text-[11px] text-[#5A5248]">
                              {recipe.ingredients.map((ing) => (
                                <div key={ing.id} className="truncate">
                                  · {ing.name} <span className="font-mono text-[#C85A32]">{ing.amount}{ing.unit}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="pt-1.5 border-t border-[#EADBCE]/60">
                            <span className="font-bold text-[#2C2723] block mb-1">
                              {language === 'zh-CN' ? '制作步骤速览：' : 'Steps Preview:'}
                            </span>
                            <ol className="space-y-1 text-[11px] text-[#5A5248]">
                              {recipe.steps.slice(0, 3).map((st, idx) => (
                                <li key={st.id} className="truncate">
                                  <strong className="text-[#C85A32]">{idx + 1}.</strong> {st.title} {st.durationMinutes ? `(${st.durationMinutes}m)` : ''}
                                </li>
                              ))}
                              {recipe.steps.length > 3 && (
                                <li className="text-[10px] text-[#A89F91] italic">
                                  ... {language === 'zh-CN' ? `后续还有 ${recipe.steps.length - 3} 个步骤` : `+${recipe.steps.length - 3} more steps`}
                                </li>
                              )}
                            </ol>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Strip */}
                    <div className="mt-4 pt-3 border-t border-[#F0E6DC] flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        {/* Preview toggle */}
                        <button
                          type="button"
                          onClick={() => setPreviewRecipeId(isPreviewOpen ? null : recipe.id)}
                          className="px-2 py-1 text-xs text-[#7A7268] hover:text-[#2C2723] hover:bg-[#FAF7F2] rounded-lg transition-colors flex items-center gap-1"
                        >
                          {isPreviewOpen ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>{language === 'zh-CN' ? '收起预览' : 'Hide'}</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>{language === 'zh-CN' ? '速览步骤' : 'Peek'}</span>
                            </>
                          )}
                        </button>

                        {/* Bookmark Button for Square recipes */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleBookmark(e, recipe.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isBookmarked 
                              ? 'text-rose-500 bg-rose-50 hover:bg-rose-100' 
                              : 'text-[#7A7268] hover:text-rose-500 hover:bg-[#FAF7F2]'
                          }`}
                          title={isBookmarked ? (language === 'zh-CN' ? '已收藏' : 'Bookmarked') : (language === 'zh-CN' ? '收藏此手帐' : 'Bookmark')}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      {/* Primary Import and Edit Actions */}
                      <div className="flex items-center gap-2">
                        {/* Import & Edit Button */}
                        <button
                          type="button"
                          onClick={() => {
                            onSelectAndEditRecipe(recipe);
                            onClose();
                          }}
                          className="px-3 py-1.5 bg-[#FAF3EC] hover:bg-[#C85A32] text-[#C85A32] hover:text-white border border-[#C85A32]/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-98"
                          title={
                            recipe.ownerId === currentUser?.uid
                              ? (language === 'zh-CN' ? '导入并进入手帐编辑' : 'Import and Edit')
                              : (language === 'zh-CN' ? '复制到我的手帐并自由修改' : 'Fork to my notebook and customize')
                          }
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>{language === 'zh-CN' ? '导入并编辑' : 'Import & Edit'}</span>
                        </button>

                        {/* Import Directly to Workbench Button */}
                        <button
                          type="button"
                          onClick={() => {
                            onSelectRecipe(recipe);
                            onClose();
                          }}
                          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1.5 active:scale-98 ${
                            isActive
                              ? 'bg-emerald-600 text-white'
                              : 'bg-[#C85A32] hover:bg-[#B34C26] text-white'
                          }`}
                        >
                          {isActive ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>{language === 'zh-CN' ? '继续制作' : 'Continue'}</span>
                            </>
                          ) : (
                            <>
                              <Utensils className="w-3.5 h-3.5" />
                              <span>{language === 'zh-CN' ? '导入工作台' : 'Import to Cook'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer Tip */}
        <div className="p-3.5 sm:px-6 bg-white/90 border-t border-[#EADBCE] flex items-center justify-between text-xs text-[#7A7268]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C85A32]" />
            <span>
              {language === 'zh-CN'
                ? '提示：导入他人的广场手帐时，点击“导入并编辑”会自动为您生成专属复刻版本，步骤与调味随心定制！'
                : 'Tip: Click "Import & Edit" on community recipes to create your own adapted copy with custom tweaks!'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#FAF7F2] hover:bg-[#EADBCE]/50 border border-[#EADBCE] text-[#2C2723] rounded-xl text-xs font-semibold transition-colors"
          >
            {language === 'zh-CN' ? '完成' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
