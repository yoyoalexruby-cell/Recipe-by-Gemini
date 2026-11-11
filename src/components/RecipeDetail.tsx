import React, { useState, useMemo } from 'react';
import { Recipe, Ingredient } from '../types/recipe';
import { FoodArtFallback } from './IllustrationPresets';
import { 
  ArrowLeft, Clock, Users, Flame, Star, Share2, 
  Edit3, Trash2, CheckCircle2, Circle, Copy, 
  Camera, Timer, Heart, Sparkles, ChefHat, AlertTriangle, Plus, Calendar, Film, Tag, Play, Printer,
  Activity, ChevronDown, ChevronUp, ShoppingBag
} from 'lucide-react';
import { compressImageFile } from '../utils/storage';
import { MarkCookingModal } from './MarkCookingModal';
import { markRecipeCookedOnDate } from '../utils/cookingLogStorage';
import { VideoPlayer } from './VideoPlayer';
import { RecipePDFExportModal } from './RecipePDFExportModal';
import { estimateRecipeCalories } from '../utils/nutritionCalculator';
import { QuickPurchaseModal } from './QuickPurchaseModal';
import { PurchaseItem } from '../utils/shoppingPlatforms';
import { useI18n } from '../i18n/context';

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
  onShare: (recipe: Recipe) => void;
  onUpdateRecipe: (updated: Recipe) => void;
  onStartTimer: (minutes: number, label: string) => void;
}

