import React, { useState } from 'react';
import { 
  X, Plus, Trash2, Tag, Sparkles, FolderPlus, 
  Layers, Check, AlertCircle, Info 
} from 'lucide-react';
import { UserProfile } from '../types/auth';
import { 
  getMergedTaxonomy, 
  getCustomTaxonomyData, 
  addCustomCategory, 
  addCustomSubcategory, 
  deleteCustomCategory, 
  deleteCustomSubcategory 
} from '../utils/taxonomyStorage';
import { ALL_CATEGORIES_LIST } from '../types/categories';
import { useI18n } from '../i18n/context';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  defaultParentCategory?: string;
  onTaxonomyChanged?: () => void;
}

const PRESET_EMOJIS = ['🍳', '🍢', '🍹', '🥟', '🥘', '🥩', '🍱', '🥣', '🥪', '🍼', '☕', '🍺', '🫖', '🥨', '🌮', '🧁', '🍰', '🍪', '🍨', '🥗'];

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  defaultParentCategory,
  onTaxonomyChanged
}) => {
  if (!isOpen) return null;

  const { t, language, getCategoryLabel, getSubcategoryLabel } = useI18n();
  const [activeTab, setActiveTab] = useState<'add_sub' | 'add_cat' | 'manage'>('add_sub');
  
  // Form states for new Subcategory
  const [parentCat, setParentCat] = useState<string>(
    defaultParentCategory && defaultParentCategory !== 'all' ? defaultParentCategory : '烘焙甜点'
  );
  const [subName, setSubName] = useState('');
  const [subDesc, setSubDesc] = useState('');
  const [subIcon, setSubIcon] = useState('🧁');

  // Form states for new Primary Category
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catIcon, setCatIcon] = useState('🍢');

  // Load latest taxonomy data
  const mergedTaxonomy = getMergedTaxonomy(currentUser);
  const customData = getCustomTaxonomyData(currentUser);
  const categoriesList = Object.keys(mergedTaxonomy);

  const customCatIds = new Set(customData.customCategories.map(c => c.id));
  const customSubKeys = new Set(customData.customSubcategories.map(s => `${s.parentCategoryId}__${s.sub.id}`));

  const handleCreateSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim()) {
      alert(language === 'zh-CN' ? '请输入细分名录名称！' : 'Please enter subcategory name!');
      return;
    }
    const success = addCustomSubcategory(
      parentCat,
      subName.trim(),
      subDesc.trim() || (language === 'zh-CN' ? '自定义私房风味细分' : 'Custom culinary subcategory'),
      subIcon,
      currentUser
    );
    if (success) {
      setSubName('');
      setSubDesc('');
      if (onTaxonomyChanged) onTaxonomyChanged();
      onClose();
    }
  };

  const handleCreateCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      alert(language === 'zh-CN' ? '请输入一级大类名录名称！' : 'Please enter category name!');
      return;
    }
    const success = addCustomCategory(
      catName.trim(),
      catIcon,
      catDesc.trim() || (language === 'zh-CN' ? '自定义私房风味大类' : 'Custom culinary category'),
      currentUser
    );
    if (success) {
      setCatName('');
      setCatDesc('');
      if (onTaxonomyChanged) onTaxonomyChanged();
      onClose();
    }
  };

  const handleDeleteCustomCat = (id: string) => {
    const confirmMsg = language === 'zh-CN'
      ? `确定要移除自定义名录「${id}」及其下所有细分吗？`
      : `Are you sure you want to remove custom category "${id}" and all its subcategories?`;
    if (window.confirm(confirmMsg)) {
      deleteCustomCategory(id, currentUser);
      if (onTaxonomyChanged) onTaxonomyChanged();
    }
  };

  const handleDeleteCustomSub = (parent: string, subId: string) => {
    const confirmMsg = language === 'zh-CN'
      ? `确定要从「${parent}」中移除细分名录「${subId}」吗？`
      : `Are you sure you want to remove subcategory "${subId}" from "${parent}"?`;
    if (window.confirm(confirmMsg)) {
      deleteCustomSubcategory(parent, subId, currentUser);
      if (onTaxonomyChanged) onTaxonomyChanged();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-xl bg-[#FAF7F2] border border-[#EADBCE] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-[#EADBCE] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FAF3EC] border border-[#EADBCE] flex items-center justify-center text-[#C85A32]">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#2C2723] font-serif">
                {t('自定义菜谱名录 · 分类管理')}
              </h2>
              <p className="text-xs text-[#7A7268]">
                {t('随心扩充一级大类与二级细分，打造贴合个人烹饪习惯的名录索引')}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-[#7A7268] hover:text-[#2C2723] hover:bg-[#FAF7F2] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="px-6 pt-3 bg-white border-b border-[#EADBCE] flex items-center gap-2">
          <button
            onClick={() => setActiveTab('add_sub')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'add_sub'
                ? 'border-[#C85A32] text-[#C85A32]'
                : 'border-transparent text-[#7A7268] hover:text-[#2C2723]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('添加二级细分名录')}</span>
          </button>

          <button
            onClick={() => setActiveTab('add_cat')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'add_cat'
                ? 'border-[#C85A32] text-[#C85A32]'
                : 'border-transparent text-[#7A7268] hover:text-[#2C2723]'
            }`}
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>{t('新建一级大类名录')}</span>
          </button>

          <button
            onClick={() => setActiveTab('manage')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'manage'
                ? 'border-[#C85A32] text-[#C85A32]'
                : 'border-transparent text-[#7A7268] hover:text-[#2C2723]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{t('名录总览与管理')} ({customData.customCategories.length + customData.customSubcategories.length})</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* TAB 1: ADD SUBCATEGORY */}
          {activeTab === 'add_sub' && (
            <form onSubmit={handleCreateSub} className="space-y-4">
              <div className="p-3 bg-[#FAF3EC] border border-[#EADBCE] rounded-xl text-xs text-[#5A5248] flex items-start gap-2">
                <Info className="w-4 h-4 text-[#C85A32] shrink-0 mt-0.5" />
                <span>
                  {language === 'zh-CN'
                    ? '在此为已有大类（如「烘焙甜点」、「家常中餐」）扩充专属二级细分。例如在甜点下补充「法式派挞」、「欧包硬欧」、「特调咖啡」等。'
                    : 'Expand custom subcategories for existing cuisines (e.g. Baking & Desserts, Home-style Chinese), such as French Pies, Sourdough Bread, or Handcrafted Coffee.'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C2723] mb-1.5">
                  {t('归属的一级分类')} <span className="text-[#C85A32]">*</span>
                </label>
                <select
                  value={parentCat}
                  onChange={(e) => setParentCat(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#EADBCE] rounded-lg focus:outline-hidden focus:border-[#C85A32] text-[#2C2723] font-semibold"
                >
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat}>
                      {mergedTaxonomy[cat]?.icon} {getCategoryLabel(cat)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C2723] mb-1.5">
                  {t('细分名录名称')} <span className="text-[#C85A32]">*</span>
                </label>
                <input
                  type="text"
                  placeholder={language === 'zh-CN' ? '例：法式派挞、古法蒸糕、手作果酱、特调咖啡' : 'e.g. French Pies, Sourdough, Artisan Jam, Handcrafted Coffee'}
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#EADBCE] rounded-lg focus:outline-hidden focus:border-[#C85A32] text-[#2C2723]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C2723] mb-1.5">
                  {t('选择图标 / Emoji')}
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {PRESET_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSubIcon(emoji)}
                      className={`w-7 h-7 rounded-md border text-sm flex items-center justify-center transition-all ${
                        subIcon === emoji 
                          ? 'border-[#C85A32] bg-[#FAF3EC] scale-110 shadow-2xs' 
                          : 'border-[#EADBCE] bg-white hover:border-[#C85A32]/60'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#7A7268]">{t('当前图标：')}</span>
                  <input
                    type="text"
                    value={subIcon}
                    onChange={(e) => setSubIcon(e.target.value)}
                    className="w-16 px-2 py-1 text-center text-sm bg-white border border-[#EADBCE] rounded-md focus:outline-hidden focus:border-[#C85A32]"
                    maxLength={3}
                  />
                  <span className="text-[11px] text-[#A8A29E]">{t('可直接输入任意表情符号')}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C2723] mb-1.5">
                  {t('细分说明 / 特色代表（可选）')}
                </label>
                <input
                  type="text"
                  placeholder={language === 'zh-CN' ? '例：苹果派/柠檬挞/巴斯克烤芝士' : 'e.g. Apple Pie / Lemon Tart / Basque Cheesecake'}
                  value={subDesc}
                  onChange={(e) => setSubDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#EADBCE] rounded-lg focus:outline-hidden focus:border-[#C85A32] text-[#2C2723]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-[#EADBCE]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-[#7A7268] hover:text-[#2C2723] rounded-lg"
                >
                  {t('action.cancel', '取消')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#C85A32] hover:bg-[#B34C26] active:scale-[0.98] rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{language === 'zh-CN' ? `添加至「${getCategoryLabel(parentCat)}」` : `Add to "${getCategoryLabel(parentCat)}"`}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: ADD PRIMARY CATEGORY */}
          {activeTab === 'add_cat' && (
            <form onSubmit={handleCreateCat} className="space-y-4">
              <div className="p-3 bg-[#FAF3EC] border border-[#EADBCE] rounded-xl text-xs text-[#5A5248] flex items-start gap-2">
                <FolderPlus className="w-4 h-4 text-[#C85A32] shrink-0 mt-0.5" />
                <span>
                  {language === 'zh-CN'
                    ? '在此新建一级大类名录，如「夜宵烧烤」、「私房调饮」、「宝宝辅食」、「地方特色」等。保存后将直接出现在顶部名录切换栏中。'
                    : 'Create new primary categories like Late Night BBQ, Handcrafted Drinks, Baby Food, or Regional Specialties. They will appear directly in the category navigation.'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C2723] mb-1.5">
                  {t('大类名录名称')} <span className="text-[#C85A32]">*</span>
                </label>
                <input
                  type="text"
                  placeholder={language === 'zh-CN' ? '例：夜宵烧烤、宝宝辅食、私房调饮、露营野炊' : 'e.g. Late-night BBQ, Baby Food, Craft Drinks, Camping Feast'}
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#EADBCE] rounded-lg focus:outline-hidden focus:border-[#C85A32] text-[#2C2723]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C2723] mb-1.5">
                  {t('选择大类图标 / Emoji')}
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {PRESET_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setCatIcon(emoji)}
                      className={`w-7 h-7 rounded-md border text-sm flex items-center justify-center transition-all ${
                        catIcon === emoji 
                          ? 'border-[#C85A32] bg-[#FAF3EC] scale-110 shadow-2xs' 
                          : 'border-[#EADBCE] bg-white hover:border-[#C85A32]/60'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#7A7268]">{t('当前图标：')}</span>
                  <input
                    type="text"
                    value={catIcon}
                    onChange={(e) => setCatIcon(e.target.value)}
                    className="w-16 px-2 py-1 text-center text-sm bg-white border border-[#EADBCE] rounded-md focus:outline-hidden focus:border-[#C85A32]"
                    maxLength={3}
                  />
                  <span className="text-[11px] text-[#A8A29E]">{t('可直接输入任意表情符号')}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C2723] mb-1.5">
                  {t('名录简介（可选）')}
                </label>
                <input
                  type="text"
                  placeholder={language === 'zh-CN' ? '例：深夜治愈的风味烤串、铁板小海鲜与微醺小酌' : 'e.g. Late night soothing skewers, sizzling seafood & cozy drinks'}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#EADBCE] rounded-lg focus:outline-hidden focus:border-[#C85A32] text-[#2C2723]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-[#EADBCE]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-[#7A7268] hover:text-[#2C2723] rounded-lg"
                >
                  {t('action.cancel', '取消')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#C85A32] hover:bg-[#B34C26] active:scale-[0.98] rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{t('创建一级名录')}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: MANAGE / OVERVIEW */}
          {activeTab === 'manage' && (
            <div className="space-y-4">
              <div className="text-xs text-[#7A7268]">
                {language === 'zh-CN' 
                  ? '以下为当前手账的所有分类与细分名录。带「自定义」标识的项可随时编辑或移除：' 
                  : 'All categories and subcategories in your journal. Custom items can be edited or removed anytime:'}
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {categoriesList.map((catKey) => {
                  const catInfo = mergedTaxonomy[catKey];
                  const isCustomCat = customCatIds.has(catKey);

                  return (
                    <div 
                      key={catKey}
                      className="p-3.5 bg-white border border-[#EADBCE] rounded-xl shadow-2xs space-y-2.5"
                    >
                      {/* Category Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{catInfo.icon}</span>
                          <span className="text-sm font-bold text-[#2C2723] font-serif">
                            {getCategoryLabel(catKey)}
                          </span>
                          {isCustomCat ? (
                            <span className="text-[10px] font-semibold text-[#C85A32] bg-[#FAF3EC] border border-[#C85A32]/30 px-1.5 py-0.5 rounded-sm">
                              {t('自定义大类')}
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#7A7268] bg-[#FAF7F2] border border-[#EADBCE] px-1.5 py-0.5 rounded-sm">
                              {t('系统内置')}
                            </span>
                          )}
                        </div>

                        {isCustomCat && (
                          <button
                            onClick={() => handleDeleteCustomCat(catKey)}
                            className="p-1 text-[#A8A29E] hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title={language === 'zh-CN' ? '删除自定义大类' : 'Delete custom category'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Subcategories */}
                      <div className="flex flex-wrap gap-1.5 pt-1 border-t border-[#EADBCE]/50">
                        {catInfo.subcategories.map((sub) => {
                          const isCustomSub = customSubKeys.has(`${catKey}__${sub.id}`);

                          return (
                            <div
                              key={sub.id}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border ${
                                isCustomSub
                                  ? 'bg-[#FAF3EC] border-[#C85A32]/40 text-[#C85A32]'
                                  : 'bg-[#FAF7F2] border-[#EADBCE] text-[#5A5248]'
                              }`}
                            >
                              <span>{sub.icon || '🥢'}</span>
                              <span className="font-medium">{getSubcategoryLabel(sub.id)}</span>
                              {isCustomSub && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCustomSub(catKey, sub.id)}
                                  className="ml-1 text-[#A8A29E] hover:text-rose-600 transition-colors"
                                  title={language === 'zh-CN' ? '移除此自定义细分' : 'Remove custom subcategory'}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          );
                        })}

                        {/* Quick add sub button inside cat */}
                        <button
                          type="button"
                          onClick={() => {
                            setParentCat(catKey);
                            setActiveTab('add_sub');
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-[#7A7268] hover:text-[#C85A32] hover:bg-[#FAF3EC] border border-dashed border-[#EADBCE] rounded-md transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          <span>{t('添加细分')}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
