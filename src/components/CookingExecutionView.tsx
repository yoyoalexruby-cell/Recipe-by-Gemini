import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Recipe, Ingredient, CookingStep } from '../types/recipe';
import { 
  CheckCircle2, Circle, Copy, Plus, Trash2, Check, 
  Sparkles, ExternalLink, ChefHat, Clock, Flame, 
  Timer, ShoppingCart, ArrowRight, RotateCcw, Calendar,
  Utensils, BookOpen, AlertCircle, Bell, Settings, ShoppingBag,
  Volume2, Mic, Play, Pause, VolumeX, SkipForward, SkipBack,
  Download, Edit3, Bookmark, GitFork, FileText, Save
} from 'lucide-react';
import { VideoPlayer } from './VideoPlayer';
import { MarkCookingModal } from './MarkCookingModal';
import { markRecipeCookedOnDate } from '../utils/cookingLogStorage';
import { ShoppingListModal } from './ShoppingListModal';
import { QuickPurchaseModal } from './QuickPurchaseModal';
import { CookingVoiceAssistant, CookingVoiceAssistantHandle } from './CookingVoiceAssistant';
import { PurchaseItem } from '../utils/shoppingPlatforms';
import { UserProfile } from '../types/auth';
import { RecipeImportModal } from './RecipeImportModal';
import { cloneRecipeToMyJournal } from '../utils/multiUserStorage';
import { useI18n } from '../i18n/context';

interface CookingExecutionViewProps {
  recipes: Recipe[];
  publicRecipes?: Recipe[];
  onOpenRecipe: (recipe: Recipe) => void;
  onStartTimer?: (minutes: number, label: string) => void;
  currentUser?: UserProfile | null;
  onEditRecipe?: (recipe: Recipe) => void;
  onSaveRecipe?: (recipe: Recipe) => void;
  onCloneRecipe?: (recipe: Recipe) => void;
}

