import React, { useState, useMemo } from 'react';
import { Recipe, Ingredient, CookingStep } from '../types/recipe';
import { 
  CheckCircle2, Circle, Copy, Plus, Trash2, Check, 
  Sparkles, ExternalLink, ChefHat, Clock, Flame, 
  Timer, ShoppingCart, ArrowRight, RotateCcw, Calendar,
  Utensils, BookOpen, AlertCircle, Bell, Settings
} from 'lucide-react';
import { VideoPlayer } from './VideoPlayer';
import { MarkCookingModal } from './MarkCookingModal';
import { markRecipeCookedOnDate } from '../utils/cookingLogStorage';
import { ShoppingListModal } from './ShoppingListModal';
import { UserProfile } from '../types/auth';

interface CookingExecutionViewProps {
  recipes: Recipe[];
  onOpenRecipe: (recipe: Recipe) => void;
  onStartTimer?: (minutes: number, label: string) => void;
  currentUser?: UserProfile | null;
}

export const CookingExecutionView: React.FC<CookingExecutionViewProps> = ({
  recipes,
  onOpenRecipe,
  onStartTimer,
  currentUser
}) => {
  // If no recipes, handle gracefully
  const hasRecipes = recipes.length > 0;
  const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);

  // Selected recipe to cook right now
  const [activeRecipeId, setActiveRecipeId] = useState<string>(
    hasRecipes ? recipes[0].id : ''
  );
  
  // Servings multiplier
  const activeRecipe = recipes.find(r => r.id === activeRecipeId) || recipes[0] || null;
  const [servings, setServings] = useState<number>(activeRecipe?.baseServings || 2);

  // When active recipe changes, sync baseServings
  const handleSelectRecipe = (id: string) => {
    setActiveRecipeId(id);
    const found = recipes.find(r => r.id === id);
    if (found) {
      setServings(found.baseServings || 2);
    }
  };

  // Checked state for ingredients
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  
  // Checked state for cooking steps
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});

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

  const toggleStepCheck = (id: string) => {
    setCheckedSteps(prev => ({ ...prev, [id]: !prev[id] }));
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

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={handleResetChecklist}
              className="px-3 py-1.5 text-xs font-medium text-[#7A7268] hover:text-[#2C2723] bg-[#FAF7F2] hover:bg-[#EADBCE]/50 border border-[#EADBCE] rounded-lg transition-colors flex items-center gap-1.5"
              title="重置当前进度"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重置打勾</span>
            </button>
            {activeRecipe && (
              <button
                onClick={() => onOpenRecipe(activeRecipe)}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#C85A32] bg-[#FAF3EC] hover:bg-[#C85A32] hover:text-white border border-[#C85A32]/40 rounded-lg transition-all flex items-center gap-1.5"
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
          <label className="block text-[11px] font-semibold text-[#7A7268] mb-1.5">
            当前制作的菜谱：
          </label>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {recipes.map((r) => {
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

      {/* 3. Main Workspace: Phase 1 Ingredients & Phase 2 Cooking Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: PHASE 1 食材备料清单 (逐步打勾 + 购物超链) */}
        <div className="lg:col-span-5 bg-white border border-[#EADBCE] rounded-2xl p-5 sm:p-6 paper-shadow space-y-5">
          
          <div className="flex items-center justify-between pb-3 border-b border-[#EADBCE]">
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

            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
              isAllIngredientsReady 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-amber-100 text-amber-800'
            }`}>
              {completedIngredients}/{totalIngredients} 备齐
            </span>
          </div>

          {/* One-Click Convert to Categorized Shopping List Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 bg-[#FAF3EC] border border-[#C85A32]/30 rounded-xl">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-[#2C2723] flex items-center gap-1.5">
                <ShoppingCart className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>一键转为分类购物清单</span>
              </span>
              <p className="text-[10px] text-[#7A7268]">
                智能归类蔬菜、肉类、调料 · 缺货一键预约提醒
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsShoppingListOpen(true)}
              className="px-3 py-1.5 bg-[#C85A32] hover:bg-[#B34C26] text-white text-xs font-semibold rounded-lg shadow-2xs transition-all flex items-center justify-center gap-1.5 shrink-0"
              title="将勾选或待采购食材一键生成分类购物清单，并设置缺货预约提醒"
            >
              <span>查看分类采购单 ({completedIngredients}/{totalIngredients})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
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

            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
              isAllStepsFinished 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-amber-100 text-amber-800'
            }`}>
              {completedSteps}/{totalSteps} 步骤完成
            </span>
          </div>

          {/* Steps Timeline Checklist */}
          {(!activeRecipe?.steps || activeRecipe.steps.length === 0) ? (
            <div className="py-12 text-center text-xs text-[#7A7268]">
              该菜谱暂无步骤信息
            </div>
          ) : (
            <div className="space-y-4">
              {activeRecipe.steps.map((st, idx) => {
                const isFinished = checkedSteps[st.id];

                return (
                  <div
                    key={st.id || idx}
                    className={`p-4 rounded-xl border transition-all ${
                      isFinished 
                        ? 'bg-[#FAF7F2] border-[#EADBCE] opacity-75' 
                        : 'bg-white border-[#EADBCE] hover:border-[#C85A32]/60 shadow-2xs'
                    }`}
                  >
                    {/* Step Top Bar: Checkbox + Title + Fire/Time badges */}
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
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        {st.heat && (
                          <span className="px-2 py-0.5 rounded-md bg-[#FAF3EC] text-[#C85A32] border border-[#C85A32]/30 font-semibold flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            <span>{st.heat}</span>
                          </span>
                        )}

                        {st.durationMinutes && (
                          <button
                            type="button"
                            onClick={() => onStartTimer && onStartTimer(st.durationMinutes || 5, `${activeRecipe.title} - 步骤${idx + 1}`)}
                            className="px-2 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-[#5A5248] transition-colors font-mono flex items-center gap-1"
                            title="为该步骤启动计时器"
                          >
                            <Timer className="w-3 h-3 text-[#C85A32]" />
                            <span>{st.durationMinutes}分钟</span>
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

      {/* Completion Toast */}
      {completionToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2C2723] text-amber-100 text-xs py-2.5 px-4 rounded-lg border border-[#EADBCE] shadow-xl flex items-center gap-2 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{completionToast}</span>
        </div>
      )}

    </div>
  );
};
