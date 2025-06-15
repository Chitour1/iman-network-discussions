
-- تفعيل Row Level Security على جدول topics إذا لم يكن مفعلاً
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

-- إضافة سياسة للسماح للمستخدمين المسجلين بقراءة المواضيع المنشورة
CREATE POLICY "Users can view published topics" 
  ON public.topics 
  FOR SELECT 
  USING (status = 'published' OR auth.uid() = author_id);

-- إضافة سياسة للسماح للمستخدمين المسجلين بإنشاء مواضيع جديدة
CREATE POLICY "Authenticated users can create topics" 
  ON public.topics 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- إضافة سياسة للسماح للمؤلفين بتحديث مواضيعهم
CREATE POLICY "Authors can update their topics" 
  ON public.topics 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- إضافة سياسة للسماح للمؤلفين بحذف مواضيعهم
CREATE POLICY "Authors can delete their topics" 
  ON public.topics 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = author_id);

-- تفعيل RLS على جدول comments وإضافة السياسات المطلوبة
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- سياسة لقراءة التعليقات المعتمدة
CREATE POLICY "Users can view approved comments" 
  ON public.comments 
  FOR SELECT 
  USING (status = 'approved' OR auth.uid() = author_id);

-- سياسة لإنشاء تعليقات جديدة
CREATE POLICY "Authenticated users can create comments" 
  ON public.comments 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- سياسة لتحديث التعليقات
CREATE POLICY "Authors can update their comments" 
  ON public.comments 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- سياسة لحذف التعليقات
CREATE POLICY "Authors can delete their comments" 
  ON public.comments 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = author_id);
