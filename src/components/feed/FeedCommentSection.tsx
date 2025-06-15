
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { MessageCircle } from "lucide-react";
import { stripHtml } from "@/utils/textUtils";

type Comment = {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  like_count: number;
};

type Profile = {
  id: string;
  display_name: string | null;
  username: string;
  avatar_url: string | null;
};

interface FeedCommentSectionProps {
  topicId: string;
  autoFocusInput?: boolean;
}

export default function FeedCommentSection({ topicId, autoFocusInput = false }: FeedCommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch comments
  useEffect(() => {
    let running = true;
    async function fetchComments() {
      setLoading(true);
      const { data, error } = await supabase
        .from("comments")
        .select("id, content, created_at, author_id, like_count")
        .eq("topic_id", topicId)
        .eq("status", "approved")
        .order("created_at", { ascending: true });
      if (!running) return;
      if (!error && data) {
        setComments(data);
        const ids = Array.from(new Set(data.map(c => c.author_id)));
        if (ids.length) {
          const { data: pData } = await supabase
            .from("profiles")
            .select("id, display_name, username, avatar_url")
            .in("id", ids);
          if (pData) {
            const map: Record<string, Profile> = {};
            pData.forEach((p: any) => { map[p.id] = p; });
            setProfiles(map);
          }
        }
      }
      setLoading(false);
    }
    fetchComments();
    return () => { running = false; };
  }, [topicId]);

  // Add new comment
  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || !user) return;
    setLoading(true);
    const { error, data } = await supabase
      .from("comments")
      .insert({
        topic_id: topicId,
        author_id: user.id,
        content: content.trim(),
        status: "approved"
      })
      .select()
      .single();
    if (error || !data) {
      toast({ title: "خطأ", description: "تعذر إضافة التعليق" });
    } else {
      setComments(comments => [...comments, data]);
      setContent("");
      toast({ title: "تم إضافة تعليقك" });
      if (!profiles[user.id]) {
        const userProfile: Profile = {
          id: user.id,
          display_name: null,
          username: "",
          avatar_url: null
        };
        setProfiles(prev => ({ ...prev, [user.id]: userProfile }));
      }
    }
    setLoading(false);
    // إعادة تركيز المؤشر على صندوق الإدخال
    textareaRef.current?.focus();
  }

  // عرض التعليق بعد تنظيف أكواد HTML مع الحفاظ على الأسطر
  function renderMultilineContent(text: string) {
    // 1. إزالة كل أكواد الـ HTML مع stripHtml
    // 2. تقسيم النص عبر newlines
    // 3. عرض كل سطر في span مع <br/>
    const clean = stripHtml(
      text
        .replace(/\r\n|\r|\n/g, '\n')
        .replace(/<br\s*\/?>/gi, '\n')
      );
    const lines = clean.split('\n');
    return lines.map((line, idx) =>
      <span key={idx}>
        {line}
        {idx < lines.length - 1 && <br />}
      </span>
    );
  }

  return (
    <div className="mt-6 rounded-xl bg-gray-50 px-4 py-3">
      <h4 className="text-sm mb-2 font-semibold text-pink-700 flex items-center gap-1">
        <MessageCircle size={17} /> التعليقات
      </h4>
      {comments.length === 0 && <div className="text-gray-400 text-sm my-2">لا توجد تعليقات بعد.</div>}
      <div className="space-y-2 mb-3 max-h-52 overflow-y-auto pr-2">
        {comments.map(comment => {
          const author = profiles[comment.author_id];
          return (
            <div key={comment.id} className="flex items-start gap-2 bg-white rounded-lg border border-gray-100 p-2 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 text-xs font-bold overflow-hidden">
                {author?.display_name?.charAt(0) || author?.username?.charAt(0) || "م"}
              </div>
              <div className="flex-1">
                <div className="flex gap-2 items-center">
                  <span className="text-pink-700 font-semibold text-xs">{author?.display_name || author?.username || "مستخدم"}</span>
                  <span className="text-xs text-gray-400">{new Date(comment.created_at).toLocaleDateString()}</span>
                </div>
                <div className="mt-1 text-sm text-gray-700 break-words whitespace-pre-wrap">
                  {renderMultilineContent(comment.content)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {user ? (
        <form className="flex gap-2" onSubmit={handleAddComment}>
          <textarea
            ref={textareaRef}
            autoFocus={autoFocusInput}
            className="flex-1 border rounded px-3 py-2 bg-white text-sm resize-y min-h-[38px] max-h-32"
            placeholder="اكتب تعليقك هنا..."
            disabled={loading}
            maxLength={500}
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={2}
            style={{ direction: "rtl" }}
          />
          <Button className="bg-green-600 hover:bg-green-700"
            disabled={loading || !content.trim()}
            type="submit"
          >
            إضافة
          </Button>
        </form>
      ) : (
        <div className="text-sm text-pink-700 p-2 pb-0">يرجى تسجيل الدخول للتعليق.</div>
      )}
    </div>
  );
}
