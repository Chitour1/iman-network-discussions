
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

interface FeedNewPostFormProps {
  onCreated: () => void
}
export default function FeedNewPostForm({ onCreated }: FeedNewPostFormProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !title.trim() || !content.trim()) return;
    setLoading(true);
    // slug بسيط: جزء من العنوان + أرقام عشوائية
    const slug = (title.trim().replace(/\s+/g, "-").slice(0, 24) + "-" + Math.floor(Math.random() * 1e5)).toLowerCase();
    const { error } = await supabase.from("topics").insert({
      title: title.trim(),
      content: content.trim(),
      author_id: user.id,
      category_id: "feed-only", // فئة وهمية/خاصة للمنصة (يمكن تخصيصها لاحقًا)
      slug,
      status: "published",
      is_feed_only: true
    });
    if (error) {
      toast({ title: "خطأ", description: "تعذر نشر المنشور." });
    } else {
      toast({ title: "تم نشر منشورك في منصة الساحة فقط" });
      setTitle("");
      setContent("");
      onCreated();
    }
    setLoading(false);
  }

  if (!user) return null;
  return (
    <form className="bg-white rounded-lg shadow px-4 py-4 mb-10" onSubmit={handleCreate}>
      <div className="flex items-center gap-2 mb-3">
        <Plus size={18} className="text-green-700" />
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
      />
      <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={loading || !title.trim() || !content.trim()}>
        نشر للمنصة فقط
      </Button>
    </form>
  );
}
