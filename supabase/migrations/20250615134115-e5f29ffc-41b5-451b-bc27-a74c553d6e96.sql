
-- إضافة عمود لتمييز المواضيع الخاصة بالمنصة فقط
ALTER TABLE public.topics
ADD COLUMN is_feed_only boolean NOT NULL DEFAULT false;

-- يمكن لاحقًا إنشاء سياسات أوتوماتيكية أو فلترة اعتمادًا على هذا الحقل.
