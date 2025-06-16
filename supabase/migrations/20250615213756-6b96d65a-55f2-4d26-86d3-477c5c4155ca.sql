
-- إنشاء جدول الصلاحيات
CREATE TYPE permission_key AS ENUM (
  'delete_topic',
  'update_topic',
  'move_topic',
  'hide_topic',
  'pin_topic',
  'feature_topic'
);

CREATE TABLE IF NOT EXISTS group_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_role USER_ROLE NOT NULL, -- admin/moderator/member
    permission permission_key NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true
);

-- تفعيل RLS (سيايات الأمان) للجدول، بحيث لا يمكن إلا للمديرين والمشرفين التحكم بها (سيتم إضافة السياسات لاحقًا إذا لزم الأمر)
