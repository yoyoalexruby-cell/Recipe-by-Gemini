import React, { useState, useEffect, useMemo, useRef, Suspense, lazy } from 'react';
import { Recipe } from './types/recipe';
import { UserProfile } from './types/auth';
import {
  getCurrentUser,
  deleteCurrentUserAccount,
  verifyOfficialOperatorOrLogout,
  isOfficialUser,
  CURRENT_USER_KEY,
} from './utils/authService';
import { OFFICIAL_ACCOUNT_UID } from './data/officialSquareSeed';
import { 
  MASTER_RECIPES_KEY,
  getUserRecipes, 
  getPublicSquareRecipes, 
  saveUserRecipeWithStatus, 
  deleteUserRecipe, 
  cloneRecipeToMyJournal, 
  cloneMenuToMyJournal,
  toggleLikeRecipe, 
  addCommentToRecipe, 
  getRecipeById
} from './utils/multiUserStorage';
import { downloadFullBackupJson, purgeAllUserDataCompletely } from './utils/fullBackupService';
import { auditUGCContentSafety } from './utils/ugcModeration';
import { getGitHubConfig, saveGitHubConfig, syncRecipesToGitHub, GitHubConfig } from './utils/githubSync';
import { Header } from './components/Header';
import { RecipeCard } from './components/RecipeCard';
import { KitchenTimer } from './components/KitchenTimer';
import { PWAInstallModal } from './components/PWAInstallModal';
import { GitHubSyncModal } from './components/GitHubSyncModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AuthModal } from './components/AuthModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { FooterCompliance } from './components/FooterCompliance';
import type { PublicPageSection } from './components/PublicLegalSupportPage';
import { FuzzySearchBar } from './components/FuzzySearchBar';

