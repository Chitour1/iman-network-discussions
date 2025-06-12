
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Send } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface CreateTopicFormProps {
  categories: Category[];
  selectedCategoryId?: string;
}

const CreateTopicForm = ({ categories, selectedCategoryId }: CreateTopicFormProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState(selectedCategoryId || "");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[\u0600-\u06FF]/g, (match) => match) // Keep Arabic characters
      .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '') // Remove special characters except Arabic
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim() || !categoryId) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "خطأ",
          description: "يجب تسجيل الدخول لإنشاء موضوع",
          variant: "destructive",
        });
        return;
      }

      const slug = generateSlug(title);
      
      const { data, error } = await supabase
        .from('topics')
        .insert({
          title: title.trim(),
          content: content.trim(),
          slug,
          author_id: user.id,
          category_id: categoryId,
          status: 'published'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم إنشاء الموضوع بنجاح",
      });

      navigate(`/topic/${data.slug}`);
    } catch (error) {
      console.error('Error creating topic:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء الموضوع",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowRight className="w-4 h-4" />
          العودة
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>إنشاء موضوع جديد</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-2">
                القسم *
              </label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر القسم" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                عنوان الموضوع *
              </label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="اكتب عنوان الموضوع"
                className="text-right"
                dir="rtl"
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium mb-2">
                محتوى الموضوع *
              </label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="اكتب محتوى الموضوع"
                className="min-h-[200px] text-right"
                dir="rtl"
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                {loading ? (
                  "جاري النشر..."
                ) : (
                  <>
                    <Send className="w-4 h-4 ml-2" />
                    نشر الموضوع
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                إلغاء
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateTopicForm;
