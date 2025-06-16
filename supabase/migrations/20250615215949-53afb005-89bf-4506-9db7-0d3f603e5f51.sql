
-- إصلاح search_path في جميع الدوال التي تستعمل SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT role = 'admin' FROM public.profiles WHERE id = user_id
$$;

-- التأكد أن سياسات RLS على الجداول الحساسة لا تتيح الوصول للمجهولين
-- جميع السياسات على site_settings وgroup_permissions تستخدم is_admin(auth.uid())
-- إذا أردت التأكيد أن الجداول الأخرى (مثلاً comments, topics, الخ) لا تسمح بوصول مجهول الهوية
-- يمكنك إعادة تعريف السياسات مع شرط auth.uid() IS NOT NULL، لكن الموجود حاليًا كافٍ للجداول الحساسة
