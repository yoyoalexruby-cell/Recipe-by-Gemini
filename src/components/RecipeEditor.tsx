import React, { useState, useMemo, useEffect } from 'react';
import { Recipe, RecipeCategory, Ingredient, CookingStep, PRESET_STICKERS, PRESET_WEATHER } from '../types/recipe';
import { getMergedTaxonomy, addCustomCategory, addCustomSubcategory } from '../utils/taxonomyStorage';
import { X, Plus, Trash2, Camera, Star, Check, Sparkles, ChefHat, Film, Tag, Edit3, Sliders, Play, Upload, Flame, Zap, ChevronDown, ChevronUp, Activity, Bell, BellOff, Timer } from 'lucide-react';
import { compressImageFile } from '../utils/storage';
import { VideoPlayer } from './VideoPlayer';
import { ImageEditorModal } from './ImageEditorModal';
import { VoiceTranscriptionButton } from './VoiceTranscriptionButton';
import { estimateRecipeCalories } from '../utils/nutritionCalculator';
import { UserProfile } from '../types/auth';
import { getCurrentUser } from '../utils/authService';

interface RecipeEditorProps {
  initialRecipe?: Recipe | null;
  onSave: (recipe: Recipe) => void;
  onCancel: () => void;
  currentUser?: UserProfile | null;
  onStartTimer?: (minutes: number, label: string) => void;
}