// Lazy-loaded feature views & heavy modals for fast initial paint
const RecipeDetail = lazy(() =>
  import('./components/RecipeDetail').then((m) => ({ default: m.RecipeDetail }))
);
const RecipeEditor = lazy(() =>
  import('./components/RecipeEditor').then((m) => ({ default: m.RecipeEditor }))
);
const CookingExecutionView = lazy(() =>
  import('./components/CookingExecutionView').then((m) => ({ default: m.CookingExecutionView }))
);
const CookingNotesView = lazy(() =>
  import('./components/CookingNotesView').then((m) => ({ default: m.CookingNotesView }))
);
const ShareCardModal = lazy(() =>
  import('./components/ShareCardModal').then((m) => ({ default: m.ShareCardModal }))
);
const BackupView = lazy(() =>
  import('./components/BackupView').then((m) => ({ default: m.BackupView }))
);
const CulinarySquareView = lazy(() =>
  import('./components/CulinarySquareView').then((m) => ({ default: m.CulinarySquareView }))
);
const MasterChefContestView = lazy(() =>
  import('./components/MasterChefContestView').then((m) => ({ default: m.MasterChefContestView }))
);
const SharedRecipePage = lazy(() =>
  import('./components/SharedRecipePage').then((m) => ({ default: m.SharedRecipePage }))
);
const UserProfileModal = lazy(() =>
  import('./components/UserProfileModal').then((m) => ({ default: m.UserProfileModal }))
);
const CalendarJournalView = lazy(() =>
  import('./components/CalendarJournalView').then((m) => ({ default: m.CalendarJournalView }))
);
const ComplianceModal = lazy(() =>
  import('./components/ComplianceModal').then((m) => ({ default: m.ComplianceModal }))
);
const MultiPlatformGuideModal = lazy(() =>
  import('./components/MultiPlatformGuideModal').then((m) => ({ default: m.MultiPlatformGuideModal }))
);
const PublicLegalSupportPage = lazy(() =>
  import('./components/PublicLegalSupportPage').then((m) => ({ default: m.PublicLegalSupportPage }))
);
const AppStoreAssetsModal = lazy(() =>
  import('./components/AppStoreAssetsModal').then((m) => ({ default: m.AppStoreAssetsModal }))
);
const OfficialOpsModal = lazy(() =>
  import('./components/OfficialOpsModal').then((m) => ({ default: m.OfficialOpsModal }))
);
const AppShareModal = lazy(() =>
  import('./components/AppShareModal').then((m) => ({ default: m.AppShareModal }))
);
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

  // Compliance, Public Legal Pages & App Store Assets Studio
  const [isComplianceModalOpen, setIsComplianceModalOpen] = useState(false);
  const [complianceTab, setComplianceTab] = useState<'privacy' | 'terms' | 'permissions' | 'cancellation' | 'filings'>('privacy');
  const [isMultiPlatformModalOpen, setIsMultiPlatformModalOpen] = useState(false);
  const [isAppShareModalOpen, setIsAppShareModalOpen] = useState(false);
  const [isStoreAssetsModalOpen, setIsStoreAssetsModalOpen] = useState(false);
  const [isOfficialOpsModalOpen, setIsOfficialOpsModalOpen] = useState(false);
  const [publicLegalPage, setPublicLegalPage] = useState<PublicPageSection | null>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const page = urlParams.get('page') || urlParams.get('view');
      const tab = urlParams.get('tab');
      if (page === 'privacy') return 'privacy';
      if (page === 'support') return 'support';
      if (page === 'terms') return 'terms';
      if (page === 'delete-account') return 'delete-account';
      if (page === 'compliance') {
        if (tab === 'terms') return 'terms';
        if (tab === 'cancellation') return 'delete-account';
        return 'privacy';
      }
    } catch {
      // ignore
    }
    return null;
  });

  // GitHub Auto-Sync Config (isolated per user UID)
  const [githubConfig, setGithubConfig] = useState<GitHubConfig>(() => getGitHubConfig(currentUser));
  const [syncToast, setSyncToast] = useState<string | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    setGithubConfig(getGitHubConfig(currentUser));
  }, [currentUser?.uid]);

  // Verify Official Operator token against backend whenever active user is the Official Chef
  useEffect(() => {
    if (!isOfficialUser(currentUser)) return;
    let cancelled = false;
    verifyOfficialOperatorOrLogout().then((valid) => {
      if (!cancelled && !valid) {
        setSyncToast(
          language === 'zh-CN'
            ? '官方运营令牌已过期或未授权，已自动退出官方身份'
            : 'Official operator session expired or invalid; signed out'
        );
        setTimeout(() => setSyncToast(null), 4000);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [currentUser?.uid, language]);

  // Kitchen Timer State
  const [timerState, setTimerState] = useState<{ isOpen: boolean; minutes: number; label: string } | null>(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  // Deep linking & public URL routing check on mount and browser back/forward
  useEffect(() => {
    const syncFromUrl = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const page = urlParams.get('page') || urlParams.get('view');
        const tab = urlParams.get('tab');

        if (page === 'store-assets') {
          setIsStoreAssetsModalOpen(true);
        }

        if (page === 'privacy') {
          setPublicLegalPage('privacy');
          return;
        }
        if (page === 'support') {
          setPublicLegalPage('support');
          return;
        }
        if (page === 'terms') {
          setPublicLegalPage('terms');
          return;
        }
        if (page === 'delete-account') {
          setPublicLegalPage('delete-account');
          return;
        }
        if (page === 'compliance') {
          setPublicLegalPage(tab === 'terms' ? 'terms' : tab === 'cancellation' ? 'delete-account' : 'privacy');
          return;
        }
        setPublicLegalPage(null);

        const recipeId = urlParams.get('recipeId') || urlParams.get('recipe');
        if (recipeId) {
          const found = getRecipeById(recipeId);
          const activeUser = getCurrentUser();
          if (found) {
            if (found.isPublic === true || (activeUser && found.ownerId === activeUser.uid)) {
              setSharedRecipeTarget(found);
            } else {
              setSyncToast('该手帐为作者私密食谱，仅作者本人或公开分享后可访问');
              setTimeout(() => setSyncToast(null), 4000);
            }
          }
        }
      } catch (e) {
        console.warn('URL parsing error', e);
      }
    };

    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, []);

  // Listen to master recipe updates, auth changes & native cross-tab storage events
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
    const handleNativeCrossTabStorage = (e: StorageEvent) => {
      if (!e.key || e.key === MASTER_RECIPES_KEY) {
        const latestUser = getCurrentUser();
        setRecipes(getUserRecipes(latestUser));
        setPublicRecipes(getPublicSquareRecipes());
      } else if (e.key === CURRENT_USER_KEY) {
        const latestUser = getCurrentUser();
        setCurrentUser(latestUser);
        setRecipes(getUserRecipes(latestUser));
        setPublicRecipes(getPublicSquareRecipes());
      }
    };
    const handleQuotaExceeded = (e: Event) => {
      const custom = e as CustomEvent<{ message?: string }>;
      setSyncToast(custom.detail?.message || '本地存储空间已满，请前往备份页导出或清理超大图片');
      setTimeout(() => setSyncToast(null), 6000);
    };

    window.addEventListener('recipes-updated', handleStorageChange);
    window.addEventListener('auth-state-changed', handleAuthChange as EventListener);
    window.addEventListener('storage', handleNativeCrossTabStorage);
    window.addEventListener('storage-quota-exceeded', handleQuotaExceeded);
    return () => {
      window.removeEventListener('recipes-updated', handleStorageChange);
      window.removeEventListener('auth-state-changed', handleAuthChange as EventListener);
      window.removeEventListener('storage', handleNativeCrossTabStorage);
      window.removeEventListener('storage-quota-exceeded', handleQuotaExceeded);
    };
  }, [currentUser]);

  // Global Escape key handler to close topmost active modal for keyboard accessibility
  useEffect(() => {
    const handleGlobalEscape = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (isAppShareModalOpen) setIsAppShareModalOpen(false);
      else if (isOfficialOpsModalOpen) setIsOfficialOpsModalOpen(false);
      else if (isStoreAssetsModalOpen) setIsStoreAssetsModalOpen(false);
      else if (isMultiPlatformModalOpen) setIsMultiPlatformModalOpen(false);
      else if (isComplianceModalOpen) setIsComplianceModalOpen(false);
      else if (isCategoryManagerOpen) setIsCategoryManagerOpen(false);
      else if (isProfileModalOpen) setIsProfileModalOpen(false);
      else if (isAuthModalOpen) setIsAuthModalOpen(false);
      else if (isGitHubModalOpen) setIsGitHubModalOpen(false);
      else if (isInstallModalOpen) setIsInstallModalOpen(false);
      else if (sharingRecipe) setSharingRecipe(null);
    };
    window.addEventListener('keydown', handleGlobalEscape);
    return () => window.removeEventListener('keydown', handleGlobalEscape);
  }, [
    isAppShareModalOpen,
    isOfficialOpsModalOpen,
    isStoreAssetsModalOpen,
    isMultiPlatformModalOpen,
    isComplianceModalOpen,
    isCategoryManagerOpen,
    isProfileModalOpen,
    isAuthModalOpen,
    isGitHubModalOpen,
    isInstallModalOpen,
    sharingRecipe,
  ]);

  // Debounced auto-sync to GitHub (3s debounce, merges full master snapshot safely)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!githubConfig.autoSync || !githubConfig.token) return;

    const timer = window.setTimeout(() => {
      syncRecipesToGitHub(githubConfig, recipes)
        .then((res) => {
          if (res.success) {
            const updatedCfg = {
              ...githubConfig,
              lastSyncedAt: new Date().toLocaleString('zh-CN'),
              lastCommitSha: res.commitSha,
            };
            saveGitHubConfig(updatedCfg, currentUser);
            setGithubConfig(updatedCfg);
            setSyncToast(`已自动合并备份至 GitHub (${res.commitSha})`);
            setTimeout(() => setSyncToast(null), 3000);
          }
        })
        .catch(console.error);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [recipes, currentUser?.uid, githubConfig.autoSync, githubConfig.token, githubConfig.owner, githubConfig.repo, githubConfig.branch]);

  // Handle Save Recipe (with server-session re-verification for Official Chef + UGC safety filter + quota verification)
  const handleSaveRecipe = async (recipe: Recipe): Promise<boolean> => {
    if (isOfficialUser(currentUser) || recipe.ownerId === OFFICIAL_ACCOUNT_UID) {
      const valid = await verifyOfficialOperatorOrLogout();
      if (!valid) {
        setSyncToast(
          language === 'zh-CN'
            ? '官方运营会话已失效，已安全退出官方身份，请重新验证后再以官方身份发布'
            : 'Official operator session invalid; please re-authenticate'
        );
        setTimeout(() => setSyncToast(null), 5000);
        return false;
      }
    }

    let recipeToSave = recipe;
    let blockedReason: string | null = null;

    if (recipe.isPublic) {
      const textFields = [
        recipe.title,
        recipe.subtitle || '',
        recipe.cuisine || '',
        ...(recipe.tags || []),
        ...recipe.ingredients.map((i) => `${i.name} ${i.note || ''}`),
        ...recipe.steps.map((s) => `${s.title} ${s.description} ${s.tip || ''}`),
        recipe.review?.tastingNotes || '',
        recipe.review?.pitfallsAndLessons || ''
      ];
      const audit = auditUGCContentSafety(textFields);
      if (!audit.passed) {
        recipeToSave = { ...recipe, isPublic: false };
        blockedReason = (language === 'zh-CN' ? audit.reasonZh : audit.reasonEn) || '未通过内容安全检测';
      }
    }

    const { recipe: saved, persisted } = saveUserRecipeWithStatus(recipeToSave, currentUser);
    if (!persisted) {
      setSyncToast(
        language === 'zh-CN'
          ? '保存失败：浏览器本地文本空间 (localStorage) 已满！草稿未关闭，请先移除超大图文或导出备份。'
          : 'Save failed: localStorage quota exceeded! Your draft remains open—please export backup or trim large photos.'
      );
      setTimeout(() => setSyncToast(null), 6500);
      return false;
    }

    setRecipes(getUserRecipes(currentUser));
    setPublicRecipes(getPublicSquareRecipes());
    setIsEditorOpen(false);
    setEditingRecipe(null);
    if (selectedRecipe && selectedRecipe.id === recipe.id) {
      setSelectedRecipe(saved);
    }

    if (blockedReason) {
      setSyncToast(`${blockedReason}（已自动转为仅自己可见的私密手帐）`);
      setTimeout(() => setSyncToast(null), 5000);
    } else {
      setSyncToast(`菜谱《${saved.title}》已保存${saved.isPublic ? '并公开至食味广场' : '至私密手帐'}`);
      setTimeout(() => setSyncToast(null), 3000);
    }
    return true;
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
      const { persisted } = saveUserRecipeWithStatus(updated, currentUser);
      if (persisted) {
        setRecipes(getUserRecipes(currentUser));
        if (selectedRecipe?.id === id) {
          setSelectedRecipe(updated);
        }
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

  // Handle Batch Clone Official Curated Menu to Current User's Journal
  const handleCloneMenu = (menuRecipes: Recipe[], menuTitle: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const addedCount = cloneMenuToMyJournal(menuRecipes, currentUser);
    setRecipes(getUserRecipes(currentUser));
    if (addedCount > 0) {
      setSyncToast(`已将《${menuTitle}》共 ${addedCount} 道食谱整套收入您的私人手帐本！`);
    } else {
      setSyncToast(`《${menuTitle}》中的菜谱已在您的手帐本中，无需重复收录。`);
    }
    setTimeout(() => setSyncToast(null), 3800);
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

  // Handle Add Comment (with server-session re-verification for Official Chef + UGC safety filter)
  const handleAddComment = async (recipeId: string, content: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    if (isOfficialUser(currentUser)) {
      const valid = await verifyOfficialOperatorOrLogout();
      if (!valid) {
        setSyncToast(
          language === 'zh-CN'
            ? '官方运营会话已失效，已安全退出官方身份'
            : 'Official operator session invalid; signed out'
        );
        setTimeout(() => setSyncToast(null), 4500);
        return;
      }
    }
    const audit = auditUGCContentSafety([content]);
    if (!audit.passed) {
      setSyncToast((language === 'zh-CN' ? audit.reasonZh : audit.reasonEn) || '评论包含敏感违禁词，已被拦截');
      setTimeout(() => setSyncToast(null), 4500);
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
    downloadFullBackupJson(currentUser, { includeMediaBlobs: false })
      .then(({ recipeCount, cookingLogCount }) => {
        setSyncToast(
          language === 'zh-CN'
            ? `已导出轻量全量数据（${recipeCount}篇食谱、${cookingLogCount}条日历打卡；如需打包离线视频请前往备份页勾选）`
            : `Exported personal archive (${recipeCount} recipes, ${cookingLogCount} logs)`
        );
        setTimeout(() => setSyncToast(null), 4500);
      })
      .catch((err) => {
        console.error('Export failed', err);
      });
  };

  const handleOpenLegalPage = (section: PublicPageSection) => {
    setPublicLegalPage(section);
    try {
      window.history.pushState({}, '', `${window.location.pathname}?page=${section}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      // ignore history errors in restricted contexts
    }
  };

  const handleCloseLegalPage = () => {
    setPublicLegalPage(null);
    try {
      window.history.pushState({}, '', window.location.pathname);
    } catch {
      // ignore
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const uidToPurge = currentUser?.uid || 'guest';
      await purgeAllUserDataCompletely(uidToPurge);
      deleteCurrentUserAccount(currentUser);
      setCurrentUser(null);
      setRecipes(getUserRecipes(null));
      setPublicRecipes(getPublicSquareRecipes());
      setSelectedRecipe(null);
      setSyncToast(
        language === 'zh-CN'
          ? '您的账号及名下全部食谱、日历、分类、收藏与离线视频已彻底清除'
          : 'Your account and all recipes, logs, categories, bookmarks, and offline videos have been purged'
      );
      setTimeout(() => setSyncToast(null), 4500);
    } catch (e) {
      console.error('Account deletion error', e);
    }
  };

  if (publicLegalPage) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center text-xs text-[#7A7268]">
            正在加载页面...
          </div>
        }
      >
        <PublicLegalSupportPage
          initialSection={publicLegalPage}
          currentUser={currentUser}
          onBackToApp={handleCloseLegalPage}
          onExportAllData={handleExportAllData}
          onDeleteAccount={handleDeleteAccount}
        />
      </Suspense>
    );
  }

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
        <Suspense
          fallback={
            <div className="max-w-4xl mx-auto px-6 py-16 text-center text-xs text-[#7A7268]">
              正在翻开手帐页...
            </div>
          }
        >
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
            currentUser={currentUser}
            onBack={() => setSelectedRecipe(null)}
            onEdit={(rec) => {
              setEditingRecipe(rec);
              setIsEditorOpen(true);
            }}
            onDelete={handleDeleteRecipe}
            onShare={(rec) => setSharingRecipe(rec)}
            onUpdateRecipe={async (updated) => {
              const ok = await handleSaveRecipe(updated);
              if (ok) {
                setSelectedRecipe(updated);
              }
            }}
            onStartTimer={handleStartTimer}
            onStartCooking={() => {
              setSelectedRecipe(null);
              setActiveView('pantry');
            }}
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
                        {t('journal.heroTag', '私房手作 · 烟火记录')}
                      </span>
                      {currentUser ? (
                        <span className="text-[11px] text-[#5A5248] bg-[#FAF7F2] border border-[#EADBCE] px-2 py-0.5 rounded-full">
                          {t('journal.chef', '专属大厨：')}{currentUser.displayName}
                        </span>
                      ) : (
                        <button
                          onClick={() => setIsAuthModalOpen(true)}
                          className="text-[11px] text-[#C85A32] hover:underline"
                        >
                          {t('journal.loginPrompt', '(点击登录切换本机多用户手帐视图)')}
                        </button>
                      )}
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-bold font-journal-title text-[#2C2723] leading-tight mb-3">
                      {t('journal.heroTitle', '今日下厨，把日子过得热气腾腾')}
                    </h1>
                    <p className="text-xs sm:text-sm text-[#7A7268] leading-relaxed font-serif">
                      {t('journal.heroDesc', '详细记录食材用量、关键火候时序与心得复盘。每一张手帐页，都是留给餐桌的温柔回忆。')}
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
                        placeholder={t('journal.searchPlaceholder', '模糊与近义词搜索菜名、食材 (如：肉、虾、抹茶、生抽)...')}
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
                      title={language === 'zh-CN' ? "自定义添加一级大类或二级细分名录" : "Add custom category or subcategory"}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{language === 'zh-CN' ? '自定义名录' : 'Custom Categories'}</span>
                    </button>
                  </div>

                  {/* Secondary Subcategory Filter Row */}
                  {selectedCategory !== 'all' ? (
                    <div className="mt-3 pt-3 border-t border-[#F0E6DC] flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
                      <span className="text-[11px] font-semibold text-[#7A7268] shrink-0 flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-[#C85A32]" />
                        <span>{getCategoryLabel(selectedCategory)} {language === 'zh-CN' ? '细分：' : 'Subcategories:'}</span>
                      </span>
                      <button
                        onClick={() => setSelectedSubCategory('all')}
                        className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium transition-colors ${
                          selectedSubCategory === 'all'
                            ? 'bg-[#C85A32] text-white shadow-2xs'
                            : 'bg-[#FAF7F2] text-[#7A7268] hover:text-[#2C2723] border border-[#EADBCE]'
                        }`}
                      >
                        {t('category.allSub', '全部细分')}
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
                            <span>{getSubcategoryLabel(sub.id)}</span>
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
                        title={language === 'zh-CN' ? "为当前分类添加细分名录" : "Add subcategory for current category"}
                      >
                        <Plus className="w-3 h-3" />
                        <span>{language === 'zh-CN' ? '添加细分' : 'Add Subcategory'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 pt-3 border-t border-[#F0E6DC] flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
                      <span className="text-[11px] font-semibold text-[#7A7268] shrink-0 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
                        <span>{t('square.dessertQuickAccess', '甜点细分直达：')}</span>
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
                          <span>{getSubcategoryLabel(sub.id)}</span>
                        </button>
                      ))}

                      {/* Add Subcategory shortcut */}
                      <button
                        onClick={() => {
                          setCategoryManagerParent('烘焙甜点');
                          setIsCategoryManagerOpen(true);
                        }}
                        className="px-2 py-1 rounded-md whitespace-nowrap text-[11px] font-medium text-[#C85A32] hover:bg-[#FAF3EC] border border-dashed border-[#C85A32]/40 transition-colors flex items-center gap-1 shrink-0 ml-1"
                        title={language === 'zh-CN' ? "为烘焙甜点添加细分名录" : "Add subcategory for Baking & Desserts"}
                      >
                        <Plus className="w-3 h-3" />
                        <span>{language === 'zh-CN' ? '添加细分' : 'Add Subcategory'}</span>
                      </button>
                    </div>
                  )}

                </div>

                {/* Recipe Cards Grid */}
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="text-xs text-[#7A7268]">
                    {language === 'zh-CN' ? (
                      <>我的手帐收录 <span className="font-mono font-semibold text-[#2C2723]">{filteredRecipes.length}</span> 道私房菜谱</>
                    ) : (
                      <><span className="font-mono font-semibold text-[#2C2723]">{filteredRecipes.length}</span> recipes in your personal journal</>
                    )}
                    {selectedCategory !== 'all' && ` · ${getCategoryLabel(selectedCategory)}`}
                    {selectedSubCategory !== 'all' && ` · ${getSubcategoryLabel(selectedSubCategory)}`}
                  </div>
                </div>

                {filteredRecipes.length === 0 ? (
                  <div className="bg-white border border-dashed border-[#EADBCE] rounded-2xl p-12 text-center max-w-md mx-auto">
                    <BookOpen className="w-10 h-10 text-[#C85A32]/40 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-[#2C2723] font-journal-title mb-1">
                      {language === 'zh-CN' ? '手帐本空空如也，来记一笔吧！' : 'Your journal is empty, start creating!'}
                    </h3>
                    <p className="text-xs text-[#7A7268] mb-4">
                      {language === 'zh-CN' 
                        ? '您可以点击下方按钮录入第一道私房菜，或者前往食味广场将厨友分享的好菜一键收录。' 
                        : 'Create your first signature recipe or browse the Culinary Square to save community dishes.'}
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
                        <span>{language === 'zh-CN' ? '新建私房食谱' : 'New Recipe'}</span>
                      </button>
                      <button
                        onClick={() => setActiveView('square')}
                        className="px-4 py-2 bg-white border border-[#EADBCE] text-[#2C2723] text-xs font-semibold rounded-lg hover:bg-[#FAF7F2] transition-colors inline-flex items-center gap-1.5"
                      >
                        <Sparkles className="w-4 h-4 text-[#C85A32]" />
                        <span>{language === 'zh-CN' ? '浏览广场灵感' : 'Explore Community'}</span>
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
                onCloneMenu={handleCloneMenu}
                onToggleLike={handleToggleLike}
                onAddComment={handleAddComment}
                onShareRecipe={(rec) => setSharingRecipe(rec)}
                onRequireLogin={() => setIsAuthModalOpen(true)}
                onOpenOfficialOps={() => setIsOfficialOpsModalOpen(true)}
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
                publicRecipes={publicRecipes}
                currentUser={currentUser}
                onOpenRecipe={(rec) => setSelectedRecipe(rec)}
                onEditRecipe={(rec) => {
                  setEditingRecipe(rec);
                  setIsEditorOpen(true);
                }}
                onSaveRecipe={handleSaveRecipe}
                onCloneRecipe={handleCloneRecipe}
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
                currentUser={currentUser}
                onReloadRecipes={(recs) => {
                  setRecipes(recs);
                  setPublicRecipes(getPublicSquareRecipes());
                }}
                onOpenGitHub={() => setIsGitHubModalOpen(true)}
                onOpenInstall={() => setIsInstallModalOpen(true)}
              />
            )}
          </>
        )}
        </Suspense>
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

      {/* Lazy-Loaded Modals Wrapped in Suspense */}
      <Suspense fallback={null}>
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
      </Suspense>

      {/* PWA App Install Modal */}
      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* GitHub Sync Modal */}
      <GitHubSyncModal
        isOpen={isGitHubModalOpen}
        recipes={recipes}
        currentUser={currentUser}
        onClose={() => setIsGitHubModalOpen(false)}
        onConfigUpdated={(cfg) => setGithubConfig(cfg)}
      />

      {/* Compliant First-Party Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onOpenLegalPage={(sec) => handleOpenLegalPage(sec)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setRecipes(getUserRecipes(user));
          setPublicRecipes(getPublicSquareRecipes());
        }}
      />

      {/* User Profile Modal */}
      <Suspense fallback={null}>
        {currentUser && isProfileModalOpen && (
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
            onDeleteAccount={handleDeleteAccount}
            onExportAllData={handleExportAllData}
            onOpenLegalPage={(sec) => handleOpenLegalPage(sec)}
            onNavigateToContest={() => {
              setActiveView('contest');
              setSelectedRecipe(null);
            }}
            onNavigateToNewRecipe={() => {
              setEditingRecipe(null);
              setIsEditorOpen(true);
            }}
            onNavigateToCalendar={() => {
              setActiveView('calendar');
              setSelectedRecipe(null);
            }}
            onNavigateToSquare={() => {
              setActiveView('square');
              setSelectedRecipe(null);
            }}
          />
        )}
      </Suspense>

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
        onOpenLegalPage={(sec) => handleOpenLegalPage(sec)}
        onOpenStoreAssets={() => setIsStoreAssetsModalOpen(true)}
      />

      <Suspense fallback={null}>
        {/* Compliance Center Modal */}
        {isComplianceModalOpen && (
          <ComplianceModal
            isOpen={isComplianceModalOpen}
            initialTab={complianceTab}
            onClose={() => setIsComplianceModalOpen(false)}
            currentUser={currentUser}
            onExportAllData={handleExportAllData}
            onDeleteAccount={handleDeleteAccount}
            onOpenLegalPage={(sec) => handleOpenLegalPage(sec)}
          />
        )}

        {/* Multi-Platform Guide Modal */}
        {isMultiPlatformModalOpen && (
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
            onOpenStoreAssets={() => setIsStoreAssetsModalOpen(true)}
            onOpenLegalPage={(sec) => handleOpenLegalPage(sec)}
          />
        )}

        {/* App Store Icons & Official Screenshots Exporter Studio */}
        {isStoreAssetsModalOpen && (
          <AppStoreAssetsModal
            isOpen={isStoreAssetsModalOpen}
            onClose={() => setIsStoreAssetsModalOpen(false)}
          />
        )}

        {/* Official Account Editorial Operations & UGC Moderation Console */}
        {isOfficialOpsModalOpen && (
          <OfficialOpsModal
            isOpen={isOfficialOpsModalOpen}
            onClose={() => setIsOfficialOpsModalOpen(false)}
            currentUser={currentUser}
            publicRecipes={publicRecipes}
            onSwitchToOfficialSuccess={(officialUser) => {
              setCurrentUser(officialUser);
              setRecipes(getUserRecipes(officialUser));
              setPublicRecipes(getPublicSquareRecipes());
            }}
            onCreateOfficialRecipe={() => {
              setEditingRecipe(null);
              setIsEditorOpen(true);
            }}
            onMenusUpdated={() => {
              setPublicRecipes(getPublicSquareRecipes());
            }}
          />
        )}

        {/* App WeChat / QR Code Share & Scrapbook Poster Modal */}
        {isAppShareModalOpen && (
          <AppShareModal
            isOpen={isAppShareModalOpen}
            onClose={() => setIsAppShareModalOpen(false)}
          />
        )}
      </Suspense>
    </div>
  );
}
