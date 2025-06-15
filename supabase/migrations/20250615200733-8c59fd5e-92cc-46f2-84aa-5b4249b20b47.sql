
-- إضافة عمود لصورة الغلاف في الملف الشخصي
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cover_url text;

-- إنشاء bucket للصور الشخصية وجعله عامًا
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict do nothing;

-- إنشاء bucket لصور الغلاف وجعله عامًا
insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict do nothing;
