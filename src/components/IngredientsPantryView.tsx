import React, { useState, useMemo } from 'react';
import { Recipe } from '../types/recipe';
import { ShoppingBag, CheckCircle2, Circle, Copy, Plus, Trash2, Check, Sparkles } from 'lucide-react';
import { getPantryCheckedIds, savePantryCheckedIds } from '../utils/storage';
import { QuickPurchaseModal } from './QuickPurchaseModal';
import { PurchaseItem } from '../utils/shoppingPlatforms';

interface IngredientsPantryViewProps {
  recipes: Recipe[];
  onOpenRecipe: (recipe: Recipe) => void;
}

export const IngredientsPantryView: React.FC<IngredientsPantryViewProps> = ({
  recipes,
  onOpenRecipe
}) => {
  // Select which recipes to include in the shopping list
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<string[]>(
    recipes.slice(0, 2).map((r) => r.id)
  );

  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>(() => getPantryCheckedIds());
  const [extraItems, setExtraItems] = useState<Array<{ id: string; name: string; amount: string; checked: boolean }>>([
    { id: 'ext-1', name: '厨房吸油纸', amount: '1卷', checked: false },
    { id: 'ext-2', name: '黄油', amount: '200g', checked: true }
  ]);
  const [newExtraName, setNewExtraName] = useState('');
  const [newExtraAmount, setNewExtraAmount] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  // Toggle recipe in planner
  const toggleRecipeSelection = (id: string) => {
    if (selectedRecipeIds.includes(id)) {
      setSelectedRecipeIds(selectedRecipeIds.filter((rid) => rid !== id));
    } else {
      setSelectedRecipeIds([...selectedRecipeIds, id]);
    }
  };

  // Toggle item check
  const toggleCheck = (id: string) => {
    const next = { ...checkedIds, [id]: !checkedIds[id] };
    setCheckedIds(next);
    savePantryCheckedIds(next);
  };

  const toggleExtraCheck = (id: string) => {
    setExtraItems(extraItems.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
  };

  const removeExtra = (id: string) => {
    setExtraItems(extraItems.filter((item) => item.id !== id));
  };

  const addExtra = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExtraName.trim()) return;
    setExtraItems([
      ...extraItems,
      {
        id: 'ext-' + Date.now(),
        name: newExtraName.trim(),
        amount: newExtraAmount.trim() || '适量',
        checked: false
      }
    ]);
    setNewExtraName('');
    setNewExtraAmount('');
  };

  // Extract and group all ingredients for selected recipes
  const selectedRecipes = recipes.filter((r) => selectedRecipeIds.includes(r.id));
  
  // Aggregate items
  const mainItems: Array<{ uniqueKey: string; name: string; amountStr: string; recipeTitle: string }> = [];
  const seasoningItems: Array<{ uniqueKey: string; name: string; amountStr: string; recipeTitle: string }> = [];
  const garnishItems: Array<{ uniqueKey: string; name: string; amountStr: string; recipeTitle: string }> = [];

  selectedRecipes.forEach((rec) => {
    rec.ingredients.forEach((ing) => {
      const item = {
        uniqueKey: `${rec.id}-${ing.id}`,
        name: ing.name,
        amountStr: `${ing.amount}${ing.unit}${ing.note ? ` (${ing.note})` : ''}`,
        recipeTitle: rec.title
      };
      if (ing.category === 'main') mainItems.push(item);
      else if (ing.category === 'seasoning') seasoningItems.push(item);
      else garnishItems.push(item);
    });
  });

  const allKeys = [
    ...mainItems.map((i) => i.uniqueKey),
    ...seasoningItems.map((i) => i.uniqueKey),
    ...garnishItems.map((i) => i.uniqueKey)
  ];

  const totalCount = allKeys.length + extraItems.length;
  const checkedCount =
    allKeys.filter((k) => checkedIds[k]).length + extraItems.filter((e) => e.checked).length;

  const handleCopyShoppingList = () => {
    const lines = [
      `🛒【食味手记 · 本周备菜与采购清单】`,
      `规划菜谱：${selectedRecipes.map((r) => r.title).join('、') || '暂无选定菜谱'}`,
      '',
      '【主料 / 生鲜禽肉】:',
      ...mainItems.map((m) => `[${checkedIds[m.uniqueKey] ? 'x' : ' '}] ${m.name}：${m.amountStr} (${m.recipeTitle})`),
      '',
      '【调料 / 酱汁香料】:',
      ...seasoningItems.map((s) => `[${checkedIds[s.uniqueKey] ? 'x' : ' '}] ${s.name}：${s.amountStr}`),
      '',
      '【配菜点缀】:',
      ...garnishItems.map((g) => `[${checkedIds[g.uniqueKey] ? 'x' : ' '}] ${g.name}：${g.amountStr}`),
      '',
      extraItems.length > 0 ? '【其他加购杂品】:' : '',
      ...extraItems.map((e) => `[${e.checked ? 'x' : ' '}] ${e.name}：${e.amount}`),
      '',
      `进度：已备齐 ${checkedCount}/${totalCount}`
    ].filter(Boolean);

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const allPurchaseItems: PurchaseItem[] = useMemo(() => {
    const list: PurchaseItem[] = [];

    mainItems.forEach((m) => {
      list.push({
        id: m.uniqueKey,
        name: m.name,
        amount: m.amountStr,
        unit: '',
        category: 'main',
        checked: Boolean(checkedIds[m.uniqueKey]),
        recipeTitle: m.recipeTitle
      });
    });

    seasoningItems.forEach((s) => {
      list.push({
        id: s.uniqueKey,
        name: s.name,
        amount: s.amountStr,
        unit: '',
        category: 'seasoning',
        checked: Boolean(checkedIds[s.uniqueKey]),
        recipeTitle: s.recipeTitle
      });
    });

    garnishItems.forEach((g) => {
      list.push({
        id: g.uniqueKey,
        name: g.name,
        amount: g.amountStr,
        unit: '',
        category: 'garnish',
        checked: Boolean(checkedIds[g.uniqueKey]),
        recipeTitle: g.recipeTitle
      });
    });

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
  }, [mainItems, seasoningItems, garnishItems, extraItems, checkedIds]);

  const clearChecked = () => {
    const next: Record<string, boolean> = {};
    setCheckedIds(next);
    savePantryCheckedIds(next);
    setExtraItems(extraItems.map((e) => ({ ...e, checked: false })));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24">
      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-[#EADBCE]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-journal-title text-[#2C2723] flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-[#C85A32]" />
            <span>智能食材清单与备料库</span>
          </h1>
          <p className="text-xs text-[#7A7268] mt-1">
            勾选你想要烹饪的菜谱，自动汇聚全套食材与调味料，下厨买菜井井有条。
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsPurchaseModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-[#2C2723] bg-white border border-[#EADBCE] hover:border-[#C85A32] hover:text-[#C85A32] rounded-md transition-all shadow-2xs flex items-center gap-1.5"
            title="关联主流购物平台一键直达搜索或扫码手机采购"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>一键选购 ({allPurchaseItems.filter((i) => !i.checked).length}缺)</span>
          </button>

          <button
            onClick={handleCopyShoppingList}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#C85A32] hover:bg-[#B34C26] rounded-md transition-all shadow-xs flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '已复制到剪贴板！' : '复制采购清单'}</span>
          </button>

          <button
            onClick={clearChecked}
            className="px-3 py-1.5 text-xs font-medium text-[#7A7268] hover:text-[#2C2723] border border-[#EADBCE] bg-white rounded-md transition-colors"
          >
            重置勾选
          </button>
        </div>
      </div>

      {/* Recipe Selector Strip */}
      <div className="bg-white border border-[#EADBCE] rounded-xl p-4 sm:p-5 mb-8 paper-shadow">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#7A7268] mb-3 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
          <span>选择当前备菜日程 (点击切换加入/移除):</span>
        </h2>
        <div className="flex flex-wrap gap-2">
          {recipes.map((r) => {
            const isSelected = selectedRecipeIds.includes(r.id);
            return (
              <button
                key={r.id}
                onClick={() => toggleRecipeSelection(r.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[#C85A32] text-white border-[#C85A32] shadow-xs'
                    : 'bg-[#FAF7F2] text-[#5A5248] border-[#EADBCE] hover:border-[#C85A32]'
                }`}
              >
                <span>{r.title}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded ${isSelected ? 'bg-white/20' : 'bg-black/5'}`}>
                  {r.ingredients.length}样
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Checklist Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Aggregated Ingredients (2 cols span) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main produce/meat */}
          <div className="bg-white border border-[#EADBCE] rounded-xl p-5 paper-shadow">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#F0E6DC]">
              <h3 className="text-sm font-bold text-[#C85A32] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C85A32]" />
                <span>生鲜与主料清单 ({mainItems.length})</span>
              </h3>
            </div>

            {mainItems.length === 0 ? (
              <p className="text-xs text-[#9A9085] py-4 text-center">暂无选定菜谱或主料</p>
            ) : (
              <div className="space-y-2">
                {mainItems.map((item) => {
                  const isChecked = checkedIds[item.uniqueKey];
                  return (
                    <div
                      key={item.uniqueKey}
                      onClick={() => toggleCheck(item.uniqueKey)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-[#F9F7F5] border-[#EADBCE] opacity-50'
                          : 'bg-white border-[#EADBCE] hover:border-[#C85A32]/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isChecked ? (
                          <CheckCircle2 className="w-4 h-4 text-[#5F7A4D] shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-[#D6CBC0] shrink-0" />
                        )}
                        <div>
                          <span className={`text-xs sm:text-sm font-medium ${isChecked ? 'line-through text-[#9A9085]' : 'text-[#2C2723]'}`}>
                            {item.name}
                          </span>
                          <span className="text-[11px] text-[#9A9085] block truncate">
                            用于：{item.recipeTitle}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono text-xs sm:text-sm font-semibold text-[#2C2723]">
                          {item.amountStr}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Seasonings & Golden Ratio */}
          <div className="bg-white border border-[#EADBCE] rounded-xl p-5 paper-shadow">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#F0E6DC]">
              <h3 className="text-sm font-bold text-[#C08A3E] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C08A3E]" />
                <span>调味料与酱汁香料 ({seasoningItems.length})</span>
              </h3>
            </div>

            {seasoningItems.length === 0 ? (
              <p className="text-xs text-[#9A9085] py-4 text-center">暂无调料</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {seasoningItems.map((item) => {
                  const isChecked = checkedIds[item.uniqueKey];
                  return (
                    <div
                      key={item.uniqueKey}
                      onClick={() => toggleCheck(item.uniqueKey)}
                      className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-[#F9F7F5] border-[#EADBCE] opacity-50'
                          : 'bg-white border-[#EADBCE] hover:border-[#C08A3E]/60'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {isChecked ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#5F7A4D] shrink-0" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-[#D6CBC0] shrink-0" />
                        )}
                        <span className={`text-xs ${isChecked ? 'line-through text-[#9A9085]' : 'text-[#2C2723]'}`}>
                          {item.name}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-[#5A5248] shrink-0">
                        {item.amountStr}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Garnish & Extras */}
          {garnishItems.length > 0 && (
            <div className="bg-white border border-[#EADBCE] rounded-xl p-5 paper-shadow">
              <h3 className="text-sm font-bold text-[#5F7A4D] mb-3 flex items-center gap-2 pb-2 border-b border-[#F0E6DC]">
                <span className="w-2 h-2 rounded-full bg-[#5F7A4D]" />
                <span>点缀提香与辅料 ({garnishItems.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {garnishItems.map((item) => {
                  const isChecked = checkedIds[item.uniqueKey];
                  return (
                    <div
                      key={item.uniqueKey}
                      onClick={() => toggleCheck(item.uniqueKey)}
                      className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-[#F9F7F5] border-[#EADBCE] opacity-50'
                          : 'bg-white border-[#EADBCE] hover:border-[#5F7A4D]/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isChecked ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#5F7A4D] shrink-0" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-[#D6CBC0] shrink-0" />
                        )}
                        <span className={`text-xs ${isChecked ? 'line-through text-[#9A9085]' : 'text-[#2C2723]'}`}>
                          {item.name}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-[#5A5248]">
                        {item.amountStr}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Custom items & Progress widget */}
        <div className="space-y-6">
          {/* Progress Widget */}
          <div className="bg-[#FAF7F2] border border-[#EADBCE] rounded-xl p-5 paper-shadow bg-notebook-dots">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#2C2723] mb-2">
              备料进度
            </h3>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-mono font-bold text-[#C85A32] tabular-nums">
                {checkedCount}
              </span>
              <span className="text-sm text-[#7A7268]">/ {totalCount} 样已备齐</span>
            </div>
            <div className="w-full bg-[#EADBCE] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#5F7A4D] h-full transition-all duration-300"
                style={{ width: `${totalCount > 0 ? (checkedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Custom Extra Items */}
          <div className="bg-white border border-[#EADBCE] rounded-xl p-5 paper-shadow">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#2C2723] mb-3">
              自添杂品与耗材
            </h3>

            {/* Add Extra Form */}
            <form onSubmit={addExtra} className="flex gap-1.5 mb-3">
              <input
                type="text"
                placeholder="物品名称 (如保鲜膜)"
                value={newExtraName}
                onChange={(e) => setNewExtraName(e.target.value)}
                className="flex-1 text-xs px-2.5 py-1.5 border border-[#EADBCE] rounded-md focus:outline-hidden focus:border-[#C85A32]"
              />
              <input
                type="text"
                placeholder="数量"
                value={newExtraAmount}
                onChange={(e) => setNewExtraAmount(e.target.value)}
                className="w-16 text-xs px-2 py-1.5 border border-[#EADBCE] rounded-md focus:outline-hidden focus:border-[#C85A32]"
              />
              <button
                type="submit"
                className="p-1.5 bg-[#C85A32] text-white rounded-md hover:bg-[#B34C26] transition-colors"
                title="添加"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {extraItems.map((extra) => (
                <div
                  key={extra.id}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-[#FAF7F2] text-xs border border-transparent hover:border-[#EADBCE]"
                >
                  <div
                    onClick={() => toggleExtraCheck(extra.id)}
                    className="flex items-center gap-2 cursor-pointer min-w-0"
                  >
                    {extra.checked ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#5F7A4D] shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-[#D6CBC0] shrink-0" />
                    )}
                    <span className={extra.checked ? 'line-through text-[#9A9085]' : 'text-[#2C2723]'}>
                      {extra.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-[#7A7268]">{extra.amount}</span>
                    <button
                      onClick={() => removeExtra(extra.id)}
                      className="text-[#9A9085] hover:text-rose-500 p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Quick Purchase Modal for Pantry Planner */}
      <QuickPurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        items={allPurchaseItems}
        sourceTitle={`本周备菜日程 (${selectedRecipes.map((r) => r.title).join('、') || '备料库'})`}
      />
    </div>
  );
};