export const RecipeEditor: React.FC<RecipeEditorProps> = ({
  initialRecipe,
  onSave,
  onCancel,
  currentUser: propUser,
  onStartTimer
}) => {
  const isEditing = Boolean(initialRecipe);
  const currentUser = propUser || getCurrentUser();

  // Dynamic taxonomy state with real-time sync
  const [taxonomyRevision, setTaxonomyRevision] = useState(0);
  const activeTaxonomy = useMemo(() => {
    return getMergedTaxonomy(currentUser);
  }, [currentUser, taxonomyRevision]);

  useEffect(() => {
    const handleUpdate = () => setTaxonomyRevision((prev) => prev + 1);
    window.addEventListener('taxonomy-updated', handleUpdate);
    return () => window.removeEventListener('taxonomy-updated', handleUpdate);
  }, []);

  const [title, setTitle] = useState(initialRecipe?.title || '');
  const [subtitle, setSubtitle] = useState(initialRecipe?.subtitle || '');
  const [category, setCategory] = useState<RecipeCategory>(initialRecipe?.category || '烘焙甜点');
  const [subCategory, setSubCategory] = useState<string>(() => {
    if (initialRecipe?.subCategory) return initialRecipe.subCategory;
    const initialTax = getMergedTaxonomy(currentUser);
    const cat = initialRecipe?.category || '烘焙甜点';
    return initialTax[cat]?.subcategories[0]?.id || '西式烘焙';
  });

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    const subList = activeTaxonomy[newCat]?.subcategories || [];
    if (subList.length > 0) {
      setSubCategory(subList[0].id);
    }
  };

  // Inline category and subcategory creation state
  const [showAddCatInline, setShowAddCatInline] = useState(false);
  const [inlineCatName, setInlineCatName] = useState('');
  const [inlineCatIcon, setInlineCatIcon] = useState('🥘');
  const [inlineCatDesc, setInlineCatDesc] = useState('');

  const [showAddSubInline, setShowAddSubInline] = useState(false);
  const [inlineSubName, setInlineSubName] = useState('');
  const [inlineSubIcon, setInlineSubIcon] = useState('✨');
  const [inlineSubDesc, setInlineSubDesc] = useState('');

  // Flavor & style tags state
  const [tags, setTags] = useState<string[]>(() => {
    if (initialRecipe?.tags && initialRecipe.tags.length > 0) return initialRecipe.tags;
    if (initialRecipe?.cuisine) return [initialRecipe.cuisine];
    return ['私房中式'];
  });
  const [newTagInput, setNewTagInput] = useState('');

  const [cuisine, setCuisine] = useState(initialRecipe?.cuisine || '私房中式');
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(initialRecipe?.prepTimeMinutes || 15);
  const [cookTimeMinutes, setCookTimeMinutes] = useState(initialRecipe?.cookTimeMinutes || 30);
  const [baseServings, setBaseServings] = useState(initialRecipe?.baseServings || 2);
  const [estimatedCalories, setEstimatedCalories] = useState<number | ''>(
    initialRecipe?.estimatedCalories !== undefined ? initialRecipe.estimatedCalories : ''
  );
  const [showCalorieBreakdown, setShowCalorieBreakdown] = useState(false);
  const [difficulty, setDifficulty] = useState(initialRecipe?.difficulty || 3);
  const [weatherStamp, setWeatherStamp] = useState(initialRecipe?.weatherStamp || '☀️ 晴暖好食');
  const [coverImage, setCoverImage] = useState(initialRecipe?.coverImage || '');
  const [coverVideo, setCoverVideo] = useState(initialRecipe?.coverVideo || initialRecipe?.videoUrl || '');
  const [coverVideoInput, setCoverVideoInput] = useState('');
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [utensilsText, setUtensilsText] = useState(initialRecipe?.utensils?.join('、') || '不粘煎锅、主厨刀');

  // Image Editor Modal target state
  const [imageEditorTarget, setImageEditorTarget] = useState<{
    type: 'cover' | 'step';
    stepIndex?: number;
    url: string;
    title: string;
  } | null>(null);

  // Ingredients state
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initialRecipe?.ingredients || [
      { id: 'ing-1', name: '主料食材', amount: 300, unit: '克', category: 'main' },
      { id: 'ing-2', name: '生抽', amount: 2, unit: '汤匙', category: 'seasoning', note: '提鲜' },
      { id: 'ing-3', name: '小葱碎', amount: 1, unit: '小撮', category: 'garnish' }
    ]
  );

  // Steps state
  const [steps, setSteps] = useState<CookingStep[]>(
    initialRecipe?.steps || [
      {
        id: 'st-1',
        stepNumber: 1,
        title: '洗净切配与备料',
        description: '食材洗净后改刀切块备用，沥干水分。',
        durationMinutes: 10,
        heat: '中火',
        tip: '食材水分需用厨房纸吸干，避免入锅油花飞溅。'
      },
      {
        id: 'st-2',
        stepNumber: 2,
        title: '入锅烹饪与调味',
        description: '热锅凉油，下入调料煸炒出香气，均匀包裹食材翻炒。',
        durationMinutes: 15,
        heat: '大火'
      }
    ]
  );

  // Review & Reflection state
  const [tastingNotes, setTastingNotes] = useState(initialRecipe?.review?.tastingNotes || '');
  const [pitfallsAndLessons, setPitfallsAndLessons] = useState(initialRecipe?.review?.pitfallsAndLessons || '');
  const [pairingSuggestions, setPairingSuggestions] = useState(initialRecipe?.review?.pairingSuggestions || '');
  const [dinerFeedback, setDinerFeedback] = useState(initialRecipe?.review?.dinerFeedback || '');
  const [tasteRating, setTasteRating] = useState(initialRecipe?.review?.ratings?.taste || 5);
  const [reproducibilityRating, setReproducibilityRating] = useState(initialRecipe?.review?.ratings?.reproducibility || 5);
  const [selectedStickers, setSelectedStickers] = useState<string[]>(
    initialRecipe?.review?.stickers || ['🍚 米饭杀手', '✨ 满分硬菜']
  );
  const [cookDate, setCookDate] = useState(initialRecipe?.review?.cookDate || new Date().toISOString().slice(0, 10));

  const [activeTab, setActiveTab] = useState<'basic' | 'ingredients' | 'steps' | 'review'>('basic');
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  // Intelligent real-time recipe calorie estimation based on ingredients
  const calorieEstimate = useMemo(() => {
    return estimateRecipeCalories(ingredients, Number(baseServings) || 2);
  }, [ingredients, baseServings]);

  const handleAutoEstimateCalories = () => {
    if (calorieEstimate.totalCalories > 0) {
      setEstimatedCalories(calorieEstimate.totalCalories);
    }
  };

  // Handle cover image upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsProcessingImage(true);
      const base64 = await compressImageFile(file);
      setCoverImage(base64);
    } catch (err) {
      console.error('Image compression error', err);
    } finally {
      setIsProcessingImage(false);
    }
  };

  // Ingredient Helpers
  const addIngredientRow = (cat: 'main' | 'seasoning' | 'garnish') => {
    setIngredients([
      ...ingredients,
      {
        id: 'ing-' + Date.now() + Math.random().toString(36).substring(2, 6),
        name: '',
        amount: 1,
        unit: '份',
        category: cat,
        note: ''
      }
    ]);
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: unknown) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  // Step Helpers
  const addStepRow = () => {
    setSteps([
      ...steps,
      {
        id: 'st-' + Date.now(),
        stepNumber: steps.length + 1,
        title: `步骤 ${steps.length + 1}`,
        description: '',
        durationMinutes: 5,
        heat: '中火',
        hasTimerPush: true
      }
    ]);
  };

  const updateStep = (index: number, field: keyof CookingStep, value: unknown) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
    setSteps(updated);
  };

  const removeStep = (index: number) => {
    const updated = steps
      .filter((_, i) => i !== index)
      .map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
    setSteps(updated);
  };

  // Toggle Sticker
  const toggleSticker = (sticker: string) => {
    if (selectedStickers.includes(sticker)) {
      setSelectedStickers(selectedStickers.filter((s) => s !== sticker));
    } else {
      setSelectedStickers([...selectedStickers, sticker]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('请输入食谱名称！');
      return;
    }

    const utensilsList = utensilsText
      .split(/[,，、]/)
      .map((u) => u.trim())
      .filter(Boolean);

    const recipe: Recipe = {
      id: initialRecipe?.id || 'recipe-' + Date.now(),
      title: title.trim(),
      subtitle: subtitle.trim(),
      category,
      subCategory: subCategory.trim(),
      cuisine: tags[0] || cuisine.trim() || '私房中式',
      tags: tags.length > 0 ? tags : [cuisine.trim() || '私房中式'],
      prepTimeMinutes: Number(prepTimeMinutes) || 10,
      cookTimeMinutes: Number(cookTimeMinutes) || 15,
      baseServings: Number(baseServings) || 2,
      estimatedCalories: estimatedCalories !== '' ? Number(estimatedCalories) : undefined,
      difficulty: Number(difficulty) || 3,
      coverImage: coverImage || '',
      coverVideo: coverVideo.trim() || undefined,
      videoUrl: coverVideo.trim() || undefined,
      weatherStamp,
      utensils: utensilsList.length > 0 ? utensilsList : ['常规锅具'],
      ingredients: ingredients.filter((i) => i.name.trim().length > 0),
      steps: steps.filter((s) => s.title.trim().length > 0 || s.description.trim().length > 0),
      review: {
        tastingNotes,
        pitfallsAndLessons,
        pairingSuggestions,
        ratings: {
          taste: tasteRating,
          difficulty,
          reproducibility: reproducibilityRating,
          presentation: 5
        },
        stickers: selectedStickers,
        dinerFeedback,
        cookDate
      },
      createdAt: initialRecipe?.createdAt || new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      isFavorite: initialRecipe?.isFavorite ?? false
    };

    onSave(recipe);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF7F2] rounded-2xl border border-[#EADBCE] shadow-2xl max-w-3xl w-full my-6 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:px-6 border-b border-[#EADBCE] bg-white">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-[#C85A32]" />
            <h2 className="text-base sm:text-lg font-bold font-journal-title text-[#2C2723]">
              {isEditing ? '编辑烹饪手帐' : '记一笔新的私房菜谱'}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 text-[#9A9085] hover:text-[#2C2723] rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-[#EADBCE] bg-[#FAF7F2] text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`py-2 px-3 border-b-2 transition-colors ${
              activeTab === 'basic' ? 'border-[#C85A32] text-[#C85A32] font-semibold' : 'border-transparent text-[#7A7268] hover:text-[#2C2723]'
            }`}
          >
            1. 基本信息与配图
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ingredients')}
            className={`py-2 px-3 border-b-2 transition-colors ${
              activeTab === 'ingredients' ? 'border-[#C85A32] text-[#C85A32] font-semibold' : 'border-transparent text-[#7A7268] hover:text-[#2C2723]'
            }`}
          >
            2. 食材清单 ({ingredients.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('steps')}
            className={`py-2 px-3 border-b-2 transition-colors ${
              activeTab === 'steps' ? 'border-[#C85A32] text-[#C85A32] font-semibold' : 'border-transparent text-[#7A7268] hover:text-[#2C2723]'
            }`}
          >
            3. 烹饪步骤 ({steps.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('review')}
            className={`py-2 px-3 border-b-2 transition-colors ${
              activeTab === 'review' ? 'border-[#C85A32] text-[#C85A32] font-semibold' : 'border-transparent text-[#7A7268] hover:text-[#2C2723]'
            }`}
          >
            4. 心得与复盘
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: BASIC INFO & PHOTO */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              {/* Photo Upload Area */}
              {/* Photo & Video Upload Area */}
              <div>
                <label className="block text-xs font-semibold text-[#2C2723] mb-1.5 flex items-center justify-between">
                  <span>菜品配图与封面视频</span>
                  <span className="text-[11px] text-[#7A7268] font-normal">支持实拍照片批注、滤镜炫彩与烹饪短视频</span>
                </label>
                <div className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-white rounded-xl border border-[#EADBCE]">
                  {/* Photo Thumbnail */}
                  <div className="w-36 h-28 rounded-lg overflow-hidden bg-[#FAF7F2] border border-[#EADBCE] flex items-center justify-center shrink-0 relative group">
                    {coverImage ? (
                      <>
                        <img src={coverImage} alt="封面预览" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setImageEditorTarget({
                            type: 'cover',
                            url: coverImage,
                            title: '编辑封面图片与文字批注'
                          })}
                          className="absolute inset-0 bg-black/40 text-white text-xs font-medium flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Sparkles className="w-4 h-4 mb-0.5 text-amber-300" />
                          <span>点击编辑批注</span>
                        </button>
                      </>
                    ) : (
                      <div className="text-center p-2 text-xs text-[#9A9085]">
                        <Camera className="w-6 h-6 mx-auto mb-1 text-[#C85A32]/60" />
                        <span>暂无配图</span>
                      </div>
                    )}
                  </div>

                  {/* Actions & Video section */}
                  <div className="flex-1 space-y-2.5 text-xs text-[#7A7268] w-full">
                    <p>支持从手机相册或电脑上传实拍菜品照片，系统会自动完成轻量压缩，并支持滤镜炫彩与手帐贴纸批注。</p>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="cursor-pointer px-3 py-1.5 bg-[#C85A32] text-white rounded-md font-medium hover:bg-[#B34C26] transition-colors flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5" />
                        <span>{isProcessingImage ? '压缩中...' : coverImage ? '更换照片' : '上传菜品实拍图'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleCoverUpload}
                          disabled={isProcessingImage}
                        />
                      </label>

                      {coverImage && (
                        <>
                          <button
                            type="button"
                            onClick={() => setImageEditorTarget({
                              type: 'cover',
                              url: coverImage,
                              title: '编辑封面图片与文字批注'
                            })}
                            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-[#C85A32] border border-[#C85A32]/30 rounded-md font-medium transition-colors flex items-center gap-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
                            <span>✨ 炫彩滤镜与文字批注</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setCoverImage('')}
                            className="px-2.5 py-1.5 border border-[#EADBCE] rounded-md hover:bg-[#FAF7F2] text-[#9A9085]"
                          >
                            移除
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => setShowVideoInput(!showVideoInput)}
                        className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 border ${
                          coverVideo || showVideoInput
                            ? 'bg-[#5F7A4D]/10 text-[#5F7A4D] border-[#5F7A4D]/40'
                            : 'bg-[#FAF7F2] text-[#7A7268] hover:text-[#2C2723] border-[#EADBCE]'
                        }`}
                      >
                        <Film className="w-3.5 h-3.5" />
                        <span>{coverVideo ? '🎥 已上传封面视频' : '📹 添加烹饪短视频'}</span>
                      </button>
                    </div>

                    {/* Cover Video Input Panel */}
                    {(showVideoInput || coverVideo) && (
                      <div className="pt-2 border-t border-[#F0E6DC] space-y-2 animate-fade-in">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <label className="cursor-pointer px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#FAF3EC] text-[#2C2723] border border-[#EADBCE] rounded-md text-xs font-medium flex items-center justify-center gap-1.5 shrink-0">
                            <Upload className="w-3.5 h-3.5 text-[#C85A32]" />
                            <span>本地上传视频 (MP4/WebM)</span>
                            <input
                              type="file"
                              accept="video/mp4,video/webm,video/quicktime"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                    if (typeof ev.target?.result === 'string') {
                                      setCoverVideo(ev.target.result);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>

                          <div className="flex-1 flex items-center gap-1.5">
                            <input
                              type="url"
                              placeholder="或粘贴在线视频链接 (如 MP4 直链)..."
                              value={coverVideoInput}
                              onChange={(e) => setCoverVideoInput(e.target.value)}
                              className="flex-1 px-2.5 py-1.5 text-xs bg-[#FAF7F2] border border-[#EADBCE] rounded-md focus:outline-hidden focus:border-[#C85A32]"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (coverVideoInput.trim()) {
                                  setCoverVideo(coverVideoInput.trim());
                                  setCoverVideoInput('');
                                }
                              }}
                              className="px-2.5 py-1.5 bg-[#2C2723] text-white text-xs rounded-md shrink-0 hover:bg-black"
                            >
                              使用
                            </button>
                          </div>

                          {coverVideo && (
                            <button
                              type="button"
                              onClick={() => setCoverVideo('')}
                              className="text-xs text-rose-500 hover:text-rose-700 px-2 py-1 rounded"
                            >
                              移除视频
                            </button>
                          )}
                        </div>

                        {coverVideo && (
                          <div className="max-w-sm aspect-video rounded-lg overflow-hidden border border-[#EADBCE]">
                            <VideoPlayer src={coverVideo} poster={coverImage} title="封面视频预览" />
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </div>
              </div>

              {/* Dish Title & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2C2723] mb-1">
                    菜品名称 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="例如：日式照烧三文鱼"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#EADBCE] rounded-lg focus:outline-hidden focus:border-[#C85A32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2C2723] mb-1">
                    手帐副标 / 风味特质
                  </label>
                  <input
                    type="text"
                    placeholder="例如：外焦里嫩，甜咸适口的下饭快手菜"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#EADBCE] rounded-lg focus:outline-hidden focus:border-[#C85A32]"
                  />
                </div>
              </div>

              {/* Authoritative Category & Subcategory Two-Tier Classification (Supports custom primary & secondary) */}
              <div className="p-4 bg-white rounded-xl border border-[#EADBCE] space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-[#F0E6DC]">
                  <span className="text-xs font-bold text-[#2C2723] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
                    <span>分类与细分标签体系</span>
                  </span>
                  <span className="text-[11px] text-[#7A7268]">精准二级细分便于按风味检索 · 支持随时自定义名录</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Primary Category Column */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-[#2C2723]">
                        主分类 (一级大类)
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowAddCatInline(!showAddCatInline)}
                        className="text-[11px] text-[#C85A32] hover:underline font-medium flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{showAddCatInline ? '收起添加' : '自定义主分类'}</span>
                      </button>
                    </div>

                    <select
                      value={category}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '__ADD_NEW_CAT__') {
                          setShowAddCatInline(true);
                        } else {
                          handleCategoryChange(val);
                        }
                      }}
                      className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#EADBCE] rounded-lg focus:outline-hidden focus:border-[#C85A32] font-semibold text-[#2C2723]"
                    >
                      {Object.keys(activeTaxonomy).map((cat) => (
                        <option key={cat} value={cat}>
                          {activeTaxonomy[cat].icon} {cat} ({activeTaxonomy[cat].shortLabel || cat})
                        </option>
                      ))}
                      <option value="__ADD_NEW_CAT__" className="text-[#C85A32] font-bold">
                        ＋ 自定义添加新主分类...
                      </option>
                    </select>

                    <span className="text-[10px] text-[#7A7268] mt-1 block">
                      {activeTaxonomy[category]?.description || '自定义风味与私房名录'}
                    </span>

                    {/* Inline Primary Category Creator */}
                    {showAddCatInline && (
                      <div className="mt-2.5 p-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-lg space-y-2 animate-fade-in text-xs">
                        <div className="font-semibold text-[#C85A32] flex items-center justify-between">
                          <span>添加自定义一级大类</span>
                          <button
                            type="button"
                            onClick={() => setShowAddCatInline(false)}
                            className="text-[#9A9085] hover:text-[#2C2723]"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="主分类名称 (如：家酿饮品、露营野炊)"
                            value={inlineCatName}
                            onChange={(e) => setInlineCatName(e.target.value)}
                            className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-[#EADBCE] rounded focus:border-[#C85A32]"
                          />
                          <input
                            type="text"
                            placeholder="图标"
                            value={inlineCatIcon}
                            onChange={(e) => setInlineCatIcon(e.target.value)}
                            className="w-12 text-center py-1.5 text-xs bg-white border border-[#EADBCE] rounded"
                            title="输入Emoji图标"
                          />
                        </div>

                        <input
                          type="text"
                          placeholder="分类简要说明 (如：手作微醺、特调冰饮与围炉煮茶)"
                          value={inlineCatDesc}
                          onChange={(e) => setInlineCatDesc(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#EADBCE] rounded focus:border-[#C85A32]"
                        />

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setShowAddCatInline(false)}
                            className="px-2.5 py-1 text-xs text-[#7A7268] hover:text-[#2C2723]"
                          >
                            取消
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!inlineCatName.trim()) {
                                alert('请输入主分类名称！');
                                return;
                              }
                              const trimmed = inlineCatName.trim();
                              const success = addCustomCategory(
                                trimmed,
                                inlineCatIcon,
                                inlineCatDesc,
                                currentUser
                              );
                              if (success) {
                                setCategory(trimmed);
                                setSubCategory(`${trimmed}精选`);
                                setShowAddCatInline(false);
                                setInlineCatName('');
                                setInlineCatDesc('');
                              }
                            }}
                            className="px-3 py-1 bg-[#C85A32] text-white rounded text-xs font-medium hover:bg-[#B34C26]"
                          >
                            保存并选用
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Secondary Subcategory Column */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-[#2C2723]">
                        二级细分 (权威分类) <span className="text-[#C85A32]">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowAddSubInline(!showAddSubInline)}
                        className="text-[11px] text-[#C85A32] hover:underline font-medium flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{showAddSubInline ? '收起添加' : '添加二级细分'}</span>
                      </button>
                    </div>

                    <select
                      value={subCategory}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '__ADD_NEW_SUB__') {
                          setShowAddSubInline(true);
                        } else {
                          setSubCategory(val);
                        }
                      }}
                      className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#C85A32] rounded-lg focus:outline-hidden focus:border-[#C85A32] font-bold text-[#C85A32]"
                    >
                      {(activeTaxonomy[category]?.subcategories || []).map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.icon} {sub.label} —— {sub.desc}
                        </option>
                      ))}
                      <option value="__ADD_NEW_SUB__" className="text-[#C85A32] font-bold">
                        ＋ 为当前「{category}」添加二级细分名录...
                      </option>
                    </select>

                    <span className="text-[10px] text-[#C85A32] mt-1 block truncate">
                      包含：{(activeTaxonomy[category]?.subcategories || []).find((s) => s.id === subCategory)?.desc || '精选拿手风味做法'}
                    </span>

                    {/* Inline Secondary Subcategory Creator */}
                    {showAddSubInline && (
                      <div className="mt-2.5 p-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-lg space-y-2 animate-fade-in text-xs">
                        <div className="font-semibold text-[#C85A32] flex items-center justify-between">
                          <span>为「{category}」添加二级细分</span>
                          <button
                            type="button"
                            onClick={() => setShowAddSubInline(false)}
                            className="text-[#9A9085] hover:text-[#2C2723]"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="细分名录名称 (如：特调冰饮、潮汕手打丸)"
                            value={inlineSubName}
                            onChange={(e) => setInlineSubName(e.target.value)}
                            className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-[#EADBCE] rounded focus:border-[#C85A32]"
                          />
                          <input
                            type="text"
                            placeholder="图标"
                            value={inlineSubIcon}
                            onChange={(e) => setInlineSubIcon(e.target.value)}
                            className="w-12 text-center py-1.5 text-xs bg-white border border-[#EADBCE] rounded"
                            title="输入Emoji图标"
                          />
                        </div>

                        <input
                          type="text"
                          placeholder="代表菜品/特色说明 (如：生椰拿铁/暴打柠檬茶/杨枝甘露)"
                          value={inlineSubDesc}
                          onChange={(e) => setInlineSubDesc(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#EADBCE] rounded focus:border-[#C85A32]"
                        />

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setShowAddSubInline(false)}
                            className="px-2.5 py-1 text-xs text-[#7A7268] hover:text-[#2C2723]"
                          >
                            取消
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!inlineSubName.trim()) {
                                alert('请输入二级细分名称！');
                                return;
                              }
                              const trimmed = inlineSubName.trim();
                              const success = addCustomSubcategory(
                                category,
                                trimmed,
                                inlineSubDesc,
                                inlineSubIcon,
                                currentUser
                              );
                              if (success) {
                                setSubCategory(trimmed);
                                setShowAddSubInline(false);
                                setInlineSubName('');
                                setInlineSubDesc('');
                              }
                            }}
                            className="px-3 py-1 bg-[#C85A32] text-white rounded text-xs font-medium hover:bg-[#B34C26]"
                          >
                            保存并选用
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Cuisine / Flavor Style Tags & Weather Stamp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Flavor & Cuisine Tags Chip Manager */}
                <div className="p-3 bg-white rounded-xl border border-[#EADBCE] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-[#2C2723] flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-[#C85A32]" />
                      <span>菜系 / 风味风格标签 (选填，支持自由添加)</span>
                    </label>
                  </div>

                  {/* Active tags chip strip */}
                  <div className="flex flex-wrap items-center gap-1.5 min-h-[28px]">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#FAF3EC] text-[#C85A32] border border-[#EADBCE] shadow-2xs"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = tags.filter((t) => t !== tag);
                            setTags(updated);
                            if (cuisine === tag) {
                              setCuisine(updated[0] || '');
                            }
                          }}
                          className="hover:text-rose-600 transition-colors ml-0.5 text-xs font-bold"
                          title="移除此标签"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                    {tags.length === 0 && (
                      <span className="text-xs text-[#9A9085]">暂无标签，可输入或点选下方推荐标签</span>
                    )}
                  </div>

                  {/* Add Custom Tag Input */}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="自定义输入风味标签 (如：空气炸锅、免烤箱、宵夜解馋)..."
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = newTagInput.trim();
                          if (val && !tags.includes(val)) {
                            setTags([...tags, val]);
                            if (!cuisine) setCuisine(val);
                            setNewTagInput('');
                          }
                        }
                      }}
                      className="flex-1 px-2.5 py-1.5 text-xs bg-[#FAF7F2] border border-[#EADBCE] rounded-lg focus:outline-hidden focus:border-[#C85A32] text-[#2C2723]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = newTagInput.trim();
                        if (val && !tags.includes(val)) {
                          setTags([...tags, val]);
                          if (!cuisine) setCuisine(val);
                          setNewTagInput('');
                        }
                      }}
                      disabled={!newTagInput.trim()}
                      className="px-2.5 py-1.5 bg-[#FAF7F2] hover:bg-[#FAF3EC] text-[#C85A32] border border-[#EADBCE] hover:border-[#C85A32] text-xs font-medium rounded-lg transition-colors shrink-0 disabled:opacity-40"
                    >
                      + 添加标签
                    </button>
                  </div>

                  {/* Quick-pick popular flavor suggestions */}
                  <div className="pt-2 border-t border-[#F0E6DC]/80">
                    <span className="text-[10px] text-[#9A9085] block mb-1">快捷点选推荐标签：</span>
                    <div className="flex flex-wrap gap-1">
                      {[
                        '私房中式', '川湘麻辣', '粤港清鲜', '日韩和风', '法式西餐', 
                        '快手下饭', '减脂低卡', '治愈甜品', '免烤箱', '深夜食堂', '聚会硬菜', '空气炸锅'
                      ].map((preset) => {
                        const isSelected = tags.includes(preset);
                        return (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                const updated = tags.filter((t) => t !== preset);
                                setTags(updated);
                                if (cuisine === preset) setCuisine(updated[0] || '');
                              } else {
                                setTags([...tags, preset]);
                                if (!cuisine) setCuisine(preset);
                              }
                            }}
                            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors border ${
                              isSelected
                                ? 'bg-[#C85A32] text-white border-[#C85A32]'
                                : 'bg-[#FAF7F2] text-[#7A7268] hover:text-[#2C2723] border-[#EADBCE]'
                            }`}
                          >
                            {isSelected ? '✓ ' : '+ '}{preset}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Weather Stamp Selection */}
                <div className="p-3 bg-white rounded-xl border border-[#EADBCE] space-y-2.5 flex flex-col justify-between">
                  <div>
                    <label className="block text-xs font-semibold text-[#2C2723] mb-1">
                      手帐天气印记
                    </label>
                    <select
                      value={weatherStamp}
                      onChange={(e) => setWeatherStamp(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#EADBCE] rounded-lg focus:outline-hidden focus:border-[#C85A32]"
                    >
                      {PRESET_WEATHER.map((w) => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[11px] text-[#7A7268] leading-relaxed">
                    用天气与节令为这篇手帐加盖专属时令印记，日历回顾时将呈现独特的美食烟火印戳。
                  </p>
                </div>
              </div>

              {/* Prep time, Cook time, Base servings, Difficulty & Estimated Calories */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-white p-4 rounded-xl border border-[#EADBCE]">
                <div>
                  <label className="block text-xs text-[#7A7268] mb-1">备料用时 (分钟)</label>
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={prepTimeMinutes}
                    onChange={(e) => setPrepTimeMinutes(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-sm font-mono border border-[#EADBCE] rounded-md focus:outline-hidden focus:border-[#C85A32]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#7A7268] mb-1">烹饪用时 (分钟)</label>
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={cookTimeMinutes}
                    onChange={(e) => setCookTimeMinutes(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-sm font-mono border border-[#EADBCE] rounded-md focus:outline-hidden focus:border-[#C85A32]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#7A7268] mb-1">基准分量 (人份)</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={baseServings}
                    onChange={(e) => setBaseServings(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-sm font-mono border border-[#EADBCE] rounded-md focus:outline-hidden focus:border-[#C85A32]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#7A7268] mb-1">难度等级</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(Number(e.target.value))}
                    className="w-full px-2 py-1.5 text-sm border border-[#EADBCE] rounded-md focus:outline-hidden focus:border-[#C85A32]"
                  >
                    <option value="1">1星 (极易小白)</option>
                    <option value="2">2星 (快手日常)</option>
                    <option value="3">3星 (需控火候)</option>
                    <option value="4">4星 (精细烘焙/宴客)</option>
                    <option value="5">5星 (大师级大菜)</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-[#7A7268] flex items-center gap-1">
                      <Flame className="w-3 h-3 text-[#C85A32]" />
                      <span>热量预估 (kcal)</span>
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="20000"
                      placeholder={calorieEstimate.totalCalories > 0 ? `测算约 ${calorieEstimate.totalCalories}` : '选填'}
                      value={estimatedCalories}
                      onChange={(e) => setEstimatedCalories(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-sm font-mono border border-[#EADBCE] rounded-md focus:outline-hidden focus:border-[#C85A32]"
                      title="整道菜预估总热量，可手动输入或点击下方「采纳测算值」自动填充"
                    />
                    <span className="absolute right-2 top-2 text-[10px] text-[#9A9085] pointer-events-none">kcal</span>
                  </div>
                </div>
              </div>

              {/* Real-time Calorie & Nutrition Estimation Card */}
              <div className="bg-[#FAF7F2] border border-[#EADBCE] rounded-xl p-3.5 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#C85A32] flex items-center justify-center shrink-0">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#2C2723]">
                        <span>基于食材实时测算：整道菜约 {calorieEstimate.totalCalories} kcal</span>
                        <span className="text-[#7A7268] font-normal">
                          (约 {calorieEstimate.perServingCalories} kcal / 人份)
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${calorieEstimate.healthLevel.badgeColor}`}>
                          {calorieEstimate.healthLevel.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#7A7268] mt-0.5">
                        {calorieEstimate.healthLevel.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAutoEstimateCalories}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold bg-[#C85A32] hover:bg-[#B34C26] active:scale-[0.98] text-white transition-all shadow-2xs"
                      title="将算法测算的整道菜总热量一键写入热量字段"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>采纳自动测算 ({calorieEstimate.totalCalories} kcal)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCalorieBreakdown(!showCalorieBreakdown)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs text-[#5A5248] hover:text-[#2C2723] bg-white border border-[#EADBCE] transition-colors"
                      title="查看各食材热量明细"
                    >
                      <Activity className="w-3.5 h-3.5 text-[#C85A32]" />
                      <span>{showCalorieBreakdown ? '收起明细' : '热量明细'}</span>
                      {showCalorieBreakdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Collapsible Ingredient Calorie Breakdown */}
                {showCalorieBreakdown && (
                  <div className="mt-2.5 pt-2.5 border-t border-[#EADBCE]/70 text-xs">
                    <div className="text-[11px] font-semibold text-[#5A5248] mb-2 flex items-center justify-between">
                      <span>各食材热量贡献明细 (共 {calorieEstimate.details.length} 项)</span>
                      <span className="text-[#9A9085]">基于食材库与用量换算（每100克标准）</span>
                    </div>
                    {calorieEstimate.details.length === 0 ? (
                      <p className="text-[#9A9085] italic text-[11px]">暂无食材数据，请在食材清单标签页添加食材</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-52 overflow-y-auto pr-1">
                        {calorieEstimate.details.map((item) => (
                          <div
                            key={item.id}
                            className="bg-white p-2 rounded-lg border border-[#EADBCE]/80 flex items-center justify-between shadow-2xs"
                          >
                            <div className="min-w-0 pr-2">
                              <span className="font-medium text-[#2C2723] block truncate">{item.name}</span>
                              <span className="text-[10px] text-[#7A7268]">
                                {item.amount} {item.unit} (约 {item.calculatedGrams}g)
                              </span>
                            </div>
                            <span className="font-mono text-[#C85A32] font-semibold text-xs shrink-0">
                              {item.calories} <span className="text-[10px] text-[#9A9085] font-sans">kcal</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Cookware Utensils */}
              <div>
                <label className="block text-xs font-semibold text-[#2C2723] mb-1">
                  所需厨具 / 器皿 (以顿号或逗号隔开)
                </label>
                <input
                  type="text"
                  placeholder="如：厚底铸铁锅、硅胶铲、厨房秤"
                  value={utensilsText}
                  onChange={(e) => setUtensilsText(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#EADBCE] rounded-lg focus:outline-hidden focus:border-[#C85A32]"
                />
              </div>
            </div>
          )}

          {/* TAB 2: INGREDIENTS */}
          {activeTab === 'ingredients' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#7A7268]">
                  填写食材与用量，后续可在菜谱详情中根据用餐人数自由无损倍数缩放。
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => addIngredientRow('main')}
                    className="px-2 py-1 text-xs bg-[#FAF7F2] border border-[#EADBCE] hover:border-[#C85A32] text-[#C85A32] rounded flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ 主料</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addIngredientRow('seasoning')}
                    className="px-2 py-1 text-xs bg-[#FAF7F2] border border-[#EADBCE] hover:border-[#C08A3E] text-[#C08A3E] rounded flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ 调料</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addIngredientRow('garnish')}
                    className="px-2 py-1 text-xs bg-[#FAF7F2] border border-[#EADBCE] hover:border-[#5F7A4D] text-[#5F7A4D] rounded flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ 配菜</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 bg-[#FAF7F2] border border-[#EADBCE] rounded-lg text-xs text-[#5A5248]">
                <div className="flex flex-wrap items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>
                    食材热量实时速算：整道菜约 <strong className="font-mono text-[#2C2723]">{calorieEstimate.totalCalories}</strong> kcal
                    （约 <strong className="font-mono text-[#2C2723]">{calorieEstimate.perServingCalories}</strong> kcal/人份）
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${calorieEstimate.healthLevel.badgeColor}`}>
                    {calorieEstimate.healthLevel.label}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAutoEstimateCalories}
                  className="text-xs text-[#C85A32] hover:text-[#B34C26] hover:underline flex items-center gap-1 font-semibold transition-colors"
                  title="将测算值填入菜谱基本信息的热量字段"
                >
                  <Zap className="w-3 h-3" />
                  <span>采纳为菜谱预估热量</span>
                </button>
              </div>

              <div className="space-y-2">
                {ingredients.map((ing, idx) => (
                  <div key={ing.id || idx} className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-[#EADBCE]">
                    {/* Category Selector */}
                    <select
                      value={ing.category}
                      onChange={(e) => updateIngredient(idx, 'category', e.target.value)}
                      className="text-xs py-1 px-1.5 border border-[#EADBCE] rounded bg-[#FAF7F2] shrink-0"
                    >
                      <option value="main">主料</option>
                      <option value="seasoning">调料</option>
                      <option value="garnish">点缀</option>
                    </select>

                    {/* Ingredient Name */}
                    <input
                      type="text"
                      placeholder="食材名称 (如 五花肉)"
                      value={ing.name}
                      onChange={(e) => updateIngredient(idx, 'name', e.target.value)}
                      className="flex-2 min-w-[100px] text-xs px-2.5 py-1.5 border border-[#EADBCE] rounded focus:outline-hidden focus:border-[#C85A32]"
                    />

                    {/* Quantity */}
                    <input
                      type="number"
                      step="any"
                      placeholder="用量"
                      value={ing.amount}
                      onChange={(e) => updateIngredient(idx, 'amount', Number(e.target.value) || 0)}
                      className="w-16 text-xs px-2 py-1.5 font-mono border border-[#EADBCE] rounded focus:outline-hidden focus:border-[#C85A32]"
                    />

                    {/* Unit */}
                    <input
                      type="text"
                      placeholder="单位 (克/勺)"
                      value={ing.unit}
                      onChange={(e) => updateIngredient(idx, 'unit', e.target.value)}
                      className="w-16 text-xs px-2 py-1.5 border border-[#EADBCE] rounded focus:outline-hidden focus:border-[#C85A32]"
                    />

                    {/* Optional Note */}
                    <input
                      type="text"
                      placeholder="备注 (如 切薄片)"
                      value={ing.note || ''}
                      onChange={(e) => updateIngredient(idx, 'note', e.target.value)}
                      className="flex-1 text-xs px-2 py-1.5 border border-[#EADBCE] rounded hidden sm:block focus:outline-hidden focus:border-[#C85A32]"
                    />

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => removeIngredient(idx)}
                      className="p-1 text-[#9A9085] hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: STEPS */}
          {activeTab === 'steps' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#7A7268]">
                  细致记录每一步骤的火候、操作时序与避坑诀窍，下厨时一目了然。
                </p>
                <button
                  type="button"
                  onClick={addStepRow}
                  className="px-3 py-1.5 text-xs bg-[#C85A32] text-white rounded-md hover:bg-[#B34C26] flex items-center gap-1 font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>添加步骤</span>
                </button>
              </div>

              <div className="space-y-4">
                {steps.map((st, idx) => (
                  <div key={st.id || idx} className="bg-white p-4 rounded-xl border border-[#EADBCE] space-y-3">
                    <div className="flex items-center justify-between gap-2 border-b border-[#F0E6DC] pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#FAF7F2] border border-[#C85A32] text-[#C85A32] text-xs font-mono font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          placeholder="步骤标题 (如 焯水去腥)"
                          value={st.title}
                          onChange={(e) => updateStep(idx, 'title', e.target.value)}
                          className="font-bold text-sm text-[#2C2723] border-b border-transparent focus:border-[#C85A32] focus:outline-hidden px-1"
                        />
                      </div>

                      <div className="flex items-center gap-2 text-xs flex-wrap">
                        <select
                          value={st.heat || '中火'}
                          onChange={(e) => updateStep(idx, 'heat', e.target.value)}
                          className="py-1 px-2 border border-[#EADBCE] rounded bg-[#FAF7F2] text-xs text-[#C85A32]"
                        >
                          <option value="大火">大火</option>
                          <option value="中火">中火</option>
                          <option value="小火">小火</option>
                          <option value="微火">微火</option>
                          <option value="关火焖">关火焖</option>
                          <option value="烤箱预热/烘烤">烤箱烘烤</option>
                        </select>

                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            max="180"
                            placeholder="分钟"
                            value={st.durationMinutes || ''}
                            onChange={(e) => updateStep(idx, 'durationMinutes', Number(e.target.value) || 0)}
                            className="w-14 py-1 px-1.5 font-mono text-xs border border-[#EADBCE] rounded"
                          />
                          <span className="text-[#9A9085]">分</span>
                        </div>

                        {/* 定时推送按钮：开启后在 CookingExecutionView 中突出显示并一键启动悬浮计时器 */}
                        <button
                          type="button"
                          onClick={() => {
                            const current = st.hasTimerPush !== false;
                            updateStep(idx, 'hasTimerPush', !current);
                          }}
                          className={`px-2 py-1 rounded text-xs font-medium border flex items-center gap-1 transition-colors ${
                            st.hasTimerPush !== false && (st.durationMinutes || 0) > 0
                              ? 'bg-amber-50 border-amber-300 text-amber-900'
                              : 'bg-white border-[#EADBCE] text-[#9A9085] hover:text-[#5A5248]'
                          }`}
                          title="在编辑菜谱步骤时为‘烹饪时长’添加‘定时推送’，在 CookingExecutionView 中可一键启动全局悬浮计时器"
                        >
                          {st.hasTimerPush !== false && (st.durationMinutes || 0) > 0 ? (
                            <>
                              <Bell className="w-3.5 h-3.5 text-amber-600 fill-amber-500/20" />
                              <span>定时推送已开启</span>
                            </>
                          ) : (
                            <>
                              <BellOff className="w-3.5 h-3.5 text-[#9A9085]" />
                              <span>添加定时推送</span>
                            </>
                          )}
                        </button>

                        {/* 一键启动悬浮计时器测试 */}
                        {(st.durationMinutes || 0) > 0 && onStartTimer && (
                          <button
                            type="button"
                            onClick={() => onStartTimer(st.durationMinutes || 5, `${title || '菜谱'} - 步骤${idx + 1}: ${st.title}`)}
                            className="px-2 py-1 bg-[#C85A32]/10 hover:bg-[#C85A32] text-[#C85A32] hover:text-white border border-[#C85A32]/30 rounded text-xs font-semibold transition-colors flex items-center gap-1"
                            title="一键启动全局悬浮计时器"
                          >
                            <Timer className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">试启计时</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => removeStep(idx)}
                          className="p-1 text-[#9A9085] hover:text-rose-600 rounded ml-1"
                          title="删除该步骤"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* 定时推送状态提示栏 */}
                    {st.hasTimerPush !== false && (st.durationMinutes || 0) > 0 && (
                      <div className="text-[11px] text-amber-800 bg-amber-50/80 border border-amber-200/70 px-2.5 py-1.5 rounded-lg flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5">
                          <Bell className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>已关联 <strong>{st.durationMinutes} 分钟</strong>烹饪时长 · 下厨执行时将突出显示「一键启动全局悬浮计时器」</span>
                        </span>
                        {onStartTimer && (
                          <button
                            type="button"
                            onClick={() => onStartTimer(st.durationMinutes || 5, `${title || '菜谱'} - 步骤${idx + 1}: ${st.title}`)}
                            className="text-[11px] text-[#C85A32] font-bold hover:underline shrink-0"
                          >
                            启动悬浮计时器
                          </button>
                        )}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-semibold text-[#7A7268] flex items-center gap-1">
                          <span>步骤描述与操作要点</span>
                        </label>
                        {/* Voice Input Button via Microphone & Speech Transcription */}
                        <VoiceTranscriptionButton
                          currentValue={st.description}
                          onTranscript={(newText) => updateStep(idx, 'description', newText)}
                        />
                      </div>
                      <textarea
                        rows={2}
                        placeholder="具体操作要点 (可手动输入或点击右上角「🎙️ 语音录入描述」说出烹饪操作)..."
                        value={st.description}
                        onChange={(e) => updateStep(idx, 'description', e.target.value)}
                        className="w-full text-xs p-2.5 bg-[#FAF7F2]/50 border border-[#EADBCE] rounded-lg focus:outline-hidden focus:border-[#C85A32]"
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="💡 避坑要点 / 小贴士 (可选，例如：切勿提前加盐)"
                        value={st.tip || ''}
                        onChange={(e) => updateStep(idx, 'tip', e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 bg-[#FFFDF9] border border-[#E8DCC4] rounded-md text-[#8C5D1E] focus:outline-hidden"
                      />
                    </div>

                    {/* Step Media: Photo & Video Upload */}
                    <div className="pt-2 border-t border-[#F0E6DC] flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Step Photo Upload / Annotation */}
                        <label className="cursor-pointer px-2.5 py-1 bg-[#FAF7F2] hover:bg-[#FAF3EC] text-[#2C2723] border border-[#EADBCE] rounded-md font-medium transition-colors flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5 text-[#C85A32]" />
                          <span>{st.photoUrl ? '更换步骤图' : '上传步骤图'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const base64 = await compressImageFile(file);
                                updateStep(idx, 'photoUrl', base64);
                              }
                            }}
                          />
                        </label>

                        {st.photoUrl && (
                          <>
                            <button
                              type="button"
                              onClick={() => setImageEditorTarget({
                                type: 'step',
                                stepIndex: idx,
                                url: st.photoUrl!,
                                title: `第${idx + 1}步实拍图批注与滤镜`
                              })}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-[#C85A32] border border-[#C85A32]/30 rounded-md font-medium transition-colors flex items-center gap-1"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
                              <span>批注/滤镜</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => updateStep(idx, 'photoUrl', undefined)}
                              className="text-xs text-rose-500 hover:text-rose-700"
                            >
                              移除图
                            </button>
                          </>
                        )}

                        {/* Step Video Upload */}
                        <label className="cursor-pointer px-2.5 py-1 bg-[#FAF7F2] hover:bg-[#FAF3EC] text-[#2C2723] border border-[#EADBCE] rounded-md font-medium transition-colors flex items-center gap-1.5">
                          <Film className="w-3.5 h-3.5 text-[#5F7A4D]" />
                          <span>{st.videoUrl ? '更换步骤视频' : '上传步骤时序视频'}</span>
                          <input
                            type="file"
                            accept="video/mp4,video/webm"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  if (typeof ev.target?.result === 'string') {
                                    updateStep(idx, 'videoUrl', ev.target.result);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>

                        {st.videoUrl && (
                          <button
                            type="button"
                            onClick={() => updateStep(idx, 'videoUrl', undefined)}
                            className="text-xs text-rose-500 hover:text-rose-700"
                          >
                            移除视频
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Step Media Previews */}
                    {(st.photoUrl || st.videoUrl) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {st.photoUrl && (
                          <div className="relative aspect-video rounded-lg overflow-hidden border border-[#EADBCE] bg-[#FAF7F2] group">
                            <img src={st.photoUrl} alt={`第${idx + 1}步实拍`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setImageEditorTarget({
                                type: 'step',
                                stepIndex: idx,
                                url: st.photoUrl!,
                                title: `第${idx + 1}步实拍图批注与滤镜`
                              })}
                              className="absolute inset-0 bg-black/40 text-white text-xs font-medium flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-1"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                              <span>点击添加手帐文字批注</span>
                            </button>
                          </div>
                        )}
                        {st.videoUrl && (
                          <div className="aspect-video rounded-lg overflow-hidden border border-[#EADBCE]">
                            <VideoPlayer src={st.videoUrl} poster={st.photoUrl} title={`第${idx + 1}步关键火候时序视频`} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: REVIEW & REFLECTIONS */}
          {activeTab === 'review' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-[#EADBCE] space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#2C2723] mb-1">
                      烹饪手帐记录日期
                    </label>
                    <input
                      type="date"
                      value={cookDate}
                      onChange={(e) => setCookDate(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-[#EADBCE] rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2C2723] mb-1">
                      风味口感评分 ({tasteRating}星)
                    </label>
                    <div className="flex items-center gap-1.5 pt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setTasteRating(star)}
                          className="text-[#C08A3E] p-0.5"
                        >
                          <Star className={`w-5 h-5 ${star <= tasteRating ? 'fill-current' : 'opacity-30'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tasting Notes */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#2C2723]">
                      口感与风味手记
                    </label>
                    <VoiceTranscriptionButton
                      currentValue={tastingNotes}
                      onTranscript={(newText) => setTastingNotes(newText)}
                    />
                  </div>
                  <textarea
                    rows={2}
                    placeholder="例如：肉皮弹糯，汤汁浓郁咸甜适中，米饭绝配..."
                    value={tastingNotes}
                    onChange={(e) => setTastingNotes(e.target.value)}
                    className="w-full text-xs p-2.5 border border-[#EADBCE] rounded-lg focus:outline-hidden focus:border-[#C85A32]"
                  />
                </div>

                {/* Pitfalls & Lessons */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#C85A32]">
                      避坑复盘与下次改进
                    </label>
                    <VoiceTranscriptionButton
                      currentValue={pitfallsAndLessons}
                      onTranscript={(newText) => setPitfallsAndLessons(newText)}
                    />
                  </div>
                  <textarea
                    rows={2}
                    placeholder="例如：糖色可以再多熬3秒，下次准备加入熟芝麻增香..."
                    value={pitfallsAndLessons}
                    onChange={(e) => setPitfallsAndLessons(e.target.value)}
                    className="w-full text-xs p-2.5 border border-[#EADBCE] rounded-lg focus:outline-hidden focus:border-[#C85A32]"
                  />
                </div>

                {/* Pairing */}
                <div>
                  <label className="block text-xs font-semibold text-[#5F7A4D] mb-1">
                    搭配建议 (主食 / 饮品 / 配菜)
                  </label>
                  <input
                    type="text"
                    placeholder="例如：配刚出锅的五常大米饭、冰镇酸梅汤"
                    value={pairingSuggestions}
                    onChange={(e) => setPairingSuggestions(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-[#EADBCE] rounded-lg focus:outline-hidden focus:border-[#C85A32]"
                  />
                </div>

                {/* Diner Feedback */}
                <div>
                  <label className="block text-xs font-semibold text-[#C08A3E] mb-1">
                    亲友食客点评
                  </label>
                  <input
                    type="text"
                    placeholder="例如：“全家光盘，要求列入每周固定菜单！”"
                    value={dinerFeedback}
                    onChange={(e) => setDinerFeedback(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-[#EADBCE] rounded-lg focus:outline-hidden focus:border-[#C85A32]"
                  />
                </div>

                {/* Sticker Badges */}
                <div>
                  <label className="block text-xs font-semibold text-[#2C2723] mb-2">
                    选择手帐贴纸印章
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_STICKERS.map((stk) => {
                      const isSelected = selectedStickers.includes(stk);
                      return (
                        <button
                          key={stk}
                          type="button"
                          onClick={() => toggleSticker(stk)}
                          className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                            isSelected
                              ? 'bg-[#C85A32] text-white border-[#C85A32]'
                              : 'bg-[#FAF7F2] text-[#7A7268] border-[#EADBCE] hover:border-[#C85A32]'
                          }`}
                        >
                          {stk}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-[#EADBCE] flex items-center justify-between">
            <div className="flex items-center gap-2">
              {activeTab !== 'basic' && (
                <button
                  type="button"
                  onClick={() => {
                    const tabs: Array<'basic' | 'ingredients' | 'steps' | 'review'> = ['basic', 'ingredients', 'steps', 'review'];
                    const prevIdx = tabs.indexOf(activeTab) - 1;
                    if (prevIdx >= 0) setActiveTab(tabs[prevIdx]);
                  }}
                  className="px-3 py-1.5 text-xs text-[#7A7268] hover:text-[#2C2723]"
                >
                  ← 上一步
                </button>
              )}
              {activeTab !== 'review' && (
                <button
                  type="button"
                  onClick={() => {
                    const tabs: Array<'basic' | 'ingredients' | 'steps' | 'review'> = ['basic', 'ingredients', 'steps', 'review'];
                    const nextIdx = tabs.indexOf(activeTab) + 1;
                    if (nextIdx < tabs.length) setActiveTab(tabs[nextIdx]);
                  }}
                  className="px-3 py-1.5 text-xs bg-[#FAF7F2] border border-[#EADBCE] rounded text-[#2C2723] hover:bg-[#F0E6DC]"
                >
                  下一步 →
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-xs text-[#7A7268] hover:text-[#2C2723] rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-[#C85A32] hover:bg-[#B34C26] rounded-lg shadow-sm transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>保存入手帐</span>
              </button>
            </div>
          </div>

        </form>
      </div>

      {/* Scrapbook Image Annotation and Filter Editor Modal */}
      {imageEditorTarget && (
        <ImageEditorModal
          isOpen={Boolean(imageEditorTarget)}
          imageUrl={imageEditorTarget.url}
          title={imageEditorTarget.title}
          onClose={() => setImageEditorTarget(null)}
          onSave={(editedImageUrl) => {
            if (imageEditorTarget.type === 'cover') {
              setCoverImage(editedImageUrl);
            } else if (imageEditorTarget.type === 'step' && typeof imageEditorTarget.stepIndex === 'number') {
              updateStep(imageEditorTarget.stepIndex, 'photoUrl', editedImageUrl);
            }
            setImageEditorTarget(null);
          }}
        />
      )}
    </div>
  );
};
