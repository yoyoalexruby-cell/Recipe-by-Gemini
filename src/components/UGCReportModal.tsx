import React, { useState } from 'react';
import { ShieldAlert, Flag, UserX, X, Check, AlertCircle } from 'lucide-react';
import { reportUGCContent, blockUser } from '../utils/ugcModeration';
import { useI18n } from '../i18n/context';

interface UGCReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: 'recipe' | 'contest_submission' | 'comment';
  targetTitle: string;
  authorId: string;
  authorName: string;
  onSuccess?: () => void;
}

const REPORT_REASONS = [
  '垃圾广告或不相关推广',
  '低俗违规、不当言论或攻击',
  '虚假危险烹饪操作或食品安全隐患',
  '涉嫌侵犯他人原创版权',
  '其他违反社区健康守则行为'
];

export const UGCReportModal: React.FC<UGCReportModalProps> = ({
  isOpen,
  onClose,
  targetId,
  targetType,
  targetTitle,
  authorId,
  authorName,
  onSuccess
}) => {
  const { language } = useI18n();
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [customDetail, setCustomDetail] = useState('');
  const [alsoBlockUser, setAlsoBlockUser] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const reasonText = customDetail.trim() 
      ? `${selectedReason}: ${customDetail.trim()}`
      : selectedReason;

    reportUGCContent({
      targetId,
      targetType,
      targetTitle,
      authorId,
      authorName,
      reason: reasonText
    });

    if (alsoBlockUser && authorId) {
      blockUser(authorId, authorName);
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onSuccess?.();
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#FAF7F2] rounded-2xl border border-[#EADBCE] shadow-2xl max-w-md w-full p-5 relative overflow-hidden animate-fade-in text-xs">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#EADBCE]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
              <Flag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#2C2723]">
                {language === 'zh-CN' ? '举报与内容安全反馈' : 'Report Inappropriate Content'}
              </h3>
              <p className="text-[10px] text-[#7A7268]">
                {language === 'zh-CN' ? '严格守护温暖干净的美食手帐社区' : 'Community Safety & Clean Environment'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-stone-200/60 flex items-center justify-center text-[#7A7268]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-[#2C2723]">
              {language === 'zh-CN' ? '感谢您的监督与反馈！' : 'Thank you for your report!'}
            </h4>
            <p className="text-[#7A7268] text-[11px] max-w-xs mx-auto">
              {language === 'zh-CN' 
                ? '我们已收到记录，平台安全组将在 24 小时内进行人工核查处理。' 
                : 'Our moderation team will review this content within 24 hours.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-3">
            {/* Target Item summary */}
            <div className="p-2.5 bg-white rounded-xl border border-[#EADBCE]">
              <span className="text-[10px] text-[#9A9085] block">{language === 'zh-CN' ? '正在举报的作品 / 评论：' : 'Reported Item:'}</span>
              <strong className="text-xs text-[#2C2723] block mt-0.5 truncate">
                {targetTitle || '作品条目'}
              </strong>
              <span className="text-[10px] text-[#7A7268] block mt-0.5">
                作者：{authorName || '匿名厨友'}
              </span>
            </div>

            {/* Reasons Radio list */}
            <div className="space-y-1.5">
              <label className="font-bold text-[#2C2723] block">
                {language === 'zh-CN' ? '请选择举报原因：' : 'Select a reason:'}
              </label>
              <div className="space-y-1">
                {REPORT_REASONS.map((r, i) => (
                  <label 
                    key={i} 
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                      selectedReason === r 
                        ? 'bg-rose-50 border-rose-300 text-rose-950 font-semibold' 
                        : 'bg-white border-[#EADBCE] text-[#5A5248] hover:bg-stone-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={r}
                      checked={selectedReason === r}
                      onChange={() => setSelectedReason(r)}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span>{r}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Optional detail notes */}
            <div>
              <label className="font-bold text-[#2C2723] block mb-1">
                {language === 'zh-CN' ? '补充说明（选填）：' : 'Additional details (optional):'}
              </label>
              <textarea
                rows={2}
                value={customDetail}
                onChange={(e) => setCustomDetail(e.target.value)}
                placeholder={language === 'zh-CN' ? '描述违规情况，方便管理员快速核实...' : 'Describe the violation...'}
                className="w-full p-2 bg-white border border-[#EADBCE] rounded-lg text-xs focus:outline-hidden focus:border-[#C85A32]"
              />
            </div>

            {/* Option to also block the author */}
            <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl">
              <label className="flex items-center gap-2 cursor-pointer text-amber-950 font-medium">
                <input
                  type="checkbox"
                  checked={alsoBlockUser}
                  onChange={(e) => setAlsoBlockUser(e.target.checked)}
                  className="rounded border-amber-400 text-[#C85A32] focus:ring-[#C85A32]"
                />
                <UserX className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>
                  {language === 'zh-CN' 
                    ? `同时屏蔽该作者 (@${authorName})，不再展示其作品` 
                    : `Also block author @${authorName}`}
                </span>
              </label>
            </div>

            {/* Submit buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EADBCE]">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg border border-[#EADBCE] bg-white text-[#7A7268] hover:bg-stone-50 font-medium"
              >
                {language === 'zh-CN' ? '取消' : 'Cancel'}
              </button>

              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all shadow-xs"
              >
                {language === 'zh-CN' ? '确认提交举报' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
