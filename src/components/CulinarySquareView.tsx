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
  Sparkles, Heart, Share2, Search, 
  ChefHat, GitFork, MessageSquare, Check, Tag, Flag, Bookmark, BookOpen, ShieldCheck, X
} from 'lucide-react';

import { SquareReviewModal } from './SquareReviewModal';
import { UGCReportModal } from './UGCReportModal';
import { getBlockedUserIds } from '../utils/ugcModeration';
import { formatLocalDate } from '../utils/dateUtils';
import { 
  isSquareRecipeBookmarked, 
  toggleBookmarkSquareRecipe 
} from '../utils/multiUserStorage';
import {
  OFFICIAL_ACCOUNT_UID,
  OfficialCuratedMenu,
  getOfficialCuratedMenus
} from '../data/officialSquareSeed';
import {
  computeWeeklyMenuRotation,
  isAutoMenuRotationEnabled
} from '../utils/seasonalMenuRotation';
import { useI18n } from '../i18n/context';

interface CulinarySquareViewProps {
  recipes: Recipe[];
  currentUser: UserProfile | null;
  onOpenRecipe: (recipe: Recipe) => void;
  onCloneRecipe: (recipe: Recipe) => void;
  onCloneMenu?: (menuRecipes: Recipe[], menuTitle: string) => void;
  onToggleLike: (recipeId: string) => void;
  onShareRecipe: (recipe: Recipe) => void;
  onRequireLogin: () => void;
  onAddComment: (recipeId: string, content: string) => void;
  onOpenOfficialOps?: () => void;
}

