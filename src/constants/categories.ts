export const VNEXPRESS_CATEGORIES = [
  'VnE-GO',
  'Thời sự',
  'Thế giới',
  'Kinh doanh',
  'Khoa học công nghệ',
  'Góc nhìn',
  'Spotlight',
  'Bất động sản',
  'Sức khỏe',
  'Giải trí',
  'Thể thao',
  'Pháp luật',
  'Giáo dục',
  'Đời sống',
  'Xe',
  'Du lịch',
  'Ảnh',
  'Infographic',
  'Ý kiến',
  'Tâm sự',
  'Thư giãn',
] as const;

export type VnExpressCategory = typeof VNEXPRESS_CATEGORIES[number];

export const VNEXPRESS_CATEGORIES_WITH_ALL = [
  'Tất cả',
  ...VNEXPRESS_CATEGORIES,
] as const;

export type VnExpressCategoryWithAll = typeof VNEXPRESS_CATEGORIES_WITH_ALL[number];
