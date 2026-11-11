import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Recipe } from './types/recipe';
import { UserProfile } from './types/auth';
import { getCurrentUser } from './utils/authService';
import { 
  getUserRecipes, 
  getPublicSquareRecipes, 
  saveUserRecipe, 
  deleteUserRecipe, 
  cloneRecipeToMyJournal, 
  toggleLikeRecipe, 
  addCommentToRecipe, 
  getRecipeById 
} from './utils/multiUserStorage';
import { getGitHubConfig, syncRecipesToGitHub, GitHubConfig } from './utils/githubSync';
import { Header } from './components/Header';
import { RecipeCard } from './components/RecipeCard';
import { RecipeDetail } from './components/RecipeDetail';
import { RecipeEditor } from './components/RecipeEditor';
import { CookingExecutionView } from './components/CookingExecutionView';
import { CookingNotesView } from './components/CookingNotesView';
import { ShareCardModal } from './components/ShareCardModal';
import { BackupView } from './components/BackupView';
import { KitchenTimer } from './components/KitchenTimer';
import { PWAInstallModal } from './components/PWAInstallModal';
import { GitHubSyncModal } from './components/GitHubSyncModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { CulinarySquareView } from './components/CulinarySquareView';
import { MasterChefContestView } from './components/MasterChefContestView';
import { SharedRecipePage } from './components/SharedRecipePage';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { CalendarJournalView } from './components/CalendarJournalView';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { ComplianceModal } from './components/ComplianceModal';
import { MultiPlatformGuideModal } from './components/MultiPlatformGuideModal';
import { AppShareModal } from './components/AppShareModal';
import { FooterCompliance } from './components/FooterCompliance';
import { FuzzySearchBar } from './components/FuzzySearchBar';
import { fuzzyFilterRecipes } from './utils/fuzzySearch';
import { getMergedTaxonomy } from './utils/taxonomyStorage';
import { 
  CATEGORY_TAXONOMY, 
  ALL_CATEGORIES_LIST, 
  getSubcategoriesForCategory 
} from './types/categories';
import { Search, Heart, Plus, BookOpen, Smartphone, Sparkles, User, LogIn, Check, Tag, Calendar, Layers, Trophy } from 'lucide-react';
import { useI18n } from './i18n/context';

