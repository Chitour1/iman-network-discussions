
-- إصلاح العلاقات المفقودة في جدول المواضيع للسماح بجلب بيانات الكاتب والقسم
ALTER TABLE public.topics DROP CONSTRAINT IF EXISTS topics_author_id_fkey;
ALTER TABLE public.topics
ADD CONSTRAINT topics_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.topics DROP CONSTRAINT IF EXISTS topics_category_id_fkey;
ALTER TABLE public.topics
ADD CONSTRAINT topics_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE RESTRICT;

-- إنشاء قسم خاص ومخفي للمنشورات القادمة من "منصة الساحة"
-- تم تعيينه كـ "غير نشط" (is_active = false) حتى لا يظهر في قائمة أقسام المنتدى للمستخدمين العاديين
INSERT INTO public.categories (id, name, slug, description, color, icon, is_active, sort_order)
VALUES 
  ('9d3f1c8b-3e5f-4a1d-8c1b-2b0e6e3d7b4a', 'منصة الساحة', 'feed-platform', 'المواضيع المنشورة مباشرة على منصة الساحة', '#be185d', 'MessageSquare', false, 999)
ON CONFLICT (slug) DO NOTHING;
