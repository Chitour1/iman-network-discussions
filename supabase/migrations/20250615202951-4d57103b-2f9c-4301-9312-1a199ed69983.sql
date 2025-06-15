
-- إنشاء أو تحديث حساب islamway.channel@gmail.com كـ admin
INSERT INTO public.profiles (id, username, display_name, role)
SELECT
    u.id, 
    split_part(u.email, '@', 1), 
    split_part(u.email, '@', 1), 
    'admin'
FROM auth.users u
WHERE u.email = 'islamway.channel@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin', display_name = EXCLUDED.display_name;

-- إنشاء أو تحديث حساب chitour1@gmail.com كـ admin
INSERT INTO public.profiles (id, username, display_name, role)
SELECT
    u.id, 
    split_part(u.email, '@', 1), 
    split_part(u.email, '@', 1), 
    'admin'
FROM auth.users u
WHERE u.email = 'chitour1@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin', display_name = EXCLUDED.display_name;