export const CookingExecutionView: React.FC<CookingExecutionViewProps> = ({
  recipes,
  publicRecipes = [],
  onOpenRecipe,
  onStartTimer,
  currentUser,
  onEditRecipe,
  onSaveRecipe,
  onCloneRecipe
}) => {
  const { language } = useI18n();

  // Extra recipes imported from the Food Square during this session
  const [extraImportedRecipes, setExtraImportedRecipes] = useState<Recipe[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [showTweakPanel, setShowTweakPanel] = useState(false);
  const [workbenchTweakNotes, setWorkbenchTweakNotes] = useState('');
  const [tweakSavedToast, setTweakSavedToast] = useState<string | null>(null);

  // Combined list of workbench recipes (user handbooks + any imported community dishes)
  const allWorkbenchRecipes = useMemo(() => {
    const map = new Map<string, Recipe>();
    recipes.forEach((r) => map.set(r.id, r));
    extraImportedRecipes.forEach((r) => {
      if (!map.has(r.id)) map.set(r.id, r);
    });
    return Array.from(map.values());
  }, [recipes, extraImportedRecipes]);

  // If no recipes, handle gracefully
  const hasRecipes = allWorkbenchRecipes.length > 0;
  const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  // Selected recipe to cook right now
  const [activeRecipeId, setActiveRecipeId] = useState<string>(
    hasRecipes ? allWorkbenchRecipes[0].id : ''
  );
  
  // Servings multiplier
  const activeRecipe = allWorkbenchRecipes.find(r => r.id === activeRecipeId) || allWorkbenchRecipes[0] || null;
  const [servings, setServings] = useState<number>(activeRecipe?.baseServings || 2);

  // If activeRecipeId changes or is not in list, auto-select
  useEffect(() => {
    if (!activeRecipeId && allWorkbenchRecipes.length > 0) {
      setActiveRecipeId(allWorkbenchRecipes[0].id);
      setServings(allWorkbenchRecipes[0].baseServings || 2);
    }
  }, [activeRecipeId, allWorkbenchRecipes]);

  // When active recipe changes, sync baseServings and reset voice step
  const handleSelectRecipe = (id: string) => {
    setActiveRecipeId(id);
    setCurrentSpokenStepIndex(0);
    const found = allWorkbenchRecipes.find(r => r.id === id);
    if (found) {
      setServings(found.baseServings || 2);
    }
  };

  // Import handler from RecipeImportModal
  const handleSelectImportedRecipe = (selected: Recipe) => {
    if (!allWorkbenchRecipes.some((r) => r.id === selected.id)) {
      setExtraImportedRecipes((prev) => [selected, ...prev]);
    }
    setActiveRecipeId(selected.id);
    setCurrentSpokenStepIndex(0);
    setServings(selected.baseServings || 2);
    setCheckedIngredients({});
    setCheckedSteps({});
    setCompletionToast(`已将《${selected.title}》导入下厨制作工作台！`);
    setTimeout(() => setCompletionToast(null), 3000);
  };

  // Import & Edit handler
  const handleSelectAndEditRecipe = (selected: Recipe) => {
    handleSelectImportedRecipe(selected);
    handleTriggerEditRecipe(selected);
  };

  // Trigger edit for a recipe
  const handleTriggerEditRecipe = (target: Recipe) => {
    const isOwner = currentUser && target.ownerId === currentUser.uid;
    if (isOwner) {
      if (onEditRecipe) {
        onEditRecipe(target);
      }
    } else {
      // It's from Food Square / someone else: clone to user's journal first
      if (currentUser) {
        const cloned = cloneRecipeToMyJournal(target, currentUser);
        setExtraImportedRecipes((prev) => [cloned, ...prev]);
        setActiveRecipeId(cloned.id);
        if (onEditRecipe) {
          onEditRecipe(cloned);
        }
        setCompletionToast(`已为您生成《${target.title}》的专属复刻副本，您可以自由增减调料与调整步骤！`);
        setTimeout(() => setCompletionToast(null), 3500);
      } else {
        if (onEditRecipe) {
          onEditRecipe(target);
        }
      }
    }
  };

  // Save in-place workbench notes & tweaks to the recipe
  const handleSaveWorkbenchTweaks = () => {
    if (!activeRecipe || !onSaveRecipe) return;
    const isOwner = currentUser && activeRecipe.ownerId === currentUser.uid;
    const targetToSave: Recipe = isOwner ? activeRecipe : (
      currentUser ? cloneRecipeToMyJournal(activeRecipe, currentUser) : activeRecipe
    );

    const updatedRecipe: Recipe = {
      ...targetToSave,
      baseServings: servings,
      review: {
        ...targetToSave.review,
        tastingNotes: workbenchTweakNotes.trim()
          ? (targetToSave.review.tastingNotes ? `${targetToSave.review.tastingNotes}\n\n【下厨备忘】：${workbenchTweakNotes.trim()}` : `【下厨备忘】：${workbenchTweakNotes.trim()}`)
          : targetToSave.review.tastingNotes
      }
    };

    onSaveRecipe(updatedRecipe);
    setTweakSavedToast('已将本次下厨备忘与人份设置保存至手帐！');
    setTimeout(() => setTweakSavedToast(null), 3000);
  };

  // Checked state for ingredients
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  
  // Checked state for cooking steps
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});

  // Active step for voice read-aloud and voice navigation
  const [currentSpokenStepIndex, setCurrentSpokenStepIndex] = useState<number>(0);
  const stepCardRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Smooth scroll to active step when spoken step changes
  useEffect(() => {
    if (stepCardRefs.current[currentSpokenStepIndex]) {
      stepCardRefs.current[currentSpokenStepIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [currentSpokenStepIndex]);

  // Extra pantry items
  const [extraItems, setExtraItems] = useState<Array<{ id: string; name: string; amount: string; checked: boolean }>>([
    { id: 'ext-1', name: '厨房吸油纸', amount: '1卷', checked: false }
  ]);
  const [newExtraName, setNewExtraName] = useState('');
  const [newExtraAmount, setNewExtraAmount] = useState('');

  // Shopping platform choice for hyperlinks
  const [shoppingPlatform, setShoppingPlatform] = useState<'jd' | 'tmall' | 'box'>('jd');

  // Mark cooking modal state
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [completionToast, setCompletionToast] = useState<string | null>(null);

  // Active Timer Step Association & Push State
  const [activeTimerStepId, setActiveTimerStepId] = useState<string | null>(null);
  const [timerToast, setTimerToast] = useState<string | null>(null);

  // Voice Guidance (Web Speech API) integration
  const voiceAssistantRef = useRef<CookingVoiceAssistantHandle | null>(null);
  const voiceAssistantPanelRef = useRef<HTMLDivElement | null>(null);
  const [voiceState, setVoiceState] = useState<{ isSpeaking: boolean; isPaused: boolean; isListening: boolean }>({
    isSpeaking: false,
    isPaused: false,
    isListening: false
  });

  const handleToggleVoiceGuidance = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('抱歉，当前浏览器环境暂不支持 Web Speech API 语音朗读，建议使用 Chrome / Edge / Safari 浏览器体验下厨免动手语音引导！');
      return;
    }
    if (!activeRecipe || !activeRecipe.steps || activeRecipe.steps.length === 0) {
      alert('当前菜谱暂无制作步骤，无法启动语音引导。');
      return;
    }
    if (voiceState.isSpeaking) {
      voiceAssistantRef.current?.pauseGuidance();
    } else if (voiceState.isPaused) {
      voiceAssistantRef.current?.resumeGuidance();
    } else {
      voiceAssistantRef.current?.startGuidance(currentSpokenStepIndex);
      if (stepCardRefs.current[currentSpokenStepIndex]) {
        stepCardRefs.current[currentSpokenStepIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (voiceAssistantPanelRef.current) {
        voiceAssistantPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  const handleStartStepTimer = (st: CookingStep, idx: number) => {
    const duration = st.durationMinutes || 5;
    const label = st.timerLabel || `${activeRecipe?.title || '菜谱'} · 第${idx + 1}步：${st.title}`;
    if (onStartTimer) {
      onStartTimer(duration, label);
      setActiveTimerStepId(st.id);
      setTimerToast(`⏱️ 已将第 ${idx + 1} 步「${st.title}」的 ${duration} 分钟定时推送至悬浮计时器！`);
      setTimeout(() => setTimerToast(null), 3500);
    }
  };

  // Scale ingredient amount based on servings
  const multiplier = activeRecipe ? servings / (activeRecipe.baseServings || 1) : 1;
  const formatScaledAmount = (ing: Ingredient) => {
    if (typeof ing.amount === 'number') {
      const scaled = ing.amount * multiplier;
      if (scaled >= 10) return Math.round(scaled);
      return Number(scaled.toFixed(1));
    }
    return ing.amount;
  };

  // Convert current recipe ingredients and extra items to PurchaseItems
  const executionPurchaseItems: PurchaseItem[] = useMemo(() => {
    if (!activeRecipe) return [];
    const list: PurchaseItem[] = activeRecipe.ingredients.map((ing) => ({
      id: ing.id,
      name: ing.name,
      amount: formatScaledAmount(ing),
      unit: ing.unit,
      category: ing.category,
      checked: Boolean(checkedIngredients[ing.id]),
      recipeTitle: activeRecipe.title
    }));
    extraItems.forEach((e) => {
      list.push({
        id: e.id,
        name: e.name,
        amount: e.amount,
        unit: '',
        category: 'extra',
        checked: Boolean(e.checked),
        recipeTitle: '加购杂品'
      });
    });
    return list;
  }, [activeRecipe, checkedIngredients, extraItems, multiplier]);

  // Generate safe shopping search URL for an ingredient
  const getShoppingUrl = (ingredientName: string) => {
    // Clean up packaging words like (切块), (洗净)
    const cleanName = ingredientName.replace(/\(.*?\)|（.*?）/g, '').trim();
    if (shoppingPlatform === 'jd') {
      return `https://search.jd.com/Search?keyword=${encodeURIComponent(cleanName + ' 生鲜')}&enc=utf-8`;
    }
    if (shoppingPlatform === 'box') {
      return `https://search.jd.com/Search?keyword=${encodeURIComponent(cleanName + ' 盒马')}&enc=utf-8`;
    }
    return `https://s.taobao.com/search?q=${encodeURIComponent(cleanName + ' 生鲜超市')}`;
  };

  // Toggle checks
  const toggleIngredientCheck = (id: string) => {
    setCheckedIngredients(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleStepCheck = (id: string, forceState?: boolean) => {
    setCheckedSteps(prev => ({ 
      ...prev, 
      [id]: forceState !== undefined ? forceState : !prev[id] 
    }));
  };

  const toggleExtraCheck = (id: string) => {
    setExtraItems(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const removeExtraItem = (id: string) => {
    setExtraItems(prev => prev.filter(item => item.id !== id));
  };

  const handleAddExtra = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExtraName.trim()) return;
    setExtraItems(prev => [
      ...prev,
      {
        id: `ext-${Date.now()}`,
        name: newExtraName.trim(),
        amount: newExtraAmount.trim() || '适量',
        checked: false
      }
    ]);
    setNewExtraName('');
    setNewExtraAmount('');
  };

  const handleResetChecklist = () => {
    if (window.confirm('确定要重置当前菜谱的所有备料和制作勾选进度吗？')) {
      setCheckedIngredients({});
      setCheckedSteps({});
      setCurrentSpokenStepIndex(0);
      setExtraItems(prev => prev.map(e => ({ ...e, checked: false })));
    }
  };

  // Stats
  const totalIngredients = (activeRecipe?.ingredients.length || 0) + extraItems.length;
  const completedIngredients = 
    (activeRecipe?.ingredients.filter(i => checkedIngredients[i.id]).length || 0) +
    extraItems.filter(e => e.checked).length;

  const totalSteps = activeRecipe?.steps.length || 0;
  const completedSteps = activeRecipe?.steps.filter(s => checkedSteps[s.id]).length || 0;

  const isAllIngredientsReady = totalIngredients > 0 && completedIngredients === totalIngredients;
  const isAllStepsFinished = totalSteps > 0 && completedSteps === totalSteps;

  const totalProgressPercent = (totalIngredients + totalSteps) > 0
    ? Math.round(((completedIngredients + completedSteps) / (totalIngredients + totalSteps)) * 100)
    : 0;

  // Group ingredients
  const mainIngredients = activeRecipe?.ingredients.filter(i => i.category === 'main') || [];
  const seasoningIngredients = activeRecipe?.ingredients.filter(i => i.category === 'seasoning') || [];
  const garnishIngredients = activeRecipe?.ingredients.filter(i => i.category === 'garnish') || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6 animate-fade-in">
      
      {/* 1. Header Masthead Banner */}
      <div className="bg-white border border-[#EADBCE] rounded-2xl p-6 sm:p-8 paper-shadow bg-notebook-dots relative overflow-hidden">
        <div className="absolute top-0 right-10 transform -translate-y-1/2 pointer-events-none">
          <div className="washi-tape px-6 py-1 bg-[#5F7A4D] text-emerald-50 text-xs font-mono tracking-wider uppercase">
            COOKING WORKBENCH
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-serif tracking-widest text-[#C85A32] uppercase">
                下厨制作工作台 · 备料与时序清关
              </span>
              <span className="text-[11px] text-[#5F7A4D] bg-[#5F7A4D]/10 px-2 py-0.5 rounded-full font-semibold">
                制作中逐步打勾 · 采购超链直达
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-journal-title text-[#2C2723] tracking-tight">
              食材备齐、火候就位，一步一步烹出好滋味
            </h1>
            <p className="text-xs sm:text-sm text-[#7A7268] mt-1 leading-relaxed">
              选择你想制作的私房食谱，根据食材清单与烹饪步骤逐步打勾核对；食材支持一键直达生鲜采购页面，助你轻松备料不慌乱。
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0 flex-wrap">
            {activeRecipe && activeRecipe.steps && activeRecipe.steps.length > 0 && (
              <button
                type="button"
                onClick={handleToggleVoiceGuidance}
                className={`min-h-[44px] px-3.5 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-2 shadow-2xs ${
                  voiceState.isSpeaking
                    ? 'bg-[#C85A32] text-white border-[#A04523] animate-pulse ring-2 ring-[#C85A32]/30'
                    : voiceState.isPaused
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300/80 hover:border-emerald-400'
                }`}
                title={voiceState.isSpeaking ? '暂停语音引导' : voiceState.isPaused ? '继续语音引导' : '启动 Web Speech API 步骤语音自动朗读'}
              >
                {voiceState.isSpeaking ? (
                  <>
                    <Pause className="w-4 h-4 shrink-0" />
                    <span>播报中 · 第 {currentSpokenStepIndex + 1} 步</span>
                  </>
                ) : voiceState.isPaused ? (
                  <>
                    <Play className="w-4 h-4 shrink-0" />
                    <span>继续语音引导</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 shrink-0 text-[#5F7A4D]" />
                    <span>语音引导 (免动手听步骤)</span>
                  </>
                )}
              </button>
            )}

            {/* Import from My Handbooks or Square Saved */}
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="min-h-[44px] px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#C85A32] to-[#B34C26] hover:from-[#B34C26] hover:to-[#9E3F1A] rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-98"
              title="导入自己的私房手帐或食味广场收藏的他人家常菜"
            >
              <Download className="w-4 h-4" />
              <span>{language === 'zh-CN' ? '导入手帐制作' : 'Import Recipe'}</span>
            </button>

            {/* Edit active recipe */}
            {activeRecipe && (
              <button
                type="button"
                onClick={() => handleTriggerEditRecipe(activeRecipe)}
                className="min-h-[44px] px-3.5 py-2 text-xs font-bold text-[#C85A32] bg-[#FAF3EC] hover:bg-[#C85A32] hover:text-white border border-[#C85A32]/40 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs active:scale-98"
                title={
                  activeRecipe.ownerId === currentUser?.uid 
                    ? '进入手帐完整编辑界面，修改食材、步骤与火候' 
                    : '复制为我的专属手帐并自由修改定制'
                }
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>
                  {activeRecipe.ownerId === currentUser?.uid 
                    ? (language === 'zh-CN' ? '编辑此手帐' : 'Edit Recipe')
                    : (language === 'zh-CN' ? '定制复刻此菜' : 'Fork & Edit')}
                </span>
              </button>
            )}

            <button
              onClick={handleResetChecklist}
              className="min-h-[44px] px-3 py-2 text-xs font-medium text-[#7A7268] hover:text-[#2C2723] bg-[#FAF7F2] hover:bg-[#EADBCE]/50 border border-[#EADBCE] rounded-xl transition-colors flex items-center gap-1.5"
              title="重置当前进度"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重置打勾</span>
            </button>
            {activeRecipe && (
              <button
                onClick={() => onOpenRecipe(activeRecipe)}
                className="min-h-[44px] px-3.5 py-2 text-xs font-semibold text-[#5A5248] bg-white hover:bg-[#FAF7F2] border border-[#EADBCE] rounded-xl transition-all flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>查看完整食谱</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-6 pt-5 border-t border-[#F0E6DC]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2 mb-2">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-[#2C2723]">制作综合进度：</span>
              <span className="text-[#5A5248]">
                备料 <strong className="font-mono text-[#C85A32]">{completedIngredients}</strong>/{totalIngredients}
              </span>
              <span aria-hidden="true" className="text-[#EADBCE]">·</span>
              <span className="text-[#5A5248]">
                步骤 <strong className="font-mono text-[#5F7A4D]">{completedSteps}</strong>/{totalSteps}
              </span>
            </div>
            <div className="text-xs font-bold text-[#C85A32] font-mono">
              {totalProgressPercent}% 已完成
            </div>
          </div>

          <div className="w-full h-2.5 bg-[#FAF7F2] rounded-full overflow-hidden border border-[#EADBCE]">
            <div 
              className="h-full bg-gradient-to-r from-[#C85A32] to-[#5F7A4D] transition-all duration-300 rounded-full"
              style={{ width: `${totalProgressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Recipe Selector Strip & Portion Scale */}
      <div className="bg-white border border-[#EADBCE] rounded-xl p-4 paper-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Horizontal Recipe Chips Selector */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <label className="block text-[11px] font-semibold text-[#7A7268]">
              {language === 'zh-CN' ? '工作台当前制作中的菜谱：' : 'Active Recipe in Workbench:'}
            </label>
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="text-xs font-bold text-[#C85A32] hover:text-[#B34C26] inline-flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'zh-CN' ? '导入私房或广场收藏' : 'Import Recipe'}</span>
            </button>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 bg-[#FAF3EC] text-[#C85A32] hover:bg-[#C85A32] hover:text-white border border-[#C85A32]/40 shrink-0"
              title="从我的私房手帐或广场收藏中导入"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'zh-CN' ? '导入新手帐' : 'Import'}</span>
            </button>

            {allWorkbenchRecipes.map((r) => {
              const isSelected = r.id === activeRecipeId;
              return (
                <button
                  key={r.id}
                  onClick={() => handleSelectRecipe(r.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#C85A32] text-white shadow-2xs'
                      : 'bg-[#FAF7F2] text-[#5A5248] hover:bg-white border border-[#EADBCE]'
                  }`}
                >
                  {r.originalSource && (
                    <GitFork className="w-3 h-3 text-amber-300 shrink-0" />
                  )}
                  <span>{r.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Portions & Shopping platform controls */}
        <div className="flex items-center gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#F0E6DC]">
          {/* Servings */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#7A7268]">用餐人数：</span>
            <div className="flex items-center border border-[#EADBCE] rounded-lg overflow-hidden bg-[#FAF7F2]">
              <button
                onClick={() => setServings(Math.max(1, servings - 1))}
                className="px-2 py-1 text-xs hover:bg-white text-[#2C2723]"
              >
                -
              </button>
              <span className="px-2 py-1 text-xs font-bold font-mono text-[#C85A32] bg-white min-w-[32px] text-center">
                {servings}人份
              </span>
              <button
                onClick={() => setServings(servings + 1)}
                className="px-2 py-1 text-xs hover:bg-white text-[#2C2723]"
              >
                +
              </button>
            </div>
          </div>

          {/* Shopping Platform choice */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#7A7268] text-[11px]">购物平台：</span>
            <select
              value={shoppingPlatform}
              onChange={(e) => setShoppingPlatform(e.target.value as any)}
              className="px-2 py-1 text-xs bg-[#FAF7F2] border border-[#EADBCE] rounded-lg focus:outline-hidden text-[#2C2723]"
            >
              <option value="jd">京东生鲜</option>
              <option value="box">盒马鲜生</option>
              <option value="tmall">淘宝/天猫超市</option>
            </select>
          </div>
        </div>

      </div>

      {/* 2.5 Active Recipe Focus Banner & In-Place Tweaks */}
      {activeRecipe ? (
        <div className="bg-white border border-[#EADBCE] rounded-2xl p-4 sm:p-5 paper-shadow space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-[#FAF7F2] border border-[#EADBCE] shrink-0">
                {activeRecipe.coverImage ? (
                  <img src={activeRecipe.coverImage} alt={activeRecipe.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🍲</div>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FAF7F2] border border-[#EADBCE] text-[#7A7268]">
                    {activeRecipe.category}
                  </span>
                  {activeRecipe.subCategory && (
                    <span className="text-[10px] font-semibold text-[#C85A32]">
                      {activeRecipe.subCategory}
                    </span>
                  )}
                  {activeRecipe.originalSource ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#5F7A4D]/10 text-[#5F7A4D] font-bold flex items-center gap-1 border border-[#5F7A4D]/20">
                      <GitFork className="w-3 h-3" />
                      <span>{language === 'zh-CN' ? `来自 @${activeRecipe.originalSource.authorName} 的私房菜` : `From @${activeRecipe.originalSource.authorName}`}</span>
                    </span>
                  ) : activeRecipe.ownerId && activeRecipe.ownerId !== currentUser?.uid && activeRecipe.authorName ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center gap-1 border border-amber-300/40">
                      <span>{language === 'zh-CN' ? `广场作者 @${activeRecipe.authorName}` : `@${activeRecipe.authorName}`}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold flex items-center gap-1 border border-emerald-200">
                      <BookOpen className="w-3 h-3" />
                      <span>{language === 'zh-CN' ? '我的原创手帐' : 'My Journal'}</span>
                    </span>
                  )}
                </div>

                <h2 className="text-lg sm:text-xl font-bold font-journal-title text-[#2C2723]">
                  {activeRecipe.title}
                </h2>
                <p className="text-xs text-[#7A7268] font-serif">
                  {activeRecipe.subtitle || `${activeRecipe.ingredients.length} 味食材 · ${activeRecipe.steps.length} 步火候 · 预计耗时 ${activeRecipe.cookTimeMinutes} 分钟`}
                </p>
              </div>
            </div>

            {/* Quick Workbench Action Buttons */}
            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => setShowTweakPanel(!showTweakPanel)}
                className={`min-h-[40px] px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 shadow-2xs ${
                  showTweakPanel
                    ? 'bg-[#2C2723] text-white border-[#2C2723]'
                    : 'bg-[#FAF7F2] hover:bg-white text-[#5A5248] border-[#EADBCE]'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>{showTweakPanel ? (language === 'zh-CN' ? '收起微调备忘' : 'Hide Tweaks') : (language === 'zh-CN' ? '下厨微调与备忘' : 'Quick Tweaks')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleTriggerEditRecipe(activeRecipe)}
                className="min-h-[40px] px-3.5 py-2 bg-[#C85A32] hover:bg-[#B34C26] text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1.5 active:scale-98"
                title="进入全功能手帐编辑器，自由增删食材、微调各步耗时与火候"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>
                  {activeRecipe.ownerId === currentUser?.uid 
                    ? (language === 'zh-CN' ? '进入完整手帐编辑' : 'Edit Recipe') 
                    : (language === 'zh-CN' ? '复制并自由定制此菜' : 'Fork & Customize')}
                </span>
              </button>
            </div>
          </div>

          {/* Expandable In-Place Workbench Tweak Panel */}
          {showTweakPanel && (
            <div className="pt-4 border-t border-[#F0E6DC] bg-[#FAF7F2]/80 p-4 rounded-xl space-y-3 animate-fade-in">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#2C2723] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#C85A32]" />
                  <span>{language === 'zh-CN' ? '本次下厨个性微调与即时备忘' : 'Cook Session Tweaks & Notes'}</span>
                </span>
                <span className="text-[11px] text-[#7A7268]">
                  {language === 'zh-CN' ? '记录本次调味增减、火候体验或备忘心得' : 'Record taste adjustments or heat notes'}
                </span>
              </div>

              <textarea
                value={workbenchTweakNotes}
                onChange={(e) => setWorkbenchTweakNotes(e.target.value)}
                placeholder={
                  language === 'zh-CN'
                    ? '例如：生抽比平时多加了半勺，最后收汁火候改用微火焖了2分钟；下次可以再加几粒青花椒提香...'
                    : 'Notes: e.g. Used less salt, reduced heat at step 3, added garnish...'
                }
                rows={2}
                className="w-full p-2.5 bg-white text-xs text-[#2C2723] border border-[#EADBCE] rounded-xl focus:outline-hidden focus:border-[#C85A32] placeholder-[#A89F91]"
              />

              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-[#A89F91]">
                  {tweakSavedToast && (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>{tweakSavedToast}</span>
                    </span>
                  )}
                </span>

                <button
                  type="button"
                  onClick={handleSaveWorkbenchTweaks}
                  className="px-3.5 py-1.5 bg-[#5F7A4D] hover:bg-[#4E663E] text-white text-xs font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 active:scale-98"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{language === 'zh-CN' ? '保存修改至手帐' : 'Save to Recipe'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty state: No active recipe on workbench */
        <div className="bg-white border border-[#EADBCE] rounded-2xl p-8 text-center paper-shadow space-y-3">
          <Utensils className="w-12 h-12 text-[#C85A32]/40 mx-auto" />
          <h3 className="text-base font-bold font-journal-title text-[#2C2723]">
            {language === 'zh-CN' ? '工作台尚未导入制作菜谱' : 'No Recipe Loaded in Workbench'}
          </h3>
          <p className="text-xs text-[#7A7268] max-w-md mx-auto">
            {language === 'zh-CN'
              ? '您可以随时从自己的手帐本导入，或从食味广场挑选收藏的他人家常菜，开启一步一步逐步打勾制作！'
              : 'Import your own recipe or saved community dishes to start guided cooking!'}
          </p>
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C85A32] hover:bg-[#B34C26] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{language === 'zh-CN' ? '立即导入手帐菜谱' : 'Import Recipe Now'}</span>
          </button>
        </div>
      )}

      {/* 3. Main Workspace: Phase 1 Ingredients & Phase 2 Cooking Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: PHASE 1 食材备料清单 (逐步打勾 + 购物超链) */}
        <div className="lg:col-span-5 bg-white border border-[#EADBCE] rounded-2xl p-5 sm:p-6 paper-shadow space-y-5">
          
          <div className="flex items-center justify-between pb-3 border-b border-[#EADBCE] gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#FAF3EC] text-[#C85A32] flex items-center justify-center">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold font-serif text-[#2C2723]">
                  阶段一：食材备料清单
                </h3>
                <p className="text-[11px] text-[#7A7268]">
                  称量齐备逐步打勾 · 点击直达生鲜购买
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPurchaseModalOpen(true)}
                className="px-2.5 py-1 text-xs font-semibold text-[#C85A32] bg-[#FAF3EC] hover:bg-[#C85A32] hover:text-white border border-[#C85A32]/40 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                title="一键选购全部食材（京东/淘宝直达 & 二维码带走）"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>一键选购</span>
              </button>

              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                isAllIngredientsReady 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {completedIngredients}/{totalIngredients} 备齐
              </span>
            </div>
          </div>

          {/* Shopping & Purchase Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 bg-[#FAF3EC] border border-[#C85A32]/30 rounded-xl">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-[#2C2723] flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>快速采购与分类购物清单</span>
              </span>
              <p className="text-[10px] text-[#7A7268]">
                一键遍历食材生成京东/淘宝链接 · 支持二维码扫码带走
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setIsPurchaseModalOpen(true)}
                className="px-3 py-1.5 bg-[#C85A32] hover:bg-[#B34C26] text-white text-xs font-bold rounded-lg shadow-2xs transition-all flex items-center justify-center gap-1.5 shrink-0 active:scale-[0.98]"
                title="遍历当前食材列表，生成完整清单购物链接（京东/淘宝），并生成二维码以便手机扫码带走"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>一键选购 ({totalIngredients - completedIngredients}缺 / 扫码)</span>
              </button>
              <button
                type="button"
                onClick={() => setIsShoppingListOpen(true)}
                className="px-3 py-1.5 bg-white hover:bg-[#FAF7F2] border border-[#EADBCE] hover:border-[#C85A32] text-[#C85A32] text-xs font-semibold rounded-lg shadow-2xs transition-all flex items-center justify-center gap-1.5 shrink-0"
                title="将勾选或待采购食材一键生成分类购物清单，并设置缺货预约提醒"
              >
                <span>分类采购单</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Main ingredients section */}
          {mainIngredients.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#2C2723] block">主料食材</span>
              <div className="space-y-1.5">
                {mainIngredients.map((ing) => {
                  const isChecked = checkedIngredients[ing.id];
                  const shoppingUrl = getShoppingUrl(ing.name);

                  return (
                    <div
                      key={ing.id}
                      onClick={() => toggleIngredientCheck(ing.id)}
                      className={`p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                        isChecked 
                          ? 'bg-[#FAF7F2] border-[#EADBCE] opacity-60' 
                          : 'bg-white border-[#EADBCE] hover:border-[#C85A32]/60 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleIngredientCheck(ing.id); }}
                          className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors ${
                            isChecked ? 'bg-[#5F7A4D] text-white' : 'border border-[#C85A32]'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5" />}
                        </button>
                        <div className="min-w-0">
                          <span className={`text-xs font-medium block truncate ${isChecked ? 'line-through text-[#9A9085]' : 'text-[#2C2723]'}`}>
                            {ing.name}
                          </span>
                          {ing.note && (
                            <span className="text-[10px] text-[#7A7268] block truncate">
                              {ing.note}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono font-bold text-[#C85A32] tabular-nums">
                          {formatScaledAmount(ing)} {ing.unit}
                        </span>
                        
                        {/* Out-of-stock restock alert button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsShoppingListOpen(true);
                          }}
                          className="p-1 text-[#7A7268] hover:text-[#C85A32] hover:bg-[#FAF3EC] rounded transition-colors"
                          title="缺货一键预约 / 打开分类采购清单"
                        >
                          <Bell className="w-3.5 h-3.5 text-[#C85A32]" />
                        </button>

                        {/* Shopping Hyperlink */}
                        <a
                          href={shoppingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 text-[#7A7268] hover:text-[#C85A32] hover:bg-[#FAF3EC] rounded transition-colors"
                          title={`前往${shoppingPlatform === 'jd' ? '京东' : shoppingPlatform === 'box' ? '盒马' : '淘宝'}采购「${ing.name}」`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Seasonings section */}
          {seasoningIngredients.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#2C2723] block">调料与配汁</span>
              <div className="space-y-1.5">
                {seasoningIngredients.map((ing) => {
                  const isChecked = checkedIngredients[ing.id];
                  const shoppingUrl = getShoppingUrl(ing.name);

                  return (
                    <div
                      key={ing.id}
                      onClick={() => toggleIngredientCheck(ing.id)}
                      className={`p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                        isChecked 
                          ? 'bg-[#FAF7F2] border-[#EADBCE] opacity-60' 
                          : 'bg-white border-[#EADBCE] hover:border-[#C85A32]/60 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleIngredientCheck(ing.id); }}
                          className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors ${
                            isChecked ? 'bg-[#5F7A4D] text-white' : 'border border-[#C85A32]'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5" />}
                        </button>
                        <div className="min-w-0">
                          <span className={`text-xs font-medium block truncate ${isChecked ? 'line-through text-[#9A9085]' : 'text-[#2C2723]'}`}>
                            {ing.name}
                          </span>
                          {ing.note && (
                            <span className="text-[10px] text-[#7A7268] block truncate">
                              {ing.note}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono font-bold text-[#C85A32] tabular-nums">
                          {formatScaledAmount(ing)} {ing.unit}
                        </span>
                        
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsShoppingListOpen(true);
                          }}
                          className="p-1 text-[#7A7268] hover:text-[#C85A32] hover:bg-[#FAF3EC] rounded transition-colors"
                          title="缺货一键预约 / 打开分类采购清单"
                        >
                          <Bell className="w-3.5 h-3.5 text-[#C85A32]" />
                        </button>

                        <a
                          href={shoppingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 text-[#7A7268] hover:text-[#C85A32] hover:bg-[#FAF3EC] rounded transition-colors"
                          title={`前往采购「${ing.name}」`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Garnish & Extras section */}
          {(garnishIngredients.length > 0 || extraItems.length > 0) && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#2C2723] block">点缀辅料与自备耗材</span>
              <div className="space-y-1.5">
                {garnishIngredients.map((ing) => {
                  const isChecked = checkedIngredients[ing.id];
                  const shoppingUrl = getShoppingUrl(ing.name);

                  return (
                    <div
                      key={ing.id}
                      onClick={() => toggleIngredientCheck(ing.id)}
                      className={`p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                        isChecked 
                          ? 'bg-[#FAF7F2] border-[#EADBCE] opacity-60' 
                          : 'bg-white border-[#EADBCE] hover:border-[#C85A32]/60 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          type="button"
                          className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                            isChecked ? 'bg-[#5F7A4D] text-white' : 'border border-[#C85A32]'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5" />}
                        </button>
                        <span className={`text-xs font-medium truncate ${isChecked ? 'line-through text-[#9A9085]' : 'text-[#2C2723]'}`}>
                          {ing.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#C85A32]">
                          {formatScaledAmount(ing)} {ing.unit}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsShoppingListOpen(true);
                          }}
                          className="p-1 text-[#7A7268] hover:text-[#C85A32] hover:bg-[#FAF3EC] rounded transition-colors"
                          title="缺货一键预约 / 打开分类采购清单"
                        >
                          <Bell className="w-3.5 h-3.5 text-[#C85A32]" />
                        </button>
                        <a
                          href={shoppingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 text-[#7A7268] hover:text-[#C85A32]"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}

                {/* Extra custom items */}
                {extraItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleExtraCheck(item.id)}
                    className={`p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      item.checked ? 'bg-[#FAF7F2] border-[#EADBCE] opacity-60' : 'bg-white border-[#EADBCE]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        type="button"
                        className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                          item.checked ? 'bg-[#5F7A4D] text-white' : 'border border-[#C85A32]'
                        }`}
                      >
                        {item.checked && <Check className="w-3.5 h-3.5" />}
                      </button>
                      <span className={`text-xs font-medium truncate ${item.checked ? 'line-through text-[#9A9085]' : 'text-[#2C2723]'}`}>
                        {item.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#7A7268]">{item.amount}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeExtraItem(item.id); }}
                        className="p-1 text-[#A8A29E] hover:text-rose-600 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add extra custom item form */}
          <form onSubmit={handleAddExtra} className="pt-2 border-t border-[#F0E6DC] flex items-center gap-2">
            <input
              type="text"
              placeholder="+ 补充自备耗材 (如：烘焙纸)"
              value={newExtraName}
              onChange={(e) => setNewExtraName(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs bg-[#FAF7F2] border border-[#EADBCE] rounded-lg focus:outline-hidden focus:border-[#C85A32]"
            />
            <input
              type="text"
              placeholder="用量"
              value={newExtraAmount}
              onChange={(e) => setNewExtraAmount(e.target.value)}
              className="w-16 px-2 py-1.5 text-xs bg-[#FAF7F2] border border-[#EADBCE] rounded-lg focus:outline-hidden focus:border-[#C85A32]"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#C85A32] hover:bg-[#B34C26] rounded-lg shrink-0"
            >
              添加
            </button>
          </form>

          {/* Bottom Quick-Action to buy all ingredients */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsPurchaseModalOpen(true)}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-[#FAF3EC] to-[#FAF7F2] hover:from-[#FAF0E6] hover:to-[#FAF3EC] border border-[#C85A32]/40 rounded-xl text-xs font-bold text-[#C85A32] transition-all flex items-center justify-center gap-2 shadow-2xs group active:scale-[0.99]"
              title="遍历当前所有食材，一键生成京东/淘宝搜索链接，并生成带走二维码"
            >
              <ShoppingBag className="w-4 h-4 text-[#C85A32] group-hover:scale-110 transition-transform" />
              <span>一键选购全部 {totalIngredients} 种食材（京东/淘宝直达 & 二维码扫码带走）</span>
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: PHASE 2 烹饪步骤与时序清关 (逐步打勾) */}
        <div className="lg:col-span-7 bg-white border border-[#EADBCE] rounded-2xl p-5 sm:p-6 paper-shadow space-y-5">
          
          <div className="flex items-center justify-between pb-3 border-b border-[#EADBCE]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#FAF3EC] text-[#5F7A4D] flex items-center justify-center">
                <ChefHat className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold font-serif text-[#2C2723]">
                  阶段二：烹饪时序与步骤清关
                </h3>
                <p className="text-[11px] text-[#7A7268]">
                  按步骤火候与时序烹饪 · 完成逐项打勾
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-end">
              {activeRecipe && activeRecipe.steps && activeRecipe.steps.length > 0 && (
                <button
                  type="button"
                  onClick={handleToggleVoiceGuidance}
                  className={`min-h-[36px] px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 shadow-2xs ${
                    voiceState.isSpeaking
                      ? 'bg-[#C85A32] text-white border-[#A04523] animate-pulse ring-2 ring-[#C85A32]/25'
                      : voiceState.isPaused
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300/80 hover:border-emerald-400'
                  }`}
                  title={voiceState.isSpeaking ? '暂停语音引导' : voiceState.isPaused ? '继续语音引导' : '启动 Web Speech API 步骤语音自动朗读'}
                >
                  {voiceState.isSpeaking ? (
                    <>
                      <Pause className="w-3.5 h-3.5 shrink-0" />
                      <span>暂停播报</span>
                    </>
                  ) : voiceState.isPaused ? (
                    <>
                      <Play className="w-3.5 h-3.5 shrink-0" />
                      <span>继续播报</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 shrink-0 text-[#5F7A4D]" />
                      <span>语音引导</span>
                    </>
                  )}
                </button>
              )}

              {activeRecipe && activeRecipe.steps.some(s => (s.durationMinutes || 0) > 0) && (
                <button
                  type="button"
                  onClick={() => {
                    const withTimer = activeRecipe.steps.filter(s => (s.durationMinutes || 0) > 0);
                    const curStep = (activeRecipe.steps[currentSpokenStepIndex] && (activeRecipe.steps[currentSpokenStepIndex].durationMinutes || 0) > 0)
                      ? activeRecipe.steps[currentSpokenStepIndex]
                      : withTimer[0];
                    if (curStep) {
                      const idx = activeRecipe.steps.findIndex(s => s.id === curStep.id);
                      handleStartStepTimer(curStep, idx >= 0 ? idx : 0);
                    }
                  }}
                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs min-h-[36px]"
                  title="一键启动当前步骤或首个定时推送的悬浮计时器"
                >
                  <Bell className="w-3.5 h-3.5 text-amber-700 fill-amber-500/20" />
                  <span>
                    关联 {activeRecipe.steps.filter(s => (s.durationMinutes || 0) > 0).length} 个定时点
                  </span>
                </button>
              )}

              <span className={`text-xs font-mono font-bold px-2 py-1 rounded-full ${
                isAllStepsFinished 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {completedSteps}/{totalSteps} 步骤完成
              </span>
            </div>
          </div>

          {/* Voice Broadcast & Hands-Free Interaction Panel */}
          {activeRecipe && activeRecipe.steps.length > 0 && (
            <div ref={voiceAssistantPanelRef}>
              <CookingVoiceAssistant
                ref={voiceAssistantRef}
                onVoiceStateChange={setVoiceState}
                recipeTitle={activeRecipe.title}
                steps={activeRecipe.steps}
                currentStepIndex={currentSpokenStepIndex}
                onStepChange={(newIdx) => setCurrentSpokenStepIndex(newIdx)}
                onToggleStepCheck={toggleStepCheck}
                checkedSteps={checkedSteps}
                onStartTimer={onStartTimer}
                onFinishAll={() => {
                  const allChecked: Record<string, boolean> = {};
                  activeRecipe.steps.forEach(s => { allChecked[s.id] = true; });
                  setCheckedSteps(allChecked);
                  setIsMarkModalOpen(true);
                }}
              />
            </div>
          )}

          {/* Steps Timeline Checklist */}
          {(!activeRecipe?.steps || activeRecipe.steps.length === 0) ? (
            <div className="py-12 text-center text-xs text-[#7A7268]">
              该菜谱暂无步骤信息
            </div>
          ) : (
            <div className="space-y-4">
              {activeRecipe.steps.map((st, idx) => {
                const isFinished = checkedSteps[st.id];
                const isCurrentlySpoken = idx === currentSpokenStepIndex;

                return (
                  <div
                    key={st.id || idx}
                    ref={(el) => { stepCardRefs.current[idx] = el; }}
                    className={`p-4 rounded-xl border transition-all ${
                      isCurrentlySpoken
                        ? 'border-[#C85A32] ring-2 ring-[#C85A32]/25 bg-[#FFFDF9] shadow-md'
                        : isFinished 
                          ? 'bg-[#FAF7F2] border-[#EADBCE] opacity-75' 
                          : 'bg-white border-[#EADBCE] hover:border-[#C85A32]/60 shadow-2xs'
                    }`}
                  >
                    {/* Step Top Bar: Checkbox + Title + Fire/Time badges + Voice Speak */}
                    <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => toggleStepCheck(st.id)}
                          className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                            isFinished 
                              ? 'bg-[#5F7A4D] text-white shadow-2xs' 
                              : 'border-2 border-[#C85A32] text-transparent hover:bg-[#FAF3EC]'
                          }`}
                          title={isFinished ? '取消勾选' : '点击标记此步骤已完成'}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        
                        <h4 className={`text-sm font-bold font-serif ${isFinished ? 'line-through text-[#7A7268]' : 'text-[#2C2723]'}`}>
                          步骤 {idx + 1}：{st.title}
                        </h4>

                        {/* Active Voice Spoken Indicator */}
                        {isCurrentlySpoken && (
                          <span className="px-2 py-0.5 rounded-md bg-[#FAF3EC] text-[#C85A32] border border-[#C85A32]/30 font-semibold flex items-center gap-1 text-[11px] animate-pulse">
                            <Volume2 className="w-3 h-3" />
                            <span>播报中</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs flex-wrap">
                        {/* Read this step button */}
                        <button
                          type="button"
                          onClick={() => setCurrentSpokenStepIndex(idx)}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors flex items-center gap-1 ${
                            isCurrentlySpoken
                              ? 'bg-[#C85A32] text-white border-[#C85A32]'
                              : 'bg-white hover:bg-[#FAF3EC] text-[#7A7268] hover:text-[#C85A32] border-[#EADBCE]'
                          }`}
                          title="朗读当前步骤"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span className="hidden sm:inline">{isCurrentlySpoken ? '正在播报' : '朗读此步'}</span>
                        </button>

                        {st.heat && (
                          <span className="px-2 py-0.5 rounded-md bg-[#FAF3EC] text-[#C85A32] border border-[#C85A32]/30 font-semibold flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            <span>{st.heat}</span>
                          </span>
                        )}

                        {st.durationMinutes && (
                          <button
                            type="button"
                            onClick={() => handleStartStepTimer(st, idx)}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs ${
                              activeTimerStepId === st.id
                                ? 'bg-emerald-600 text-white ring-2 ring-emerald-300 animate-pulse'
                                : st.hasTimerPush !== false
                                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                                  : 'bg-stone-100 hover:bg-stone-200 text-[#5A5248]'
                            }`}
                            title="点击一键启动全局悬浮计时器"
                          >
                            <Bell className={`w-3.5 h-3.5 ${activeTimerStepId === st.id ? 'text-white' : 'text-[#C85A32]'}`} />
                            <span>{activeTimerStepId === st.id ? '计时中' : '定时推送'}: {st.durationMinutes}分钟</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Step Description */}
                    <p className={`text-xs text-[#5A5248] leading-relaxed pl-8 ${isFinished ? 'text-[#8A8075]' : ''}`}>
                      {st.description}
                    </p>

                    {/* Step Tip */}
                    {st.tip && (
                      <div className="mt-2.5 ml-8 p-2.5 bg-[#FFFDF9] border border-[#E8DCC4] rounded-lg text-xs text-[#8C5D1E] flex items-start gap-2">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#C85A32]" />
                        <span>{st.tip}</span>
                      </div>
                    )}

                    {/* Dedicated Step Timer Push Control Bar */}
                    {st.durationMinutes && st.durationMinutes > 0 && (
                      <div className={`mt-3 ml-8 p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs transition-all ${
                        activeTimerStepId === st.id
                          ? 'bg-emerald-50/90 border-emerald-300'
                          : 'bg-gradient-to-r from-[#FFFDF9] to-[#FAF7F2] border-[#EADBCE]'
                      }`}>
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            activeTimerStepId === st.id
                              ? 'bg-emerald-600 text-white'
                              : 'bg-[#C85A32]/10 text-[#C85A32]'
                          }`}>
                            <Timer className={`w-4 h-4 ${activeTimerStepId === st.id ? 'animate-spin-slow' : ''}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-[#2C2723]">
                                步骤烹饪时长：{st.durationMinutes} 分钟
                              </span>
                              {st.heat && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FAF3EC] text-[#C85A32] border border-[#C85A32]/20 font-medium">
                                  {st.heat}
                                </span>
                              )}
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold border border-amber-300/40">
                                🔔 定时推送
                              </span>
                              {activeTimerStepId === st.id && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold animate-pulse">
                                  ⏱️ 悬浮计时运行中
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#7A7268] mt-0.5">
                              已与全局厨房计时器深度关联，点击一键在屏幕右下角启动悬浮倒计时
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleStartStepTimer(st, idx)}
                          className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xs min-h-[44px] ${
                            activeTimerStepId === st.id
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-[#C85A32] hover:bg-[#B34C26] text-white'
                          }`}
                          title="一键启动全局悬浮计时器"
                        >
                          <Bell className="w-4 h-4" />
                          <span>{activeTimerStepId === st.id ? '已开启倒计时 · 点击再次推送' : `一键启动悬浮计时器 (${st.durationMinutes}分)`}</span>
                        </button>
                      </div>
                    )}

                    {/* Step Media: Photo or Demonstration Video */}
                    {(st.photoUrl || st.videoUrl) && (
                      <div className="mt-3 ml-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {st.photoUrl && (
                          <div className="rounded-lg overflow-hidden border border-[#EADBCE] aspect-[16/10] bg-[#FAF7F2]">
                            <img src={st.photoUrl} alt={`步骤${idx + 1}实拍`} className="w-full h-full object-cover" />
                          </div>
                        )}
                        {st.videoUrl && (
                          <div className="rounded-lg overflow-hidden border border-[#EADBCE] aspect-[16/10]">
                            <VideoPlayer src={st.videoUrl} title={`步骤${idx + 1}操作演示`} className="w-full h-full" />
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

          {/* Celebratory Milestone & Log to Calendar */}
          {isAllStepsFinished && (
            <div className="p-4 bg-[#FAF3EC] border border-[#C85A32] rounded-xl text-center space-y-2 animate-fade-in">
              <Sparkles className="w-7 h-7 mx-auto text-[#C85A32]" />
              <h4 className="text-sm font-bold text-[#2C2723] font-serif">
                🎉 太棒了！本道美味全部烹饪步骤已制作完成！
              </h4>
              <p className="text-xs text-[#7A7268]">
                热气腾腾出锅，快去将今天的下厨成就打卡记录到手帐日历中吧。
              </p>
              <button
                onClick={() => setIsMarkModalOpen(true)}
                className="px-4 py-2 bg-[#C85A32] hover:bg-[#B34C26] text-white text-xs font-semibold rounded-lg shadow-sm transition-all inline-flex items-center gap-1.5"
              >
                <Calendar className="w-4 h-4" />
                <span>打卡记录到烹饪日历</span>
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Mark Cooking Modal when completing */}
      {activeRecipe && (
        <MarkCookingModal
          isOpen={isMarkModalOpen}
          onClose={() => setIsMarkModalOpen(false)}
          recipes={[activeRecipe]}
          initialRecipe={activeRecipe}
          onSaveRecord={(data) => {
            markRecipeCookedOnDate(
              data.recipe,
              data.date,
              data.notes,
              data.rating,
              null,
              data.dinerFeedback
            );
            setCompletionToast(`已成功打卡！已记录在 ${data.date} 烹饪日历中。`);
            setTimeout(() => setCompletionToast(null), 3500);
          }}
        />
      )}

      {/* Categorized Shopping List & Restock Alerts Modal */}
      {activeRecipe && (
        <ShoppingListModal
          isOpen={isShoppingListOpen}
          onClose={() => setIsShoppingListOpen(false)}
          recipe={activeRecipe}
          servings={servings}
          initialSelectedIngredients={checkedIngredients}
          extraItems={extraItems}
          currentUser={currentUser}
        />
      )}

      {/* Quick Online Purchase & QR Code Modal */}
      {activeRecipe && (
        <QuickPurchaseModal
          isOpen={isPurchaseModalOpen}
          onClose={() => setIsPurchaseModalOpen(false)}
          items={executionPurchaseItems}
          sourceTitle={`制作工作台 · 《${activeRecipe.title}》(${servings}人份)`}
        />
      )}

      {/* Floating Voice Guidance Controller Pill (Active when speaking or paused) */}
      {(voiceState.isSpeaking || voiceState.isPaused) && activeRecipe && activeRecipe.steps && (
        <aside
          aria-label="正在播放的语音引导控制栏"
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-[#2C2723]/95 backdrop-blur-md text-amber-50 px-4 py-2.5 rounded-2xl border border-[#EADBCE]/30 shadow-2xl flex items-center gap-3 animate-fade-in max-w-[92vw] sm:max-w-md"
        >
          {/* Animated Speaker indicator */}
          <div className="flex items-center gap-2 shrink-0">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${voiceState.isSpeaking ? 'bg-[#C85A32] text-white animate-pulse' : 'bg-[#3E3832] text-amber-200'}`}>
              {voiceState.isSpeaking ? <Volume2 className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </div>
          </div>

          {/* Current Step Description */}
          <div 
            onClick={() => {
              if (stepCardRefs.current[currentSpokenStepIndex]) {
                stepCardRefs.current[currentSpokenStepIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }}
            className="flex-1 min-w-0 cursor-pointer group"
            title="点击跳转至该步骤位置"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-bold">
                {voiceState.isSpeaking ? '正在语音朗读' : '已暂停'} · 第 {currentSpokenStepIndex + 1}/{activeRecipe.steps.length} 步
              </span>
            </div>
            <p className="text-xs font-medium truncate text-amber-100 group-hover:text-amber-200">
              {activeRecipe.steps[currentSpokenStepIndex]?.title || '烹饪步骤'}
            </p>
          </div>

          {/* Quick controls */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Prev Step */}
            <button
              type="button"
              onClick={() => {
                const prev = Math.max(0, currentSpokenStepIndex - 1);
                setCurrentSpokenStepIndex(prev);
                voiceAssistantRef.current?.startGuidance(prev);
              }}
              disabled={currentSpokenStepIndex === 0}
              className="p-1.5 text-amber-200 hover:text-white disabled:opacity-30 disabled:hover:text-amber-200 rounded-lg hover:bg-white/10 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="上一步"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            {/* Play/Pause */}
            <button
              type="button"
              onClick={handleToggleVoiceGuidance}
              className={`p-2 rounded-xl transition-all min-h-[40px] min-w-[40px] flex items-center justify-center ${
                voiceState.isSpeaking 
                  ? 'bg-amber-200 text-[#2C2723] hover:bg-amber-100 font-bold' 
                  : 'bg-[#C85A32] text-white hover:bg-[#B34C26]'
              }`}
              title={voiceState.isSpeaking ? '暂停' : '继续'}
            >
              {voiceState.isSpeaking ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            {/* Next Step */}
            <button
              type="button"
              onClick={() => {
                const next = Math.min(activeRecipe.steps.length - 1, currentSpokenStepIndex + 1);
                setCurrentSpokenStepIndex(next);
                voiceAssistantRef.current?.startGuidance(next);
              }}
              disabled={currentSpokenStepIndex >= activeRecipe.steps.length - 1}
              className="p-1.5 text-amber-200 hover:text-white disabled:opacity-30 disabled:hover:text-amber-200 rounded-lg hover:bg-white/10 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="下一步"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            {/* Close / Stop */}
            <button
              type="button"
              onClick={() => {
                voiceAssistantRef.current?.stopGuidance();
              }}
              className="p-1.5 text-amber-400/80 hover:text-rose-300 rounded-lg hover:bg-white/10 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="结束语音引导"
            >
              <VolumeX className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      )}

      {/* Recipe Importer Modal */}
      {isImportModalOpen && (
        <RecipeImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          userRecipes={recipes}
          publicRecipes={publicRecipes}
          currentUser={currentUser || null}
          onSelectRecipe={handleSelectImportedRecipe}
          onSelectAndEditRecipe={handleSelectAndEditRecipe}
          currentActiveRecipeId={activeRecipeId}
        />
      )}

      {/* Completion Toast */}
      {completionToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2C2723] text-amber-100 text-xs py-2.5 px-4 rounded-lg border border-[#EADBCE] shadow-xl flex items-center gap-2 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{completionToast}</span>
        </div>
      )}

      {/* Timer Push Notification Toast */}
      {timerToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#2C2723] text-amber-100 text-xs py-2.5 px-4 rounded-xl border border-[#EADBCE] shadow-2xl flex items-center gap-2 animate-fade-in">
          <Bell className="w-4 h-4 text-amber-400 animate-bounce" />
          <span>{timerToast}</span>
        </div>
      )}

    </div>
  );
};
