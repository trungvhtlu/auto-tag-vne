import React from 'react';
import { Tag, BookOpen, Database, BarChart2, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  activeTab: 'tagger' | 'sample-input' | 'database' | 'metrics' | 'rules';
  setActiveTab: (tab: 'tagger' | 'sample-input' | 'database' | 'metrics' | 'rules') => void;
  samplesCount: number;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, samplesCount }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar with VnExpress branding & System status */}
        <div className="flex flex-col md:flex-row md:items-center justify-between py-3.5 border-b border-slate-100 gap-3">
          <div className="flex items-center space-x-3.5">
            <div className="flex items-center">
              <span className="bg-[#9f224e] text-white font-bold text-lg sm:text-xl px-2.5 py-0.5 rounded-sm tracking-tight font-serif shadow-xs">
                VnExpress
              </span>
              <div className="ml-3 border-l border-slate-200 pl-3">
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Hệ thống Đánh Tag Tự động
                  </h1>
                  <span className="text-[10px] uppercase font-semibold bg-red-50 text-[#9f224e] border border-red-200 px-1.5 py-0.5 rounded">
                    SEO AI Engine
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Chuẩn hóa theo Keywordtool 24 tháng (Volume ≥ 100) & Lịch sử View 2 năm (View ≥ 100)
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-medium">Gemini 3.8 Flash Active</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <span>Cơ sở mẫu: <strong className="text-slate-900 font-semibold">{samplesCount}</strong> bài</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2 no-scrollbar">
          <button
            onClick={() => setActiveTab('tagger')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-sm font-semibold rounded-md transition-all whitespace-nowrap ${
              activeTab === 'tagger'
                ? 'bg-[#9f224e] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Phân tích & Đánh Tag</span>
          </button>

          <button
            onClick={() => setActiveTab('sample-input')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-sm font-semibold rounded-md transition-all whitespace-nowrap ${
              activeTab === 'sample-input'
                ? 'bg-[#9f224e] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Nhập Tag Mẫu (URL Crawler)</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-sm font-semibold rounded-md transition-all whitespace-nowrap ${
              activeTab === 'database'
                ? 'bg-[#9f224e] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Kho 'Các bài tag mẫu' ({samplesCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('metrics')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-sm font-semibold rounded-md transition-all whitespace-nowrap ${
              activeTab === 'metrics'
                ? 'bg-[#9f224e] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Tra cứu Tax/Tag & Search Volume</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-sm font-semibold rounded-md transition-all whitespace-nowrap ${
              activeTab === 'rules'
                ? 'bg-[#9f224e] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Quy tắc SEO Chuyên mục</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
