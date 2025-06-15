
-- إنشاء تصنيف جديد خاص بمنصة الساحة (يظهر فقط للمنشورات المنصة)
INSERT INTO public.categories (
  name,
  slug,
  description,
  color,
  icon,
  sort_order,
  is_active
) VALUES (
  'منصة الساحة',
  'feed-only',
  'تصنيف خاص بمنشورات منصة التواصل الداخلية ولا يظهر في المنتدى العام',
  '#be185d',
  'Star',
  100,
  true
);

-- عرض الـ uuid الخاص بهذا التصنيف الجديد لاستخدامه في الكود لاحقًا:
SELECT id, name FROM public.categories WHERE slug = 'feed-only';
