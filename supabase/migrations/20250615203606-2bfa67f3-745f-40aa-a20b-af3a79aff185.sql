
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  forum_title text NOT NULL,
  forum_description text,
  forum_language text NOT NULL DEFAULT 'ar',
  forum_timezone text NOT NULL DEFAULT 'Asia/Riyadh',
  forum_email text,
  seo_description text,
  seo_keywords text,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- في معظم المنتديات هناك سجل إعداد خاص واحد فقط:
INSERT INTO public.site_settings (forum_title, forum_description)
VALUES ('شبكة الساحات', 'منتدى للنقاش الإسلامي الحر')
ON CONFLICT DO NOTHING;
