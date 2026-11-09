import React, { useState } from 'react';
import { Recipe, RecipeComment } from '../types/recipe';
import { UserProfile } from '../types/auth';
import { 
  X, MessageSquare, Heart, Share2, GitFork, 
  Send, Check, Sparkles, Star, Copy, ExternalLink 
} from 'lucide-react';

interface SquareReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe | null;
  currentUser: UserProfile | null;
  onAddComment: (recipeId: string, content: string) => void;
  onCloneRecipe: (recipe: Recipe) => void;
  onShareRecipe: (recipe: Recipe) => void;
  onRequireLogin: () => void;
  onToggleLike: (recipeId: string) => void;
}

export const SquareReviewModal: React.FC<SquareReviewModalProps> = ({
  isOpen,
  onClose,
  recipe,
  currentUser,
  onAddComment,
  onCloneRecipe,
  onShareRecipe,
  onRequireLogin,
  onToggleLike
}) => {
  if (!isOpen || !recipe) return null;

  const [commentText, setCommentText] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [clonedSuccess, setClonedSuccess] = useState(false);

  const isLikedByMe = currentUser && recipe.likedBy?.includes(currentUser.uid);

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?recipeId=${recipe.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleClone = () => {
    if (!currentUser) {
      onRequireLogin();
      return;
    }
    onCloneRecipe(recipe);
    setClonedSuccess(true);
    setTimeout(() => setClonedSuccess(false), 2500);
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!currentUser) {
      onRequireLogin();
      return;
    }

    onAddComment(recipe.id, commentText.trim());
    setCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-xl bg-[#FAF7F2] border border-[#EADBCE] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-white border-b border-[#EADBCE] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FAF3EC] border border-[#EADBCE] flex items-center justify-center text-[#C85A32]">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2C2723] font-serif truncate max-w-xs sm:max-w-md">
                食客点评与分享 · 《{recipe.title}》
              </h3>
              <p className="text-xs text-[#7A7268]">
                作者：@{recipe.authorName || '热心厨友'} · 共 {recipe.comments?.length || 0} 条厨友评价
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

        {/* Share & Quick Actions Bar */}
        <div className="px-5 py-3 bg-[#FAF3EC] border-b border-[#EADBCE] flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleLike(recipe.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                isLikedByMe
                  ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-2xs'
                  : 'bg-white border-[#EADBCE] text-[#7A7268] hover:text-rose-600'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isLikedByMe ? 'fill-current' : ''}`} />
              <span>{recipe.likesCount || 0} 赞</span>
            </button>

            <button
              onClick={handleClone}
              disabled={clonedSuccess}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#C85A32] text-white hover:bg-[#B34C26] transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              {clonedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>已克隆到我的手帐！</span>
                </>
              ) : (
                <>
                  <GitFork className="w-3.5 h-3.5" />
                  <span>收进我的手帐</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onShareRecipe(recipe)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white border border-[#EADBCE] text-[#5A5248] hover:text-[#C85A32] transition-colors flex items-center gap-1"
              title="生成精美长图手帐分享卡"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>制作长图卡</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white border border-[#EADBCE] text-[#5A5248] hover:text-[#C85A32] transition-colors flex items-center gap-1"
              title="复制专属深度链接"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedLink ? '已复制链接！' : '复制链接'}</span>
            </button>
          </div>
        </div>

        {/* Reviews List */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3.5">
          {(!recipe.comments || recipe.comments.length === 0) ? (
            <div className="py-12 text-center text-xs text-[#7A7268] space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-[#C85A32]/30" />
              <p>这篇菜谱暂无点评，做过这道菜的朋友快来抢沙发写下你的品尝心得吧！</p>
            </div>
          ) : (
            recipe.comments.map((comment) => (
              <div 
                key={comment.id}
                className="p-3.5 bg-white border border-[#EADBCE] rounded-xl space-y-1.5 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden border border-[#EADBCE] bg-[#FAF7F2]">
                      {comment.authorAvatar ? (
                        <img src={comment.authorAvatar} alt={comment.authorName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[#C85A32] text-white text-[10px] flex items-center justify-center font-bold">
                          {comment.authorName?.[0] || '友'}
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-[#2C2723]">
                      {comment.authorName}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#A8A29E] font-mono">
                    {comment.createdAt}
                  </span>
                </div>
                <p className="text-xs text-[#5A5248] leading-relaxed pl-8 font-serif">
                  {comment.content}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Comment Input Footer */}
        <form onSubmit={handleSubmitComment} className="p-4 bg-white border-t border-[#EADBCE]">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <textarea
                rows={2}
                placeholder={currentUser ? "写下你的品尝反馈、火候改进建议或复刻心得..." : "请先登录后发表点评..."}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={!currentUser}
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#EADBCE] rounded-xl focus:outline-hidden focus:border-[#C85A32] text-[#2C2723] resize-none"
              />
            </div>
            {currentUser ? (
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-4 py-2 bg-[#C85A32] hover:bg-[#B34C26] disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm shrink-0 h-10"
              >
                <Send className="w-3.5 h-3.5" />
                <span>发表点评</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onRequireLogin}
                className="px-4 py-2 bg-[#C85A32] text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm shrink-0 h-10"
              >
                <span>登录后点评</span>
              </button>
            )}
          </div>
        </form>

      </div>
    </div>
  );
};
