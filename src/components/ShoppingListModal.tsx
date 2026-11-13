import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Check, ShoppingCart, Bell, Settings, Copy, CheckCheck, 
  ExternalLink, Calendar, Clock, Sparkles, AlertTriangle, ShieldCheck,
  ChevronRight, Trash2, Sliders, Info
} from 'lucide-react';
import { Ingredient, Recipe } from '../types/recipe';
import { UserProfile } from '../types/auth';
import { addDaysLocal } from '../utils/dateUtils';
import { 
  ShoppingCategory, 
  SHOPPING_CATEGORIES, 
  classifyIngredientToAisle, 
  UserShoppingPreference, 
  getShoppingPreference, 
  saveShoppingPreference, 
  getRestockAlerts, 
  addRestockAlert, 
  removeRestockAlert,
  getPlatformSearchUrl,
  RestockAlertReservation
} from '../utils/shoppingStorage';

export interface ShoppingItem {
  id: string;
  name: string;
  amount: string | number;
  unit: string;
  category: ShoppingCategory;
  note?: string;
  purchased: boolean;
  recipeTitle: string;
  recipeId: string;
}

interface ShoppingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe;
  servings: number;
  initialSelectedIngredients: Record<string, boolean>; // Checked state from workbench
  extraItems?: Array<{ id: string; name: string; amount: string; checked: boolean }>;
  currentUser?: UserProfile | null;
}

const PLATFORM_OPTIONS = [
  { id: 'box', name: '盒马鲜生', tag: '最快30分钟达 · 净菜/日日鲜', desc: '半成品净菜与优质冷链生鲜' },
  { id: 'jd', name: '京东生鲜 / 七鲜', tag: '次日自营冷链 · 品质保障', desc: '产地直发与大牌优质生鲜' },
  { id: 'dingdong', name: '叮咚买菜', tag: '29分钟即时到家 · 绿叶菜专长', desc: '每日早市实惠蔬菜与水产' },
  { id: 'sams', name: '山姆会员店 (Sam\'s Club)', tag: '大包装高品质 · 极速达', desc: '进口肉品/深海海鲜/烘焙' },
  { id: 'meituan', name: '美团买菜 / 小象超市', tag: '全城30分钟达 · 丰富平价', desc: '随时随地下单便民生鲜' },
  { id: 'tmall', name: '淘宝 / 天猫超市', tag: '半日达 / 次日达 · 调味干货齐全', desc: '粮油米面与全国特色调味料' },
  { id: 'market', name: '线下生鲜菜市场', tag: '清晨早市 · 烟火实惠', desc: '实地挑选活鲜与应季时蔬' },
] as const;

const TIME_WINDOW_OPTIONS = [
  '07:30 - 09:00 (早市早起配送)',
  '11:00 - 12:30 (午餐备料准时达)',
  '17:00 - 18:30 (傍晚下班前送达)',
  '19:30 - 21:00 (夜宵下厨极速达)',
  '30分钟内极速送达 (即刻开火)'
];

const QUALITY_PREFERENCE_TAGS = [
  '优先有机认证 / 绿色食品',
  '谷饲纯鲜 / 纯天然无抗生肉',
  '要求免洗免切净菜 (省时备料)',
  '可接受临期特惠 / 晚市折扣',
  '当季地标原产地生鲜',
  '冷链急冻独立锁鲜小包装'
];

