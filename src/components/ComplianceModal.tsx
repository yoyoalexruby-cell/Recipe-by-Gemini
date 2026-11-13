import React, { useState } from 'react';
import { 
  ShieldCheck, FileText, Lock, UserX, Download, 
  ExternalLink, X, CheckCircle2, AlertTriangle, Info,
  Smartphone, Building, Award, Check
} from 'lucide-react';
import { UserProfile } from '../types/auth';

interface ComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile | null;
  onDeleteAccount?: () => void;
  onExportAllData?: () => void;
  initialTab?: 'privacy' | 'terms' | 'permissions' | 'cancellation' | 'filings';
  onOpenLegalPage?: (section: 'privacy' | 'support' | 'terms' | 'delete-account') => void;
}

export const ComplianceModal: React.FC<ComplianceModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onDeleteAccount,
  onExportAllData,
  initialTab = 'privacy',
  onOpenLegalPage,
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'permissions' | 'cancellation' | 'filings'>(initialTab);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  if (!isOpen) return null;

  const handleExecuteDelete = () => {
    if (!confirmChecked) return;
    if (onDeleteAccount) {
      onDeleteAccount();
    }
    setDeleteSuccess(true);
    setConfirmChecked(false);
    setTimeout(() => {
      setDeleteSuccess(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs overflow-y-auto no-print">
      <div 
        className="bg-white border border-[#EADBCE] rounded-2xl shadow-2xl w-full max-w-4xl my-4 flex flex-col max-h-[92vh] overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#EADBCE] bg-[#FAF7F2] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#5F7A4D]/15 border border-[#5F7A4D]/30 flex items-center justify-center text-[#5F7A4D]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#2C2723] font-journal-title flex items-center gap-2">
                <span>合规政策与隐私权益中心</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#5F7A4D]/10 text-[#5F7A4D] font-sans font-medium">
                  符合 PIPL 个人信息保护法规范
                </span>
              </h2>
              <p className="text-xs text-[#7A7268]">
                食味手记 · 中国大陆及海外合规上线运营声明
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#7A7268] hover:text-[#2C2723] hover:bg-white rounded-lg transition-colors"
            title="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 bg-white border-b border-[#EADBCE] flex items-center gap-2 overflow-x-auto no-scrollbar text-xs shrink-0">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-3 px-3 font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'privacy'
                ? 'border-[#C85A32] text-[#C85A32] font-bold'
                : 'border-transparent text-[#7A7268] hover:text-[#2C2723]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>隐私保护政策</span>
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`py-3 px-3 font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'terms'
                ? 'border-[#C85A32] text-[#C85A32] font-bold'
                : 'border-transparent text-[#7A7268] hover:text-[#2C2723]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>用户服务协议</span>
          </button>

          <button
            onClick={() => setActiveTab('permissions')}
            className={`py-3 px-3 font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'permissions'
                ? 'border-[#C85A32] text-[#C85A32] font-bold'
                : 'border-transparent text-[#7A7268] hover:text-[#2C2723]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>个人信息与权限清单</span>
          </button>

          <button
            onClick={() => setActiveTab('cancellation')}
            className={`py-3 px-3 font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'cancellation'
                ? 'border-[#C85A32] text-[#C85A32] font-bold'
                : 'border-transparent text-[#7A7268] hover:text-[#2C2723]'
            }`}
          >
            <UserX className="w-3.5 h-3.5" />
            <span>账号注销与数据导出</span>
          </button>

          <button
            onClick={() => setActiveTab('filings')}
            className={`py-3 px-3 font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'filings'
                ? 'border-[#C85A32] text-[#C85A32] font-bold'
                : 'border-transparent text-[#7A7268] hover:text-[#2C2723]'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>全球合规与技术支持</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 text-xs sm:text-sm text-[#4A423B] leading-relaxed space-y-4">
          
          {/* TAB 1: 隐私保护政策 (PIPL Compliance) */}
          {activeTab === 'privacy' && (
            <div className="space-y-4 animate-fade-in font-serif">
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EADBCE] flex items-center gap-2.5 text-xs font-sans text-[#7A7268]">
                <ShieldCheck className="w-4 h-4 text-[#5F7A4D] shrink-0" />
                <span>更新生效日期：2026年3月1日 · 遵循《中华人民共和国个人信息保护法》(PIPL) 及 GDPR 标准制定</span>
              </div>

              <section className="space-y-1.5">
                <h3 className="text-base font-bold text-[#2C2723]">一、引言与承诺</h3>
                <p>
                  「食味手记」（以下统称“本应用”）非常重视用户的隐私保护与个人信息安全。本应用坚持**“数据归属于用户”、“最小必要原则”**以及**“透明透明不追踪”**的核心原则。除非法律法规另有规定或取得您的明示同意，我们绝不向任何第三方出租、出售或共享您的个人做菜手帐、私房配方或个人信息。
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="text-base font-bold text-[#2C2723]">二、我们收集与使用的信息</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>食谱与手帐创作内容</strong>：包括您主动输入的菜名、食材配比、制作步骤、心得评价及打卡日志；</li>
                  <li><strong>设备与多媒体数据</strong>：您主动拍照或选取的菜谱封面实拍图、步骤照片。本应用仅在获得授权后读取您选取的特定单张照片，绝不擅自扫描您的手机相册；</li>
                  <li><strong>语音数据处理</strong>：仅在您主动点击「语音录入」或开启「免触伴厨语音指令」时调用麦克风。语音仅用于转换为烹饪文本与控制口令，不进行任何声纹留存或背景偷听；</li>
                  <li><strong>本地存储技术</strong>：通过 IndexedDB / LocalStorage 在您的设备端本地保存离线手帐内容，保障在无网络环境或厨房信号不佳时依然能够顺畅查阅与制作。</li>
                </ul>
              </section>

              <section className="space-y-1.5">
                <h3 className="text-base font-bold text-[#2C2723]">三、第三方链接与电商服务</h3>
                <p>
                  当您点击「一键选购」跳转至京东、盒马、淘宝等电商平台时，您将直接前往相应平台的搜索页面。相关平台有其独立的隐私政策，食味手记不截留您的任何第三方购物账号密码或支付账单信息。
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="text-base font-bold text-[#2C2723]">四、您的法定权利</h3>
                <p>
                  根据《个人信息保护法》，您享有查阅、复制、更正、补充、撤回授权、导出以及注销账号并删除个人数据的完整权利。您可以通过本中心的「账号注销与数据导出」标签页随时一键导出您的全部数据或申请永久抹除账号。
                </p>
              </section>
            </div>
          )}

          {/* TAB 2: 用户服务协议 (Terms of Service) */}
          {activeTab === 'terms' && (
            <div className="space-y-4 animate-fade-in font-serif">
              <section className="space-y-1.5">
                <h3 className="text-base font-bold text-[#2C2723]">一、服务条款的确认与接纳</h3>
                <p>
                  欢迎使用食味手记。本协议由您与食味手记开发及运营团队共同缔结。当您访问或使用食味手记的各项功能（包括但不限于菜谱记录、时序计时、打印排版、语音伴厨等）即视为您已阅读并同意本协议全部条款。
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="text-base font-bold text-[#2C2723]">二、知识产权与用户原创著作权</h3>
                <p>
                  您在食味手记中创作并录入的私房菜谱、家庭秘方、步骤文字、原创摄影配图，其著作权完全归属于您本人。当您选择将菜谱公开发布至「食味广场」时，您授予食味手记在全球范围内的非排他性展示与分享许可，其他用户可进行翻牌与打卡互动。
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="text-base font-bold text-[#2C2723]">三、用户行为与内容安全规范（UGC合规）</h3>
                <p>
                  用户在使用食味广场或社区心得墙等互动功能时，必须遵守国家相关法律法规，严禁发布含有虚假广告、侵权盗版、危害国家安全或违背公序良俗的有害信息。一经发现，平台有权采取警示、下架或限制账号使用的措施。
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="text-base font-bold text-[#2C2723]">四、下厨安全免责提示</h3>
                <p className="text-[#C85A32]">
                  ⚠️ 烹饪过程涉及明火、高温油脂、高压炊具及锐利刀具。食味手记中的菜谱耗时、火候与步骤提示仅供美食参考。请务必根据您的家庭厨房设备、燃气安全规程及个人体质情况（如食物过敏原）进行谨慎操作，注意通风与防烫防火安全。
                </p>
              </section>
            </div>
          )}

          {/* TAB 3: 个人信息与权限清单 (Permissions Manifest) */}
          {activeTab === 'permissions' && (
            <div className="space-y-4 animate-fade-in font-sans">
              <p className="text-xs text-[#7A7268]">
                根据移动应用合规要求，以下清晰列出食味手记申请调用的系统权限及其明确使用场景：
              </p>

              <div className="overflow-x-auto border border-[#EADBCE] rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] border-b border-[#EADBCE] text-[#2C2723]">
                    <tr>
                      <th className="p-3 font-semibold">权限名称</th>
                      <th className="p-3 font-semibold">业务使用场景</th>
                      <th className="p-3 font-semibold">触发机制</th>
                      <th className="p-3 font-semibold">是否必选</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EADBCE]">
                    <tr>
                      <td className="p-3 font-mono font-medium text-[#2C2723]">麦克风 (Microphone)</td>
                      <td className="p-3 text-[#5A5248]">用于口述录入烹饪步骤，以及下厨时免触碰识别“下一步”、“重复”等语音指令</td>
                      <td className="p-3 text-[#7A7268]">用户点击麦克风图标或开启伴厨模式时动态申请</td>
                      <td className="p-3 text-emerald-700 font-semibold">否 (可手动触屏替代)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-medium text-[#2C2723]">相册与存储 (Storage / Photos)</td>
                      <td className="p-3 text-[#5A5248]">用于用户挑选菜品定妆照片、实拍步骤图，以及将 A4 打印手帐导出保存为本地长图</td>
                      <td className="p-3 text-[#7A7268]">用户点击“添加照片”或“下载手帐长图”时调用</td>
                      <td className="p-3 text-emerald-700 font-semibold">否 (可使用内置预设插画)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-medium text-[#2C2723]">网络通讯 (Network Access)</td>
                      <td className="p-3 text-[#5A5248]">用于同步社区食味广场公开菜谱、多设备 GitHub 代码备份以及生鲜采购搜索</td>
                      <td className="p-3 text-[#7A7268]">发起网络请求时使用</td>
                      <td className="p-3 text-amber-700 font-semibold">核心功能离线可用</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>食味手记无后台自启动、无静默位置追踪、无设备唯一识别码 (IMEI/MAC) 强制索取行为。</span>
              </div>
            </div>
          )}

          {/* TAB 4: 账号注销与数据导出 (Account Deletion & Data Portability) */}
          {activeTab === 'cancellation' && (
            <div className="space-y-4 animate-fade-in font-sans">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                <h4 className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>个人信息主体权利保障</span>
                </h4>
                <p className="text-xs text-amber-800 leading-relaxed">
                  按照《中华人民共和国个人信息保护法》第四十七条规定，用户有权随时注销其注册账号并要求彻底删除其个人信息。
                </p>
              </div>

              {/* Data Export Option */}
              <div className="p-4 bg-white border border-[#EADBCE] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-[#2C2723] text-sm">资产数据全量导出 (Data Takeout)</h4>
                  <p className="text-xs text-[#7A7268] mt-0.5">
                    在注销前，您可以将您所有的私房食谱、食材记录、备忘心得一键导出为标准的 JSON 备份文件。
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onExportAllData}
                  className="px-4 py-2 bg-[#FAF7F2] hover:bg-[#EADBCE]/50 border border-[#EADBCE] text-[#2C2723] text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Download className="w-4 h-4 text-[#C85A32]" />
                  <span>导出我的食谱资产</span>
                </button>
              </div>

              {/* Delete Account Danger Zone */}
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
                <div>
                  <h4 className="font-bold text-rose-900 text-sm flex items-center gap-1.5">
                    <UserX className="w-4 h-4 text-rose-600" />
                    <span>彻底注销账号与隐私抹除</span>
                  </h4>
                  <p className="text-xs text-rose-700 mt-1">
                    注销账号后：1) 您的身份认证与登录状态将即刻作废；2) 您在云端与本地存储的所有菜谱、心得将永久销毁无法找回；3) 账号名将予以释放。
                  </p>
                </div>

                <div className="pt-2 border-t border-rose-200 space-y-3">
                  <label className="flex items-start gap-2.5 text-xs text-rose-900 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={confirmChecked}
                      onChange={(e) => setConfirmChecked(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-rose-600 rounded shrink-0"
                    />
                    <span>
                      我已知晓注销操作不可撤销，确认永久注销当前账号并彻底抹除所有个人手帐与认证数据 / I understand this action is irreversible and permanently deletes my account and data.
                    </span>
                  </label>
                  <div>
                    <button
                      type="button"
                      onClick={handleExecuteDelete}
                      disabled={!confirmChecked}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold rounded-lg transition-colors shrink-0 shadow-xs min-h-[40px]"
                    >
                      注销账号并永久抹除 / Delete Account Permanently
                    </button>
                  </div>
                </div>

                {deleteSuccess && (
                  <div className="p-2 bg-rose-100 text-rose-800 text-xs font-medium rounded text-center">
                    账号及本地数据已彻底销毁并登出。 / Account and local data permanently deleted.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: 全球上架合规与公开网址 (Global Store Compliance & Support) */}
          {activeTab === 'filings' && (
            <div className="space-y-4 animate-fade-in font-sans">
              <div className="p-4 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-[#2C2723]">
                  <Award className="w-5 h-5 text-[#C85A32]" />
                  <span>App Store 全球合规与官方支持公开页面</span>
                </div>
                <p className="text-xs text-[#7A7268] leading-relaxed">
                  《食味手记 (Culinary Journal)》遵循 Apple App Store Review Guidelines（含 Guideline 1.2 UGC 社区安全与 Guideline 5.1.1(v) 账号随时删除规范）、GDPR 及本地优先隐私保护原则。
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
                  <div className="p-3 bg-white border border-[#EADBCE] rounded-lg">
                    <span className="text-[11px] text-[#7A7268] block">应用名称 / Bundle ID</span>
                    <strong className="text-[#2C2723] font-mono block mt-0.5">Culinary Journal (com.culinary.journal)</strong>
                  </div>

                  <div className="p-3 bg-white border border-[#EADBCE] rounded-lg">
                    <span className="text-[11px] text-[#7A7268] block">开发者联系与隐私申诉邮箱</span>
                    <strong className="text-[#C85A32] font-mono block mt-0.5">yoyoalexruby@gmail.com</strong>
                  </div>
                </div>

                {onOpenLegalPage && (
                  <div className="pt-2 flex items-center gap-3 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenLegalPage('privacy');
                      }}
                      className="px-3.5 py-2 bg-white border border-[#EADBCE] hover:border-[#C85A32] rounded-xl text-xs font-semibold text-[#2C2723] inline-flex items-center gap-1.5"
                    >
                      <span>打开独立《隐私政策》公开网页</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#C85A32]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenLegalPage('support');
                      }}
                      className="px-3.5 py-2 bg-white border border-[#EADBCE] hover:border-[#C85A32] rounded-xl text-xs font-semibold text-[#2C2723] inline-flex items-center gap-1.5"
                    >
                      <span>打开独立《技术支持中心》公开网页</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#C85A32]" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Actions */}
        <div className="px-5 py-3.5 bg-[#FAF7F2] border-t border-[#EADBCE] flex items-center justify-between text-xs text-[#7A7268] shrink-0">
          <span className="text-[11px]">
            食味手记保护每一位烹饪爱好者的隐私与数字创作资产
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-[#EADBCE] bg-white hover:bg-[#FAF7F2] text-[#2C2723] font-semibold transition-colors"
          >
            已阅读并了解
          </button>
        </div>

      </div>
    </div>
  );
};
