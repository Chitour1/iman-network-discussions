import { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { MessageCircle, Heart, Users, UserPlus2, UserMinus2 } from "lucide-react";
import { stripHtml } from "@/utils/textUtils";
import FeedCommentSection from "@/components/feed/FeedCommentSection";
import FeedNewPostForm from "@/components/feed/FeedNewPostForm";

// ========== Types ============
interface FeedTopic {
  id: string;
  title: string;
  content: string;
  created_at: string;
  like_count: number;
  reply_count: number;
  slug: string;
  author_id: string;
  is_feed_only: boolean;
}

type ProfileData = {
  id: string;
  display_name: string | null;
  username: string;
  avatar_url: string | null;
};

// ==== Local follow util ======
function getFollowingList(userId: string): string[] {
  try {
    const data = localStorage.getItem(`following_${userId}`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}
function setFollowingList(userId: string, following: string[]) {
  localStorage.setItem(`following_${userId}`, JSON.stringify(following));
}

// =========== Modal ==============
function FeedTopicModal({
  show,
  onClose,
  topic,
  author,
  goToFullView
}: {
  show: boolean,
  onClose: () => void,
  topic: FeedTopic | null,
  author: ProfileData | null,
  goToFullView: () => void
}) {
  const modalRef = useRef<HTMLDivElement>(null);

  // إغلاق عند الضغط خارج المودال
  useEffect(() => {
    if (!show) return;
    function handleClick(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [show, onClose]);

  if (!show || !topic) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg p-6 max-w-lg w-full relative shadow-lg"
        style={{
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <button
          aria-label="إغلاق"
          onClick={onClose}
          className="absolute left-2 top-2 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
        >✖</button>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-full bg-pink-200 flex items-center justify-center text-pink-600 text-lg font-bold overflow-hidden">
            {author?.display_name?.charAt(0) || author?.username?.charAt(0) || "م"}
          </div>
          <span className="font-semibold text-pink-700">
            {author?.display_name || author?.username || "مستخدم"}
          </span>
          <span className="text-xs text-gray-400 ml-2">{new Date(topic.created_at).toLocaleDateString()}</span>
        </div>
        <div
          className="text-gray-700 mb-4 overflow-y-auto"
          style={{
            maxHeight: "45vh",
            fontFamily: "inherit",
            whiteSpace: "pre-line",
            wordBreak: "break-word",
            overflowX: "hidden",
          }}
        >
          {renderPlainTextWithShortLinks(topic.content)}
        </div>
        <div className="flex gap-2 items-center mt-auto">
          <Button variant="secondary" onClick={goToFullView}>
            عرض كامل في المنتدى
          </Button>
        </div>
      </div>
    </div>
  );
}

// ========== مساعد: تصفية النص وجعله عادي بشكل كامل ==========
function renderPlainTextWithShortLinks(text: string) {
  // تنظيف النص من أي أكواد HTML
  const clean = stripHtml(text);

  // regex للروابط
  const urlRegex = /((https?:\/\/|www\.)[^\s]+)/g;
  const maxUrlLen = 28;

  // تقسيم النص وعرض الروابط مختصرة مع إمكانية الضغط
  const parts = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  let idx = 0;

  while ((match = urlRegex.exec(clean))) {
    const [url] = match;
    const start = match.index;
    const end = start + url.length;

    // أضف ما قبل الرابط
    if (start > lastIdx) {
      parts.push(clean.slice(lastIdx, start));
    }
    // الرابط نفسه (مختصر ومع ... مع فتحه عند الضغط)
    let show = url;
    if (show.length > maxUrlLen) {
      show = show.slice(0, maxUrlLen - 1) + "…";
    }
    let realUrl = url;
    if (!realUrl.startsWith("http")) realUrl = "https://" + realUrl;

    parts.push(
      <a
        key={"link" + idx}
        href={realUrl}
        className="text-blue-600 underline break-all"
        target="_blank"
        rel="noopener noreferrer"
      >
        {show}
      </a>
    );
    idx++;
    lastIdx = end;
  }
  // أضف النهاية (بعد آخر رابط)
  if (lastIdx < clean.length) {
    parts.push(clean.slice(lastIdx));
  }

  return parts;
}

export default function Feed() {
  const [topics, setTopics] = useState<FeedTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"foryou"|"following">("foryou");
  const { user, loading: authLoading } = useAuth();
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [feedLoading, setFeedLoading] = useState(false);
  const [following, setFollowing] = useState<string[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileData>>({});
  const [selectedTopic, setSelectedTopic] = useState<FeedTopic|null>(null);
  const navigate = useNavigate();
  const [reloadFeed, setReloadFeed] = useState(0);

  // جلب قائمة المتابعين من LocalStorage
  useEffect(() => {
    if (user) {
      setFollowing(getFollowingList(user.id));
    }
  }, [user, authLoading]);

  // جلب المواضيع (تشمل is_feed_only=true أو is_feed_only=false جميع المواضيع)
  useEffect(() => {
    let running = true;
    async function fetchFeed() {
      setFeedLoading(true);
      // فقط المواضيع المنشورة للمنتدى أو المخصصة للمنصة is_feed_only
      const { data, error } = await supabase
        .from("topics")
        .select("id, title, content, created_at, like_count, reply_count, slug, author_id, is_feed_only")
        .order("created_at", { ascending: false })
        .eq("status", "published")
        .or("is_feed_only.eq.true,is_feed_only.eq.false") // إحضار الجميع (هذا ضروري ليتم الفلترة لاحقًا)
        .limit(30);
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
  }, [activeTab, reloadFeed]);

  // جلب بيانات جميع الـ authors المعروضين مرة واحدة
  useEffect(() => {
    async function fetchProfiles() {
      const authorIds = Array.from(new Set(topics.map(t => t.author_id)));
      if (!authorIds.length) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, username, avatar_url")
        .in("id", authorIds);
      if (!error && data) {
        // حفظ جميع الحسابات في profiles map
        const profMap: Record<string, ProfileData> = {};
        data.forEach((p: any) => {
          profMap[p.id] = {
            id: p.id,
            display_name: p.display_name,
            username: p.username,
            avatar_url: p.avatar_url,
          };
        });
        setProfiles(profMap);
      }
    }
    fetchProfiles();
  }, [topics]);

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

  // زر متابعة/إلغاء المتابعة
  const handleFollow = (authorId: string) => {
    if (!user) {
      toast({
        title: "يرجى تسجيل الدخول",
        description: "ميزة المتابعة متاحة للأعضاء فقط.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }
    if (authorId === user.id) {
      toast({ title: "لا يمكنك متابعة نفسك" });
      return;
    }
    if (following.includes(authorId)) {
      const updated = following.filter(id => id !== authorId);
      setFollowing(updated);
      setFollowingList(user.id, updated);
      toast({ title: "تم إلغاء المتابعة لهذا العضو." });
    } else {
      const updated = [...following, authorId];
      setFollowing(updated);
      setFollowingList(user.id, updated);
      toast({ title: "تمت متابعة العضو بنجاح!" });
    }
  };

  // قائمة المتابعين في تبويب following
  const followedAuthors = useMemo(() => {
    if (!user) return [];
    return following;
  }, [user, following]);
  // === فلتر المستخدم لما يعرض في المنصة: فقط is_feed_only أو التي ليست فقط المنتدى ===
  const filteredTopics = activeTab === "foryou"
    ? topics.filter(t => t.is_feed_only === true || t.is_feed_only === false)
    : topics.filter(t => followedAuthors.includes(t.author_id) && (t.is_feed_only === true || t.is_feed_only === false));
    // لا نعرض سوى المواضيع التي تخص المنصة أو العامة (المنتدى قد يدقق أكثر)

  // ==== عند الضغط على منشور: عرض modal ====
  function handleTopicClick(topic: FeedTopic) {
    setSelectedTopic(topic);
  }
  function goToFull(topic: FeedTopic|null) {
    if (topic) {
      navigate(`/topic/${topic.slug}`);
      setSelectedTopic(null);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "#e0edfa" }} dir="rtl">
      <div className="max-w-xl mx-auto py-10">
        {/* Header, Tabs */}
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
        <FeedNewPostForm onCreated={() => setReloadFeed(reload => reload + 1)} />

        {feedLoading || loading ? (
          <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-b-2 border-pink-600 rounded-full"></div></div>
        ) : (
          filteredTopics.length === 0 ?
            <div className="text-gray-500 text-center py-16">لا توجد مواضيع متاحة</div> :
            <div className="space-y-6">
              {filteredTopics.map(topic => {
                const author = profiles[topic.author_id];
                return (
                  <div
                    key={topic.id}
                    className="bg-white shadow rounded-lg px-5 py-4 relative cursor-pointer transition hover:shadow-lg"
                    onClick={() => handleTopicClick(topic)}
                  >
                    {/* الكاتب */}
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-pink-200 rounded-full flex items-center justify-center text-sm text-pink-700 overflow-hidden">
                        {author?.display_name?.charAt(0) || author?.username?.charAt(0) || "م"}
                      </div>
                      <span className="font-semibold text-pink-700">
                        {author?.display_name || author?.username || "مستخدم"}
                      </span>
                      {/* زر المتابعة */}
                      {user && topic.author_id !== user.id && (
                        <button
                          onClick={e => {e.stopPropagation(); handleFollow(topic.author_id)}}
                          className={`ml-2 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all border ${following.includes(topic.author_id)
                            ? "bg-purple-100 text-purple-700 border-purple-400 hover:bg-purple-200"
                            : "bg-pink-100 text-pink-700 border-pink-400 hover:bg-pink-200"
                          }`}
                          title={following.includes(topic.author_id) ? "إلغاء المتابعة" : "تابع العضو"}
                        >
                          {following.includes(topic.author_id) ? (
                            <>
                              <UserMinus2 size={16} /> إلغاء المتابعة
                            </>
                          ) : (
                            <>
                              <UserPlus2 size={16} /> تابع العضو
                            </>
                          )}
                        </button>
                      )}
                      <span className="text-xs text-gray-400 ml-2">{new Date(topic.created_at).toLocaleDateString()}</span>
                    </div>
                    {/* العنوان بشكل شبيه بنص المحتوى */}
                    <div
                      className="text-gray-600 mb-2 text-base font-normal overflow-y-auto"
                      style={{
                        whiteSpace: "pre-line",
                        fontFamily: "inherit",
                        maxHeight: "8em",
                        wordBreak: "break-word",
                        overflowX: "hidden",
                      }}
                    >
                      {topic.title}
                    </div>
                    {/* محتوى النص: راسي فقط, لا تمرير أفقي, نص عادي, الروابط مختصره */}
                    <div
                      className="text-gray-600 mb-2 text-base font-normal overflow-y-auto"
                      style={{
                        whiteSpace: "pre-line",
                        fontFamily: "inherit",
                        maxHeight: "8em",
                        wordBreak: "break-word",
                        overflowX: "hidden",
                      }}
                    >
                      {renderPlainTextWithShortLinks(topic.content)}
                    </div>
                    {/* أزرار التفاعل */}
                    <div className="flex items-center gap-4 mt-3">
                      <button
                        className={`flex items-center gap-1 rounded-full px-3 py-1 border ${liked[topic.id] ? "bg-pink-100 border-pink-600 text-pink-700" : "border-gray-200 hover:border-pink-600"}`}
                        onClick={e => {e.stopPropagation(); handleLike(topic.id)}}
                        disabled={!user || liked[topic.id]}
                        title={!user ? "يجب تسجيل الدخول للتفاعل" : ""}
                      >
                        <Heart size={18} /> <span>{topic.like_count + (liked[topic.id] ? 1 : 0)}</span>
                      </button>
                      <button
                        className="flex items-center gap-1 rounded-full px-3 py-1 border border-gray-200 hover:border-pink-600"
                        onClick={e => {e.stopPropagation(); handleComment(topic.slug)}}
                        disabled={!user}
                        title={!user ? "يجب تسجيل الدخول للتعليق" : ""}
                      >
                        <MessageCircle size={18}/> <span>{topic.reply_count}</span>
                      </button>
                      <Button
                        variant="secondary"
                        className="ml-auto"
                        onClick={e => {e.stopPropagation(); navigate(`/topic/${topic.slug}`);}}
                      >عرض كامل</Button>
                    </div>
                    {/* قسم التعليقات الجديد */}
                    <FeedCommentSection topicId={topic.id} />
                  </div>
                );
              })}
            </div>
        )}

        {/* تلميح لميزة المتابعة */}
        {activeTab === "following" && !user &&
          <div className="mt-8 text-center text-gray-400 text-sm">سجّل الدخول لمتابعة مستخدمين وعرض منشوراتهم هنا.</div>
        }

        {/* نافذة modal لعرض المنشور المختار */}
        <FeedTopicModal
          show={!!selectedTopic}
          onClose={() => setSelectedTopic(null)}
          topic={selectedTopic}
          author={selectedTopic ? profiles[selectedTopic.author_id] : null}
          goToFullView={() => goToFull(selectedTopic)}
        />
      </div>
    </div>
  );
}
