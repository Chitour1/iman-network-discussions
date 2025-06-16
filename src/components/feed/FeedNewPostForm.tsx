
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { stripHtml } from "@/utils/textUtils";

interface FeedNewPostFormProps {
  onCreated: () => void
}

export default function FeedNewPostForm({ onCreated }: FeedNewPostFormProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  function cleanText(val: string) {
    // أزل أكواد HTML وفصّل الأسطر المكررة، وأزل المسافات الزائدة
    let txt = val.replace(/<br\s*\/?>/gi, "\n").replace(/\r\n|\r|\n/g, "\n");
    txt = txt.replace(/^[\s\n\r]+|[\s\n\r]+$/g, ""); // from start/end
    // strip html tags to ensure it's just plain text
    return stripHtml ? stripHtml(txt) : txt;
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast({ 
        title: "خطأ", 
        description: "يجب تسجيل الدخول أولاً",
        variant: "destructive" 
      });
      return;
    }

    const pureTitle = cleanText(title);
    const pureContent = cleanText(content);
    
    if (!pureTitle || !pureContent) {
      toast({ 
        title: "خطأ", 
        description: "العنوان والمحتوى مطلوبان",
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);
    
    try {
      // البحث عن قسم منصة الساحة أو إنشاؤه إذا لم يكن موجوداً
      let { data: platformCategory, error: categoryError } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", "feed-platform")
        .single();

      if (categoryError || !platformCategory) {
        // إنشاء القسم إذا لم يكن موجوداً
        const { data: newCategory, error: createCategoryError } = await supabase
          .from("categories")
          .insert({
            name: "منصة الساحة",
            slug: "feed-platform", 
            description: "المواضيع المنشورة مباشرة على منصة الساحة",
            color: "#be185d",
            icon: "MessageSquare",
            is_active: false,
            sort_order: 999
          })
          .select("id")
          .single();

        if (createCategoryError) {
          throw new Error("فشل في إنشاء قسم المنصة");
        }
        platformCategory = newCategory;
      }

      // إنشاء slug فريد
      const timestamp = Date.now();
      const slug = `${pureTitle.replace(/\s+/g, "-").slice(0, 24)}-${timestamp}`.toLowerCase();
      
      // إدراج الموضوع
      const { error: insertError } = await supabase
        .from("topics")
        .insert({
          title: pureTitle,
          content: pureContent,
          author_id: user.id,
          category_id: platformCategory.id,
          slug,
          status: "published",
          is_feed_only: true
        });

      if (insertError) {
        console.error("Insert error:", insertError);
        throw new Error(insertError.message || "فشل في نشر المنشور");
      }

      toast({ 
        title: "نجح النشر!", 
        description: "تم نشر منشورك في منصة الساحة بنجاح" 
      });
      
      setTitle("");
      setContent("");
      onCreated();
      
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast({ 
        title: "خطأ في النشر", 
        description: error.message || "حدث خطأ أثناء نشر المنشور",
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow px-4 py-4 mb-10 text-center">
        <p className="text-gray-600">يجب تسجيل الدخول لإضافة منشورات جديدة</p>
      </div>
    );
  }

  return (
    <form className="bg-white rounded-lg shadow px-4 py-4 mb-10" onSubmit={handleCreate}>
      <div className="flex items-center gap-2 mb-3">
        <Plus className="w-5 h-5 text-green-700" />
        <span className="font-bold text-green-700">أضف منشورًا خاصًا بمنصة الساحة</span>
      </div>
      
      <input
        className="border rounded px-3 py-2 w-full mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
        placeholder="العنوان"
        value={title}
        maxLength={100}
        onChange={e => setTitle(e.target.value)}
        required
        disabled={loading}
      />
      
      <textarea
        className="border rounded px-3 py-2 w-full mb-3 min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-green-500"
        placeholder="اكتب نص المنشور هنا..."
        value={content}
        maxLength={2000}
        onChange={e => setContent(e.target.value)}
        required
        disabled={loading}
        rows={4}
        style={{ direction: "rtl" }}
      />
      
      <div className="flex justify-between items-center">
        <Button 
          type="submit" 
          className="bg-green-600 hover:bg-green-700" 
          disabled={loading || !title.trim() || !content.trim()}
        >
          {loading ? "جاري النشر..." : "نشر للمنصة فقط"}
        </Button>
        
        <div className="text-sm text-gray-500">
          {title.length}/100 | {content.length}/2000
        </div>
      </div>
    </form>
  );
}
