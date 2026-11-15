import React from 'react';
import { AlertTriangle, RotateCcw, Download } from 'lucide-react';
import { getCurrentUser } from '../utils/authService';
import { downloadFullBackupJson } from '../utils/fullBackupService';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error instanceof Error ? error.message : '页面渲染遇到意外错误',
    };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught UI error:', error, info);
  }

  private handleEmergencyBackup = () => {
    downloadFullBackupJson(getCurrentUser(), { includeMediaBlobs: false }).catch((err) => {
      console.error('Emergency backup failed', err);
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF7F2] text-[#2C2723] flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white border border-[#EADBCE] rounded-2xl p-6 paper-shadow space-y-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-[#C85A32] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h1 className="text-lg font-bold font-journal-title text-[#2C2723]">
              手帐页面遇到了一点小状况
            </h1>
            <p className="text-xs text-[#7A7268] leading-relaxed">
              您的私房食谱与打卡记录仍安全保存在本地存储中。您可以先一键导出紧急备份，或刷新页面恢复正常浏览。
            </p>
            {this.state.errorMessage && (
              <div className="p-2.5 bg-[#FAF7F2] border border-[#EADBCE] rounded-lg text-[11px] font-mono text-[#7A7268] break-all">
                {this.state.errorMessage}
              </div>
            )}
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleEmergencyBackup}
                className="px-3.5 py-2 bg-[#FAF7F2] border border-[#EADBCE] hover:bg-[#F0E6DC] text-[#2C2723] rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-[#5F7A4D]" />
                <span>导出紧急备份</span>
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-[#C85A32] hover:bg-[#B34C26] text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>重新加载手帐</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
