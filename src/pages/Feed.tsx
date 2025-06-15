
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ThumbsUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getContentPreview } from "@/utils/textUtils";

interface FeedTopic {
  id: string;
  title: string;
  content: string;
  created_at: string;
  like_count: number;
  reply_count: number;
  slug: string;
  categories: {
    name: string;
    color: string;
    slug: string;
  } | null;
  // profiles لم تعد مستخدمة مباشرة لحين إصلاح الربط
  profiles?: {
    display_name: string;
    avatar_url: string | null;
  } | null;
  author_id?: string | null;
}

const Feed = () => {
  const [tab, setTab] = useState<"foryou" | "following">("foryou");
  const [topics, setTopics] = useState<FeedTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeed();
    // eslint-disable-next-line
  }, [tab, user]);

  // مبدأيًا: "تتابعه" تسحب كل المواضيع، لاحقًا إذا تم بناء متابعة مستخدمين نقوم بفلترتها
  async function fetchFeed() {
    setLoading(true);
    // جلب أحدث المواضيع بدون profiles
    const { data, error } = await supabase
      .from("topics")
      .select(`
        id, title, content, created_at, like_count, reply_count, slug, author_id,
        categories ( name, color, slug )
      `)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(30);

    if (!error && data) setTopics(data as FeedTopic[]);
    setLoading(false);
  }

  // تعامل الإعجاب: فقط للمسجّل
  const handleLike = async (topicId: string) => {
    if (!user) {
      navigate("/profile"); // تحويل لتسجيل الدخول أو صفحة البروفايل
      return;
    }
    await supabase.from("likes").insert({
      topic_id: topicId,
      user_id: user.id,
      created_at: new Date().toISOString(),
    });
    fetchFeed();
  };

  const handleComment = (topic: FeedTopic) => {
    if (!user) {
      navigate("/profile");
      return;
    }
    navigate(`/topic/${topic.slug}#comments`);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-2">
      <div className="mb-4">
        <Tabs value={tab} onValueChange={v => setTab(v as "foryou" | "following")}>
          <TabsList className="w-full grid grid-cols-2 bg-gray-100">
            <TabsTrigger value="foryou" className={tab === "foryou" ? "bg-white" : ""}>
              🟢 لك
            </TabsTrigger>
            <TabsTrigger value="following" className={tab === "following" ? "bg-white" : ""}>
              🟣 تتابعه
            </TabsTrigger>
          </TabsList>
          <TabsContent value="foryou" className="p-0">
            <FeedList topics={topics} loading={loading} user={user} onLike={handleLike} onComment={handleComment} />
          </TabsContent>
          <TabsContent value="following" className="p-0">
            <div className="py-8">
              <p className="text-gray-700 text-center">ميزة "تتابعه" ستتاح قريبًا بعد دعم متابعة المستخدمين! حاليًا تظهر كل المواضيع.</p>
              <FeedList topics={topics} loading={loading} user={user} onLike={handleLike} onComment={handleComment} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// مكون عرض المواضيع
function FeedList({ topics, loading, user, onLike, onComment }: {
  topics: FeedTopic[], loading: boolean, user: any,
  onLike: (id: string) => void,
  onComment: (topic: FeedTopic) => void
}) {
  if (loading)
    return <div className="py-10 text-center text-gray-500">جاري تحميل المواضيع ...</div>;

  if (!topics.length)
    return <div className="py-10 text-center text-gray-600">لا توجد مواضيع حديثة لعرضها.</div>;

  return (
    <div className="space-y-6">
      {topics.map(topic => (
        <Card key={topic.id} className="shadow border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              {topic.categories && (
                <Badge
                  variant="secondary"
                  className="text-xs cursor-pointer"
                  style={{ backgroundColor: `${topic.categories.color}20`, color: topic.categories.color }}
                  onClick={() => {
                    window.open(`/category/${topic.categories.slug}`, "_self");
                  }}
                >
                  {topic.categories.name}
                </Badge>
              )}
            </div>
            <h2
              className="font-bold text-lg mb-2 cursor-pointer hover:text-green-700"
              onClick={() => window.open(`/topic/${topic.slug}`, "_self")}
            >
              {topic.title}
            </h2>
            <p className="text-gray-700 mb-3">{getContentPreview(topic.content, 90)}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500 my-2">
              {/* بما أن profiles غير متوفرة حالياً: */}
              {"مستخدم"}
            </div>
            <div className="flex items-center gap-3 mt-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={!user}
                onClick={() => onLike(topic.id)}
              >
                <ThumbsUp className="w-4 h-4 ml-1" />
                {topic.like_count}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={!user}
                onClick={() => onComment(topic)}
              >
                <MessageSquare className="w-4 h-4 ml-1" />
                {topic.reply_count}
              </Button>
              <Button
                className="ml-auto"
                variant="outline"
                size="sm"
                onClick={() => window.open(`/topic/${topic.slug}`, "_self")}
              >
                عرض كامل
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default Feed;
