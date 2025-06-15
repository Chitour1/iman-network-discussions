
-- حذف الأقسام الحالية وإنشاء الأقسام الجديدة
DELETE FROM public.categories;

-- إدراج الأقسام الجديدة
INSERT INTO public.categories (name, slug, description, color, icon, sort_order, is_active) VALUES
('الدفــــاع عن عقيدة أهل السنة', 'defense-aqeedah-sunna', 'منتدى مخصص للدفاع عن عقيدة أهل السنة والجماعة وبيان صحيح الدين', '#059669', 'Shield', 1, true),
('مــنـــتــدى الدراسات العقدية و الشرعية', 'aqeedah-sharia-studies', 'دراسات متخصصة في العقيدة والشريعة الإسلامية', '#10B981', 'BookOpen', 2, true),
('مــنـــتــدى مـجـالـس الإيــمــان و الـدعـوة', 'iman-dawah-councils', 'مجالس لتقوية الإيمان ونشر الدعوة إلى الله', '#34D399', 'Heart', 3, true),
('المـنــتــدى الـعـــام', 'general-forum', 'النقاشات العامة والمواضيع المتنوعة في الإطار الإسلامي', '#1E40AF', 'MessageSquare', 4, true),
('مــنـــتــدى الأخـبـــــــــار', 'news-forum', 'آخر الأخبار المهمة في العالم الإسلامي', '#7C2D12', 'Megaphone', 5, true),
('مــنـــتــدى الأعضاء الجدد', 'new-members-forum', 'قسم ترحيب بالأعضاء الجدد والتعارف', '#92400E', 'UserPlus', 6, true),
('مــنـــتــدى الـســمـــعـيــــات و الــمـــرئـيــــات الإســلامــــيــة', 'islamic-media-forum', 'المواد الصوتية والمرئية الإسلامية النافعة', '#A16207', 'Users', 7, true),
('الاســـــــتــــــراحـــــــــــة الــمــــفـــــتـــــو حــــــــــــة', 'open-break-area', 'استراحة للأعضاء والمواضيع الخفيفة المباحة', '#15803D', 'Star', 8, true),
('منتدى التكنولوجيا والذكاء الاصطناعي', 'technology-ai-forum', 'مناقشة التطورات التكنولوجية والذكاء الاصطناعي من منظور إسلامي', '#581C87', 'TrendingUp', 9, true);

-- نقل جميع المواضيع الموجودة إلى المنتدى العام (النقاش العام)
UPDATE public.topics 
SET category_id = (SELECT id FROM public.categories WHERE slug = 'general-forum' LIMIT 1)
WHERE category_id IS NOT NULL;

-- تحديث إحصائيات الأقسام
UPDATE public.categories 
SET topic_count = (
    SELECT COUNT(*) 
    FROM public.topics 
    WHERE topics.category_id = categories.id
)
WHERE slug = 'general-forum';

-- تحديث باقي الأقسام بعدد 0 مواضيع
UPDATE public.categories 
SET topic_count = 0 
WHERE slug != 'general-forum';

-- تحديث إحصائيات الموقع
UPDATE public.site_stats 
SET last_updated = now();
