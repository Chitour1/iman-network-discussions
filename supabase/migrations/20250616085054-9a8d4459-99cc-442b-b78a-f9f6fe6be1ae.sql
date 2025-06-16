
-- إضافة الحقول الجديدة للملف الشخصي
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS interests text,
ADD COLUMN IF NOT EXISTS signature text,
ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'Asia/Riyadh',
ADD COLUMN IF NOT EXISTS language text DEFAULT 'ar',
ADD COLUMN IF NOT EXISTS profile_visibility text DEFAULT 'public',
ADD COLUMN IF NOT EXISTS allow_private_messages boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS show_online_status boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS show_email boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS notify_on_reply boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_on_mention boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_on_message boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS email_notifications boolean DEFAULT false;

-- إضافة قيود للتحقق من الصحة
ALTER TABLE public.profiles 
ADD CONSTRAINT check_profile_visibility 
CHECK (profile_visibility IN ('public', 'members', 'friends'));
