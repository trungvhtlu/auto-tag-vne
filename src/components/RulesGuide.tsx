import React from 'react';
import { ShieldCheck, Flame, Skull, Car, Compass, AlertTriangle, CheckCircle, FileText } from 'lucide-react';

export const RulesGuide: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <ShieldCheck className="w-5 h-5 text-[#9f224e]" />
          <h2 className="text-lg font-bold text-slate-900">
            Quy tắc & Tiêu chuẩn Đánh Tag Báo điện tử VnExpress
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          Hệ thống AI được lập trình nghiêm ngặt theo các tiêu chuẩn SEO biên tập nội bộ của VnExpress nhằm đảm bảo chuẩn hóa từ khóa, tối ưu lưu lượng tìm kiếm tự nhiên và tăng trải nghiệm liên kết nội bộ.
        </p>
      </div>

      {/* 2 Core Criteria & 1 Edge Case */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Criterion 1 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <span className="w-5 h-5 rounded-full bg-red-100 text-[#9f224e] flex items-center justify-center text-xs">
              1
            </span>
            <span>Tính liên quan (Bắt buộc)</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Tag phải là từ khoá, tên chủ đề, đối tượng cụ thể (nhân vật, sự kiện, địa danh, tổ chức) được đề cập hoặc liên quan trực tiếp đến nội dung tin bài. <strong>TUYỆT ĐỐI KHÔNG</strong> tạo tag không liên quan đến bài viết.
          </p>
        </div>

        {/* Criterion 2 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">
              2
            </span>
            <span>Tính giá trị (Thỏa 1 trong 2)</span>
          </div>
          <div className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
            <p>
              • <strong>Điều kiện A (Search Volume):</strong> Truy vấn Keywordtool trong 24 tháng gần nhất đạt <strong>Volume ≥ 100 lượt/tháng</strong>.
            </p>
            <p>
              • <strong>Điều kiện B (Lịch sử View):</strong> Trang tag hoặc taxonomy trong dữ liệu 2 năm qua của VnExpress đạt <strong>View ≥ 100</strong>.
            </p>
          </div>
        </div>

        {/* Criterion 3 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs">
              3
            </span>
            <span>Giới hạn số lượng (Edge Case)</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Nếu bài báo nhắc đến quá nhiều nhân vật nổi tiếng hoặc đối tượng cùng loại thỏa mãn tiêu chí tìm kiếm cao, <strong>CHỈ CHỌN TỐI ĐA 3 TAG</strong> cho mỗi loại (ưu tiên 3 tag có Volume search hoặc View cao nhất).
          </p>
        </div>
      </div>

      {/* Category Templates (Mandatory) */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-100">
          Quy tắc Tag Cụ thể Theo Chuyên Mục (Bắt Buộc Tuân Thủ Nghiêm Ngặt)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cháy nhà */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-[#9f224e]">
              <Flame className="w-4 h-4 text-red-600" />
              <span>1. Tin Cháy nhà, Hoả hoạn</span>
            </div>
            <p className="text-xs text-slate-600">
              Bắt buộc sinh các tag theo mẫu chuẩn:
            </p>
            <ul className="text-xs font-mono space-y-1 text-slate-800 bg-white p-2.5 rounded border border-slate-200">
              <li className="text-red-700 font-semibold">• Cháy nhà</li>
              <li>• Cháy nhà tại [Tên tỉnh/thành xảy ra vụ việc]</li>
              <li>• [Tên tỉnh/thành xảy ra vụ việc]</li>
            </ul>
            <p className="text-[11px] text-slate-500">
              Ví dụ: <em>Cháy nhà</em>, <em>Cháy nhà tại Hà Nội</em>, <em>Hà Nội</em>.
            </p>
          </div>

          {/* Án mạng */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-[#9f224e]">
              <Skull className="w-4 h-4 text-slate-700" />
              <span>2. Tin Án mạng, Giết người</span>
            </div>
            <p className="text-xs text-slate-600">
              Bắt buộc sinh các tag theo mẫu chuẩn:
            </p>
            <ul className="text-xs font-mono space-y-1 text-slate-800 bg-white p-2.5 rounded border border-slate-200">
              <li className="text-red-700 font-semibold">• Giết người</li>
              <li>• Giết người tại [Tên tỉnh/thành xảy ra vụ việc]</li>
              <li>• [Tên tỉnh/thành xảy ra vụ việc]</li>
            </ul>
            <p className="text-[11px] text-slate-500">
              Ví dụ: <em>Giết người</em>, <em>Giết người tại Bình Dương</em>, <em>Bình Dương</em>.
            </p>
          </div>

          {/* Tai nạn giao thông */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-[#9f224e]">
              <Car className="w-4 h-4 text-amber-600" />
              <span>3. Tin Tai nạn giao thông</span>
            </div>
            <p className="text-xs text-slate-600">
              Bắt buộc sinh các tag theo mẫu chuẩn:
            </p>
            <ul className="text-xs font-mono space-y-1 text-slate-800 bg-white p-2.5 rounded border border-slate-200">
              <li className="text-red-700 font-semibold">• Tai nạn giao thông</li>
              <li>• Tai nạn giao thông tại [Tên tỉnh/thành xảy ra vụ việc]</li>
              <li>• [Tên tỉnh/thành xảy ra vụ việc]</li>
            </ul>
            <p className="text-[11px] text-slate-500">
              Ví dụ: <em>Tai nạn giao thông</em>, <em>Tai nạn giao thông tại Lâm Đồng</em>, <em>Lâm Đồng</em>.
            </p>
          </div>

          {/* Du lịch trong nước */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-[#9f224e]">
              <Compass className="w-4 h-4 text-blue-600" />
              <span>4. Tin Du lịch trong nước</span>
            </div>
            <p className="text-xs text-slate-600">
              Bắt buộc sinh các tag theo mẫu chuẩn:
            </p>
            <ul className="text-xs font-mono space-y-1 text-slate-800 bg-white p-2.5 rounded border border-slate-200">
              <li>• [Tên tỉnh/thành]</li>
              <li>• [Tên địa điểm du lịch nổi tiếng bên trong tỉnh thành]</li>
              <li>• Du lịch [Tên tỉnh/thành] (Ví dụ: Du lịch Đà Nẵng)</li>
              <li>• Du lịch [Tên địa điểm du lịch] (Ví dụ: Du lịch Bà Nà Hills)</li>
              <li>• Nếu là tin ẩm thực: Thêm <em>Ẩm thực [Địa điểm]</em>, <em>Ẩm thực [Tỉnh/thành]</em></li>
              <li>• Nếu là tin vui chơi: Thêm <em>Vui chơi [Địa điểm]</em>, <em>Vui chơi [Tỉnh/thành]</em></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Output Format */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <FileText className="w-4 h-4 text-[#9f224e]" />
          <span>Định dạng đầu ra chuẩn VnExpress CMS</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          • Trả về danh sách các tag được phân tách nhau bằng dấu phẩy <code>, </code> (định dạng chuẩn để phóng viên / biên tập viên copy paste trực tiếp vào CMS VnExpress).
        </p>
        <p className="text-xs text-slate-600 leading-relaxed">
          • Trong môi trường Test/Demo: Xuất kèm phần <strong>"Lý do đánh tag"</strong> và <strong>"Báo cáo Kiểm duyệt SEO"</strong> ngắn gọn giải trình logic tiêu chí Volume ≥ 100 hoặc View ≥ 100 để SEO Manager thẩm định.
        </p>
      </div>
    </div>
  );
};
