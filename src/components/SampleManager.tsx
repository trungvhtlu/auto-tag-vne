import React, { useState } from 'react';
import { 
  Link as LinkIcon, Plus, Trash2, Save, RefreshCw, CheckCircle2, 
  AlertCircle, Sparkles, BookOpen, FileText 
} from 'lucide-react';
import { SampleArticle } from '../types';
import { VNEXPRESS_CATEGORIES } from '../constants/categories';

interface SampleManagerProps {
  onSaveSample: (newSample: {
    url: string;
    title: string;
    content: string;
    category?: string;
    tags: Array<{ tag: string; reason: string }>;
  }) => Promise<void>;
  onViewDatabase: () => void;
}

interface TagInputRow {
  tag: string;
  reason: string;
}

export const SampleManager: React.FC<SampleManagerProps> = ({ onSaveSample, onViewDatabase }) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Thời sự');
  const [tagRows, setTagRows] = useState<TagInputRow[]>([
    { tag: '', reason: '' },
    { tag: '', reason: '' },
    { tag: '', reason: '' },
  ]);

  const [isExtracting, setIsExtracting] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Auto extract from URL
  const handleExtract = async () => {
    if (!url.trim()) {
      setStatusMsg({ type: 'error', text: 'Vui lòng nhập đường link bài báo VnExpress (URL).' });
      return;
    }
    setStatusMsg(null);
    setIsExtracting(true);

    try {
      const res = await fetch('/api/extract-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Không thể bóc tách nội dung từ URL này.');
      }

      setTitle(data.title || '');
      setContent(data.content || '');
      
      // Auto detect category from VnExpress standard categories
      const lower = ((data.title || '') + ' ' + (data.content || '')).toLowerCase();
      if (lower.includes('cháy') || lower.includes('hỏa hoạn') || lower.includes('tai nạn') || lower.includes('ùn tắc')) {
        setCategory('Thời sự');
      } else if (lower.includes('giết') || lower.includes('án mạng') || lower.includes('truy bắt') || lower.includes('khởi tố') || lower.includes('tòa án')) {
        setCategory('Pháp luật');
      } else if (lower.includes('du lịch') || lower.includes('bà nà') || lower.includes('tour') || lower.includes('khách sạn') || lower.includes('resort')) {
        setCategory('Du lịch');
      } else if (lower.includes('vàng') || lower.includes('chứng khoán') || lower.includes('doanh nghiệp') || lower.includes('lãi suất') || lower.includes('ngân hàng')) {
        setCategory('Kinh doanh');
      } else if (lower.includes('bất động sản') || lower.includes('chung cư') || lower.includes('đất nền') || lower.includes('nhà ở')) {
        setCategory('Bất động sản');
      } else if (lower.includes('xe máy') || lower.includes('ô tô') || lower.includes('xe điện') || lower.includes('vinfast')) {
        setCategory('Xe');
      } else if (lower.includes('sức khỏe') || lower.includes('bệnh viện') || lower.includes('bác sĩ') || lower.includes('dược')) {
        setCategory('Sức khỏe');
      } else if (lower.includes('ai') || lower.includes('công nghệ') || lower.includes('smartphone') || lower.includes('khoa học')) {
        setCategory('Khoa học công nghệ');
      } else if (lower.includes('bóng đá') || lower.includes('thể thao') || lower.includes('v-league')) {
        setCategory('Thể thao');
      } else if (lower.includes('ca sĩ') || lower.includes('phim') || lower.includes('hoa hậu') || lower.includes('giải trí')) {
        setCategory('Giải trí');
      } else if (lower.includes('thế giới') || lower.includes('nga') || lower.includes('mỹ') || lower.includes('ukraine')) {
        setCategory('Thế giới');
      } else if (lower.includes('giáo dục') || lower.includes('học sinh') || lower.includes('đại học') || lower.includes('thi cử')) {
        setCategory('Giáo dục');
      }

      setStatusMsg({ 
        type: 'success', 
        text: 'Bóc tách thành công Tiêu đề và Nội dung thuần text của bài báo!' 
      });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Lỗi bóc tách URL.' });
    } finally {
      setIsExtracting(false);
    }
  };

  // Add new tag row
  const handleAddRow = () => {
    setTagRows([...tagRows, { tag: '', reason: '' }]);
  };

  // Remove tag row
  const handleRemoveRow = (index: number) => {
    if (tagRows.length <= 1) {
      setTagRows([{ tag: '', reason: '' }]);
      return;
    }
    setTagRows(tagRows.filter((_, i) => i !== index));
  };

  // Update tag row field
  const handleUpdateRow = (index: number, field: 'tag' | 'reason', val: string) => {
    const updated = [...tagRows];
    updated[index][field] = val;
    setTagRows(updated);
  };

  // Quick initial tag suggestion using AI
  const handleSuggestTags = async () => {
    if (!title.trim() && !content.trim()) {
      setStatusMsg({ type: 'error', text: 'Vui lòng nhập Title hoặc Content trước khi gợi ý tag.' });
      return;
    }
    setStatusMsg(null);
    setIsSuggesting(true);

    try {
      const res = await fetch('/api/analyze-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          mode: 'demo',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Lỗi gợi ý tag.');
      }

      if (data.tags && data.tags.length > 0) {
        setTagRows(data.tags.map((t: any) => ({
          tag: t.tag,
          reason: t.reason || 'Đạt tiêu chí Volume/View ≥ 100',
        })));
        setStatusMsg({
          type: 'success',
          text: `Đã tự động điền ${data.tags.length} tag theo quy tắc VnExpress! Bạn có thể chỉnh sửa lại trước khi lưu.`
        });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Lỗi gợi ý tag.' });
    } finally {
      setIsSuggesting(false);
    }
  };

  // Save to sample database
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setStatusMsg({ type: 'error', text: 'Tiêu đề bài báo không được để trống.' });
      return;
    }

    const validTags = tagRows
      .filter(r => r.tag.trim().length > 0)
      .map(r => ({
        tag: r.tag.trim(),
        reason: r.reason.trim() || 'Mẫu chuẩn SEO VnExpress',
      }));

    if (validTags.length === 0) {
      setStatusMsg({ type: 'error', text: 'Vui lòng nhập ít nhất một Tag mẫu kèm lý do.' });
      return;
    }

    setIsSaving(true);
    setStatusMsg(null);

    try {
      await onSaveSample({
        url: url.trim(),
        title: title.trim(),
        content: content.trim(),
        category,
        tags: validTags,
      });

      setStatusMsg({
        type: 'success',
        text: 'Đã lưu thành công bài mẫu vào cơ sở dữ liệu "Các bài tag mẫu" (file CSV & JSON)!',
      });

      // Clear or reset form
      setUrl('');
      setTitle('');
      setContent('');
      setTagRows([
        { tag: '', reason: '' },
        { tag: '', reason: '' },
        { tag: '', reason: '' },
      ]);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: 'Lỗi khi lưu bài mẫu: ' + err.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Intro Box */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#9f224e]" />
              <h2 className="text-lg font-bold text-slate-900">
                Tính năng Nhập Tag Mẫu (Few-Shot Learning Knowledge Base)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Nhập link bài báo VnExpress, hệ thống tự bóc tách Title, Content thuần text. Nhập các tag kèm lý do đánh tag để lưu trữ làm tri thức cho các tin bài tiếp theo.
            </p>
          </div>

          <button
            type="button"
            onClick={onViewDatabase}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md transition-colors shrink-0 flex items-center gap-1.5"
          >
            <span>Xem Kho 'Các bài tag mẫu'</span>
          </button>
        </div>

        <div className="mt-3 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-200">
          <strong>Cấu trúc lưu trữ chuẩn:</strong> Dữ liệu được ghi nhận vào file <code>data/sample_tags.csv</code> theo đúng format: <span className="font-mono font-semibold text-[#9f224e]">#,URL,Title,Tag,Lý do tag</span> và được tự động nạp vào Few-Shot Context cho AI khi phân tích các tin tương tự.
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 shadow-xs space-y-5">
        {/* Step 1: URL input and crawler */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            1. Đường link bài báo VnExpress
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <LinkIcon className="w-4 h-4" />
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://vnexpress.net/chay-can-ho-tang-28-chung-cu-o-ha-noi-4720101.html"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9f224e]/20 focus:border-[#9f224e]"
              />
            </div>
            <button
              type="button"
              onClick={handleExtract}
              disabled={isExtracting || !url.trim()}
              className="px-4 py-2 text-xs font-semibold bg-[#9f224e] hover:bg-[#83183d] text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
            >
              {isExtracting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang bóc tách...</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5" />
                  <span>Bóc tách Title & Content</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Step 2: Title & Category */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              2. Tiêu đề bài báo (Title) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề hoặc bóc tách từ URL trên..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9f224e]/20 focus:border-[#9f224e] font-editorial font-bold text-slate-900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Chuyên mục
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9f224e]/20 focus:border-[#9f224e] text-slate-800"
            >
              {VNEXPRESS_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Step 3: Pure text Body Content */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              3. Nội dung chính thuần text (Clean Body Content)
            </label>
            <span className="text-[11px] text-slate-400">
              {content.length > 0 ? `${content.length} ký tự` : ''}
            </span>
          </div>
          <textarea
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nội dung thuần text của bài báo (đã loại bỏ quảng cáo, bình luận, video rác)..."
            className="w-full px-3 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9f224e]/20 focus:border-[#9f224e] text-slate-800 leading-relaxed font-sans"
          />
        </div>

        {/* Step 4: Tag Input Rows with Reason */}
        <div className="space-y-3 pt-3 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                4. Nhập các Tag & Lý do đánh tag tương ứng
              </label>
              <p className="text-[11px] text-slate-500">
                Mỗi tag là một ô input kèm lý do đánh tag cụ thể (Volume ≥ 100, Lịch sử View ≥ 100, hoặc Template bắt buộc).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSuggestTags}
                disabled={isSuggesting || (!title.trim() && !content.trim())}
                className="px-2.5 py-1 text-xs font-medium text-[#9f224e] bg-red-50 hover:bg-red-100 border border-red-200 rounded flex items-center gap-1 transition-colors disabled:opacity-50"
                title="Sử dụng AI điền trước các tag theo quy tắc để bạn chỉnh sửa"
              >
                {isSuggesting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Gợi ý tag ban đầu</span>
              </button>

              <button
                type="button"
                onClick={handleAddRow}
                className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm dòng tag</span>
              </button>
            </div>
          </div>

          {/* Dynamic Rows */}
          <div className="space-y-2.5">
            {tagRows.map((row, index) => (
              <div 
                key={index} 
                className="flex flex-col md:flex-row items-start md:items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-md"
              >
                <div className="w-full md:w-1/3">
                  <input
                    type="text"
                    value={row.tag}
                    onChange={(e) => handleUpdateRow(index, 'tag', e.target.value)}
                    placeholder={`Tag ${index + 1} (Ví dụ: Cháy nhà)`}
                    className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-[#9f224e] font-semibold text-slate-900"
                  />
                </div>

                <div className="w-full md:flex-1">
                  <input
                    type="text"
                    value={row.reason}
                    onChange={(e) => handleUpdateRow(index, 'reason', e.target.value)}
                    placeholder="Lý do đánh tag: Template bắt buộc / Volume: 14,800 / View: 412,000..."
                    className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-[#9f224e] text-slate-700"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveRow(index)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded transition-colors self-end md:self-center"
                  title="Xoá dòng"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Status Message */}
        {statusMsg && (
          <div className={`p-3 rounded-md text-xs flex items-start gap-2 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-3 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-[#9f224e] hover:bg-[#83183d] text-white text-sm font-semibold rounded-md shadow-xs disabled:opacity-50 flex items-center gap-2 transition-all cursor-pointer"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Đang lưu vào file 'Các bài tag mẫu'...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Lưu vào file 'Các bài tag mẫu' (Cơ sở tri thức)</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
