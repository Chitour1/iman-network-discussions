import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { stripHtml } from "@/utils/textUtils";

// ✨ ضع هنا uuid تصنيف المنصة الخاص بك:
const FEED_CATEGORY_ID = "b0dde55b-3f8d-47db-9bf5-d5056e2bfbcb"; // <-- هذا هو المعرّف الصحيح

interface FeedNewPostFormProps {
  onCreated: () => void
}
export default function FeedNewPostForm({ onCreated }: FeedNewPostFormProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  function cleanText(val: string) {
    let txt = val.replace(/<br\s*\/?>/gi, "\n").replace(/\r\n|\r|\n/g, "\n");
    txt = txt.replace(/^[\s\n\r]+|[\s\n\r]+$/g, "");
    return stripHtml ? stripHtml(txt) : txt;
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast({ title: "يرجى تسجيل الدخول" });
      return;
    }
    setLoading(true);

    const pureTitle = cleanText(title);
    const pureContent = cleanText(content);

    if (!pureTitle || !pureContent) {
      toast({ title: "العنوان والمحتوى مطلوبان" });
      setLoading(false);
      return;
    }

    // وضّح القيم المرسلة (للتنقيح)
    console.log("Creating feed post", {
      title: pureTitle,
      content: pureContent,
      author_id: user.id,
      category_id: FEED_CATEGORY_ID,
    });

    try {
      const slug = (pureTitle.replace(/\s+/g, "-").slice(0, 24) + "-" + Math.floor(Math.random() * 1e5)).toLowerCase();
      const { error } = await supabase.from("topics").insert({
        title: pureTitle,
        content: pureContent,
        author_id: user.id,
        category_id: FEED_CATEGORY_ID,
        slug,
        status: "published",
        is_feed_only: true,
      });

      if (error) {
        console.error("Feed post error", error);
        toast({
          title: "خطأ في النشر",
          description: error.message || "تعذر نشر المنشور. قد تكون هناك مشكلة اتصال أو نقص في الصلاحيات.",
          variant: "destructive",
        });
      } else {
        toast({ title: "تم نشر منشورك في منصة الساحة فقط" });
        setTitle("");
        setContent("");
        if (onCreated) onCreated();
      }
    } catch (err) {
      // التقاط أي خطأ غير متوقع
      console.error("Feed post exception", err);
      toast({
        title: "خطأ داخلي غير متوقع",
        description: (err as Error).message || "حدثت مشكلة غير معروفة أثناء النشر.",
        variant: "destructive",
      });
    }
    setLoading(false);
  }

  if (!user) return null;
  return (
    <form className="bg-white rounded-lg shadow px-4 py-4 mb-10" onSubmit={handleCreate}>
      <div className="flex items-center gap-2 mb-3">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#15803d" strokeWidth="2" strokeLinecap="round"/></svg>
        <span className="font-bold text-green-700">أضف منشورًا خاصًا بمنصة الساحة</span>
      </div>
      <input
        className="border rounded px-2 py-2 w-full mb-2"
        placeholder="العنوان"
        value={title}
        maxLength={100}
        onChange={e => setTitle(e.target.value)}
        required
        disabled={loading}
      />
      <textarea
        className="border rounded px-2 py-2 w-full mb-3 min-h-[60px] resize-y"
        placeholder="اكتب نص المنشور هنا..."
        value={content}
        maxLength={2000}
        onChange={e => setContent(e.target.value)}
        required
        disabled={loading}
        rows={3}
        style={{ direction: "rtl" }}
      />
      <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={loading || !title.trim() || !content.trim()}>
        نشر للمنصة فقط
      </Button>
    </form>
  );
}