export default function App() {
  const { t, getCategoryLabel, getSubcategoryLabel, language } = useI18n();

  // Multi-user authentication state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Recipes state (isolated per user)
  const [recipes, setRecipes] = useState<Recipe[]>(() => getUserRecipes(getCurrentUser()));
  const [publicRecipes, setPublicRecipes] = useState<Recipe[]>(() => getPublicSquareRecipes());

  // Navigation & Selected Recipe
  const [activeView, setActiveView] = useState<'journal' | 'calendar' | 'square' | 'contest' | 'pantry' | 'notes' | 'backup'>('journal');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [sharedRecipeTarget, setSharedRecipeTarget] = useState<Recipe | null>(null);

  // Modals & Editors
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [sharingRecipe, setSharingRecipe] = useState<Recipe | null>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [categoryManagerParent, setCategoryManagerParent] = useState<string>('烘焙甜点');
  const [taxonomyRevision, setTaxonomyRevision] = useState(0);

  // Compliance & Multi-Platform Guide Modals
  const [isComplianceModalOpen, setIsComplianceModalOpen] = useState(false);
  const [complianceTab, setComplianceTab] = useState<'privacy' | 'terms' | 'permissions' | 'cancellation' | 'filings'>('privacy');
  const [isMultiPlatformModalOpen, setIsMultiPlatformModalOpen] = useState(false);
  const [isAppShareModalOpen, setIsAppShareModalOpen] = useState(false);

  // GitHub Auto-Sync Config
  const [githubConfig, setGithubConfig] = useState<GitHubConfig>(() => getGitHubConfig());
  const [syncToast, setSyncToast] = useState<string | null>(null);
  const isFirstRender = useRef(true);

  // Kitchen Timer State
  const [timerState, setTimerState] = useState<{ isOpen: boolean; minutes: number; label: string } | null>(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  // Deep linking check on mount
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const recipeId = urlParams.get('recipeId') || urlParams.get('recipe');
      if (recipeId) {
        const found = getRecipeById(recipeId);
        if (found) {
          setSharedRecipeTarget(found);
        }
      }
    } catch (e) {
      console.warn('URL parsing error', e);
    }
  }, []);

  // Listen to master recipe updates & auth changes across windows / tabs
  useEffect(() => {
    const handleStorageChange = () => {
      setRecipes(getUserRecipes(currentUser));
      setPublicRecipes(getPublicSquareRecipes());
    };
    const handleAuthChange = (e: CustomEvent) => {
      const newUser = e.detail;
      setCurrentUser(newUser);
      setRecipes(getUserRecipes(newUser));
      setPublicRecipes(getPublicSquareRecipes());
    };

    window.addEventListener('recipes-updated', handleStorageChange);
    window.addEventListener('auth-state-changed', handleAuthChange as EventListener);
    return () => {
      window.removeEventListener('recipes-updated', handleStorageChange);
      window.removeEventListener('auth-state-changed', handleAuthChange as EventListener);
    };
  }, [currentUser]);

  // Sync recipes to GitHub if configured
  useEffect(() => {
    if (!isFirstRender.current && githubConfig.autoSync && githubConfig.token) {
      syncRecipesToGitHub(githubConfig, recipes)
        .then((res) => {
          if (res.success) {
            setSyncToast(`已实时备份至 GitHub (${res.commitSha})`);
            setTimeout(() => setSyncToast(null), 3000);
          }
        })
        .catch(console.error);
    }
    isFirstRender.current = false;
  }, [recipes, githubConfig]);

  // Handle Save Recipe (isolated to current user)
  const handleSaveRecipe = (recipe: Recipe) => {
    const saved = saveUserRecipe(recipe, currentUser);
    setRecipes(getUserRecipes(currentUser));
    setPublicRecipes(getPublicSquareRecipes());
    setIsEditorOpen(false);
    setEditingRecipe(null);
    if (selectedRecipe && selectedRecipe.id === recipe.id) {
      setSelectedRecipe(saved);
    }
    setSyncToast(`菜谱《${saved.title}》已保存${saved.isPublic ? '并公开至食味广场' : '至私密手帐'}`);
    setTimeout(() => setSyncToast(null), 3000);
  };

  // Handle Delete Recipe
  const handleDeleteRecipe = (id: string) => {
    deleteUserRecipe(id, currentUser);
    setRecipes(getUserRecipes(currentUser));
    setPublicRecipes(getPublicSquareRecipes());
    if (selectedRecipe?.id === id) {
      setSelectedRecipe(null);
    }
  };

  // Handle Toggle Favorite
  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = recipes.find((r) => r.id === id);
    if (target) {
      const updated = { ...target, isFavorite: !target.isFavorite };
      saveUserRecipe(updated, currentUser);
      setRecipes(getUserRecipes(currentUser));
      if (selectedRecipe?.id === id) {
        setSelectedRecipe(updated);
      }
    }
  };

  // Handle Clone Recipe to Current User's Journal
  const handleCloneRecipe = (sourceRecipe: Recipe) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const cloned = cloneRecipeToMyJournal(sourceRecipe, currentUser);
    setRecipes(getUserRecipes(currentUser));
    setActiveView('journal');
    setSelectedRecipe(cloned);
    setSharedRecipeTarget(null);
    setSyncToast(`已成功收录《${sourceRecipe.title}》到您的手帐本！`);
    setTimeout(() => setSyncToast(null), 3500);
  };

  // Handle Like on Public or Private Recipe
  const handleToggleLike = (recipeId: string) => {
    toggleLikeRecipe(recipeId, currentUser);
    setRecipes(getUserRecipes(currentUser));
    setPublicRecipes(getPublicSquareRecipes());
    if (sharedRecipeTarget && sharedRecipeTarget.id === recipeId) {
      const refreshed = getRecipeById(recipeId);
      if (refreshed) setSharedRecipeTarget(refreshed);
    }
    if (selectedRecipe && selectedRecipe.id === recipeId) {
      const refreshed = getRecipeById(recipeId);
      if (refreshed) setSelectedRecipe(refreshed);
    }
  };

  // Handle Add Comment
  const handleAddComment = (recipeId: string, content: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    addCommentToRecipe(recipeId, currentUser.displayName, currentUser.avatarUrl, content);
    setRecipes(getUserRecipes(currentUser));
    setPublicRecipes(getPublicSquareRecipes());
    if (sharedRecipeTarget && sharedRecipeTarget.id === recipeId) {
      const refreshed = getRecipeById(recipeId);
      if (refreshed) setSharedRecipeTarget(refreshed);
    }
  };

  const handleStartTimer = (minutes: number, label: string) => {
    setTimerState({ isOpen: true, minutes, label });
  };

  // User Stats Calculation for UserProfileModal
  const publicRecipeCount = useMemo(() => {
    return recipes.filter((r) => r.isPublic).length;
  }, [recipes]);

  const totalLikesReceived = useMemo(() => {
    if (!currentUser) return 0;
    return recipes.reduce((sum, r) => sum + (r.likesCount || 0), 0);
  }, [recipes, currentUser]);

  // Filtered recipe list for personal journal with fuzzy matching and synonyms
  const filteredRecipes = useMemo(() => {
    let list = recipes;
    // Category filter
    if (selectedCategory !== 'all') {
      list = list.filter((r) => r.category === selectedCategory);
    }
    // Subcategory filter
    if (selectedSubCategory !== 'all') {
      list = list.filter((r) => r.subCategory === selectedSubCategory);
    }
    // Favorite filter
    if (favoritesOnly) {
      list = list.filter((r) => r.isFavorite);
    }
    // Search query filter (fuzzy search & synonym expansion)
    if (searchQuery.trim()) {
      return fuzzyFilterRecipes(list, searchQuery);
    }
    return list;
  }, [recipes, selectedCategory, selectedSubCategory, favoritesOnly, searchQuery]);
  useEffect(() => {
    const handleTaxonomyUpdate = () => {
      setTaxonomyRevision((prev) => prev + 1);
    };
    window.addEventListener('taxonomy-updated', handleTaxonomyUpdate);
    return () => {
      window.removeEventListener('taxonomy-updated', handleTaxonomyUpdate);
    };
  }, []);

  const activeTaxonomy = useMemo(() => {
    return getMergedTaxonomy(currentUser);
  }, [currentUser, taxonomyRevision]);

  const categories = useMemo(() => {
    const list = Object.keys(activeTaxonomy);
    return [
      { id: 'all', label: t('category.all', '全部菜谱'), icon: '📖' },
      ...list.map((c) => ({
        id: c,
        label: getCategoryLabel(c),
        icon: activeTaxonomy[c]?.icon || '🥢'
      }))
    ];
  }, [activeTaxonomy, language, t]);

  const handleOpenCompliance = (tab: 'privacy' | 'terms' | 'permissions' | 'cancellation' | 'filings' = 'privacy') => {
    setComplianceTab(tab);
    setIsComplianceModalOpen(true);
  };

  const handleExportAllData = () => {
    try {
      const exportPayload = {
        exportDate: new Date().toISOString(),
        platform: '食味手记 Culinary Journal',
        user: currentUser,
        recipes: recipes,
        publicRecipes: publicRecipes,
        schemaVersion: '1.2.0',
        totalRecipes: recipes.length,
      };
      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `culinary-journal-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  const handleDeleteAccount = () => {
    try {
      if (currentUser) {
        const userKey = `culinary_recipes_${currentUser.uid}`;
        localStorage.removeItem(userKey);
        localStorage.removeItem('culinary_current_user');
      }
      setCurrentUser(null);
      setRecipes(getUserRecipes(null));
    } catch (e) {
      console.error('Account deletion error', e);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C2723] flex flex-col font-sans">
      {/* 1. Header (Top Bar Contract) */}
      <Header
        activeView={activeView}
        setActiveView={(view) => {
          setActiveView(view);
          setSelectedRecipe(null);
          setSharedRecipeTarget(null);
        }}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onNewRecipe={() => {
          setEditingRecipe(null);
          setIsEditorOpen(true);
        }}
        onOpenInstall={() => setIsInstallModalOpen(true)}
        onOpenGitHub={() => setIsGitHubModalOpen(true)}
        onOpenShare={() => setIsAppShareModalOpen(true)}
      />

      {/* Realtime Notification Toast */}
      {syncToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#2C2723] text-amber-100 text-xs py-2 px-3.5 rounded-lg border border-[#EADBCE] shadow-xl flex items-center gap-2 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{syncToast}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* VIEW 0: DEEP LINK SHARED RECIPE VIEW */}
        {sharedRecipeTarget ? (
          <SharedRecipePage
            recipe={sharedRecipeTarget}
            currentUser={currentUser}
            onBackToApp={() => {
              setSharedRecipeTarget(null);
              window.history.replaceState({}, '', window.location.pathname);
            }}
            onCloneRecipe={handleCloneRecipe}
            onToggleLike={handleToggleLike}
            onAddComment={handleAddComment}
            onRequireLogin={() => setIsAuthModalOpen(true)}
          />
        ) : selectedRecipe ? (
          /* VIEW 1: DETAIL RECIPE VIEW */
          <RecipeDetail
            recipe={selectedRecipe}
            onBack={() => setSelectedRecipe(null)}
            onEdit={(rec) => {
              setEditingRecipe(rec);
              setIsEditorOpen(true);
            }}
            onDelete={handleDeleteRecipe}
            onShare={(rec) => setSharingRecipe(rec)}
            onUpdateRecipe={(updated) => {
              handleSaveRecipe(updated);
              setSelectedRecipe(updated);
            }}
            onStartTimer={handleStartTimer}
          />
        ) : (
          <>
            {/* VIEW 2: MAIN JOURNAL CATALOG */}
            {activeView === 'journal' && (
              <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24">
                
                {/* Hero / Scrapbook Masthead */}
                <div className="mb-8 p-6 sm:p-8 bg-white border border-[#EADBCE] rounded-2xl paper-shadow bg-notebook-dots relative overflow-hidden">
                  <div className="absolute top-0 right-10 transform -translate-y-1/2 pointer-events-none">
                    <div className="washi-tape px-6 py-1 bg-[#5F7A4D]/80 text-emerald-50 text-xs font-mono tracking-wider uppercase">
                      PERSONAL JOURNAL
                    </div>
                  </div>

                  <div className="max-w-2xl">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-serif tracking-widest text-[#C85A32] uppercase block">
                        私房手作 · 烟火记录
                      </span>
                      {currentUser ? (
                        <span className="text-[11px] text-[#5A5248] bg-[#FAF7F2] border border-[#EADBCE] px-2 py-0.5 rounded-full">
                          专属大厨：{currentUser.displayName}
                        </span>
                      ) : (
                        <button
                          onClick={() => setIsAuthModalOpen(true)}
                          className="text-[11px] text-[#C85A32] hover:underline"
                        >
                          (点击登录以享受多端独立手帐)
                        </button>
                      )}
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-bold font-journal-title text-[#2C2723] leading-tight mb-3">
                      今日下厨，把日子过得热气腾腾
                    </h1>
                    <p className="text-xs sm:text-sm text-[#7A7268] leading-relaxed font-serif">
                      详细记录食材用量、关键火候时序与心得复盘。每一张手帐页，都是留给餐桌的温柔回忆。
                    </p>
                  </div>

                  {/* Search & Filter Toolbar */}
                  <div className="mt-6 pt-5 border-t border-[#F0E6DC] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    {/* Fuzzy Search Bar with Synonym Associations */}
                    <div className="flex-1 max-w-md">
                      <FuzzySearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        recipes={recipes}
                        onSelectRecipe={(rec) => setSelectedRecipe(rec)}
                        placeholder="模糊与近义词搜索菜名、食材 (如：肉、虾、抹茶、生抽)..."
                      />
                    </div>

                    {/* Favorites Toggle & Contest / Square shortcut */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => setActiveView('contest')}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-amber-400/80 bg-amber-50 text-amber-950 hover:bg-amber-100 transition-colors shadow-2xs relative"
                      >
                        <Trophy className="w-3.5 h-3.5 text-amber-600 fill-amber-400" />
                        <span>{language === 'zh-CN' ? '厨神大赛打擂' : 'Master Chef Contest'}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping absolute -top-0.5 -right-0.5" />
                      </button>

                      <button
                        onClick={() => setActiveView('square')}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-[#C85A32]/40 bg-orange-50/50 text-[#C85A32] hover:bg-orange-100/50 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{t('journal.squareInspiration', '去食味广场找灵感')}</span>
                      </button>

                      <button
                        onClick={() => setFavoritesOnly(!favoritesOnly)}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors shrink-0 ${
                          favoritesOnly
                            ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-2xs'
                            : 'bg-[#FAF7F2] text-[#7A7268] border-[#EADBCE] hover:text-[#2C2723]'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-current' : ''}`} />
                        <span>{favoritesOnly ? (language === 'zh-CN' ? '只看常做收藏' : 'Favorites') : (language === 'zh-CN' ? '筛选收藏' : 'Favorites')}</span>
                      </button>
                    </div>
                  </div>

                  {/* Category Segmented Tabs */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pt-4 text-xs no-scrollbar">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setSelectedSubCategory('all');
                        }}
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

                    {/* + 自定义名录 button */}
                    <button
                      onClick={() => {
                        setCategoryManagerParent(selectedCategory !== 'all' ? selectedCategory : '烘焙甜点');
                        setIsCategoryManagerOpen(true);
                      }}
                      className="px-2.5 py-1.5 rounded-lg whitespace-nowrap font-medium text-[#C85A32] bg-[#FAF3EC] hover:bg-[#C85A32] hover:text-white border border-dashed border-[#C85A32]/50 transition-colors flex items-center gap-1 shrink-0 ml-1"
                      title="自定义添加一级大类或二级细分名录"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>自定义名录</span>
                    </button>
                  </div>

                  {/* Secondary Subcategory Filter Row */}
                  {selectedCategory !== 'all' ? (
                    <div className="mt-3 pt-3 border-t border-[#F0E6DC] flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
                      <span className="text-[11px] font-semibold text-[#7A7268] shrink-0 flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-[#C85A32]" />
                        <span>{selectedCategory}细分：</span>
                      </span>
                      <button
                        onClick={() => setSelectedSubCategory('all')}
                        className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium transition-colors ${
                          selectedSubCategory === 'all'
                            ? 'bg-[#C85A32] text-white shadow-2xs'
                            : 'bg-[#FAF7F2] text-[#7A7268] hover:text-[#2C2723] border border-[#EADBCE]'
                        }`}
                      >
                        全部细分
                      </button>
                      {(activeTaxonomy[selectedCategory]?.subcategories || []).map((sub) => {
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
                                selectedSubCategory === sub.id ? 'bg-white/25 text-white' : 'bg-stone-200/70 text-[#7A7268]'
                              }`}>
                                {count}
                              </span>
                            )}
                          </button>
                        );
                      })}

                      {/* Add Subcategory Button */}
                      <button
                        onClick={() => {
                          setCategoryManagerParent(selectedCategory);
                          setIsCategoryManagerOpen(true);
                        }}
                        className="px-2 py-1 rounded-md whitespace-nowrap text-[11px] font-medium text-[#C85A32] hover:bg-[#FAF3EC] border border-dashed border-[#C85A32]/40 transition-colors flex items-center gap-1 shrink-0 ml-1"
                        title="为当前分类添加细分名录"
                      >
                        <Plus className="w-3 h-3" />
                        <span>添加细分</span>
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 pt-3 border-t border-[#F0E6DC] flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
                      <span className="text-[11px] font-semibold text-[#7A7268] shrink-0 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
                        <span>甜点细分直达：</span>
                      </span>
                      {(activeTaxonomy['烘焙甜点']?.subcategories || []).map((sub) => (
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

                      {/* Add Subcategory shortcut */}
                      <button
                        onClick={() => {
                          setCategoryManagerParent('烘焙甜点');
                          setIsCategoryManagerOpen(true);
                        }}
                        className="px-2 py-1 rounded-md whitespace-nowrap text-[11px] font-medium text-[#C85A32] hover:bg-[#FAF3EC] border border-dashed border-[#C85A32]/40 transition-colors flex items-center gap-1 shrink-0 ml-1"
                        title="为烘焙甜点添加细分名录"
                      >
                        <Plus className="w-3 h-3" />
                        <span>添加细分</span>
                      </button>
                    </div>
                  )}

                </div>

                {/* Recipe Cards Grid */}
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="text-xs text-[#7A7268]">
                    我的手帐收录 <span className="font-mono font-semibold text-[#2C2723]">{filteredRecipes.length}</span> 道私房菜谱
                    {selectedCategory !== 'all' && ` · ${selectedCategory}`}
                    {selectedSubCategory !== 'all' && ` · ${selectedSubCategory}`}
                  </div>
                </div>

                {filteredRecipes.length === 0 ? (
                  <div className="bg-white border border-dashed border-[#EADBCE] rounded-2xl p-12 text-center max-w-md mx-auto">
                    <BookOpen className="w-10 h-10 text-[#C85A32]/40 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-[#2C2723] font-journal-title mb-1">
                      手帐本空空如也，来记一笔吧！
                    </h3>
                    <p className="text-xs text-[#7A7268] mb-4">
                      您可以点击下方按钮录入第一道私房菜，或者前往食味广场将厨友分享的好菜一键收录。
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => {
                          setEditingRecipe(null);
                          setIsEditorOpen(true);
                        }}
                        className="px-4 py-2 bg-[#C85A32] text-white text-xs font-semibold rounded-lg hover:bg-[#B34C26] transition-colors inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>新建私房食谱</span>
                      </button>
                      <button
                        onClick={() => setActiveView('square')}
                        className="px-4 py-2 bg-white border border-[#EADBCE] text-[#2C2723] text-xs font-semibold rounded-lg hover:bg-[#FAF7F2] transition-colors inline-flex items-center gap-1.5"
                      >
                        <Sparkles className="w-4 h-4 text-[#C85A32]" />
                        <span>浏览广场灵感</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRecipes.map((recipe) => (
                      <RecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        onSelect={(rec) => setSelectedRecipe(rec)}
                        onShare={(rec) => setSharingRecipe(rec)}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))}
                  </div>
                )}

              </div>
            )}

            {/* VIEW 2.5: COOKING CALENDAR & CULINARY HISTORY */}
            {activeView === 'calendar' && (
              <CalendarJournalView
                recipes={recipes}
                currentUser={currentUser}
                onOpenRecipe={(rec) => setSelectedRecipe(rec)}
                onNewRecipe={() => {
                  setEditingRecipe(null);
                  setIsEditorOpen(true);
                }}
              />
            )}

            {/* VIEW 3: CULINARY SQUARE (PUBLIC EXPLORATION) */}
            {activeView === 'square' && (
              <CulinarySquareView
                recipes={publicRecipes}
                currentUser={currentUser}
                onOpenRecipe={(rec) => setSelectedRecipe(rec)}
                onCloneRecipe={handleCloneRecipe}
                onToggleLike={handleToggleLike}
                onAddComment={handleAddComment}
                onShareRecipe={(rec) => setSharingRecipe(rec)}
                onRequireLogin={() => setIsAuthModalOpen(true)}
              />
            )}

            {/* VIEW 3.5: MASTER CHEF CONTEST ARENA */}
            {activeView === 'contest' && (
              <MasterChefContestView
                currentUser={currentUser}
                userRecipes={recipes}
                onOpenRecipe={(rec) => setSelectedRecipe(rec)}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                onRecipeCloned={(cloned) => {
                  setRecipes(getUserRecipes(currentUser));
                  setPublicRecipes(getPublicSquareRecipes());
                  setSelectedRecipe(cloned);
                }}
              />
            )}

            {/* VIEW 4: COOKING EXECUTION & PREPARATION WORKBENCH */}
            {activeView === 'pantry' && (
              <CookingExecutionView
                recipes={recipes}
                currentUser={currentUser}
                onOpenRecipe={(rec) => setSelectedRecipe(rec)}
                onStartTimer={handleStartTimer}
              />
            )}

            {/* VIEW 5: COOKING NOTES & REVIEWS WALL */}
            {activeView === 'notes' && (
              <CookingNotesView
                recipes={recipes}
                onOpenRecipe={(rec) => setSelectedRecipe(rec)}
                onShareRecipe={(rec) => setSharingRecipe(rec)}
              />
            )}

            {/* VIEW 6: BACKUP & DATA MANAGEMENT */}
            {activeView === 'backup' && (
              <BackupView
                recipes={recipes}
                onReloadRecipes={(recs) => {
                  setRecipes(recs);
                }}
                onOpenGitHub={() => setIsGitHubModalOpen(true)}
                onOpenInstall={() => setIsInstallModalOpen(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Kitchen Offline State Indicator */}
      <OfflineIndicator />

      {/* Floating Kitchen Timer (When Active) */}
      {timerState?.isOpen && (
        <KitchenTimer
          initialMinutes={timerState.minutes}
          label={timerState.label}
          onClose={() => setTimerState(null)}
        />
      )}

      {/* Recipe Editor Modal / Drawer */}
      {isEditorOpen && (
        <RecipeEditor
          initialRecipe={editingRecipe}
          currentUser={currentUser}
          onSave={handleSaveRecipe}
          onCancel={() => {
            setIsEditorOpen(false);
            setEditingRecipe(null);
          }}
          onStartTimer={handleStartTimer}
        />
      )}

      {/* Share Card Modal */}
      {sharingRecipe && (
        <ShareCardModal
          recipe={sharingRecipe}
          onClose={() => setSharingRecipe(null)}
        />
      )}

      {/* PWA App Install Modal */}
      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* GitHub Sync Modal */}
      <GitHubSyncModal
        isOpen={isGitHubModalOpen}
        recipes={recipes}
        onClose={() => setIsGitHubModalOpen(false)}
        onConfigUpdated={(cfg) => setGithubConfig(cfg)}
      />

      {/* Multi-Channel Auth Modal (Phone, Email/Password, WeChat, Alipay, Google) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setRecipes(getUserRecipes(user));
          setPublicRecipes(getPublicSquareRecipes());
        }}
      />

      {/* User Profile Modal */}
      {currentUser && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          user={currentUser}
          recipes={recipes}
          userRecipeCount={recipes.length}
          publicRecipeCount={publicRecipeCount}
          totalLikesReceived={totalLikesReceived}
          onClose={() => setIsProfileModalOpen(false)}
          onUserUpdated={(updated) => {
            setCurrentUser(updated);
          }}
          onLogout={() => {
            setCurrentUser(null);
            setRecipes(getUserRecipes(null));
            setPublicRecipes(getPublicSquareRecipes());
          }}
          onNavigateToContest={() => {
            setActiveView('contest');
            setSelectedRecipe(null);
          }}
          onNavigateToNewRecipe={() => {
            setEditingRecipe(null);
            setIsEditorOpen(true);
          }}
        />
      )}

      {/* Category Manager Modal */}
      <CategoryManagerModal
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        currentUser={currentUser}
        defaultParentCategory={categoryManagerParent}
        onTaxonomyChanged={() => setTaxonomyRevision((prev) => prev + 1)}
      />

      {/* Multi-End & Regulatory Compliant Footer */}
      <FooterCompliance
        onOpenCompliance={handleOpenCompliance}
        onOpenMultiPlatform={() => setIsMultiPlatformModalOpen(true)}
        onOpenShare={() => setIsAppShareModalOpen(true)}
      />

      {/* Compliance Center Modal (PIPL, Privacy, Terms, Data Takeout, MIIT Filings) */}
      <ComplianceModal
        isOpen={isComplianceModalOpen}
        initialTab={complianceTab}
        onClose={() => setIsComplianceModalOpen(false)}
        currentUser={currentUser}
        onExportAllData={handleExportAllData}
        onDeleteAccount={handleDeleteAccount}
      />

      {/* Multi-Platform Guide Modal (iOS, Android, WeChat Mini Program, Web) */}
      <MultiPlatformGuideModal
        isOpen={isMultiPlatformModalOpen}
        onClose={() => setIsMultiPlatformModalOpen(false)}
        onOpenPWAInstall={() => {
          setIsMultiPlatformModalOpen(false);
          setIsInstallModalOpen(true);
        }}
        onOpenShare={() => {
          setIsMultiPlatformModalOpen(false);
          setIsAppShareModalOpen(true);
        }}
      />

      {/* App WeChat / QR Code Share & Scrapbook Poster Modal */}
      <AppShareModal
        isOpen={isAppShareModalOpen}
        onClose={() => setIsAppShareModalOpen(false)}
      />
    </div>
  );
}
