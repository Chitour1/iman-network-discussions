
-- إنشاء الأقسام الأساسية للمنتدى
INSERT INTO public.categories (name, slug, description, color, icon, sort_order, is_active) VALUES
('العلوم الشرعية', 'sharia-sciences', 'أقسام العلوم الشرعية والفقه والتفسير', '#10B981', 'BookOpen', 1, true),
('القرآن الكريم وعلومه', 'quran-sciences', 'تفسير القرآن الكريم وعلومه المختلفة', '#059669', 'Book', 2, true),
('الحديث الشريف وعلومه', 'hadith-sciences', 'الأحاديث النبوية الشريفة وعلومها', '#047857', 'Scroll', 3, true),
('الفقه الإسلامي', 'islamic-fiqh', 'أحكام الفقه الإسلامي والمذاهب الفقهية', '#065F46', 'Scale', 4, true),
('العقيدة والتوحيد', 'aqidah-tawheed', 'مسائل العقيدة الإسلامية والتوحيد', '#064E3B', 'Heart', 5, true),
('السيرة النبوية', 'prophetic-biography', 'سيرة النبي محمد صلى الله عليه وسلم', '#1E40AF', 'Star', 6, true),
('التاريخ الإسلامي', 'islamic-history', 'تاريخ الأمة الإسلامية والحضارة الإسلامية', '#1E3A8A', 'Clock', 7, true),
('الدعوة والإرشاد', 'dawah-guidance', 'طرق الدعوة إلى الله والإرشاد الديني', '#3730A3', 'Megaphone', 8, true),
('الأخلاق والآداب', 'ethics-manners', 'الأخلاق الإسلامية والآداب الشرعية', '#581C87', 'Users', 9, true),
('النقاش العام', 'general-discussion', 'المناقشات العامة حول الموضوعات الإسلامية', '#7C2D12', 'MessageSquare', 10, true),
('التعارف والترحيب', 'introductions-welcome', 'قسم التعارف بين الأعضاء والترحيب بالجدد', '#92400E', 'UserPlus', 11, true),
('الاستفسارات والأسئلة', 'questions-inquiries', 'طرح الأسئلة والاستفسارات الشرعية', '#A16207', 'HelpCircle', 12, true);

-- إنشاء بعض المواضيع التجريبية للأقسام
INSERT INTO public.topics (title, slug, content, author_id, category_id, status, is_pinned, is_featured) 
SELECT 
  'مرحباً بكم في شبكة أنا المؤمن',
  'welcome-to-iman-network',
  'بسم الله الرحمن الرحيم

أهلاً وسهلاً بكم في شبكة أنا المؤمن للنقاش الإسلامي المبارك.

هذا المنتدى مخصص للنقاشات العلمية الهادفة حول الدين الإسلامي، حيث يمكنكم:

• المشاركة في النقاشات العلمية
• طرح الأسئلة والاستفسارات الشرعية  
• تبادل المعرفة والخبرات
• التعارف مع إخوانكم المؤمنين

نرجو من جميع الأعضاء الالتزام بآداب النقاش الإسلامي والاحترام المتبادل.

بارك الله فيكم جميعاً',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM categories WHERE slug = 'introductions-welcome' LIMIT 1),
  'published',
  true,
  true
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);

-- تحديث إحصائيات الموقع
INSERT INTO public.site_stats (total_users, total_topics, total_comments, daily_views, weekly_views, monthly_views, total_views, active_users)
VALUES (1, 1, 0, 25, 150, 600, 2500, 5)
ON CONFLICT (id) DO UPDATE SET
  total_topics = 1,
  last_updated = now();
