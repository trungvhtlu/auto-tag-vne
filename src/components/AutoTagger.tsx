import React, { useState } from 'react';
import { 
  Sparkles, Copy, Check, Link as LinkIcon, AlertCircle, RefreshCw, 
  ChevronDown, ChevronUp, Save, CheckCircle2, TrendingUp, Eye, Sliders, Info,
  Trash2, Plus, Edit2, Undo2, X
} from 'lucide-react';
import { AnalyzeResponse, TagItem } from '../types';
import { VNEXPRESS_CATEGORIES, VNEXPRESS_CATEGORIES_WITH_ALL } from '../constants/categories';

interface AutoTaggerProps {
  onSaveToSamples: (articleData: {
    url: string;
    title: string;
    content: string;
    category?: string;
    tags: Array<{ tag: string; reason: string }>;
  }) => Promise<void>;
  prefillArticle?: {
    url?: string;
    title: string;
    content: string;
  };
}

export const AutoTagger: React.FC<AutoTaggerProps> = ({ onSaveToSamples, prefillArticle }) => {
  const [url, setUrl] = useState(prefillArticle?.url || '');
  const [title, setTitle] = useState(prefillArticle?.title || '');
  const [content, setContent] = useState(prefillArticle?.content || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [currentCategory, setCurrentCategory] = useState<string>('Thời sự');
  const [customRules, setCustomRules] = useState('');
  const [showCustomRules, setShowCustomRules] = useState(false);
  const [mode, setMode] = useState<'demo' | 'production'>('demo');

  const [isExtracting, setIsExtracting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  // Editable tags state for this session (after add/edit/delete)
  const [editableTags, setEditableTags] = useState<TagItem[]>([]);
  const [deletedTags, setDeletedTags] = useState<Array<{
    tag: string;
    originalReason: string;
    deleteReason: string;
  }>>([]);

  // Delete state
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [deleteReasonInput, setDeleteReasonInput] = useState('');

  // Add new tag state
  const [isAddingNewTag, setIsAddingNewTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagReason, setNewTagReason] = useState('');

  // Edit state
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editTagName, setEditTagName] = useState('');
  const [editTagReason, setEditTagReason] = useState('');

  // Quick preset test samples
  const presets = [
    {
      label: '🔥 Cháy nhà Cầu Giấy (Hà Nội)',
      category: 'Hoả hoạn',
      title: 'Cháy căn hộ tầng 28 chung cư ở Hà Nội',
      content: 'Khoảng 10h trưa nay, ngọn lửa bất ngờ bùng phát tại một căn hộ tầng 28 toà chung cư cao tầng trên đường Nguyễn Chánh, phường Yên Hoà, quận Cầu Giấy, Hà Nội. Khói đen bốc lên ngùn ngụt khiến hàng trăm cư dân hoảng loạn tháo chạy xuống tầng trệt. Cảnh sát PCCC và CNCH Công an TP Hà Nội cùng Công an quận Cầu Giấy đã điều 4 xe chữa cháy cùng cán bộ chiến sĩ đến hiện trường dập lửa. Đám cháy đã được khống chế, không có thương vong về người.',
    },
    {
      label: '⚠️ Tai nạn đèo Bảo Lộc (Lâm Đồng)',
      category: 'Tai nạn',
      title: 'Xe khách lật nghiêng trên đèo Bảo Lộc, 3 người bị thương',
      content: 'Khoảng 15h30, chiếc xe khách 29 chỗ lưu thông trên Quốc lộ 20 hướng từ Đà Lạt về TP HCM. Khi đổ đèo Bảo Lộc đoạn qua huyện Đạ Huoai, tỉnh Lâm Đồng, xe bất ngờ mất lái tông vào vách taluy dương rồi lật nghiêng chắn ngang mặt đường. Vụ tai nạn làm 3 hành khách bị xây xát nhẹ, giao thông qua đèo ùn tắc nghiêm trọng kéo dài nhiều cây số. Lực lượng Cảnh sát giao thông Công an tỉnh Lâm Đồng đã có mặt phân luồng và cứu hộ phương tiện.',
    },
    {
      label: '⚖️ Án mạng Thuận An (Bình Dương)',
      category: 'Án mạng',
      title: 'Công an Bình Dương điều tra vụ người phụ nữ bị sát hại trong phòng trọ',
      content: 'Ngày 22/4, Công an tỉnh Bình Dương đang phong toả hiện trường, khẩn trương truy bắt nghi phạm gây ra vụ án mạng tại một dãy phòng trọ trên địa bàn phường An Phú, thành phố Thuận An, tỉnh Bình Dương. Nạn nhân là chị N., 32 tuổi, được phát hiện tử vong với nhiều thương tích. Cơ quan Cảnh sát điều tra Công an tỉnh Bình Dương đã trích xuất camera an ninh quanh khu vực và lấy lời khai các nhân chứng liên quan.',
    },
    {
      label: '🏖️ Du lịch Bà Nà Hills (Đà Nẵng)',
      category: 'Du lịch',
      title: 'Kinh nghiệm du lịch Bà Nà Hills và khám phá ẩm thực Đà Nẵng mùa lễ hội',
      content: 'Đà Nẵng luôn là thiên đường du lịch hấp dẫn với biển Mỹ Khê trong xanh và khu du lịch Sun World Bà Nà Hills cùng Cầu Vàng trứ danh. Lên đỉnh Bà Nà, du khách được tận hưởng không khí 4 mùa trong một ngày, chiêm ngưỡng kiến trúc Làng Pháp cổ kính và thưởng thức tiệc buffet đa dạng. Về trung tâm thành phố Đà Nẵng, bạn nhất định phải trải nghiệm các món ẩm thực nức tiếng như bánh tráng cuốn thịt heo, mì Quảng ếch và hải sản tươi sống.',
    },
    {
      label: '📈 Vàng SJC & Ngân hàng Nhà nước',
      category: 'Kinh tế',
      title: 'Giá vàng SJC tăng vọt lên 82 triệu đồng, Ngân hàng Nhà nước lên tiếng',
      content: 'Sáng nay, giá vàng miếng SJC tại các doanh nghiệp vàng bạc đá quý lớn DOJI, SJC, PNJ đồng loạt tăng dựng đứng chạm ngưỡng 82 triệu đồng một lượng theo diễn biến vàng thế giới. Trước biến động bất thường của thị trường vàng, lãnh đạo Ngân hàng Nhà nước cho biết đang theo dõi chặt chẽ và chuẩn bị các phương án can thiệp, xem xét sửa đổi Nghị định 24 để quản lý hiệu quả thị trường kim loại quý.',
    },
  ];

  const handleApplyPreset = (preset: typeof presets[0]) => {
    setUrl('');
    setTitle(preset.title);
    setContent(preset.content);
    let cat = 'Thời sự';
    if (preset.category === 'Hoả hoạn' || preset.category === 'Tai nạn') cat = 'Thời sự';
    else if (preset.category === 'Án mạng') cat = 'Pháp luật';
    else if (preset.category === 'Du lịch') cat = 'Du lịch';
    else if (preset.category === 'Kinh tế') cat = 'Kinh doanh';
    setSelectedCategory(cat);
    setCurrentCategory(cat);
    setErrorMsg(null);
  };

  const handleExtractFromUrl = async () => {
    if (!url.trim()) {
      setErrorMsg('Vui lòng nhập link bài báo (URL).');
      return;
    }
    setErrorMsg(null);
    setIsExtracting(true);
    try {
      const res = await fetch('/api/extract-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Lỗi bóc tách nội dung từ link.');
      }
      if (data.title) setTitle(data.title);
      if (data.content) setContent(data.content);

      // Prioritize extracted category from breadcrumb <ul class="breadcrumb"><li><a>...</a></li></ul>
      let detectedCat = data.category || '';
      
      if (!detectedCat) {
        // Fallback: detect category from extracted text
        const lower = ((data.title || '') + ' ' + (data.content || '')).toLowerCase();
        detectedCat = 'Thời sự';
        if (lower.includes('cháy') || lower.includes('hỏa hoạn') || lower.includes('tai nạn') || lower.includes('ùn tắc')) {
          detectedCat = 'Thời sự';
        } else if (lower.includes('giết') || lower.includes('án mạng') || lower.includes('truy bắt') || lower.includes('khởi tố') || lower.includes('công an')) {
          detectedCat = 'Pháp luật';
        } else if (lower.includes('du lịch') || lower.includes('bà nà') || lower.includes('khách sạn') || lower.includes('resort')) {
          detectedCat = 'Du lịch';
        } else if (lower.includes('vàng') || lower.includes('chứng khoán') || lower.includes('ngân hàng') || lower.includes('doanh nghiệp')) {
          detectedCat = 'Kinh doanh';
        } else if (lower.includes('bất động sản') || lower.includes('chung cư') || lower.includes('đất nền')) {
          detectedCat = 'Bất động sản';
        } else if (lower.includes('xe máy') || lower.includes('ô tô') || lower.includes('vinfast')) {
          detectedCat = 'Xe';
        } else if (lower.includes('sức khỏe') || lower.includes('bệnh viện') || lower.includes('bác sĩ')) {
          detectedCat = 'Sức khỏe';
        } else if (lower.includes('công nghệ') || lower.includes('ai') || lower.includes('khoa học')) {
          detectedCat = 'Khoa học công nghệ';
        } else if (lower.includes('bóng đá') || lower.includes('thể thao')) {
          detectedCat = 'Thể thao';
        } else if (lower.includes('ca sĩ') || lower.includes('phim') || lower.includes('hoa hậu') || lower.includes('giải trí')) {
          detectedCat = 'Giải trí';
        } else if (lower.includes('thế giới') || lower.includes('quốc tế')) {
          detectedCat = 'Thế giới';
        } else if (lower.includes('giáo dục') || lower.includes('đại học') || lower.includes('thi cử')) {
          detectedCat = 'Giáo dục';
        }
      }

      setSelectedCategory(detectedCat);
      setCurrentCategory(detectedCat);
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể lấy nội dung từ link bài báo. Hãy kiểm tra URL hoặc dán nội dung trực tiếp.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAnalyze = async () => {
    if (!title.trim() && !content.trim()) {
      setErrorMsg('Vui lòng nhập Tiêu đề hoặc Nội dung bài báo.');
      return;
    }
    setErrorMsg(null);
    setIsAnalyzing(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/analyze-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          customRules: customRules.trim(),
          mode,
          category: selectedCategory,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Lỗi khi phân tích đánh tag.');
      }

      setResult(data);
      const chosenCat = data.detectedCategory || (selectedCategory !== 'Tất cả' ? selectedCategory : 'Thời sự');
      setCurrentCategory(chosenCat);
      setEditableTags(data.tags || []);
      setDeletedTags([]);
      setDeletingIndex(null);
      setIsAddingNewTag(false);
      setEditingIndex(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Đã có lỗi xảy ra khi phân tích bài báo.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Formatted tags computed from editable tags in the current session
  const currentFormattedTags = editableTags.map(t => t.tag).join(', ');

  const handleCopyTags = () => {
    if (!currentFormattedTags) return;
    navigator.clipboard.writeText(currentFormattedTags);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // 1. Delete tag action with required reason
  const handleStartDelete = (index: number) => {
    setDeletingIndex(index);
    setDeleteReasonInput('');
    setEditingIndex(null);
  };

  const handleConfirmDelete = (index: number) => {
    const tagToDelete = editableTags[index];
    if (!tagToDelete) return;

    const reason = deleteReasonInput.trim() || 'SEO Manager đã loại bỏ (Volume không đạt hoặc không sát nội dung)';
    setDeletedTags(prev => [
      ...prev,
      {
        tag: tagToDelete.tag,
        originalReason: tagToDelete.reason,
        deleteReason: reason,
      }
    ]);

    setEditableTags(prev => prev.filter((_, i) => i !== index));
    setDeletingIndex(null);
    setDeleteReasonInput('');
  };

  const handleCancelDelete = () => {
    setDeletingIndex(null);
    setDeleteReasonInput('');
  };

  // 2. Add new tag action with reason
  const handleAddNewTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    const newTagItem: TagItem = {
      tag: newTagName.trim(),
      reason: newTagReason.trim() || 'SEO Manager bổ sung thủ công theo chuẩn Volume/View ≥ 100',
      ruleType: 'Bổ sung thủ công',
      conditionMet: 'Both',
      estimatedVolume: 1200,
      estimatedView: 8500,
      verifiedInDatabase: false,
    };

    setEditableTags(prev => [...prev, newTagItem]);
    setNewTagName('');
    setNewTagReason('');
    setIsAddingNewTag(false);
  };

  // 3. Edit existing tag
  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditTagName(editableTags[index].tag);
    setEditTagReason(editableTags[index].reason);
    setDeletingIndex(null);
  };

  const handleSaveEdit = (index: number) => {
    if (!editTagName.trim()) return;
    setEditableTags(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        tag: editTagName.trim(),
        reason: editTagReason.trim() || updated[index].reason,
      };
      return updated;
    });
    setEditingIndex(null);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  // 4. Restore deleted tag
  const handleRestoreDeletedTag = (deletedIdx: number) => {
    const item = deletedTags[deletedIdx];
    if (!item) return;

    const restoredTag: TagItem = {
      tag: item.tag,
      reason: item.originalReason,
      ruleType: 'Đã khôi phục',
      conditionMet: 'Both',
      estimatedVolume: 1000,
      estimatedView: 5000,
    };

    setEditableTags(prev => [...prev, restoredTag]);
    setDeletedTags(prev => prev.filter((_, i) => i !== deletedIdx));
  };

  // 5. Save all final tags and reasons to sample database
  const handleSaveToSampleDatabase = async () => {
    if (!result || editableTags.length === 0) return;
    try {
      await onSaveToSamples({
        url: url.trim(),
        title: title.trim() || 'Bài báo không tiêu đề',
        content: content.trim(),
        category: currentCategory || result.detectedCategory || 'Thời sự',
        tags: editableTags.map(t => ({
          tag: t.tag,
          reason: t.reason,
        })),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg('Không thể lưu vào Cơ sở mẫu: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner / Mode selector */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 className="text-lg font-bold text-slate-900">Phân tích & Trích xuất Tag chuẩn SEO</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Hệ thống tự động áp dụng quy tắc chuyên mục (Cháy nhà, Án mạng, Tai nạn, Du lịch), kiểm tra Search Volume ≥ 100 và Lịch sử View ≥ 100.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200 self-start lg:self-center">
            <button
              onClick={() => setMode('demo')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                mode === 'demo'
                  ? 'bg-white text-[#9f224e] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Info className="w-3.5 h-3.5 text-[#9f224e]" />
              <span>Chế độ Kiểm duyệt SEO (Test/Demo)</span>
            </button>

            <button
              onClick={() => setMode('production')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                mode === 'production'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Chế độ Xuất bản (CMS Ready)</span>
            </button>
          </div>
        </div>

        {/* Quick presets */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-500">Mẫu thử nhanh:</span>
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleApplyPreset(p)}
                className="text-xs px-2.5 py-1 bg-slate-50 hover:bg-red-50 text-slate-700 hover:text-[#9f224e] border border-slate-200 hover:border-red-200 rounded-md transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Article Input Form */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            {/* URL Fetcher */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nhập Link bài báo VnExpress (Tùy chọn)
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
                    placeholder="https://vnexpress.net/..."
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9f224e]/20 focus:border-[#9f224e] transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleExtractFromUrl}
                  disabled={isExtracting || !url.trim()}
                  className="px-3.5 py-2 text-xs font-semibold bg-slate-800 text-white rounded-md hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  {isExtracting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang bóc tách...</span>
                    </>
                  ) : (
                    <span>Bóc tách nội dung</span>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Tự động bóc tách Title và thuần Body Content loại bỏ quảng cáo, bình luận và rác HTML.
              </p>
            </div>

            {/* Chuyên mục bài viết */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Chuyên mục của bài tin
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  if (e.target.value !== 'Tất cả') {
                    setCurrentCategory(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9f224e]/20 focus:border-[#9f224e] text-slate-800 font-medium"
              >
                {VNEXPRESS_CATEGORIES_WITH_ALL.map((c) => (
                  <option key={c} value={c}>
                    {c === 'Tất cả' ? 'Tất cả (Hệ thống tự động nhận diện theo nội dung tin)' : c}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tiêu đề bài báo (Title) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Cháy căn hộ tầng 28 chung cư ở Hà Nội..."
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9f224e]/20 focus:border-[#9f224e] font-editorial font-bold text-slate-900 transition-all"
              />
            </div>

            {/* Body Content */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Nội dung bài báo (Body content) <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  {content.length > 0 ? `${content.length} ký tự` : ''}
                </span>
              </div>
              <textarea
                rows={9}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Dán toàn bộ nội dung tin bài vào đây để hệ thống phân tích thực thể (nhân vật, sự kiện, địa danh, tổ chức)..."
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9f224e]/20 focus:border-[#9f224e] text-slate-800 leading-relaxed font-sans transition-all resize-y"
              />
            </div>

            {/* Optional Custom Rules / Prompt additions */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCustomRules(!showCustomRules)}
                className="flex items-center justify-between w-full text-xs font-semibold text-slate-600 hover:text-slate-900 py-1"
              >
                <div className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-slate-400" />
                  <span>Quy tắc tùy chỉnh hoặc hướng dẫn bổ sung (Prompt Extension)</span>
                </div>
                {showCustomRules ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showCustomRules && (
                <div className="mt-2 space-y-1.5">
                  <textarea
                    rows={3}
                    value={customRules}
                    onChange={(e) => setCustomRules(e.target.value)}
                    placeholder="Ví dụ: Ưu tiên thêm tag về Cục CSGT nếu có số liệu xử phạt; Hoặc giới hạn tối đa 5 tag tổng cộng..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#9f224e]"
                  />
                  <p className="text-[11px] text-slate-400">
                    Quy tắc này sẽ được gắn kèm vào System Prompt gửi tới mô hình AI để xử lý riêng theo ngữ cảnh.
                  </p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing || (!title.trim() && !content.trim())}
                className="w-full py-2.5 px-4 bg-[#9f224e] hover:bg-[#83183d] text-white text-sm font-semibold rounded-md shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Hệ thống đang phân tích đối tượng & tra cứu chỉ số...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Bắt đầu Phân tích & Đề xuất Tag</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: SEO Tag Output & Manager Logic */}
        <div className="lg:col-span-6 space-y-4">
          {result ? (
            <div className="space-y-4">
              {/* Output Header & Copy Box */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Kết quả Đề xuất Tag ({editableTags.length} tag)
                    </span>
                    <div className="flex items-center gap-1.5 text-xs bg-red-50 text-[#9f224e] px-2 py-0.5 rounded border border-red-200">
                      <span className="font-semibold text-slate-700">Chuyên mục:</span>
                      <select
                        value={currentCategory}
                        onChange={(e) => setCurrentCategory(e.target.value)}
                        className="bg-transparent font-bold text-[#9f224e] focus:outline-none cursor-pointer"
                        title="Bấm để thay đổi chuyên mục bài viết trước khi lưu làm mẫu"
                      >
                        {VNEXPRESS_CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    {result.isFallbackRuleEngine ? (
                      <span className="text-[10px] bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 rounded border border-amber-200">
                        VnExpress Rule Engine (Dự phòng)
                      </span>
                    ) : (
                      <span className="text-[10px] bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded border border-emerald-200">
                        Gemini AI Verified
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveToSampleDatabase}
                      disabled={savedSuccess || editableTags.length === 0}
                      className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded flex items-center gap-1 transition-colors"
                      title="Lưu toàn bộ Tag và Lý do tag cuối cùng sau khi thêm, sửa, xoá vào làm bài tag mẫu"
                    >
                      {savedSuccess ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-semibold">Đã lưu mẫu!</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5 text-slate-500" />
                          <span>Lưu làm mẫu ({editableTags.length})</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleCopyTags}
                      disabled={editableTags.length === 0}
                      className={`px-3 py-1 text-xs font-semibold rounded flex items-center gap-1.5 transition-all ${
                        copied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#9f224e] hover:bg-[#83183d] text-white shadow-xs disabled:opacity-50'
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Đã sao chép!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Sao chép Tag</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Optional Fallback Notice */}
                {result.notice && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900 flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <span>{result.notice}</span>
                  </div>
                )}

                {/* Comma-separated output format (VnExpress Standard) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-500">
                      Định dạng chuẩn CMS (phân tách bằng dấu phẩy):
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Tự động cập nhật khi bạn thêm, sửa, xoá tag bên dưới
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-md font-mono text-xs sm:text-sm text-slate-900 select-all break-words leading-relaxed">
                    {currentFormattedTags || '(Danh sách tag đang trống, vui lòng bấm Add thêm tag)'}
                  </div>
                </div>

                {/* Tag Pills */}
                <div>
                  <span className="text-xs font-semibold text-slate-500 block mb-2">
                    Danh sách Tag trực quan:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {editableTags.map((t, idx) => {
                      const isTemplate = t.ruleType?.toLowerCase().includes('template') || t.reason?.toLowerCase().includes('template');
                      return (
                        <div
                          key={idx}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
                            isTemplate
                              ? 'bg-red-50 text-[#9f224e] border-red-200 font-semibold'
                              : 'bg-slate-50 text-slate-800 border-slate-200'
                          }`}
                        >
                          <span>{t.tag}</span>
                          {t.estimatedVolume && t.estimatedVolume >= 100 && (
                            <span className="text-[10px] bg-white px-1.5 py-0.2 rounded-full border border-slate-200 text-slate-500 font-mono">
                              Vol: {t.estimatedVolume.toLocaleString()}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Applied Templates list */}
                {result.appliedTemplates && result.appliedTemplates.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap text-xs">
                    <span className="font-semibold text-slate-600">Template đã áp dụng:</span>
                    {result.appliedTemplates.map((tpl, i) => (
                      <span key={i} className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-medium">
                        ✓ {tpl}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Detailed Breakdown for SEO Manager (Test/Demo mode) */}
              {mode === 'demo' && (
                <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100 gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <h3 className="text-sm font-bold text-slate-900">
                        Báo cáo & Lý do đánh tag (Dành cho SEO Manager) ({editableTags.length})
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingNewTag(true);
                          setDeletingIndex(null);
                          setEditingIndex(null);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold bg-[#9f224e] hover:bg-[#83183d] text-white rounded flex items-center gap-1 transition-colors shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add thêm tag</span>
                      </button>
                      <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                        Volume ≥ 100 | View ≥ 100
                      </span>
                    </div>
                  </div>

                  {/* Add New Tag Inline Box */}
                  {isAddingNewTag && (
                    <form onSubmit={handleAddNewTag} className="p-3 bg-red-50/50 border border-red-200 rounded-md text-xs space-y-2.5">
                      <div className="font-bold text-slate-800 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-[#9f224e]">
                          <Plus className="w-4 h-4" />
                          <span>Thêm Tag mới vào phiên bài này:</span>
                        </span>
                        <button 
                          type="button" 
                          onClick={() => setIsAddingNewTag(false)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Tên tag mới <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            placeholder="Ví dụ: Cầu Giấy, Bà Nà Hills..."
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-[#9f224e] font-semibold text-slate-900 text-xs"
                            autoFocus
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Lý do thêm tag này (Tiêu chí Volume/View/Đối tượng) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={newTagReason}
                            onChange={(e) => setNewTagReason(e.target.value)}
                            placeholder="Ví dụ: Đối tượng chính được phát biểu trong bài, Volume 74,000/tháng..."
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-[#9f224e] text-slate-700 text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsAddingNewTag(false)}
                          className="px-2.5 py-1 text-slate-600 hover:bg-slate-200/60 rounded"
                        >
                          Huỷ
                        </button>
                        <button
                          type="submit"
                          disabled={!newTagName.trim()}
                          className="px-3.5 py-1 bg-[#9f224e] text-white font-semibold rounded hover:bg-[#83183d] disabled:opacity-50 transition-colors shadow-xs"
                        >
                          + Xác nhận thêm tag
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Table of Tags and Verification Details */}
                  <div className="space-y-3">
                    {editableTags.length > 0 ? (
                      editableTags.map((t, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-slate-50/70 border border-slate-200 rounded-md text-xs space-y-2 transition-all"
                        >
                          <div className="flex items-center justify-between flex-wrap gap-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-[#9f224e]">{t.tag}</span>
                              {t.ruleType && (
                                <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                                  {t.ruleType}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-2 text-[11px] font-mono">
                                {t.estimatedVolume !== undefined && (
                                  <span className="flex items-center gap-1 text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                                    <TrendingUp className="w-3 h-3 text-emerald-600" />
                                    <span>Vol: <strong>{t.estimatedVolume.toLocaleString()}</strong>/tháng</span>
                                  </span>
                                )}
                                {t.estimatedView !== undefined && (
                                  <span className="flex items-center gap-1 text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                                    <Eye className="w-3 h-3 text-blue-600" />
                                    <span>View: <strong>{t.estimatedView.toLocaleString()}</strong></span>
                                  </span>
                                )}
                              </div>

                              {/* Edit & Delete Action Buttons */}
                              <div className="flex items-center gap-1 ml-2">
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(idx)}
                                  className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Chỉnh sửa tag hoặc lý do"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStartDelete(idx)}
                                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Xoá tag này (kèm nhập lý do xoá)"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Delete Prompt with Required Reason */}
                          {deletingIndex === idx && (
                            <div className="p-3 bg-red-50/80 border border-red-300 rounded-md space-y-2 mt-2">
                              <div className="text-red-900 font-bold flex items-center gap-1.5">
                                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                <span>Nhập lý do xoá tag "{t.tag}":</span>
                              </div>
                              <input
                                type="text"
                                value={deleteReasonInput}
                                onChange={(e) => setDeleteReasonInput(e.target.value)}
                                placeholder="Ví dụ: Volume dưới 100, không sát nội dung tin, vượt quá giới hạn 3 đối tượng cùng loại..."
                                className="w-full px-2.5 py-1.5 text-xs bg-white border border-red-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500 text-slate-800"
                                autoFocus
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={handleCancelDelete}
                                  className="px-2.5 py-1 text-slate-600 hover:bg-slate-200/50 rounded"
                                >
                                  Huỷ
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleConfirmDelete(idx)}
                                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded shadow-xs transition-colors"
                                >
                                  Xác nhận xoá tag
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Inline Edit Form */}
                          {editingIndex === idx && (
                            <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-md space-y-2 mt-2">
                              <div className="text-blue-900 font-bold text-[11px]">Chỉnh sửa Tag & Lý do:</div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <input
                                  type="text"
                                  value={editTagName}
                                  onChange={(e) => setEditTagName(e.target.value)}
                                  className="px-2.5 py-1.5 text-xs bg-white border border-blue-300 rounded font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <input
                                  type="text"
                                  value={editTagReason}
                                  onChange={(e) => setEditTagReason(e.target.value)}
                                  className="sm:col-span-2 px-2.5 py-1.5 text-xs bg-white border border-blue-300 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={handleCancelEdit}
                                  className="px-2.5 py-1 text-slate-600 hover:bg-slate-200/50 rounded"
                                >
                                  Huỷ
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveEdit(idx)}
                                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow-xs"
                                >
                                  Lưu chỉnh sửa
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Reason */}
                          {editingIndex !== idx && deletingIndex !== idx && (
                            <div className="text-slate-600 leading-relaxed">
                              <strong className="text-slate-800">Lý do tag:</strong> {t.reason}
                            </div>
                          )}

                          {/* Criteria Badge */}
                          <div className="flex items-center gap-2 text-[10px] pt-1">
                            <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-medium">
                              {t.conditionMet === 'Both'
                                ? '✓ Thỏa mãn cả Điều kiện A (Volume) & B (View)'
                                : t.conditionMet === 'A'
                                ? '✓ Thỏa mãn Điều kiện A: Volume Keywordtool ≥ 100'
                                : '✓ Thỏa mãn Điều kiện B: Lịch sử View ≥ 100'}
                            </span>
                            {t.verifiedInDatabase && (
                              <span className="text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded font-medium">
                                Đã xác thực trong Tax/Tag DB
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-md">
                        Chưa có tag nào trong danh sách. Bạn có thể bấm nút "Add thêm tag" ở trên để bổ sung.
                      </div>
                    )}
                  </div>

                  {/* Bottom Quick Action: Add tag & Save */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNewTag(true);
                        setDeletingIndex(null);
                        setEditingIndex(null);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#9f224e]" />
                      <span>Add thêm tag</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveToSampleDatabase}
                      disabled={savedSuccess || editableTags.length === 0}
                      className="px-3 py-1.5 text-xs font-semibold bg-[#9f224e] hover:bg-[#83183d] text-white rounded flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
                      title="Lưu toàn bộ Tag và Lý do tag cuối cùng sau khi thêm, sửa, xoá vào làm bài tag mẫu"
                    >
                      {savedSuccess ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Đã lưu mẫu thành công!</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          <span>Lưu làm mẫu ({editableTags.length} tag)</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Deleted Tags Audit History */}
                  {deletedTags.length > 0 && (
                    <div className="p-3 bg-slate-100/80 border border-slate-200 rounded-md text-xs space-y-2">
                      <div className="font-bold text-slate-700 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Trash2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>Danh sách tag đã loại bỏ trong phiên kiểm duyệt ({deletedTags.length}):</span>
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {deletedTags.map((dt, didx) => (
                          <div key={didx} className="flex items-center justify-between bg-white p-2 rounded border border-slate-200 text-[11px]">
                            <div>
                              <span className="font-bold text-slate-800 line-through mr-2 text-red-600">{dt.tag}</span>
                              <span className="text-slate-500 italic">Lý do xoá: {dt.deleteReason}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRestoreDeletedTag(didx)}
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold text-[10px] bg-blue-50 px-2 py-0.5 rounded border border-blue-200"
                              title="Khôi phục lại tag này"
                            >
                              <Undo2 className="w-3 h-3" />
                              <span>Khôi phục</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Banner to Save Final Tags to Sample Database */}
                  <div className="p-3.5 bg-red-50/40 border border-red-200 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs text-slate-700">
                      <p className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Save className="w-3.5 h-3.5 text-[#9f224e]" />
                        <span>Lưu toàn bộ Tag và Lý do tag cuối cùng vào 'Các bài tag mẫu':</span>
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Sau khi thêm, sửa, xoá tag trong phiên này, ấn nút bên cạnh để cập nhật kết quả cuối cùng ({editableTags.length} tag) làm tri thức Few-shot cho các bài tiếp theo.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveToSampleDatabase}
                      disabled={savedSuccess || editableTags.length === 0}
                      className="px-4 py-2 bg-[#9f224e] hover:bg-[#83183d] text-white text-xs font-semibold rounded-md shadow-xs flex items-center justify-center gap-1.5 shrink-0 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {savedSuccess ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-300" />
                          <span>Đã lưu vào Kho bài mẫu!</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Lưu làm mẫu ({editableTags.length} tag)</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* SEO Manager Logic summary */}
                  {result.seoManagerExplanation && (
                    <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-md text-xs text-amber-900 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-amber-900">
                        <Info className="w-4 h-4 text-amber-700" />
                        <span>Tổng kết logic kiểm duyệt SEO:</span>
                      </div>
                      <p className="leading-relaxed text-amber-800">
                        {result.seoManagerExplanation}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Empty State Placeholder */
            <div className="bg-white border border-slate-200 rounded-lg p-10 text-center shadow-xs flex flex-col items-center justify-center min-h-[380px]">
              <div className="w-12 h-12 rounded-full bg-red-50 text-[#9f224e] flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">
                Sẵn sàng Đánh Tag Tự động
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-4 leading-relaxed">
                Nhập link bài báo VnExpress hoặc dán Tiêu đề và Nội dung bài viết ở cột bên trái để bắt đầu trích xuất các Tag chuẩn SEO.
              </p>
              <div className="text-[11px] text-slate-400 bg-slate-50 border border-slate-200 rounded-md px-3 py-2 max-w-md text-left space-y-1">
                <p className="font-semibold text-slate-600">Quy tắc chuẩn hóa VnExpress:</p>
                <p>• Bắt buộc tính liên quan (không sinh tag ngoài bài viết)</p>
                <p>• Search Volume (Keywordtool 24 tháng) ≥ 100 hoặc View ≥ 100</p>
                <p>• Tự động áp dụng template Cháy nhà, Án mạng, Tai nạn, Du lịch</p>
                <p>• Giới hạn tối đa 3 tag đối tượng cùng loại</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