export const CulinarySquareView: React.FC<CulinarySquareViewProps> = ({
  recipes,
  currentUser,
  onOpenRecipe,
  onCloneRecipe,
  onCloneMenu,
  onToggleLike,
  onShareRecipe,
  onRequireLogin,
  onAddComment,
  onOpenOfficialOps
}) => {
  const { t, language, getCategoryLabel, getSubcategoryLabel } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [officialOnly, setOfficialOnly] = useState(false);
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  const [officialMenus, setOfficialMenus] = useState<OfficialCuratedMenu[]>(() => getOfficialCuratedMenus());
  const [clonedSuccessId, setClonedSuccessId] = useState<string | null>(null);
  const [clonedMenuSuccessId, setClonedMenuSuccessId] = useState<string | null>(null);
  const [reviewModalRecipe, setReviewModalRecipe] = useState<Recipe | null>(null);
  const [reportModalData, setReportModalData] = useState<{
    targetId: string;
    targetTitle: string;
    authorId: string;
    authorName: string;
  } | null>(null);
  const [, setBlockedUsersRevision] = useState(0);
  const [, setBookmarkRevision] = useState(0);

  const [, setRotationRevision] = useState(0);

  // Listen to block updates, bookmark updates, and official menu updates
  React.useEffect(() => {
    const handleMod = () => setBlockedUsersRevision((p) => p + 1);
    const handleBm = () => setBookmarkRevision((p) => p + 1);
    const handleMenus = () => {
      setOfficialMenus(getOfficialCuratedMenus());
      setRotationRevision((p) => p + 1);
    };
    window.addEventListener('ugc-moderation-updated', handleMod);
    window.addEventListener('square-bookmarks-updated', handleBm);
    window.addEventListener('official-menus-updated', handleMenus);
    return () => {
      window.removeEventListener('ugc-moderation-updated', handleMod);
      window.removeEventListener('square-bookmarks-updated', handleBm);
      window.removeEventListener('official-menus-updated', handleMenus);
    };
  }, []);

  const rotationSnapshot = React.useMemo(() => {
    return computeWeeklyMenuRotation(officialMenus);
  }, [officialMenus]);

  const sortedMenus = React.useMemo(() => {
    return rotationSnapshot ? rotationSnapshot.orderedMenus : officialMenus;
  }, [rotationSnapshot, officialMenus]);

  const autoRotationActive = isAutoMenuRotationEnabled();

  const activeMenu = React.useMemo(
    () => sortedMenus.find((m) => m.id === selectedMenuId) || null,
    [sortedMenus, selectedMenuId]
  );

  const categories = [
    { id: 'all', label: t('square.allCuisines', '全部美食'), icon: '🍽️' },
    ...ALL_CATEGORIES_LIST.map((c) => ({
      id: c,
      label: getCategoryLabel(c),
      icon: CATEGORY_TAXONOMY[c].icon
    }))
  ];

  // Active subcategories list
  const activeSubcategories = selectedCategory !== 'all' 
    ? getSubcategoriesForCategory(selectedCategory as any) 
    : [];

  // Filter recipes (including Apple Guideline 1.2 Blocked Users Exclusion)
  const blockedUserIds = getBlockedUserIds();
  const filtered = recipes.filter((r) => {
    // Hide content from blocked users
    if (r.ownerId && blockedUserIds.includes(r.ownerId)) return false;
    if (r.authorName && blockedUserIds.includes(r.authorName)) return false;

    if (activeMenu && !activeMenu.recipeIds.includes(r.id)) return false;
    if (officialOnly && r.ownerId !== OFFICIAL_ACCOUNT_UID) return false;
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
            {t('square.mastheadBadge', 'PUBLIC CULINARY SQUARE')}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="max-w-2xl">
            <span className="text-xs font-serif tracking-widest text-[#C85A32] uppercase mb-1 block">
              {t('square.heroSub', '厨友灵感广场 · 烟火人间')}
            </span>
            <h1 className="text-2xl sm:text-4xl font-bold font-journal-title text-[#2C2723] leading-tight mb-3">
              {t('square.heroTitle', '食味广场：看大家今天都在做什么好吃的')}
            </h1>
            <p className="text-xs sm:text-sm text-[#7A7268] leading-relaxed font-serif">
              {language === 'zh-CN' ? (
                <>汇聚<strong>「食味手记官方主厨」严选零失败菜单</strong>与全国厨友公开分享的私房好菜。首次使用可直接按主题菜单整套学习，或<strong>一键收录到自己的手帐本</strong>自由改版复刻！</>
              ) : (
                <>Explore <strong>Official Chef Curated Menus</strong> and community signature dishes across 6 culinary categories. Clone single recipes or entire menus into your personal journal with one click!</>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              type="button"
              onClick={() => setOfficialOnly((prev) => !prev)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors inline-flex items-center gap-1.5 min-h-[40px] ${
                officialOnly
                  ? 'bg-[#2C2723] text-amber-100 border-[#2C2723]'
                  : 'bg-[#FAF7F2] text-[#2C2723] border-[#EADBCE] hover:border-[#C85A32]'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>
                {language === 'zh-CN'
                  ? officialOnly
                    ? '已筛：只看官方主厨'
                    : '只看官方主厨食谱'
                  : 'Official Chef Only'}
              </span>
            </button>

            {onOpenOfficialOps && (
              <button
                type="button"
                onClick={onOpenOfficialOps}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-[#EADBCE] bg-white hover:bg-[#FAF7F2] text-[#5A5248] hover:text-[#2C2723] transition-colors inline-flex items-center gap-1.5 min-h-[40px]"
                title="官方主厨账号发谱、主题菜单编排与UGC内容安全监管台"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>{language === 'zh-CN' ? '官方运营与内容监管台' : 'Editorial & Safety Ops'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Search & Category toolbar */}
        <div className="mt-6 pt-5 border-t border-[#F0E6DC] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#9A9085] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('square.searchPlaceholder', '搜索广场公开菜谱、作者、食材...')}
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
              <span>{getCategoryLabel(selectedCategory)} {t('square.subcategoriesLabel', '细分：')}</span>
            </span>
            <button
              onClick={() => setSelectedSubCategory('all')}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium transition-colors ${
                selectedSubCategory === 'all'
                  ? 'bg-[#C85A32] text-white'
                  : 'bg-[#FAF7F2] text-[#7A7268] hover:text-[#2C2723] border border-[#EADBCE]'
              }`}
            >
              {t('square.allSubcategories', '全部细分')}
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
                  <span>{getSubcategoryLabel(sub.id)}</span>
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
              <span>{t('square.dessertQuickAccess', '甜点细分直达：')}</span>
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
                <span>{getSubcategoryLabel(sub.id)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Official Curated Menus Shelf (Solar-Term & Weekly Auto-Rotating) */}
      {sortedMenus.length > 0 && (
        <section className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 px-1">
            <div>
              <h2 className="text-base sm:text-lg font-bold font-journal-title text-[#2C2723] flex items-center gap-2 flex-wrap">
                <BookOpen className="w-4 h-4 text-[#C85A32]" />
                <span>
                  {language === 'zh-CN' ? '官方主厨精选主题菜单' : 'Official Chef Curated Menus'}
                </span>
                {rotationSnapshot && autoRotationActive && (
                  <span className="text-xs font-normal text-[#C85A32] font-sans">
                    ·{' '}
                    {language === 'zh-CN'
                      ? `${rotationSnapshot.solarTerm.zh}节气（第 ${rotationSnapshot.isoWeek} 周当季轮换）`
                      : `${rotationSnapshot.solarTerm.en} · Week ${rotationSnapshot.isoWeek} Auto-Pick`}
                  </span>
                )}
              </h2>
              <p className="text-xs text-[#7A7268] mt-0.5">
                {language === 'zh-CN'
                  ? `随二十四节气每周一自动换新主打菜单（共 ${sortedMenus.length} 套四季主题）· 支持一键整单收进手帐本`
                  : `Automatically rotates featured seasonal menus every Monday (${sortedMenus.length} collections) · Save entire menus in one click`}
              </p>
            </div>
            {activeMenu && (
              <button
                type="button"
                onClick={() => setSelectedMenuId(null)}
                className="px-3 py-1.5 rounded-lg bg-white border border-[#EADBCE] text-xs font-semibold text-[#2C2723] hover:border-[#C85A32] inline-flex items-center gap-1 self-start sm:self-auto"
              >
                <X className="w-3.5 h-3.5" />
                <span>{language === 'zh-CN' ? '退出菜单筛选，看全部广场' : 'Show All Recipes'}</span>
              </button>
            )}
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {sortedMenus.map((menu, idx) => {
              const isSelected = selectedMenuId === menu.id;
              const isSpotlight = idx === 0 && autoRotationActive;
              const menuMatchedRecipes = recipes.filter((r) => menu.recipeIds.includes(r.id));
              const isMenuCloned = clonedMenuSuccessId === menu.id;

              return (
                <div
                  key={menu.id}
                  onClick={() => {
                    setSelectedMenuId(isSelected ? null : menu.id);
                    setSelectedCategory('all');
                    setSelectedSubCategory('all');
                  }}
                  className={`w-72 sm:w-80 shrink-0 bg-white rounded-xl overflow-hidden border transition-all cursor-pointer flex flex-col justify-between paper-shadow ${
                    isSelected
                      ? 'border-[#C85A32] ring-2 ring-[#C85A32]/25'
                      : isSpotlight
                      ? 'border-[#C85A32]/70'
                      : 'border-[#EADBCE] hover:border-[#C85A32]/60'
                  }`}
                >
                  <div>
                    <div className="relative h-32 w-full bg-[#FAF7F2] overflow-hidden">
                      {menu.coverImage ? (
                        <img
                          src={menu.coverImage}
                          alt={language === 'zh-CN' ? menu.title : menu.titleEn}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FoodArtFallback type={menu.title} className="w-full h-full" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                      {isSpotlight && (
                        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-[#C85A32] text-amber-50 text-[10px] font-bold tracking-wide">
                          {language === 'zh-CN' ? '本周时令主打' : 'Weekly Spotlight'}
                        </div>
                      )}
                      <div className="absolute bottom-2.5 left-3 right-3 text-white">
                        <div className="text-[11px] text-amber-200 font-medium">
                          {language === 'zh-CN' ? menu.sceneTag : menu.sceneTagEn} · {menuMatchedRecipes.length}{' '}
                          {language === 'zh-CN' ? '道严选好菜' : 'dishes'}
                        </div>
                        <h3 className="text-sm font-bold leading-snug line-clamp-1">
                          {language === 'zh-CN' ? menu.title : menu.titleEn}
                        </h3>
                      </div>
                    </div>

                    <div className="p-3.5">
                      <p className="text-xs text-[#7A7268] line-clamp-2 leading-relaxed">
                        {language === 'zh-CN' ? menu.subtitle : menu.subtitleEn}
                      </p>
                    </div>
                  </div>

                  <div className="px-3.5 py-2.5 bg-[#FAF7F2]/80 border-t border-[#F0E6DC] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#7A7268] truncate">
                      {menu.curatorName}
                    </span>

                    {onCloneMenu && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!currentUser) {
                            onRequireLogin();
                            return;
                          }
                          onCloneMenu(menuMatchedRecipes, menu.title);
                          setClonedMenuSuccessId(menu.id);
                          setTimeout(() => setClonedMenuSuccessId(null), 2600);
                        }}
                        className={`px-2.5 py-1 rounded-md font-semibold transition-colors inline-flex items-center gap-1 shrink-0 ${
                          isMenuCloned
                            ? 'bg-emerald-600 text-white'
                            : 'text-[#C85A32] hover:bg-white border border-[#C85A32]/30'
                        }`}
                      >
                        {isMenuCloned ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>{language === 'zh-CN' ? '整单已存' : 'Saved'}</span>
                          </>
                        ) : (
                          <>
                            <GitFork className="w-3 h-3" />
                            <span>{language === 'zh-CN' ? '整单收进手帐' : 'Save Menu'}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {activeMenu && (
            <div className="p-4 rounded-xl bg-amber-50/70 border border-[#C85A32]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#2C2723]">
              <div>
                <span className="font-bold text-[#C85A32]">
                  {language === 'zh-CN' ? `正在浏览主题菜单：《${activeMenu.title}》` : `Viewing Menu: ${activeMenu.titleEn}`}
                </span>
                <span className="mx-2 text-[#9A9085]">·</span>
                <span className="text-[#5A5248]">
                  {language === 'zh-CN' ? activeMenu.subtitle : activeMenu.subtitleEn}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMenuId(null)}
                className="text-[#C85A32] font-semibold hover:underline shrink-0 self-start sm:self-auto"
              >
                {language === 'zh-CN' ? '查看广场全部食谱' : 'Reset filter'}
              </button>
            </div>
          )}
        </section>
      )}

      {/* Grid of Public Recipe Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((recipe) => {
          const isLikedByMe = currentUser && recipe.likedBy?.includes(currentUser.uid);
          const isCloned = clonedSuccessId === recipe.id;
          const isOfficialRecipe = recipe.ownerId === OFFICIAL_ACCOUNT_UID;

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
                      {recipe.authorName || (language === 'zh-CN' ? '热心厨友' : 'Friendly Chef')}
                    </span>
                    {isOfficialRecipe && (
                      <span className="text-[11px] font-semibold text-[#C85A32] shrink-0">
                        · {language === 'zh-CN' ? '官方严选' : 'Official'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-[#9A9085]">
                      {recipe.review?.cookDate || recipe.createdAt}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReportModalData({
                          targetId: recipe.id,
                          targetTitle: recipe.title,
                          authorId: recipe.ownerId || recipe.authorName || 'unknown',
                          authorName: recipe.authorName || (language === 'zh-CN' ? '热心厨友' : 'Friendly Chef')
                        });
                      }}
                      className="p-1 text-[#9A9085] hover:text-rose-600 rounded-md transition-colors"
                      title={t('square.reportOrBlock', '举报该菜谱或屏蔽作者')}
                    >
                      <Flag className="w-3 h-3" />
                    </button>
                  </div>
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
                      <span>{t('square.adaptedFrom', '收录改版自')} @{recipe.originalSource.authorName}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5">
                  <div className="flex items-center gap-1.5 text-xs text-[#7A7268] mb-1.5 flex-wrap">
                    <span className="font-medium text-[#2C2723]">{getCategoryLabel(recipe.category)}</span>
                    {recipe.subCategory && (
                      <>
                        <span aria-hidden="true" className="text-[#C85A32]/60">/</span>
                        <span className="text-[#C85A32] font-semibold">{getSubcategoryLabel(recipe.subCategory)}</span>
                      </>
                    )}
                    <span aria-hidden="true">·</span>
                    <span>{recipe.cuisine}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums font-mono">{recipe.prepTimeMinutes + recipe.cookTimeMinutes} {t('common.minutes', '分钟')}</span>
                  </div>

                  <h3 className="text-base font-bold text-[#2C2723] font-journal-title leading-snug group-hover:text-[#C85A32] transition-colors mb-2">
                    {recipe.title}
                  </h3>

                  <p className="text-xs text-[#7A7268] line-clamp-2 leading-relaxed">
                    {recipe.subtitle || recipe.review?.tastingNotes || (language === 'zh-CN' ? '认真做菜，用手帐记录餐桌的四季温度。' : 'Cooking with passion, capturing everyday kitchen warmth.')}
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
                    title={t('square.warmKudos', '暖胃点赞')}
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
                    title={t('square.viewReviews', '查看与发表食客点评')}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span className="font-mono tabular-nums">{recipe.comments?.length || 0}</span>
                  </button>

                  {/* Bookmark to Workbench / Saved */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmarkSquareRecipe(recipe.id, currentUser);
                      setBookmarkRevision((p) => p + 1);
                    }}
                    className={`flex items-center gap-1 text-xs font-semibold py-1 px-2 rounded-md transition-colors ${
                      isSquareRecipeBookmarked(recipe.id, currentUser)
                        ? 'text-amber-800 bg-amber-50' 
                        : 'text-[#7A7268] hover:text-amber-800 hover:bg-white'
                    }`}
                    title={
                      isSquareRecipeBookmarked(recipe.id, currentUser)
                        ? (language === 'zh-CN' ? '已收藏此手帐' : 'Bookmarked')
                        : (language === 'zh-CN' ? '收藏此手帐，随时导入下厨工作台' : 'Bookmark to Workbench')
                    }
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isSquareRecipeBookmarked(recipe.id, currentUser) ? 'fill-current' : ''}`} />
                    <span className="hidden sm:inline">
                      {isSquareRecipeBookmarked(recipe.id, currentUser) 
                        ? (language === 'zh-CN' ? '已收藏' : 'Saved') 
                        : (language === 'zh-CN' ? '收藏' : 'Save')}
                    </span>
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
                    title={t('square.shareCard', '分享手帐卡')}
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
                    title={t('square.cloneToJournal', '将本篇菜谱克隆存入我的专属手帐')}
                  >
                    {isCloned ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>{t('square.clonedSuccess', '已收录！')}</span>
                      </>
                    ) : (
                      <>
                        <GitFork className="w-3.5 h-3.5" />
                        <span>{t('square.cloneToJournal', '收进手帐')}</span>
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
            <p className="text-xs text-[#7A7268]">{t('square.empty', '暂无匹配的广场菜谱，快去记录并将你的拿手好菜公开分享吧！')}</p>
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
                  createdAt: formatLocalDate()
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

      {/* UGC Content Safety Report & Block Modal */}
      {reportModalData && (
        <UGCReportModal
          isOpen={Boolean(reportModalData)}
          onClose={() => setReportModalData(null)}
          targetId={reportModalData.targetId}
          targetType="recipe"
          targetTitle={reportModalData.targetTitle}
          authorId={reportModalData.authorId}
          authorName={reportModalData.authorName}
        />
      )}

    </div>
  );
};
