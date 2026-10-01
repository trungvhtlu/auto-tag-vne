import React, { useState } from 'react';
import { 
  Database, Download, Search, Trash2, ArrowUpRight, Plus, 
  ExternalLink, Sparkles, Filter, FileSpreadsheet, RefreshCw,
  Copy, Check, CheckCircle2, Sheet, Table
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
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [copiedSheet, setCopiedSheet] = useState(false);
  const [viewMode, setViewMode] = useState<'sheet' | 'table'>('sheet');

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

  const handleSyncSheet = async () => {
    setIsSyncing(true);
    setSyncNotice(null);
    try {
      const res = await fetch('/api/sample-tags/sync-sheet', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi đồng bộ file sheet.');
      
      await onRefresh();
      setSyncNotice(`Đã đồng bộ thành công tất cả ${data.totalCount || samples.length} bài mẫu vào file sheet chuẩn (#, URL, Title, Tag, Lý do tag)!`);
      setTimeout(() => setSyncNotice(null), 4000);
    } catch (err: any) {
      alert('Không thể đồng bộ: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopyForGoogleSheets = () => {
    // Format as TSV (Tab-Separated Values) with exact 5 columns for Google Sheets Ctrl+V
    const header = ['#', 'URL', 'Title', 'Tag', 'Lý do tag'].join('\t');
    const rows = filteredSamples.map((s, index) => {
      const id = index + 1;
      const url = s.url || '';
      const title = (s.title || '').replace(/\t|\r|\n/g, ' ');
      const tagsStr = s.tags.map(t => t.tag).join('; ');
      const reasonsStr = s.tags.map(t => `${t.tag}: ${t.reason}`).join('; ').replace(/\t|\r|\n/g, ' ');
      return `${id}\t${url}\t${title}\t${tagsStr}\t${reasonsStr}`;
    });

    const tsvData = [header, ...rows].join('\n');
    navigator.clipboard.writeText(tsvData);
    setCopiedSheet(true);
    setTimeout(() => setCopiedSheet(false), 3000);
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
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-[#9f224e]" />
              <h2 className="text-lg font-bold text-slate-900">
                Kho Dữ liệu 'Các bài tag mẫu' (File Sheet Database)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Dữ liệu được lưu trữ và tự động đồng bộ vào file sheet <code>/data/sample_tags.csv</code> & <code>sample_tags.json</code> theo cấu trúc chuẩn: <strong>#, URL, Title, Tag, Lý do tag</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSyncSheet}
              disabled={isSyncing}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#9f224e] hover:bg-[#83183d] rounded-md flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              title="Đồng bộ tất cả dữ liệu vào file sheet theo cấu trúc #,URL,Title,Tag,Lý do tag"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ vào File Sheet'}</span>
            </button>

            <button
              onClick={handleCopyForGoogleSheets}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md flex items-center gap-1.5 transition-colors border border-slate-300 cursor-pointer"
              title="Sao chép toàn bộ bảng dữ liệu vào Clipboard để dán trực tiếp (Ctrl+V) vào Google Sheets"
            >
              {copiedSheet ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Đã chép để dán Google Sheets!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Sao chép vào Google Sheets</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadCsv}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md flex items-center gap-1.5 transition-colors border border-slate-300 cursor-pointer"
              title="Tải về file sheet CSV định dạng UTF-8 BOM chuẩn cho Microsoft Excel & Google Sheets"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tải file CSV Sheet</span>
            </button>

            <button
              onClick={onGoToInput}
              className="px-3.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-md flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nhập bài mẫu mới</span>
            </button>
          </div>
        </div>

        {/* Sync Success Banner */}
        {syncNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{syncNotice}</span>
          </div>
        )}

        {/* Filter and View Mode Switcher */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tiêu đề, tag, lý do hoặc URL..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#9f224e]"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none text-slate-700"
              >
                <option value="all">Tất cả chuyên mục</option>
                {VNEXPRESS_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle: Spreadsheet vs Detailed Cards */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('sheet')}
                className={`px-2.5 py-1 rounded flex items-center gap-1 font-medium transition-all ${
                  viewMode === 'sheet'
                    ? 'bg-white text-[#9f224e] shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Xem giao diện bảng tính (File Sheet view)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Giao diện Sheet</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded flex items-center gap-1 font-medium transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-[#9f224e] shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Xem giao diện thẻ bài viết"
              >
                <Table className="w-3.5 h-3.5" />
                <span>Chi tiết</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Spreadsheet / Table View */}
      {viewMode === 'sheet' ? (
        /* SPREADSHEET GRID VIEW - Exact 5 Columns matching Google Sheets / Excel */
        <div className="bg-white border border-slate-300 rounded-lg shadow-xs overflow-hidden">
          <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-mono">
            <span className="font-bold flex items-center gap-1.5 text-slate-800">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Định dạng File Sheet chuẩn: #, URL, Title, Tag, Lý do tag ({filteredSamples.length} dòng)</span>
            </span>
            <span className="text-[11px] text-slate-500">Mẹo: Ấn "Sao chép vào Google Sheets" rồi mở Google Sheets ấn Ctrl+V</span>
          </div>

          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead className="sticky top-0 bg-slate-200/95 backdrop-blur-xs z-10">
                <tr className="border-b border-slate-300 text-slate-800 font-bold uppercase text-[11px]">
                  <th className="py-2.5 px-3 w-12 border-r border-slate-300 text-center bg-slate-200">#</th>
                  <th className="py-2.5 px-3 min-w-[260px] border-r border-slate-300">URL</th>
                  <th className="py-2.5 px-4 min-w-[280px] border-r border-slate-300">Title</th>
                  <th className="py-2.5 px-4 min-w-[240px] border-r border-slate-300">Tag</th>
                  <th className="py-2.5 px-4 min-w-[340px] border-r border-slate-300">Lý do tag</th>
                  <th className="py-2.5 px-2 w-20 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans">
                {filteredSamples.length > 0 ? (
                  filteredSamples.map((s, index) => {
                    const tagsText = s.tags.map(t => t.tag).join('; ');
                    const reasonsText = s.tags.map(t => `${t.tag}: ${t.reason}`).join('; ');
                    return (
                      <tr key={s.id} className="hover:bg-amber-50/40 transition-colors odd:bg-white even:bg-slate-50/60">
                        {/* Column 1: # */}
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-600 text-center border-r border-slate-200">
                          {index + 1}
                        </td>

                        {/* Column 2: URL */}
                        <td className="py-2.5 px-3 border-r border-slate-200 text-[11px] font-mono">
                          {s.url ? (
                            <a
                              href={s.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 group break-all"
                            >
                              <span>{s.url}</span>
                              <ExternalLink className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100" />
                            </a>
                          ) : (
                            <span className="text-slate-400 italic">(Không có URL)</span>
                          )}
                        </td>

                        {/* Column 3: Title */}
                        <td className="py-2.5 px-4 font-semibold text-slate-900 border-r border-slate-200 leading-snug">
                          {s.title}
                        </td>

                        {/* Column 4: Tag */}
                        <td className="py-2.5 px-4 border-r border-slate-200 font-medium text-[#9f224e]">
                          {tagsText}
                        </td>

                        {/* Column 5: Lý do tag */}
                        <td className="py-2.5 px-4 text-slate-700 leading-relaxed border-r border-slate-200 text-[11px]">
                          {reasonsText}
                        </td>

                        {/* Action buttons */}
                        <td className="py-2.5 px-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => onSelectForTest(s)}
                              className="p-1 text-slate-500 hover:text-[#9f224e] hover:bg-red-50 rounded"
                              title="Dùng bài này để chạy thử phân tích tag"
                            >
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(s.id)}
                              disabled={isDeleting === s.id}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                              title="Xoá bài mẫu"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Không tìm thấy bài tag mẫu nào phù hợp với từ khoá tìm kiếm.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* DETAILED CARD TABLE VIEW */
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
                            className="px-2 py-1 text-[11px] font-semibold text-[#9f224e] bg-red-50 hover:bg-red-100 rounded border border-red-200 flex items-center gap-1 transition-colors"
                            title="Nạp bài này vào tab Phân tích & Đánh Tag"
                          >
                            <span>Dùng thử</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id)}
                            disabled={isDeleting === s.id}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Xoá bài mẫu này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      Chưa có dữ liệu bài tag mẫu nào phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
