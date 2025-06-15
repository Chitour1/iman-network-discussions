
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { MessageCircle, Heart, Users } from "lucide-react";

interface FeedTopic {
  id: string;
  title: string;
  content: string;
  created_at: string;
  like_count: number;
  reply_count: number;
  slug: string;
  author_id: string;
}

type TabType = "foryou" | "following";

export default function Feed() {
  const [topics, setTopics] = useState<FeedTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("foryou");
  const { user, loading: authLoading } = useAuth();
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [feedLoading, setFeedLoading] = useState(false);
  const navigate = useNavigate();

  // جلب المواضيع بشكل زمني تنازلي من كل أقسام المنتدى
  useEffect(() => {
    let running = true;
    async function fetchFeed() {
      setFeedLoading(true);
      const { data, error } = await supabase
        .from("topics")
        .select("id, title, content, created_at, like_count, reply_count, slug, author_id")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(20);

      if (!running) return;
      if (error) {
        toast({ title: "خطأ", description: "تعذر جلب المواضيع." });
        setTopics([]);
      } else {
        setTopics(data || []);
      }
      setFeedLoading(false);
      setLoading(false);
    }
    fetchFeed();
    return () => { running = false };
  }, [activeTab]);

  const handleLike = async (id: string) => {
    if (!user) {
      toast({
        title: "يرجى تسجيل الدخول",
        description: "لا يمكنك التفاعل دون تسجيل الدخول.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }
    setLiked(liked => ({ ...liked, [id]: true }));

    const { error } = await supabase
      .from("likes")
      .insert({ user_id: user.id, topic_id: id });

    if (error) {
      setLiked(liked => ({ ...liked, [id]: false }));
      toast({ title: "خطأ", description: "تعذر تسجيل الإعجاب." });
    } else {
      setTopics(curr => curr.map(t =>
        t.id === id ? { ...t, like_count: t.like_count + 1 } : t
      ));
    }
  };

  const handleComment = (topicId: string) => {
    if (!user) {
      toast({
        title: "يرجى تسجيل الدخول",
        description: "لا يمكنك التعليق دون تسجيل الدخول.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }
    navigate(`/topic/${topicId}#reply`);
  };

  // Filtering for "تتابعه" (following): فقط مواضيع من متابعين محفوظين محلياً أو في جدول المتابعة (ينفذ لاحقًا)
  const followedAuthors = useMemo(() => {
    if (!user || !window?.localStorage) return [];
    try {
      const data = localStorage.getItem(`following_${user.id}`);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }, [user]);

  const filteredTopics = activeTab === "foryou"
    ? topics
    : topics.filter(t => followedAuthors.includes(t.author_id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50" dir="rtl">
      <div className="max-w-xl mx-auto py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-pink-700 flex items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#be185d" strokeWidth="2"/><path d="M9 12c1.5 2 4.5 2 6 0M12 9v6" stroke="#be185d" strokeWidth="2" strokeLinecap="round"/></svg>
            منصة الساحة
          </h2>
          <Button variant="outline" onClick={() => navigate("/")}>
            <Users className="ml-1" />العودة للمنتدى
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 gap-2">
          <button
            className={`flex-1 py-2 rounded-full text-lg font-semibold transition-all ${activeTab === "foryou" ? "bg-pink-600 text-white shadow" : "bg-gray-200 text-gray-700"}`}
            onClick={() => setActiveTab("foryou")}
          >
            🟢 لك
          </button>
          <button
            className={`flex-1 py-2 rounded-full text-lg font-semibold transition-all ${activeTab === "following" ? "bg-purple-700 text-white shadow" : "bg-gray-200 text-gray-700"}`}
            onClick={() => setActiveTab("following")}
            disabled={!user}
            title={!user ? "متاحة عند تسجيل الدخول فقط" : ""}
          >
            🟣 تتابعه
          </button>
        </div>

        {/* Feed List */}
        {feedLoading || loading ? (
          <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-b-2 border-pink-600 rounded-full"></div></div>
        ) : (
          filteredTopics.length === 0 ?
            <div className="text-gray-500 text-center py-16">لا توجد مواضيع متاحة</div> :
            <div className="space-y-6">
              {filteredTopics.map(topic => (
                <div key={topic.id} className="bg-white shadow rounded-lg px-5 py-4 relative">
                  {/* الكاتب */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-pink-200 rounded-full flex items-center justify-center text-sm text-pink-700">م</div>
                    <span className="font-semibold text-pink-700">مستخدم</span>
                    <span className="text-xs text-gray-400 ml-2">{new Date(topic.created_at).toLocaleDateString()}</span>
                  </div>
                  {/* العنوان */}
                  <div className="font-bold text-xl text-gray-800 mb-2">{topic.title}</div>
                  {/* مقتطف المحتوى */}
                  <div className="text-gray-600 mb-2 line-clamp-3">{topic.content.slice(0, 180)}{topic.content.length > 180 && "..."}</div>
                  {/* أزرار التفاعل */}
                  <div className="flex items-center gap-4 mt-3">
                    <button
                      className={`flex items-center gap-1 rounded-full px-3 py-1 border ${liked[topic.id] ? "bg-pink-100 border-pink-600 text-pink-700" : "border-gray-200 hover:border-pink-600"}`}
                      onClick={() => handleLike(topic.id)}
                      disabled={!user || liked[topic.id]}
                      title={!user ? "يجب تسجيل الدخول للتفاعل" : ""}
                    >
                      <Heart size={18} /> <span>{topic.like_count + (liked[topic.id] ? 1 : 0)}</span>
                    </button>
                    <button
                      className="flex items-center gap-1 rounded-full px-3 py-1 border border-gray-200 hover:border-pink-600"
                      onClick={() => handleComment(topic.slug)}
                      disabled={!user}
                      title={!user ? "يجب تسجيل الدخول للتعليق" : ""}
                    >
                      <MessageCircle size={18}/> <span>{topic.reply_count}</span>
                    </button>
                    <Button
                      variant="secondary"
                      className="ml-auto"
                      onClick={() => navigate(`/topic/${topic.slug}`)}
                    >عرض كامل</Button>
                  </div>
                </div>
              ))}
            </div>
        )}

        {/* تلميح لميزة المتابعة */}
        {activeTab === "following" && !user &&
          <div className="mt-8 text-center text-gray-400 text-sm">سجّل الدخول لمتابعة مستخدمين وعرض منشوراتهم هنا.</div>
        }
      </div>
    </div>
  );
}
