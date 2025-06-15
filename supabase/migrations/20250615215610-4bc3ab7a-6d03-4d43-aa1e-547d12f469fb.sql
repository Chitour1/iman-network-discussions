
-- تفعيل RLS على جدول site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- سياسة: فقط المستخدم ذو الدور "admin" يستطيع SELECT وUPDATE وDELETE وINSERT
-- سنستخدم دالة امنية لفحص الدور بدون recursion
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role = 'admin' FROM public.profiles WHERE id = user_id
$$;

CREATE POLICY "Admins can select site_settings" ON public.site_settings
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update site_settings" ON public.site_settings
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete site_settings" ON public.site_settings
  FOR DELETE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert site_settings" ON public.site_settings
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

-- نفس الشيء لجدول group_permissions
ALTER TABLE public.group_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can select group_permissions" ON public.group_permissions
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update group_permissions" ON public.group_permissions
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete group_permissions" ON public.group_permissions
  FOR DELETE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert group_permissions" ON public.group_permissions
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
