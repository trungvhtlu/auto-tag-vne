import React, { useState } from 'react';
import { 
  Database, Download, Search, Trash2, ArrowUpRight, Plus, 
  ExternalLink, Sparkles, Filter, FileSpreadsheet, RefreshCw 
} from 'lucide-react';
import { SampleArticle } from '../types';
import { VNEXPRESS_CATEGORIES } from '../constants/categories';

interface SampleDatabaseViewProps {
  samples: SampleArticle[];
  onDeleteSample: (id: number) => Promise<void>;
  onSelectForTest: (sample: SampleArticle) => void;
  onGoToInput: () => void;
  onRefresh: () => Promise<void>;
}

export const SampleDatabaseView: React.FC<SampleDatabaseViewProps> = ({
  samples,
  onDeleteSample,
  onSelectForTest,
  onGoToInput,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredSamples = samples.filter(s => {
    const matchesSearch = 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tags.some(t => t.tag.toLowerCase().includes(searchQuery.toLowerCase()) || t.reason.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.url || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || 
      (s.category && (
        s.category.toLowerCase() === selectedCategory.toLowerCase() ||
        s.category.toLowerCase().includes(selectedCategory.toLowerCase())
      ));

    return matchesSearch && matchesCategory;
  });

  const handleDownloadCsv = () => {
    window.location.href = '/api/sample-tags/export-csv';
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xoá bài tag mẫu này khỏi cơ sở dữ liệu?')) {
      return;
    }
    setIsDeleting(id);
    try {
      await onDeleteSample(id);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleRefreshClick = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-[#9f224e]" />
              <h2 className="text-lg font-bold text-slate-900">
                Kho Dữ liệu 'Các bài tag mẫu' (Knowledge Base)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              File lưu trữ database: <code>/data/sample_tags.csv</code> & <code>sample_tags.json</code>. Hệ thống sử dụng kho mẫu này làm tri thức và Few-Shot Learning để tự động hóa chuẩn xác cho các bài viết tiếp theo.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleRefreshClick}
              disabled={isRefreshing}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md flex items-center gap-1.5 transition-colors border border-slate-300"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </button>

            <button
              onClick={handleDownloadCsv}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md flex items-center gap-1.5 transition-colors border border-slate-300"
              title="Tải về file CSV theo cấu trúc #,URL,Title,Tag,Lý do tag"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tải file CSV mẫu</span>
            </button>

            <button
              onClick={onGoToInput}
              className="px-3.5 py-1.5 text-xs font-semibold bg-[#9f224e] hover:bg-[#83183d] text-white rounded-md flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nhập bài mẫu mới</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tiêu đề, tag, lý do hoặc URL..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#9f224e]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none text-slate-700"
            >
              <option value="all">Tất cả</option>
              {VNEXPRESS_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Database Table view */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px] tracking-wider">
                <th className="py-3 px-3 w-12 text-center">#</th>
                <th className="py-3 px-4 min-w-[200px]">Tiêu đề bài báo & URL</th>
                <th className="py-3 px-3 w-32">Chuyên mục</th>
                <th className="py-3 px-4 min-w-[250px]">Tag chuẩn SEO đề xuất</th>
                <th className="py-3 px-4 min-w-[300px]">Lý do đánh tag</th>
                <th className="py-3 px-3 w-28 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredSamples.length > 0 ? (
                filteredSamples.map((s, index) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* # */}
                    <td className="py-3 px-3 font-mono font-bold text-slate-500 text-center">
                      {index + 1}
                    </td>

                    {/* Title & URL */}
                    <td className="py-3 px-4">
                      <div className="font-editorial font-bold text-slate-900 text-sm leading-snug mb-1">
                        {s.title}
                      </div>
                      {s.url && (
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 hover:underline max-w-xs truncate"
                          title={s.url}
                        >
                          <span className="truncate">{s.url}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                        {s.category || 'Thời sự'}
                      </span>
                    </td>

                    {/* Tag */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {s.tags.map((t, tidx) => (
                          <span
                            key={tidx}
                            className="inline-block px-2 py-0.5 rounded bg-red-50 text-[#9f224e] border border-red-200 font-semibold text-[11px]"
                          >
                            {t.tag}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Lý do tag */}
                    <td className="py-3 px-4 text-slate-600 space-y-1">
                      {s.tags.map((t, tidx) => (
                        <div key={tidx} className="text-[11px] leading-relaxed">
                          <strong className="text-slate-800">{t.tag}:</strong> {t.reason}
                        </div>
                      ))}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onSelectForTest(s)}
                          className="p-1.5 text-slate-600 hover:text-[#9f224e] hover:bg-red-50 rounded transition-colors"
                          title="Sử dụng bài này để chạy thử Đánh Tag"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          disabled={isDeleting === s.id}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                          title="Xoá bài mẫu"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Không tìm thấy bài tag mẫu nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