export const RecipeDetail: React.FC<RecipeDetailProps> = ({
  recipe,
  onBack,
  onEdit,
  onDelete,
  onShare,
  onUpdateRecipe,
  onStartTimer
}) => {
  const { t, language, getCategoryLabel, getSubcategoryLabel, getDifficultyLabel, getHeatLabel, getWeatherLabel, formatMinutes, formatServings } = useI18n();

  // Servings multiplier state
  const [servings, setServings] = useState<number>(recipe.baseServings || 2);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [copySuccess, setCopySuccess] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [markToast, setMarkToast] = useState<string | null>(null);
  const [showCoverVideo, setShowCoverVideo] = useState(false);
  const [isExportPDFOpen, setIsExportPDFOpen] = useState(false);
  const [showNutritionBreakdown, setShowNutritionBreakdown] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  const multiplier = servings / (recipe.baseServings || 1);

  // Calorie & Nutrition Estimation
  const nutritionEstimate = useMemo(() => {
    const autoCalc = estimateRecipeCalories(recipe.ingredients, recipe.baseServings || 2);
    const baseTotal = recipe.estimatedCalories !== undefined ? recipe.estimatedCalories : autoCalc.totalCalories;
    const scaledTotal = Math.round(baseTotal * multiplier);
    const perServing = Math.round(baseTotal / (recipe.baseServings || 2));

    return {
      baseTotal,
      scaledTotal,
      perServing,
      healthLevel: autoCalc.healthLevel,
      details: autoCalc.details,
      isCustom: recipe.estimatedCalories !== undefined
    };
  }, [recipe.ingredients, recipe.baseServings, recipe.estimatedCalories, multiplier]);

  // Calculate scaled quantity
  const formatScaledAmount = (ing: Ingredient) => {
    if (typeof ing.amount === 'number') {
      const scaled = ing.amount * multiplier;
      // Round nicely
      if (scaled >= 10) return Math.round(scaled);
      return Number(scaled.toFixed(1));
    }
    return ing.amount;
  };

  // Items for quick online purchase
  const purchaseItems: PurchaseItem[] = useMemo(() => {
    return recipe.ingredients.map((ing) => ({
      id: ing.id,
      name: ing.name,
      amount: formatScaledAmount(ing),
      unit: ing.unit,
      category: ing.category,
      checked: Boolean(checkedIngredients[ing.id]),
      recipeTitle: recipe.title
    }));
  }, [recipe.ingredients, checkedIngredients, multiplier]);

  const toggleCheck = (id: string) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCopyIngredients = () => {
    const lines = [
      `【${recipe.title}】食材清单 (${servings}人份):`,
      ...recipe.ingredients.map(
        (i) => `· ${i.name}：${formatScaledAmount(i)}${i.unit}${i.note ? ` (${i.note})` : ''}`
      )
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Handle uploading photos to recipe gallery or step
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'cover' | 'gallery') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingPhoto(true);
      const base64 = await compressImageFile(file);
      if (target === 'cover') {
        onUpdateRecipe({
          ...recipe,
          coverImage: base64,
          updatedAt: new Date().toISOString().slice(0, 10)
        });
      } else {
        const currentGallery = recipe.galleryPhotos || [];
        onUpdateRecipe({
          ...recipe,
          galleryPhotos: [...currentGallery, base64],
          updatedAt: new Date().toISOString().slice(0, 10)
        });
      }
    } catch (err) {
      console.error('Failed to compress/save photo', err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const checkedCount = recipe.ingredients.filter((i) => checkedIngredients[i.id]).length;
  const totalIngredients = recipe.ingredients.length;

  const mainIngredients = recipe.ingredients.filter((i) => i.category === 'main');
  const seasoningIngredients = recipe.ingredients.filter((i) => i.category === 'seasoning');
  const garnishIngredients = recipe.ingredients.filter((i) => i.category === 'garnish');

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24">
      {/* Top action breadcrumb bar */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#EADBCE]">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-[#7A7268] hover:text-[#2C2723] transition-colors py-1 px-2 rounded-md hover:bg-[#FAF7F2]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('detail.back', '返回手帐本')}</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Public / Private toggle */}
          <button
            onClick={() => onUpdateRecipe({ ...recipe, isPublic: !recipe.isPublic })}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
              recipe.isPublic
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                : 'bg-[#FAF7F2] text-[#7A7268] border-[#EADBCE] hover:text-[#2C2723]'
            }`}
            title={recipe.isPublic ? (language === 'zh-CN' ? '已公开发布，点击可转为私密' : 'Public recipe, click to make private') : (language === 'zh-CN' ? '当前私密，点击发布到食味广场' : 'Private recipe, click to publish')}
          >
            <span>{recipe.isPublic ? (language === 'zh-CN' ? '🌐 广场已公开' : '🌐 Public') : (language === 'zh-CN' ? '🔒 私密手帐' : '🔒 Private')}</span>
          </button>

          <button
            onClick={() => {
              const shareUrl = `${window.location.origin}${window.location.pathname}?recipeId=${recipe.id}`;
              navigator.clipboard.writeText(shareUrl);
              setMarkToast(language === 'zh-CN' ? '已复制专属分享链接！朋友点开即可查阅并一键克隆到自己的手帐。' : 'Share link copied to clipboard!');
              setTimeout(() => setMarkToast(null), 3000);
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#5A5248] bg-white border border-[#EADBCE] hover:bg-[#FAF7F2] rounded-md transition-colors"
            title={t('detail.shareLink', '复制专属好友分享链接')}
          >
            <span>{t('detail.shareLink', '🔗 分享链接')}</span>
          </button>

          <button
            onClick={() => setIsMarkModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#C85A32] hover:bg-[#B34C26] active:scale-[0.98] rounded-md transition-all shadow-2xs"
            title={t('detail.markCooked', '打卡下厨')}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{t('detail.markCooked', '打卡下厨')}</span>
          </button>

          <button
            onClick={() => onShare(recipe)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#C85A32] bg-[#FAF7F2] border border-[#EADBCE] hover:bg-[#F3ECE4] rounded-md transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{t('detail.makeCard', '制作手帐卡')}</span>
          </button>

          <button
            onClick={() => setIsExportPDFOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#C85A32] hover:bg-[#B34C26] rounded-md transition-all shadow-2xs active:scale-95"
            title={t('detail.printJournal', '打印为手帐')}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t('detail.printJournal', '打印为手帐')}</span>
          </button>

          <button
            onClick={() => onEdit(recipe)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#2C2723] bg-white border border-[#EADBCE] hover:bg-[#FAF7F2] rounded-md transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{t('detail.edit', '编辑')}</span>
          </button>

          <button
            onClick={() => {
              if (confirm(`${t('detail.confirmDelete', '确定要从手帐中移除此道菜谱吗？')} (${recipe.title})`)) {
                onDelete(recipe.id);
              }
            }}
            className="p-1.5 text-[#9A9085] hover:text-rose-600 rounded-md transition-colors"
            title={t('detail.delete', '删除菜谱')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Recipe Scrapbook Page */}
      <div className="bg-white border border-[#EADBCE] rounded-2xl paper-shadow p-6 sm:p-10 relative overflow-hidden bg-notebook-dots">
        
        {/* Washi Tape Ribbon Header Decoration */}
        <div className="absolute top-0 left-12 transform -translate-y-1/2 pointer-events-none">
          <div className="washi-tape px-6 py-1 bg-[#C85A32]/80 text-amber-50 text-xs font-mono tracking-widest uppercase shadow-sm">
            RECIPE JOURNAL #{recipe.id.slice(-4).toUpperCase()}
          </div>
        </div>

        {/* Header Block: Title & Story */}
        <div className="mb-8 pt-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#7A7268] mb-2">
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
            <span>{t('common.recordedOn', '记录于')} {recipe.review?.cookDate || recipe.createdAt}</span>
            {recipe.weatherStamp && (
              <>
                <span aria-hidden="true">·</span>
                <span>{getWeatherLabel(recipe.weatherStamp)}</span>
              </>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold text-[#2C2723] font-journal-title leading-tight mb-3">
            {recipe.title}
          </h1>

          <p className="text-sm sm:text-base text-[#7A7268] leading-relaxed max-w-2xl italic font-serif">
            “{recipe.subtitle || '每一道菜都是一封写给生活的情书。'}”
          </p>

          {/* Flavor & Style Tags Badges */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {recipe.tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FAF3EC] text-[#C85A32] border border-[#EADBCE]"
                >
                  <Tag className="w-3 h-3" />
                  <span>{t}</span>
                </span>
              ))}
            </div>
          )}

          {recipe.originalSource && (
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#C85A32] bg-[#FAF7F2] border border-[#EADBCE] px-2.5 py-1 rounded-md font-sans">
              <span>🍴 本篇手帐收录并改良自 @{recipe.originalSource.authorName} 的公开食谱</span>
            </div>
          )}
        </div>

        {/* Featured Visual Section: Polaroid Frame Style with Photo & Video */}
        <div className="mb-10">
          <div className="bg-[#FAF7F2] p-3 sm:p-4 rounded-xl border border-[#EADBCE] polaroid-shadow relative">
            
            {/* Photo / Video Switcher if coverVideo exists */}
            {recipe.coverVideo && (
              <div className="flex items-center justify-end gap-1.5 mb-2.5 text-xs">
                <button
                  onClick={() => setShowCoverVideo(false)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                    !showCoverVideo 
                      ? 'bg-[#C85A32] text-white shadow-2xs' 
                      : 'bg-white text-[#7A7268] hover:text-[#2C2723] border border-[#EADBCE]'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>菜品实拍图</span>
                </button>
                <button
                  onClick={() => setShowCoverVideo(true)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                    showCoverVideo 
                      ? 'bg-[#C85A32] text-white shadow-2xs' 
                      : 'bg-white text-[#7A7268] hover:text-[#2C2723] border border-[#EADBCE]'
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>烹饪高光视频</span>
                </button>
              </div>
            )}

            <div className="aspect-[16/9] w-full rounded-lg overflow-hidden bg-[#EADBCE]/40 relative group">
              {showCoverVideo && recipe.coverVideo ? (
                <VideoPlayer src={recipe.coverVideo} poster={recipe.coverImage} title={recipe.title} className="w-full h-full" />
              ) : recipe.coverImage ? (
                <img 
                  src={recipe.coverImage} 
                  alt={recipe.title} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FoodArtFallback type={recipe.title} className="w-full h-full" />
              )}

              {/* Photo Upload trigger button */}
              {!showCoverVideo && (
                <label className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm border border-[#EADBCE] text-[#2C2723] text-xs font-medium py-1.5 px-3 rounded-md shadow-sm hover:bg-white cursor-pointer transition-all flex items-center gap-1.5 opacity-90 group-hover:opacity-100">
                  <Camera className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>{isUploadingPhoto ? '上传中...' : recipe.coverImage ? '更换成我的实拍照片' : '上传我的实拍照片'}</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => handlePhotoUpload(e, 'cover')}
                    disabled={isUploadingPhoto}
                  />
                </label>
              )}
            </div>

            {/* Quick Cooking Parameters Strip */}
            <div className="mt-3 pt-3 border-t border-[#EADBCE]/60 flex flex-wrap items-center justify-between gap-4 text-xs text-[#7A7268]">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#C85A32]" />
                  <span>{t('recipe.prepTime', '备料')} <strong className="font-mono tabular-nums text-[#2C2723]">{recipe.prepTimeMinutes}</strong> {t('common.minutes', '分钟')}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-[#C85A32]" />
                  <span>{t('recipe.cookTime', '烹饪')} <strong className="font-mono tabular-nums text-[#2C2723]">{recipe.cookTimeMinutes}</strong> {t('common.minutes', '分钟')}</span>
                </span>
                <span className="flex items-center gap-1.5" title={t('recipe.calories', '单人份预估热量')}>
                  <Activity className="w-4 h-4 text-[#C85A32]" />
                  <span>{t('recipe.calories', '热量')} <strong className="font-mono tabular-nums text-[#2C2723]">{nutritionEstimate.perServing}</strong> {t('common.kcal', 'kcal')}/{t('common.serving', '份')}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <ChefHat className="w-4 h-4 text-[#C85A32]" />
                  <span>{t('recipe.difficulty', '难度')} {getDifficultyLabel(recipe.difficulty || 3)}</span>
                </span>
              </div>

              {recipe.utensils && recipe.utensils.length > 0 && (
                <div className="flex items-center gap-1 text-[11px] text-[#9A9085]">
                  <span>{t('detail.cookware', '备置炊具:')}</span>
                  <span className="text-[#5A5248]">{recipe.utensils.join(' / ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 1: 食材清单 (Ingredients Section with Dynamic Servings Scaler) */}
        <section className="mb-12">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-2 border-b-2 border-[#EADBCE]">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold font-journal-title text-[#2C2723] flex items-center gap-2">
                <span>{t('detail.ingredientsTitle', '食材清单')}</span>
                <span className="text-xs font-normal text-[#9A9085] font-sans">
                  ({t('detail.preppedCount', '已备齐')} {checkedCount}/{totalIngredients})
                </span>
              </h2>
            </div>

            {/* Servings Scaler Control */}
            <div className="flex items-center gap-2 bg-[#FAF7F2] border border-[#EADBCE] rounded-lg p-1 text-xs">
              <span className="text-[#7A7268] px-2 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>{t('detail.portionScaler', '分量调节:')}</span>
              </span>
              {[1, 2, 4, 6].map((num) => (
                <button
                  key={num}
                  onClick={() => setServings(num)}
                  className={`px-2.5 py-1 rounded font-mono font-medium transition-colors ${
                    servings === num 
                      ? 'bg-[#C85A32] text-white shadow-xs' 
                      : 'text-[#7A7268] hover:text-[#2C2723]'
                  }`}
                >
                  {formatServings(num)}
                </button>
              ))}

              <button
                onClick={handleCopyIngredients}
                className="ml-2 px-2.5 py-1 bg-white border border-[#EADBCE] text-[#5A5248] hover:text-[#2C2723] rounded flex items-center gap-1 transition-colors"
                title={t('detail.copyIngredients', '复制食材文本')}
              >
                <Copy className="w-3 h-3" />
                <span>{copySuccess ? t('common.copied', '已复制！') : t('detail.copyIngredients', '复制清单')}</span>
              </button>

              <button
                onClick={() => setIsPurchaseModalOpen(true)}
                className="ml-1 px-2.5 py-1 bg-[#FAF7F2] border border-[#EADBCE] hover:border-[#C85A32] text-[#C85A32] rounded flex items-center gap-1.5 transition-colors font-medium shadow-2xs hover:bg-[#FAF2EA]"
                title={t('detail.oneClickBuy', '一键选购')}
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>{t('detail.oneClickBuy', '一键选购')}</span>
              </button>
            </div>
          </div>

          {/* Calorie & Nutrition Health Estimation Banner */}
          <div className="mb-6 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl p-3.5 sm:p-4 transition-all">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#C85A32] flex items-center justify-center shrink-0 shadow-2xs">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-[#2C2723] font-journal-title">
                      饮食健康与热量预估
                    </span>
                    <span className="font-mono text-xs font-bold text-[#C85A32] bg-white px-2 py-0.5 rounded border border-[#EADBCE]">
                      约 {nutritionEstimate.perServing} kcal / 人份
                    </span>
                    <span className="text-xs text-[#7A7268]">
                      (当前 {servings} 人份整锅约 <strong className="font-mono text-[#2C2723]">{nutritionEstimate.scaledTotal}</strong> kcal)
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${nutritionEstimate.healthLevel.badgeColor}`}>
                      {nutritionEstimate.healthLevel.label}
                    </span>
                  </div>
                  <p className="text-xs text-[#7A7268] mt-1">
                    {nutritionEstimate.healthLevel.description}
                    {nutritionEstimate.isCustom && ' · （采用手帐作者自定义预估值）'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowNutritionBreakdown(!showNutritionBreakdown)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#5A5248] hover:text-[#2C2723] bg-white border border-[#EADBCE] hover:bg-[#FAF7F2] transition-colors shadow-2xs"
                title="查看各食材的热量明细与贡献"
              >
                <Activity className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>{showNutritionBreakdown ? '收起热量拆解' : '查看食材热量明细'}</span>
                {showNutritionBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Expandable Breakdown Drawer */}
            {showNutritionBreakdown && (
              <div className="mt-3.5 pt-3.5 border-t border-[#EADBCE] animate-fade-in text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                  <span className="font-semibold text-[#2C2723]">
                    各食材热量贡献榜 (基于基准 {recipe.baseServings} 人份测算)
                  </span>
                  <span className="text-[11px] text-[#9A9085]">
                    依据标准食物成分数据 · 随分量调节同步倍增
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {nutritionEstimate.details.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white p-2.5 rounded-lg border border-[#EADBCE] shadow-2xs flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-medium text-[#2C2723] truncate block">{item.name}</span>
                        <span className="text-[10px] text-[#7A7268]">
                          {item.amount} {item.unit}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-[#C85A32] text-xs">
                          {item.calories}
                        </span>
                        <span className="text-[10px] text-[#9A9085] ml-0.5">kcal</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Ingredients Grid (Divided by Main, Seasoning, Garnish) */}
          <div className="space-y-6">
            {/* Main Ingredients */}
            {mainIngredients.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-[#C85A32] tracking-wider uppercase mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32]" />
                  <span>{t('detail.mainIngredients', '主料 / 生鲜禽肉蔬菜')}</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {mainIngredients.map((ing) => (
                    <div
                      key={ing.id}
                      onClick={() => toggleCheck(ing.id)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer select-none ${
                        checkedIngredients[ing.id]
                          ? 'bg-[#F9F7F5] border-[#EADBCE] opacity-60'
                          : 'bg-white border-[#EADBCE] hover:border-[#C85A32]/50 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {checkedIngredients[ing.id] ? (
                          <CheckCircle2 className="w-4 h-4 text-[#5F7A4D] shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-[#D6CBC0] shrink-0" />
                        )}
                        <span className={`text-sm ${checkedIngredients[ing.id] ? 'line-through text-[#9A9085]' : 'font-medium text-[#2C2723]'}`}>
                          {ing.name}
                        </span>
                      </div>
                      <div className="text-right shrink-0 pl-2">
                        <span className="font-mono text-sm font-semibold text-[#2C2723] tabular-nums">
                          {formatScaledAmount(ing)}
                        </span>
                        <span className="text-xs text-[#7A7268] ml-1">{ing.unit}</span>
                        {ing.note && (
                          <span className="block text-[11px] text-[#9A9085] truncate max-w-[120px]">{ing.note}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Seasonings & Golden Ratio */}
            {seasoningIngredients.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-[#C08A3E] tracking-wider uppercase mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C08A3E]" />
                  <span>{t('detail.seasoningIngredients', '调料 / 酱汁配比')}</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {seasoningIngredients.map((ing) => (
                    <div
                      key={ing.id}
                      onClick={() => toggleCheck(ing.id)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer select-none ${
                        checkedIngredients[ing.id]
                          ? 'bg-[#F9F7F5] border-[#EADBCE] opacity-60'
                          : 'bg-white border-[#EADBCE] hover:border-[#C08A3E]/50 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {checkedIngredients[ing.id] ? (
                          <CheckCircle2 className="w-4 h-4 text-[#5F7A4D] shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-[#D6CBC0] shrink-0" />
                        )}
                        <span className={`text-sm ${checkedIngredients[ing.id] ? 'line-through text-[#9A9085]' : 'font-medium text-[#2C2723]'}`}>
                          {ing.name}
                        </span>
                      </div>
                      <div className="text-right shrink-0 pl-2">
                        <span className="font-mono text-sm font-semibold text-[#2C2723] tabular-nums">
                          {formatScaledAmount(ing)}
                        </span>
                        <span className="text-xs text-[#7A7268] ml-1">{ing.unit}</span>
                        {ing.note && (
                          <span className="block text-[11px] text-[#9A9085] truncate max-w-[120px]">{ing.note}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Garnish & Extras */}
            {garnishIngredients.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-[#5F7A4D] tracking-wider uppercase mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5F7A4D]" />
                  <span>{t('detail.garnishIngredients', '配菜与点缀提香')}</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {garnishIngredients.map((ing) => (
                    <div
                      key={ing.id}
                      onClick={() => toggleCheck(ing.id)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer select-none ${
                        checkedIngredients[ing.id]
                          ? 'bg-[#F9F7F5] border-[#EADBCE] opacity-60'
                          : 'bg-white border-[#EADBCE] hover:border-[#5F7A4D]/50 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {checkedIngredients[ing.id] ? (
                          <CheckCircle2 className="w-4 h-4 text-[#5F7A4D] shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-[#D6CBC0] shrink-0" />
                        )}
                        <span className={`text-sm ${checkedIngredients[ing.id] ? 'line-through text-[#9A9085]' : 'font-medium text-[#2C2723]'}`}>
                          {ing.name}
                        </span>
                      </div>
                      <div className="text-right shrink-0 pl-2">
                        <span className="font-mono text-sm font-semibold text-[#2C2723] tabular-nums">
                          {formatScaledAmount(ing)}
                        </span>
                        <span className="text-xs text-[#7A7268] ml-1">{ing.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Section 2: 详细烹饪步骤 (Step-by-step Cooking Journal) */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6 pb-2 border-b-2 border-[#EADBCE]">
            <h2 className="text-xl font-bold font-journal-title text-[#2C2723]">
              {t('detail.stepsTitle', '烹饪步骤与时序')}
            </h2>
            <span className="text-xs text-[#7A7268]">({recipe.steps.length} {t('detail.stepsUnit', '步')})</span>
          </div>

          <div className="space-y-8 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-[#EADBCE]/80">
            {recipe.steps.map((step, idx) => (
              <div key={step.id || idx} className="relative pl-10">
                {/* Step Index Badge */}
                <div className="absolute left-1 top-0 w-7 h-7 rounded-full bg-[#FAF7F2] border-2 border-[#C85A32] text-[#C85A32] font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                  {step.stepNumber || idx + 1}
                </div>

                <div className="bg-[#FAF7F2]/60 rounded-xl p-4 sm:p-5 border border-[#EADBCE]/80">
                  {/* Step Title & Meta */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <h3 className="text-base font-bold text-[#2C2723] font-journal-title">
                      {step.title}
                    </h3>

                    <div className="flex items-center gap-2">
                      {step.heat && (
                        <span className="text-[11px] font-medium text-[#C85A32] bg-white border border-[#EADBCE] px-2 py-0.5 rounded">
                          {getHeatLabel(step.heat)}
                        </span>
                      )}

                      {step.durationMinutes && (
                        <button
                          onClick={() => onStartTimer(step.durationMinutes!, `${recipe.title} - 第${step.stepNumber || idx + 1}步: ${step.title}`)}
                          className="text-[11px] font-medium text-[#7A7268] hover:text-[#C85A32] bg-white border border-[#EADBCE] hover:border-[#C85A32] px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
                          title="点击一键启动全局悬浮计时器"
                        >
                          <Timer className="w-3.5 h-3.5 text-[#C85A32]" />
                          <span>{t('detail.startTimer', '一键启动计时')} ({step.durationMinutes}{t('common.minutes', '分')})</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Step Description */}
                  <p className="text-sm text-[#4A423B] leading-relaxed mb-3">
                    {step.description}
                  </p>

                  {/* Step Pro Tip / Pitfall Avoidance */}
                  {step.tip && (
                    <div className="bg-[#FFFDF9] border border-[#E8DCC4] rounded-lg p-3 text-xs text-[#6B5838] flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-[#C08A3E] shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold text-[#8C5D1E]">{t('recipe.tip', '避坑提示')}: </strong>
                        <span>{step.tip}</span>
                      </div>
                    </div>
                  )}

                  {/* Step Photo and Video (if available) */}
                  {(step.photoUrl || step.videoUrl) && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
                      {step.photoUrl && (
                        <div className="aspect-video rounded-lg overflow-hidden border border-[#EADBCE]">
                          <img src={step.photoUrl} alt={step.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      {step.videoUrl && (
                        <div className="aspect-video rounded-lg overflow-hidden border border-[#EADBCE]">
                          <VideoPlayer src={step.videoUrl} poster={step.photoUrl} title={`第${step.stepNumber}步操作视频`} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: 烹饪心得与手帐复盘 (Cooking Reflections & Tasting Notes) */}
        <section className="mb-10 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl p-6 sm:p-8 relative">
          {/* Scrapbook Stamp seal */}
          <div className="absolute top-4 right-4 text-[#C85A32] opacity-80 pointer-events-none">
            <div className="seal-stamp text-xs">
              ★ 私房品鉴 ★
            </div>
          </div>

          <h2 className="text-xl font-bold font-journal-title text-[#2C2723] mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C85A32]" />
            <span>{t('detail.reviewTitle', '烹饪心得与手帐复盘')}</span>
          </h2>

          {/* 4-Axis Ratings */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 bg-white p-4 rounded-xl border border-[#EADBCE]">
            <div>
              <span className="text-[11px] text-[#7A7268] block mb-1">{t('detail.tasteRating', '风味口感')}</span>
              <div className="flex items-center gap-1 text-[#C08A3E]">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-mono font-bold text-sm text-[#2C2723]">
                  {recipe.review?.ratings?.taste || 5}.0
                </span>
              </div>
            </div>

            <div>
              <span className="text-[11px] text-[#7A7268] block mb-1">制作难度</span>
              <div className="text-sm font-semibold text-[#2C2723]">
                {recipe.review?.ratings?.difficulty ? `${recipe.review.ratings.difficulty}星级` : '中等'}
              </div>
            </div>

            <div>
              <span className="text-[11px] text-[#7A7268] block mb-1">翻牌推荐度</span>
              <div className="flex items-center gap-1 text-[#5F7A4D]">
                <Heart className="w-4 h-4 fill-current" />
                <span className="font-mono font-bold text-sm text-[#2C2723]">
                  {recipe.review?.ratings?.reproducibility || 5}.0
                </span>
              </div>
            </div>

            <div>
              <span className="text-[11px] text-[#7A7268] block mb-1">出锅颜值</span>
              <div className="text-sm font-semibold text-[#2C2723]">
                {'★'.repeat(recipe.review?.ratings?.presentation || 5)}
              </div>
            </div>
          </div>

          {/* Tasting Notes */}
          <div className="space-y-4 text-sm">
            {recipe.review?.tastingNotes && (
              <div>
                <h4 className="text-xs font-semibold text-[#2C2723] uppercase tracking-wider mb-1">
                  口感风味手记:
                </h4>
                <p className="text-[#5A5248] leading-relaxed bg-white/70 p-3 rounded-lg border border-[#EADBCE]/80">
                  {recipe.review.tastingNotes}
                </p>
              </div>
            )}

            {recipe.review?.pitfallsAndLessons && (
              <div>
                <h4 className="text-xs font-semibold text-[#C85A32] uppercase tracking-wider mb-1">
                  避坑经验与下次优化:
                </h4>
                <p className="text-[#5A5248] leading-relaxed bg-white/70 p-3 rounded-lg border border-[#EADBCE]/80">
                  {recipe.review.pitfallsAndLessons}
                </p>
              </div>
            )}

            {recipe.review?.pairingSuggestions && (
              <div>
                <h4 className="text-xs font-semibold text-[#5F7A4D] uppercase tracking-wider mb-1">
                  绝配搭档 (主食/饮品):
                </h4>
                <p className="text-[#5A5248] leading-relaxed bg-white/70 p-3 rounded-lg border border-[#EADBCE]/80">
                  {recipe.review.pairingSuggestions}
                </p>
              </div>
            )}

            {recipe.review?.dinerFeedback && (
              <div>
                <h4 className="text-xs font-semibold text-[#C08A3E] uppercase tracking-wider mb-1">
                  食客点评:
                </h4>
                <p className="text-[#5A5248] italic bg-white/70 p-3 rounded-lg border border-[#EADBCE]/80">
                  {recipe.review.dinerFeedback}
                </p>
              </div>
            )}

            {/* Sticker Tags */}
            {recipe.review?.stickers && recipe.review.stickers.length > 0 && (
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <span className="text-xs text-[#7A7268]">手帐印章:</span>
                {recipe.review.stickers.map((stk, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-medium text-[#2C2723] bg-white border border-[#EADBCE] px-2.5 py-1 rounded-full shadow-2xs"
                  >
                    {stk}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Section 4: 烹饪相册 / 附图画廊 (Photo Gallery) */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-[#EADBCE]">
            <h2 className="text-xl font-bold font-journal-title text-[#2C2723] flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#C85A32]" />
              <span>烹饪记录相册</span>
            </h2>
            <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-[#C85A32] hover:text-[#B34C26] font-medium py-1 px-2.5 bg-[#FAF7F2] border border-[#EADBCE] rounded-md transition-colors">
              <Plus className="w-3.5 h-3.5" />
              <span>添加烹饪照片</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handlePhotoUpload(e, 'gallery')}
                disabled={isUploadingPhoto}
              />
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {recipe.coverImage && (
              <div className="aspect-square rounded-lg overflow-hidden border border-[#EADBCE] bg-[#FAF7F2] p-1.5 shadow-xs">
                <img src={recipe.coverImage} alt="成品图" className="w-full h-full object-cover rounded" />
                <span className="block text-[10px] text-center text-[#7A7268] mt-1">成品出锅</span>
              </div>
            )}

            {recipe.galleryPhotos && recipe.galleryPhotos.map((photo, idx) => (
              <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-[#EADBCE] bg-[#FAF7F2] p-1.5 shadow-xs">
                <img src={photo} alt={`烹饪花絮 ${idx + 1}`} className="w-full h-full object-cover rounded" />
                <span className="block text-[10px] text-center text-[#7A7268] mt-1">花絮 #{idx + 1}</span>
              </div>
            ))}

            {(!recipe.galleryPhotos || recipe.galleryPhotos.length === 0) && !recipe.coverImage && (
              <div className="col-span-full py-8 text-center text-xs text-[#9A9085] bg-[#FAF7F2] rounded-xl border border-dashed border-[#EADBCE]">
                暂无实拍照片，点击右上角「添加烹饪照片」将你下厨的过程拍下来放入手帐吧！
              </div>
            )}
          </div>
        </section>

        {/* Bottom Printable Journal Callout Banner */}
        <div className="mt-8 pt-6 border-t border-[#EADBCE] flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4.5 bg-[#FAF7F2] rounded-xl border border-dashed border-[#C85A32]/35 no-print">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#EADBCE] text-[#C85A32] flex items-center justify-center shrink-0 shadow-2xs">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold font-serif text-[#2C2723]">
                将本道食谱生成精美排版的 A4 打印版手帐
              </h4>
              <p className="text-xs text-[#7A7268] mt-0.5">
                支持古典双线边框、火漆邮政印记、清新草木等风格装饰，并可即时预览、另存为 PDF 或导出高清长图。
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsExportPDFOpen(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-[#C85A32] hover:bg-[#B34C26] rounded-lg transition-all shadow-sm flex items-center justify-center gap-1.5 shrink-0 active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>生成打印版手帐</span>
          </button>
        </div>

      </div>

      {/* Floating Toast Notification */}
      {markToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2C2723] text-amber-100 text-xs py-2.5 px-4 rounded-lg border border-[#EADBCE] shadow-xl flex items-center gap-2 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{markToast}</span>
        </div>
      )}

      {/* Mark Cooking Modal */}
      <MarkCookingModal
        isOpen={isMarkModalOpen}
        onClose={() => setIsMarkModalOpen(false)}
        recipes={[recipe]}
        initialRecipe={recipe}
        onSaveRecord={(data) => {
          markRecipeCookedOnDate(
            data.recipe,
            data.date,
            data.notes,
            data.rating,
            null,
            data.dinerFeedback
          );
          setMarkToast(`已成功打卡下厨！已记录在 ${data.date} 烹饪日历中`);
          setTimeout(() => setMarkToast(null), 3500);
        }}
      />

      {/* Recipe PDF Export & Print Modal */}
      <RecipePDFExportModal
        isOpen={isExportPDFOpen}
        onClose={() => setIsExportPDFOpen(false)}
        recipe={recipe}
        servings={servings}
      />

      {/* Quick Online Purchase & QR Code Modal */}
      <QuickPurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        items={purchaseItems}
        sourceTitle={`《${recipe.title}》(${servings}人份)`}
      />
    </article>
  );
};
