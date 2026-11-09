import React, { useState } from 'react';
import { Recipe } from '../types/recipe';
import { UserProfile } from '../types/auth';
import { FoodArtFallback } from './IllustrationPresets';
import { 
  ArrowLeft, Clock, Users, Flame, Star, GitFork, 
  Heart, MessageSquare, Check, Share2, ChefHat, Sparkles 
} from 'lucide-react';

interface SharedRecipePageProps {
  recipe: Recipe;
  currentUser: UserProfile | null;
  onBackToApp: () => void;
  onCloneRecipe: (recipe: Recipe) => void;
  onToggleLike: (recipeId: string) => void;
  onAddComment: (recipeId: string, content: string) => void;
  onRequireLogin: () => void;
}

export const SharedRecipePage: React.FC<SharedRecipePageProps> = ({
  recipe,
  currentUser,
  onBackToApp,
  onCloneRecipe,
  onToggleLike,
  onAddComment,
  onRequireLogin
}) => {
  const [servings, setServings] = useState(recipe.baseServings || 2);
  const [commentText, setCommentText] = useState('');
  const [isCloned, setIsCloned] = useState(false);
  const multiplier = servings / (recipe.baseServings || 1);

  const isLikedByMe = currentUser && recipe.likedBy?.includes(currentUser.uid);

  const formatScaled = (amount: number | string) => {
    if (typeof amount === 'number') {
      const scaled = amount * multiplier;
      if (scaled >= 10) return Math.round(scaled);
      return Number(scaled.toFixed(1));
    }
    return amount;
  };

  const handleClone = () => {
    if (!currentUser) {
      onRequireLogin();
      return;
    }
    onCloneRecipe(recipe);
    setIsCloned(true);
    setTimeout(() => setIsCloned(false), 3000);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!currentUser) {
      onRequireLogin();
      return;
    }
    onAddComment(recipe.id, commentText);
    setCommentText('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6">
      
      {/* Top Banner Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-[#EADBCE]">
        <button
          onClick={onBackToApp}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A7268] hover:text-[#2C2723] px-2.5 py-1.5 rounded-md hover:bg-[#FAF7F2] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回手帐主页</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleLike(recipe.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md border transition-colors ${
              isLikedByMe
                ? 'bg-rose-50 text-rose-600 border-rose-200'
                : 'bg-white text-[#7A7268] border-[#EADBCE] hover:text-rose-600'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isLikedByMe ? 'fill-current' : ''}`} />
            <span>点赞 ({recipe.likesCount || 0})</span>
          </button>

          <button
            onClick={handleClone}
            disabled={isCloned}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-md transition-all shadow-2xs ${
              isCloned
                ? 'bg-emerald-600 text-white'
                : 'bg-[#C85A32] hover:bg-[#B34C26] text-white'
            }`}
          >
            {isCloned ? <Check className="w-3.5 h-3.5" /> : <GitFork className="w-3.5 h-3.5" />}
            <span>{isCloned ? '已收录到我的手帐！' : '收录到我的手帐本'}</span>
          </button>
        </div>
      </div>

      {/* Main Recipe Card */}
      <div className="bg-white border border-[#EADBCE] rounded-2xl paper-shadow p-6 sm:p-10 relative overflow-hidden bg-notebook-dots">
        
        {/* Author Card Header Strip */}
        <div className="flex items-center justify-between p-3.5 bg-[#FAF7F2] rounded-xl border border-[#EADBCE] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#C85A32] shrink-0 bg-white shadow-xs">
              {recipe.authorAvatar ? (
                <img src={recipe.authorAvatar} alt={recipe.authorName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#C85A32] text-white flex items-center justify-center font-bold">
                  {recipe.authorName?.[0] || '厨'}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#2C2723]">{recipe.authorName || '手帐作者'}</span>
                <span className="text-[10px] text-[#5F7A4D] bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-sans">
                  公开食谱认证
                </span>
              </div>
              <span className="text-[11px] text-[#7A7268] block">
                于 {recipe.review?.cookDate || recipe.createdAt} 录入烹饪手帐
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="seal-stamp text-[11px] text-[#C85A32]">
              私房好味道
            </div>
          </div>
        </div>

        {/* Title & Story */}
        <div className="mb-6">
          <div className="flex items-center gap-1.5 text-xs text-[#7A7268] mb-1.5">
            <span className="font-medium text-[#2C2723]">{recipe.category}</span>
            {recipe.subCategory && (
              <>
                <span aria-hidden="true" className="text-[#C85A32]/60">/</span>
                <span className="text-[#C85A32] font-semibold">{recipe.subCategory}</span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span>{recipe.cuisine}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold font-journal-title text-[#2C2723] leading-tight mb-2">
            {recipe.title}
          </h1>
          <p className="text-sm text-[#7A7268] font-serif italic max-w-2xl">
            “{recipe.subtitle || '在慢炖细煨中，体悟餐桌最真实的温度'}”
          </p>
        </div>

        {/* Polaroid Cover Picture */}
        <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-[#FAF7F2] border border-[#EADBCE] polaroid-shadow mb-8 relative">
          {recipe.coverImage ? (
            <img src={recipe.coverImage} alt={recipe.title} className="w-full h-full object-cover" />
          ) : (
            <FoodArtFallback type={recipe.title} className="w-full h-full" />
          )}
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded">
            备料 {recipe.prepTimeMinutes}分钟 · 烹饪 {recipe.cookTimeMinutes}分钟 · 难度 {'★'.repeat(recipe.difficulty || 3)}
          </div>
        </div>

        {/* Ingredients Section with Dynamic Scaler */}
        <div className="mb-10 bg-[#FAF7F2]/60 p-5 rounded-xl border border-[#EADBCE]">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-2 border-b border-[#EADBCE]">
            <h2 className="text-base font-bold font-journal-title text-[#2C2723]">
              食材清单与比例
            </h2>

            {/* Servings Switcher */}
            <div className="flex items-center gap-1.5 text-xs bg-white p-1 rounded-md border border-[#EADBCE]">
              <span className="text-[#7A7268] px-1.5 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>调节人数:</span>
              </span>
              {[1, 2, 4, 6].map((num) => (
                <button
                  key={num}
                  onClick={() => setServings(num)}
                  className={`px-2 py-0.5 rounded font-mono ${
                    servings === num ? 'bg-[#C85A32] text-white font-bold' : 'text-[#7A7268] hover:text-[#2C2723]'
                  }`}
                >
                  {num}人份
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {recipe.ingredients.map((ing) => (
              <div key={ing.id} className="flex justify-between p-2 bg-white rounded border border-[#EADBCE]/80">
                <span className="font-medium text-[#2C2723]">· {ing.name}</span>
                <span className="font-mono font-bold text-[#C85A32]">
                  {formatScaled(ing.amount)} {ing.unit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Cooking Steps */}
        <div className="mb-10 space-y-4">
          <h2 className="text-base font-bold font-journal-title text-[#2C2723] pb-2 border-b border-[#EADBCE]">
            烹饪步骤与时序
          </h2>

          <div className="space-y-4">
            {recipe.steps.map((st, idx) => (
              <div key={st.id || idx} className="p-4 bg-[#FAF7F2]/60 rounded-xl border border-[#EADBCE] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#2C2723] font-journal-title">
                    {idx + 1}. {st.title}
                  </span>
                  {st.heat && (
                    <span className="text-[11px] font-medium text-[#C85A32] bg-white border border-[#EADBCE] px-2 py-0.5 rounded">
                      {st.heat}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#5A5248] leading-relaxed">
                  {st.description}
                </p>
                {st.tip && (
                  <p className="text-[11px] text-[#8C5D1E] bg-[#FFFDF9] p-2 rounded border border-[#E8DCC4]">
                    <strong>💡 避坑要点:</strong> {st.tip}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Author Tasting Notes */}
        {recipe.review?.tastingNotes && (
          <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#EADBCE] mb-8 text-xs space-y-2">
            <h3 className="font-bold text-[#C85A32] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>作者品鉴心得与复盘</span>
            </h3>
            <p className="text-[#5A5248] italic leading-relaxed">
              “{recipe.review.tastingNotes}”
            </p>
          </div>
        )}

        {/* Comments Section */}
        <div className="pt-6 border-t border-[#EADBCE] space-y-4">
          <h3 className="font-bold text-sm text-[#2C2723] flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#C85A32]" />
            <span>食客复刻打卡与留言 ({recipe.comments?.length || 0})</span>
          </h3>

          {/* Add Comment Form */}
          <form onSubmit={handleCommentSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder={currentUser ? '留下您的复刻感受或提问...' : '请先登录后发表点评...'}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-white border border-[#EADBCE] rounded-lg focus:outline-hidden focus:border-[#C85A32]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#C85A32] hover:bg-[#B34C26] text-white rounded-lg text-xs font-bold transition-colors"
            >
              发送点评
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-2.5 pt-2">
            {recipe.comments && recipe.comments.map((cm) => (
              <div key={cm.id} className="p-3 bg-[#FAF7F2] rounded-lg border border-[#EADBCE]/80 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[#2C2723]">{cm.authorName}</span>
                  <span className="text-[10px] text-[#9A9085]">{cm.createdAt}</span>
                </div>
                <p className="text-[#5A5248]">{cm.content}</p>
              </div>
            ))}

            {(!recipe.comments || recipe.comments.length === 0) && (
              <p className="text-xs text-[#9A9085] py-2 text-center">暂无食客留言，快来成为第一个跟着做的人吧！</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
