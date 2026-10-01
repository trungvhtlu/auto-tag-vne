import React, { useState, useEffect } from 'react';
import { 
  BarChart2, Search, CheckCircle2, XCircle, TrendingUp, 
  Eye, Plus, ShieldCheck, Filter, RefreshCw 
} from 'lucide-react';
import { TaxTagMetric } from '../types';
import { VNEXPRESS_CATEGORIES } from '../constants/categories';

export const MetricsExplorer: React.FC = () => {
  const [metrics, setMetrics] = useState<TaxTagMetric[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Quick checker state
  const [checkInput, setCheckInput] = useState('');
  const [checkResult, setCheckResult] = useState<{
    found: boolean;
    tag: string;
    volume: number;
    views: number;
    condA: boolean;
    condB: boolean;
  } | null>(null);

  // New metric modal/drawer state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newType, setNewType] = useState<'tag' | 'taxonomy'>('tag');
  const [newCategory, setNewCategory] = useState('Thời sự');
  const [newViews, setNewViews] = useState('');
  const [newVolume, setNewVolume] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/tax-tag-metrics');
      const data = await res.json();
      setMetrics(data);
    } catch (err) {
      console.error('Error fetching metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleQuickCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInput.trim()) return;

    const term = checkInput.trim().toLowerCase();
    const found = metrics.find(m => m.tag.toLowerCase() === term);

    if (found) {
      setCheckResult({
        found: true,
        tag: found.tag,
        volume: found.search_volume_monthly,
        views: found.views_2years,
        condA: found.search_volume_monthly >= 100,
        condB: found.views_2years >= 100,
      });
    } else {
      // Not in cached list
      setCheckResult({
        found: false,
        tag: checkInput.trim(),
        volume: 0,
        views: 0,
        condA: false,
        condB: false,
      });
    }
  };

  const handleAddMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    setIsAdding(true);
    try {
      const res = await fetch('/api/tax-tag-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tag: newTag.trim(),
          type: newType,
          category: newCategory,
          views_2years: Number(newViews) || 0,
          search_volume_monthly: Number(newVolume) || 0,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewTag('');
        setNewViews('');
        setNewVolume('');
        await fetchMetrics();
      }
    } catch (err) {
      console.error('Error adding metric:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const filteredMetrics = metrics.filter(m => {
    const matchesSearch = m.tag.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'all' || 
      m.category.toLowerCase() === categoryFilter.toLowerCase() ||
      m.category.toLowerCase().includes(categoryFilter.toLowerCase());
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Intro Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-[#9f224e]" />
              <h2 className="text-lg font-bold text-slate-900">
                Tra cứu Chỉ số Tax/Tag & Search Volume (24 Tháng & 2 Năm qua)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Dữ liệu đối soát tiêu chuẩn: File "Chỉ số Tax/Tag trong 2 năm qua | VnExpress" (View ≥ 100) và Keywordtool 24 tháng (Search Volume ≥ 100 lượt/tháng).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-1.5 text-xs font-semibold bg-[#9f224e] hover:bg-[#83183d] text-white rounded-md flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Tag / Taxonomy</span>
            </button>
          </div>
        </div>

        {/* Quick Check Tool */}
        <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <form onSubmit={handleQuickCheck} className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={checkInput}
                onChange={(e) => setCheckInput(e.target.value)}
                placeholder="Nhập tên tag cần kiểm tra chuẩn SEO (Ví dụ: Cháy nhà, Bà Nà Hills, Vàng SJC, Hà Nội)..."
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#9f224e]"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-md transition-colors shrink-0"
            >
              Kiểm tra nhanh tiêu chí
            </button>
          </form>

          {/* Quick Check Result */}
          {checkResult && (
            <div className="mt-3 p-3 bg-white border border-slate-200 rounded-md text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-slate-500">Từ khoá:</span>{' '}
                  <strong className="text-base text-[#9f224e] font-serif">{checkResult.tag}</strong>
                </div>

                <div className="flex items-center gap-3 font-mono">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Volume 24T: <strong>{checkResult.volume.toLocaleString()}</strong>/tháng</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    <span>View 2 năm: <strong>{checkResult.views.toLocaleString()}</strong></span>
                  </span>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  {checkResult.condA ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-slate-400" />
                  )}
                  <span className={checkResult.condA ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                    Điều kiện A (Volume ≥ 100): {checkResult.condA ? 'ĐẠT' : 'CHƯA ĐẠT'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {checkResult.condB ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-slate-400" />
                  )}
                  <span className={checkResult.condB ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                    Điều kiện B (View ≥ 100): {checkResult.condB ? 'ĐẠT' : 'CHƯA ĐẠT'}
                  </span>
                </div>

                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  checkResult.condA || checkResult.condB
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}>
                  {checkResult.condA || checkResult.condB
                    ? '✓ ĐẠT CHUẨN ĐÁNH TAG'
                    : '⚠ CẦN XÉT DUYỆT THÊM TÍNH LIÊN QUAN HOẶC TEMPLATE'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Filter Bar */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Lọc danh sách tag / taxonomy..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#9f224e]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
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

      {/* Metrics Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px] tracking-wider">
                <th className="py-3 px-4">Tên Tag / Taxonomy</th>
                <th className="py-3 px-3">Phân loại</th>
                <th className="py-3 px-3">Chuyên mục</th>
                <th className="py-3 px-4 text-right">Search Volume (Keywordtool 24 tháng)</th>
                <th className="py-3 px-4 text-right">Lịch sử View (2 năm qua VnExpress)</th>
                <th className="py-3 px-4 text-center">Tiêu chuẩn SEO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredMetrics.length > 0 ? (
                filteredMetrics.map((m, idx) => {
                  const condA = m.search_volume_monthly >= 100;
                  const condB = m.views_2years >= 100;
                  const isQualified = condA || condB;

                  return (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {m.tag}
                      </td>

                      <td className="py-3 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          m.type === 'taxonomy'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {m.type === 'taxonomy' ? 'Taxonomy' : 'Tag'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-600">
                        {m.category}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                        {m.search_volume_monthly.toLocaleString()}
                        <span className="text-[10px] text-slate-400 font-sans ml-1">/tháng</span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                        {m.views_2years.toLocaleString()}
                        <span className="text-[10px] text-slate-400 font-sans ml-1">views</span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                          isQualified
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {isQualified ? '✓ Đạt chuẩn (≥100)' : 'Dưới ngưỡng'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Không tìm thấy bản ghi Tax/Tag nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Thêm mới Tag / Taxonomy vào cơ sở dữ liệu
            </h3>

            <form onSubmit={handleAddMetric} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên Tag / Taxonomy</label>
                <input
                  type="text"
                  required
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Ví dụ: Bà Nà Hills..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-[#9f224e] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phân loại</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-[#9f224e]"
                  >
                    <option value="tag">Tag</option>
                    <option value="taxonomy">Taxonomy</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Chuyên mục</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-[#9f224e] bg-white text-slate-800"
                  >
                    {VNEXPRESS_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Search Volume (24 tháng)</label>
                  <input
                    type="number"
                    value={newVolume}
                    onChange={(e) => setNewVolume(e.target.value)}
                    placeholder="≥ 100 lượt/tháng"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-[#9f224e]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lịch sử View (2 năm qua)</label>
                  <input
                    type="number"
                    value={newViews}
                    onChange={(e) => setNewViews(e.target.value)}
                    placeholder="≥ 100 views"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-[#9f224e]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="px-4 py-1.5 bg-[#9f224e] text-white font-semibold rounded hover:bg-[#83183d]"
                >
                  {isAdding ? 'Đang lưu...' : 'Lưu dữ liệu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