export const ShoppingListModal: React.FC<ShoppingListModalProps> = ({
  isOpen,
  onClose,
  recipe,
  servings,
  initialSelectedIngredients,
  extraItems = [],
  currentUser
}) => {
  // Tabs: 'list' (shopping checklist) or 'preference' (settings) or 'alerts' (active reservations)
  const [activeTab, setActiveTab] = useState<'list' | 'preference' | 'alerts'>('list');

  // Load user purchase preferences
  const [preferences, setPreferences] = useState<UserShoppingPreference>(() => 
    getShoppingPreference(currentUser)
  );

  // Active restock alerts
  const [restockAlerts, setRestockAlerts] = useState<RestockAlertReservation[]>(() =>
    getRestockAlerts(currentUser)
  );

  // Quick reservation modal/sheet state for specific ingredient
  const [reservingItem, setReservingItem] = useState<ShoppingItem | null>(null);
  const [reserveTargetDate, setReserveTargetDate] = useState<string>(() => addDaysLocal(1));
  const [reserveNote, setReserveNote] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Listen to external updates
  useEffect(() => {
    const handleAlertsUpdate = (e: any) => {
      setRestockAlerts(e.detail || getRestockAlerts(currentUser));
    };
    const handlePrefUpdate = (e: any) => {
      setPreferences(e.detail || getShoppingPreference(currentUser));
    };

    window.addEventListener('restock-alerts-updated', handleAlertsUpdate);
    window.addEventListener('shopping-preference-updated', handlePrefUpdate);
    return () => {
      window.removeEventListener('restock-alerts-updated', handleAlertsUpdate);
      window.removeEventListener('shopping-preference-updated', handlePrefUpdate);
    };
  }, [currentUser]);

  // Portion multiplier
  const multiplier = recipe ? servings / (recipe.baseServings || 1) : 1;
  const formatScaledAmount = (amount: number | string) => {
    if (typeof amount === 'number') {
      const scaled = amount * multiplier;
      if (scaled >= 10) return Math.round(scaled);
      return Number(scaled.toFixed(1));
    }
    return amount;
  };

  // Convert recipe ingredients + extras into categorized ShoppingItems
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>(() => {
    const items: ShoppingItem[] = [];

    // Recipe ingredients
    recipe.ingredients.forEach((ing) => {
      // If user checked it in the workbench, we respect the checked state
      const isPurchased = Boolean(initialSelectedIngredients[ing.id]);
      const aisle = classifyIngredientToAisle(ing.name, ing.category);

      items.push({
        id: ing.id,
        name: ing.name,
        amount: formatScaledAmount(ing.amount),
        unit: ing.unit,
        category: aisle,
        note: ing.note,
        purchased: isPurchased,
        recipeTitle: recipe.title,
        recipeId: recipe.id
      });
    });

    // Extras
    extraItems.forEach((ext) => {
      const aisle = classifyIngredientToAisle(ext.name, 'main');
      items.push({
        id: ext.id,
        name: ext.name,
        amount: ext.amount,
        unit: '',
        category: aisle,
        purchased: ext.checked,
        recipeTitle: recipe.title,
        recipeId: recipe.id
      });
    });

    return items;
  });

  // Toggle purchased state
  const togglePurchased = (id: string) => {
    setShoppingItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, purchased: !item.purchased } : item))
    );
  };

  // Group items by category aisle
  const groupedItems = useMemo(() => {
    const groups: Record<ShoppingCategory, ShoppingItem[]> = {
      veggie: [],
      meat: [],
      seasoning: [],
      staple: [],
      supplies: []
    };

    shoppingItems.forEach((item) => {
      if (groups[item.category]) {
        groups[item.category].push(item);
      } else {
        groups.veggie.push(item);
      }
    });

    return groups;
  }, [shoppingItems]);

  const totalCount = shoppingItems.length;
  const purchasedCount = shoppingItems.filter((i) => i.purchased).length;
  const missingCount = totalCount - purchasedCount;

  // Save updated preferences
  const handleSavePreferences = (updated: UserShoppingPreference) => {
    setPreferences(updated);
    saveShoppingPreference(updated, currentUser);
    setToastMessage('✅ 购买偏好已更新并保存');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Trigger one-click restock reservation for an ingredient
  const handleConfirmReservation = (item: ShoppingItem) => {
    addRestockAlert(
      {
        recipeId: item.recipeId,
        recipeTitle: item.recipeTitle,
        ingredientName: item.name,
        amount: `${item.amount}${item.unit}`,
        targetDate: reserveTargetDate,
        preference: preferences
      },
      currentUser
    );

    // Request notification permission if user chose browser notifications
    if (preferences.notificationChannel === 'browser' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

    setToastMessage(`🔔 已为「${item.name}」创建缺货补货预约提醒 (${preferences.platformName})`);
    setTimeout(() => setToastMessage(null), 4000);
    setReservingItem(null);
  };

  // Batch reserve all unpurchased / out-of-stock items
  const handleBatchReserveAllMissing = () => {
    const unpurchased = shoppingItems.filter((i) => !i.purchased);
    if (unpurchased.length === 0) {
      setToastMessage('✨ 所有食材已全部备齐，暂无需预约缺货！');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    unpurchased.forEach((item) => {
      addRestockAlert(
        {
          recipeId: item.recipeId,
          recipeTitle: item.recipeTitle,
          ingredientName: item.name,
          amount: `${item.amount}${item.unit}`,
          targetDate: reserveTargetDate,
          preference: preferences
        },
        currentUser
      );
    });

    setToastMessage(`🎉 已为 ${unpurchased.length} 项待采购食材一键创建【${preferences.platformName}】缺货与备料预约！`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // One-click copy formatted shopping list
  const handleCopyFormattedList = () => {
    const lines: string[] = [
      `🛒【食味手记 · 食材分类采购清单】`,
      `菜谱：《${recipe.title}》(${servings}人份)`,
      `首选商超：${preferences.platformName}`,
      `期望送达：${preferences.preferredTimeWindow}`,
      `采购品质偏好：${preferences.qualityPreference.join('、') || '常规优质生鲜'}`,
      `--------------------------------`
    ];

    (Object.keys(SHOPPING_CATEGORIES) as ShoppingCategory[]).forEach((catKey) => {
      const items = groupedItems[catKey];
      if (items && items.length > 0) {
        const catInfo = SHOPPING_CATEGORIES[catKey];
        lines.push(`\n${catInfo.icon}【${catInfo.name}】(${items.length}项)`);
        items.forEach((it) => {
          const status = it.purchased ? '✓ [已备齐]' : '○ [待采购]';
          lines.push(`· ${it.name}：${it.amount}${it.unit} ${status}${it.note ? ` (${it.note})` : ''}`);
        });
      }
    });

    lines.push(`\n📅 记录于 食味手记下厨制作模块`);
    navigator.clipboard.writeText(lines.join('\n'));
    setIsCopied(true);
    setToastMessage('📋 分类购物清单已复制！可直接粘贴发送给家人或发至微信群');
    setTimeout(() => {
      setIsCopied(false);
      setTimeout(() => setToastMessage(null), 3500);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-[#FAF7F2] rounded-2xl border border-[#EADBCE] shadow-2xl max-w-3xl w-full my-6 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:px-6 border-b border-[#EADBCE] bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FAF3EC] text-[#C85A32] flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-journal-title text-[#2C2723]">
                  食材智能分类购物清单
                </h2>
                <span className="text-[11px] font-semibold text-[#C85A32] bg-[#FAF3EC] border border-[#C85A32]/30 px-2 py-0.5 rounded-full">
                  《{recipe.title}》 · {servings}人份
                </span>
              </div>
              <p className="text-[11px] text-[#7A7268]">
                按生鲜分区科学归类 · 一键预约缺货补货 · 关联用户购买偏好
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#9A9085] hover:text-[#2C2723] rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 pt-2.5 border-b border-[#EADBCE] bg-[#FAF7F2] text-xs shrink-0">
          <div className="flex items-center gap-2 font-medium">
            <button
              onClick={() => setActiveTab('list')}
              className={`py-2 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'list'
                  ? 'border-[#C85A32] text-[#C85A32] font-bold'
                  : 'border-transparent text-[#7A7268] hover:text-[#2C2723]'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>分类清单 ({purchasedCount}/{totalCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('preference')}
              className={`py-2 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'preference'
                  ? 'border-[#C85A32] text-[#C85A32] font-bold'
                  : 'border-transparent text-[#7A7268] hover:text-[#2C2723]'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>购买偏好设置</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#5F7A4D]" />
            </button>

            <button
              onClick={() => setActiveTab('alerts')}
              className={`py-2 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'alerts'
                  ? 'border-[#C85A32] text-[#C85A32] font-bold'
                  : 'border-transparent text-[#7A7268] hover:text-[#2C2723]'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>缺货预约记录 ({restockAlerts.length})</span>
            </button>
          </div>

          {/* Quick Copy button */}
          <div className="flex items-center gap-1.5 pb-2">
            <button
              onClick={handleCopyFormattedList}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#C85A32] bg-white border border-[#C85A32]/30 hover:bg-[#FAF3EC] rounded-lg transition-colors shadow-2xs"
              title="复制结构化清单文本，方便通过微信发给家人代买"
            >
              {isCopied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? '已复制' : '复制微信采购单'}</span>
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* TAB 1: CATEGORIZED SHOPPING LIST */}
          {activeTab === 'list' && (
            <div className="space-y-5">
              
              {/* Top Summary Banner with Preferences badge */}
              <div className="p-3.5 bg-white border border-[#EADBCE] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[#2C2723]">当前首选商超：</span>
                    <span className="px-2 py-0.5 rounded-md bg-[#FAF3EC] text-[#C85A32] font-bold border border-[#C85A32]/30 flex items-center gap-1">
                      <span>🏪</span>
                      <span>{preferences.platformName}</span>
                    </span>
                    <span className="text-[#7A7268] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#5F7A4D]" />
                      <span>{preferences.preferredTimeWindow}</span>
                    </span>
                  </div>
                  <div className="text-[11px] text-[#7A7268] flex items-center gap-1.5 flex-wrap">
                    <span>选品标准：</span>
                    {preferences.qualityPreference.map((q) => (
                      <span key={q} className="bg-[#FAF7F2] border border-[#EADBCE] px-1.5 py-0.2 rounded text-[10px]">
                        {q}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveTab('preference')}
                    className="text-[11px] text-[#C85A32] hover:underline flex items-center gap-1"
                  >
                    <Sliders className="w-3 h-3" />
                    <span>修改偏好</span>
                  </button>
                  <button
                    onClick={handleBatchReserveAllMissing}
                    className="px-2.5 py-1 text-xs font-semibold bg-[#2C2723] hover:bg-black text-amber-100 rounded-md transition-colors flex items-center gap-1 shadow-2xs"
                    title="为全部待采购食材一键创建补货与预约提醒"
                  >
                    <Bell className="w-3.5 h-3.5 text-amber-300" />
                    <span>待采购一键全预约</span>
                  </button>
                </div>
              </div>

              {/* Categorized Aisles Display */}
              {(Object.keys(SHOPPING_CATEGORIES) as ShoppingCategory[]).map((catKey) => {
                const items = groupedItems[catKey];
                if (!items || items.length === 0) return null;
                const catInfo = SHOPPING_CATEGORIES[catKey];

                const aisleCompleted = items.every((i) => i.purchased);

                return (
                  <div key={catKey} className="bg-white border border-[#EADBCE] rounded-xl p-4 space-y-3 shadow-2xs">
                    {/* Aisle Section Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-[#F0E6DC]">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{catInfo.icon}</span>
                        <h4 className="text-xs sm:text-sm font-bold text-[#2C2723] font-serif">
                          {catInfo.name}
                        </h4>
                        <span className="text-[10px] text-[#7A7268] hidden sm:inline">
                          ({catInfo.description})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                          aisleCompleted ? 'bg-emerald-100 text-emerald-800 font-bold' : 'bg-stone-100 text-[#7A7268]'
                        }`}>
                          {items.filter(i => i.purchased).length}/{items.length} 齐备
                        </span>
                      </div>
                    </div>

                    {/* Aisle Items List */}
                    <div className="space-y-2">
                      {items.map((item) => {
                        const isReserved = restockAlerts.some(
                          (a) => a.recipeId === item.recipeId && a.ingredientName === item.name
                        );
                        const buyUrl = getPlatformSearchUrl(item.name, preferences.platform);

                        return (
                          <div
                            key={item.id}
                            className={`p-2.5 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                              item.purchased
                                ? 'bg-[#FAF7F2] border-[#EADBCE] opacity-60'
                                : 'bg-white border-[#EADBCE] hover:border-[#C85A32]/50 shadow-2xs'
                            }`}
                          >
                            {/* Checkbox and Item Name */}
                            <div className="flex items-center gap-2.5 min-w-0">
                              <button
                                type="button"
                                onClick={() => togglePurchased(item.id)}
                                className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors ${
                                  item.purchased ? 'bg-[#5F7A4D] text-white' : 'border border-[#C85A32] text-transparent hover:bg-stone-50'
                                }`}
                                title={item.purchased ? '标记为未采购' : '标记为已采购'}
                              >
                                {item.purchased && <Check className="w-3.5 h-3.5" />}
                              </button>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs font-semibold ${item.purchased ? 'line-through text-[#9A9085]' : 'text-[#2C2723]'}`}>
                                    {item.name}
                                  </span>
                                  <span className="text-xs font-mono font-bold text-[#C85A32]">
                                    {item.amount} {item.unit}
                                  </span>
                                </div>
                                {item.note && (
                                  <span className="text-[10px] text-[#7A7268] block truncate">
                                    备注: {item.note}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Actions Right: Buy Link & Out-of-stock Alert */}
                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                              {/* Restock reservation badge / button */}
                              {isReserved ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                  <Check className="w-3 h-3 text-amber-600" />
                                  <span>已设缺货预约</span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setReservingItem(item)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium bg-[#FAF7F2] hover:bg-[#FAF3EC] text-[#7A7268] hover:text-[#C85A32] border border-[#EADBCE] hover:border-[#C85A32] transition-colors"
                                  title="若该食材缺货或暂无库存，点击一键关联偏好设置到货提醒"
                                >
                                  <Bell className="w-3 h-3 text-[#C85A32]" />
                                  <span>缺货一键预约</span>
                                </button>
                              )}

                              {/* Direct Jump to Preferred E-Commerce platform */}
                              <a
                                href={buyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-white hover:bg-[#FAF7F2] text-[#2C2723] hover:text-[#C85A32] border border-[#EADBCE] transition-colors"
                                title={`在${preferences.platformName}中搜索购买此食材`}
                              >
                                <span>在{preferences.platform.toUpperCase()}采购</span>
                                <ExternalLink className="w-3 h-3 text-[#9A9085]" />
                              </a>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

            </div>
          )}

          {/* TAB 2: USER SHOPPING PREFERENCES CONFIGURATION */}
          {activeTab === 'preference' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 bg-white border border-[#EADBCE] rounded-xl space-y-4">
                
                {/* 1. Preferred Platform Selector */}
                <div>
                  <label className="block text-xs font-bold text-[#2C2723] mb-2 flex items-center gap-1.5">
                    <span>🏪 首选购买商超 / 生鲜配送平台</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {PLATFORM_OPTIONS.map((plat) => {
                      const isSelected = preferences.platform === plat.id;
                      return (
                        <div
                          key={plat.id}
                          onClick={() => handleSavePreferences({
                            ...preferences,
                            platform: plat.id as any,
                            platformName: `${plat.name} (${plat.tag.split('·')[0].trim()})`
                          })}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#FAF3EC] border-[#C85A32] shadow-2xs'
                              : 'bg-white border-[#EADBCE] hover:border-[#C85A32]/40'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-[#2C2723]">
                              {plat.name}
                            </span>
                            {isSelected && (
                              <span className="w-4 h-4 rounded-full bg-[#C85A32] text-white flex items-center justify-center text-[10px]">
                                ✓
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#C85A32] font-semibold block">
                            {plat.tag}
                          </span>
                          <span className="text-[10px] text-[#7A7268] block mt-0.5">
                            {plat.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Preferred Delivery Time Window */}
                <div className="pt-3 border-t border-[#F0E6DC]">
                  <label className="block text-xs font-bold text-[#2C2723] mb-2 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#C85A32]" />
                    <span>期望配送时段 (缺货补货按此期望时段优先推送)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TIME_WINDOW_OPTIONS.map((timeWin) => {
                      const isSelected = preferences.preferredTimeWindow === timeWin;
                      return (
                        <button
                          key={timeWin}
                          type="button"
                          onClick={() => handleSavePreferences({
                            ...preferences,
                            preferredTimeWindow: timeWin
                          })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                            isSelected
                              ? 'bg-[#2C2723] text-white border-[#2C2723] font-bold shadow-2xs'
                              : 'bg-[#FAF7F2] text-[#7A7268] hover:text-[#2C2723] border-[#EADBCE]'
                          }`}
                        >
                          {isSelected && '✓ '}{timeWin}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Quality & Standard Preferences */}
                <div className="pt-3 border-t border-[#F0E6DC]">
                  <label className="block text-xs font-bold text-[#2C2723] mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#5F7A4D]" />
                    <span>食材品质与选品偏好 (支持多选)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {QUALITY_PREFERENCE_TAGS.map((tag) => {
                      const isSelected = preferences.qualityPreference.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            const updatedList = isSelected
                              ? preferences.qualityPreference.filter((t) => t !== tag)
                              : [...preferences.qualityPreference, tag];
                            handleSavePreferences({
                              ...preferences,
                              qualityPreference: updatedList
                            });
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                            isSelected
                              ? 'bg-[#5F7A4D] text-white border-[#5F7A4D] font-bold shadow-2xs'
                              : 'bg-[#FAF7F2] text-[#7A7268] hover:text-[#2C2723] border-[#EADBCE]'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}{tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Notification Channel */}
                <div className="pt-3 border-t border-[#F0E6DC]">
                  <label className="block text-xs font-bold text-[#2C2723] mb-2 flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-[#C85A32]" />
                    <span>缺货一键预约提醒触发渠道</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    {[
                      { id: 'calendar', title: '📅 烹饪日历备料打卡', desc: '在指定下厨日期日历中同步待采购提醒' },
                      { id: 'browser', title: '🔔 浏览器系统通知', desc: '到货或约定时间弹出系统原生横幅' },
                      { id: 'in-app', title: '📱 手帐应用内提醒气泡', desc: '登录打开手帐时顶部实时气泡浮显' },
                    ].map((chan) => {
                      const isSelected = preferences.notificationChannel === chan.id;
                      return (
                        <div
                          key={chan.id}
                          onClick={() => handleSavePreferences({
                            ...preferences,
                            notificationChannel: chan.id as any
                          })}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            isSelected ? 'bg-[#FAF3EC] border-[#C85A32]' : 'bg-[#FAF7F2] border-[#EADBCE]'
                          }`}
                        >
                          <div className="font-semibold text-[#2C2723] mb-0.5">{chan.title}</div>
                          <div className="text-[10px] text-[#7A7268] leading-tight">{chan.desc}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: ACTIVE RESTOCK RESERVATIONS & ALERTS */}
          {activeTab === 'alerts' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-semibold text-[#7A7268]">
                  已生效的缺货补货预约提醒列表 ({restockAlerts.length})
                </span>
                {restockAlerts.length > 0 && (
                  <button
                    onClick={() => {
                      if (window.confirm('确定清空所有缺货预约记录吗？')) {
                        localStorage.removeItem(`food_journal_restock_alerts_v1_${currentUser?.uid || 'guest'}`);
                        setRestockAlerts([]);
                      }
                    }}
                    className="text-xs text-rose-500 hover:text-rose-700"
                  >
                    清空记录
                  </button>
                )}
              </div>

              {restockAlerts.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-xl border border-dashed border-[#EADBCE] text-xs text-[#7A7268] space-y-2">
                  <Bell className="w-8 h-8 mx-auto text-[#C85A32]/50" />
                  <p className="font-semibold text-[#2C2723]">暂无缺货预约记录</p>
                  <p className="text-[11px]">
                    在清单中遇到商超缺货或待补食材时，点击「缺货一键预约」即可在此查看与管理。
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {restockAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-3.5 bg-white border border-[#EADBCE] rounded-xl flex items-center justify-between gap-3 text-xs shadow-2xs"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#2C2723] text-sm truncate">
                            {alert.ingredientName}
                          </span>
                          <span className="font-mono text-xs text-[#C85A32] font-semibold">
                            {alert.amount}
                          </span>
                          <span className="px-1.5 py-0.2 bg-[#FAF3EC] text-[#C85A32] text-[10px] rounded border border-[#C85A32]/30">
                            来自《{alert.recipeTitle}》
                          </span>
                        </div>

                        <div className="text-[11px] text-[#7A7268] flex items-center gap-3">
                          <span>预约商超：{alert.preference.platformName}</span>
                          <span>期望时段：{alert.preference.preferredTimeWindow}</span>
                          <span>预约采购日：{alert.targetDate}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={getPlatformSearchUrl(alert.ingredientName, alert.preference.platform)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 text-xs bg-[#FAF7F2] hover:bg-[#FAF3EC] text-[#C85A32] border border-[#EADBCE] rounded-md transition-colors"
                        >
                          即刻复查库存
                        </a>
                        <button
                          onClick={() => removeRestockAlert(alert.id, currentUser)}
                          className="p-1 text-[#9A9085] hover:text-rose-600 rounded"
                          title="删除此预约"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:px-6 border-t border-[#EADBCE] bg-[#FAF7F2] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
          <div className="text-[#7A7268] flex items-center gap-2">
            <span>总计 {totalCount} 项食材</span>
            <span>·</span>
            <span>已备齐 <strong className="font-mono text-[#5F7A4D]">{purchasedCount}</strong> 项</span>
            <span>·</span>
            <span>待采购 <strong className="font-mono text-[#C85A32]">{missingCount}</strong> 项</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs text-[#7A7268] hover:text-[#2C2723] rounded-lg transition-colors"
            >
              关闭
            </button>
            <button
              onClick={handleCopyFormattedList}
              className="px-4 py-2 text-xs font-semibold bg-[#C85A32] hover:bg-[#B34C26] text-white rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>复制分类采购清单</span>
            </button>
          </div>
        </div>

      </div>

      {/* Quick Reservation Dialog for specific item */}
      {reservingItem && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white rounded-xl border border-[#EADBCE] shadow-xl p-5 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0E6DC] pb-2">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#C85A32]" />
                <h3 className="text-sm font-bold text-[#2C2723]">
                  缺货一键预约 / 补货提醒
                </h3>
              </div>
              <button
                onClick={() => setReservingItem(null)}
                className="text-[#9A9085] hover:text-[#2C2723]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#EADBCE] space-y-1">
                <div className="font-bold text-[#2C2723]">
                  预约食材：{reservingItem.name} ({reservingItem.amount} {reservingItem.unit})
                </div>
                <div className="text-[11px] text-[#7A7268]">
                  关联菜谱：《{reservingItem.recipeTitle}》
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#7A7268] mb-1">
                  首选商超与配送偏好：
                </label>
                <div className="p-2.5 bg-white border border-[#EADBCE] rounded-lg space-y-1 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#2C2723]">{preferences.platformName}</span>
                    <span className="text-[#C85A32]">{preferences.preferredTimeWindow}</span>
                  </div>
                  <div className="text-[#9A9085]">
                    偏好标准：{preferences.qualityPreference.join('、') || '标准优质生鲜'}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#7A7268] mb-1">
                  期望下厨 / 备料送达日期：
                </label>
                <input
                  type="date"
                  value={reserveTargetDate}
                  onChange={(e) => setReserveTargetDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#FAF7F2] border border-[#EADBCE] rounded-lg"
                />
              </div>

              <div className="p-2.5 bg-[#FFFDF9] border border-[#E8DCC4] rounded-lg text-[11px] text-[#8C5D1E] flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#C85A32]" />
                <span>
                  确认后，系统将在所选日期的期望时段通过【{preferences.notificationChannel === 'calendar' ? '烹饪日历备料打卡' : preferences.notificationChannel === 'browser' ? '浏览器系统横幅' : '应用内提醒'}】提醒您复查库存与补货。
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F0E6DC]">
              <button
                type="button"
                onClick={() => setReservingItem(null)}
                className="px-3 py-1.5 text-xs text-[#7A7268] hover:text-[#2C2723]"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => handleConfirmReservation(reservingItem)}
                className="px-4 py-1.5 bg-[#C85A32] hover:bg-[#B34C26] text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                确认建立缺货预约
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Realtime Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-60 bg-[#2C2723] text-amber-100 text-xs py-2 px-3.5 rounded-lg border border-[#EADBCE] shadow-xl flex items-center gap-2 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
