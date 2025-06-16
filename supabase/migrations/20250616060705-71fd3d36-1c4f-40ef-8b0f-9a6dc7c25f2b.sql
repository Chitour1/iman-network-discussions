
-- إضافة الصلاحيات الافتراضية لجدول group_permissions
-- صلاحيات المدير (admin) - كل الصلاحيات مفعلة
INSERT INTO public.group_permissions (group_role, permission, enabled) VALUES
('admin', 'delete_topic', true),
('admin', 'update_topic', true),
('admin', 'move_topic', true),
('admin', 'hide_topic', true),
('admin', 'pin_topic', true),
('admin', 'feature_topic', true);

-- صلاحيات المشرف (moderator) - معظم الصلاحيات مفعلة عدا الحذف
INSERT INTO public.group_permissions (group_role, permission, enabled) VALUES
('moderator', 'delete_topic', false),
('moderator', 'update_topic', true),
('moderator', 'move_topic', true),
('moderator', 'hide_topic', true),
('moderator', 'pin_topic', true),
('moderator', 'feature_topic', true);

-- صلاحيات العضو العادي (member) - لا صلاحيات إدارية
INSERT INTO public.group_permissions (group_role, permission, enabled) VALUES
('member', 'delete_topic', false),
('member', 'update_topic', false),
('member', 'move_topic', false),
('member', 'hide_topic', false),
('member', 'pin_topic', false),
('member', 'feature_topic', false);
