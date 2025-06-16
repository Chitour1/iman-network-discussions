
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Calendar, Users, Edit2, MessageCircle, Copy, MessageSquare, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import ForumLayout from "@/components/forum/ForumLayout";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

// --- أنواع بسيطة
type ProfileData = {
  id: string;
  display_name: string | null;
  username: string;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  created_at: string;
  total_topics: number;
  total_comments: number;
  reputation_score: number;
};

type TopicType = {
  id: string;
  title: string;
  slug: string;
  view_count: number;
  reply_count: number;
  created_at: string;
  category_name: string;
  category_color: string;
  is_feed_only: boolean;
};

type CommentType = {
  id: string;
  content: string;
  created_at: string;
  topic_title: string;
  topic_slug: string;
  is_feed_only: boolean;
};

export default function PublicProfilePage() {
  const { username } = useParams();
  const { user: currentUser, session, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [topics, setTopics] = useState<TopicType[]>([]);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const navigate = useNavigate();

  // جلب بيانات المستخدم
  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      let { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, username, bio, avatar_url, cover_url, created_at, reputation_score")
        .eq("username", username)
        .maybeSingle();
      if (!error && data) {
        // عدادات: مواضيع، تعليقات
        const { count: topicCount } = await supabase
          .from("topics")
          .select("*", { count: "exact" })
          .eq("author_id", data.id)
          .eq("status", "published");
        const { count: commentCount } = await supabase
          .from("comments")
          .select("*", { count: "exact" })
          .eq("author_id", data.id)
          .eq("status", "approved");
        setProfile({
          ...data,
          total_topics: topicCount || 0,
          total_comments: commentCount || 0,
        });
        // check following status for current user
        if (currentUser && data.id !== currentUser.id) {
          const followingList = localStorage.getItem(`following_${currentUser.id}`);
          const followingArr = followingList ? JSON.parse(followingList) : [];
          setFollowing(followingArr.includes(data.id));
        }
        fetchUserTopics(data.id);
        fetchUserComments(data.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    }

    async function fetchUserTopics(userId: string) {
      const { data: topicsRes } = await supabase
        .from("topics")
        .select("id, title, slug, view_count, reply_count, created_at, is_feed_only, category_id")
        .eq("author_id", userId)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(20);
      if (!topicsRes) {
        setTopics([]);
        return;
      }
      // get categories
      const catIds = topicsRes.map((t) => t.category_id).filter(Boolean);
      const { data: cats } = await supabase
        .from("categories")
        .select("id, name, color")
        .in("id", [...new Set(catIds)]);
      const catMap: any = {};
      cats?.forEach((c) => { catMap[c.id] = c });
      setTopics(
        topicsRes.map((t) => ({
          ...t,
          category_name: t.category_id ? catMap[t.category_id]?.name || "" : "",
          category_color: t.category_id ? catMap[t.category_id]?.color || "#3B82F6" : "#3B82F6",
        }))
      );
    }

    async function fetchUserComments(userId: string) {
      const { data: commentsRes } = await supabase
        .from("comments")
        .select(`
          id, content, created_at,
          topics!inner(title, slug, is_feed_only)
        `)
        .eq("author_id", userId)
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (commentsRes) {
        setComments(
          commentsRes.map((c: any) => ({
            id: c.id,
            content: c.content,
            created_at: c.created_at,
            topic_title: c.topics.title,
            topic_slug: c.topics.slug,
            is_feed_only: c.topics.is_feed_only,
          }))
        );
      }
    }

    fetchProfile();
    // eslint-disable-next-line
  }, [username]);

  // زر المتابعة/إلغاء المتابعة
  const toggleFollow = () => {
    if (!currentUser) {
      toast({ title: "سجل الدخول لمتابعة الأعضاء", variant: "destructive" });
      navigate("/");
      return;
    }
    if (!profile) return;
    const followingList = localStorage.getItem(`following_${currentUser.id}`);
    const followingArr = followingList ? JSON.parse(followingList) : [];
    if (following) {
      const newList = followingArr.filter((id: string) => id !== profile.id);
      localStorage.setItem(`following_${currentUser.id}`, JSON.stringify(newList));
      setFollowing(false);
      toast({ title: "تم إلغاء المتابعة" });
    } else {
      const newList = [...followingArr, profile.id];
      localStorage.setItem(`following_${currentUser.id}`, JSON.stringify(newList));
      setFollowing(true);
      toast({ title: "تمت المتابعة بنجاح!" });
    }
  };

  // نسخ المعرف
  const copyUsername = () => {
    if (!profile) return;
    navigator.clipboard.writeText(`@${profile.username}`);
    toast({ title: "تم نسخ المعرف" });
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-b-2 border-pink-600 rounded-full"></div>
      </div>
    );
  }
  if (!profile) {
    return (
      <ForumLayout session={session}>
        <div className="max-w-xl mx-auto text-center py-24">
          <h2 className="text-xl text-gray-700">العضو غير موجود!</h2>
        </div>
      </ForumLayout>
    );
  }

  return (
    <ForumLayout session={session}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* غلاف الملف الشخصي */}
        <div className="relative w-full">
          <div 
            className="w-full h-32 md:h-40 rounded-lg overflow-hidden border bg-gray-200 flex items-center justify-center"
            style={{
              backgroundImage: profile.cover_url ? `url(${profile.cover_url})` : 'linear-gradient(to-r, #fce7f3, #dbeafe)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {!profile.cover_url && (
              <div className="text-gray-400">
                <User className="w-10 h-10 mx-auto" />
              </div>
            )}
          </div>
          {/* صورة البروفايل دائرية */}
          <div className="absolute right-8 -bottom-10 z-10">
            <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
              <AvatarImage src={profile.avatar_url || ""} />
              <AvatarFallback className="bg-pink-200 text-pink-600 text-3xl">
                {profile.display_name?.slice(0,2) || profile.username?.slice(0,2) || "عض"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Profile Card */}
        <Card className="shadow-lg mt-14">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-green-100 text-green-700 text-2xl">
                    {profile?.display_name?.slice(0, 2) || profile?.username?.slice(0, 2) || "عض"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {profile?.display_name || "عضو جديد"}
                  </h1>
                  <div className="flex items-center text-gray-500 gap-2 text-base">
                    <span className="cursor-pointer select-all font-mono hover:text-pink-700 duration-100" onClick={copyUsername}>
                      @{profile.username}
                    </span>
                    <Copy className="w-4 h-4 cursor-pointer" onClick={copyUsername} />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500">
                      انضم {profile && formatDistanceToNow(new Date(profile.created_at), {
                        addSuffix: true,
                        locale: ar
                      })}
                    </span>
                  </div>
                </div>
              </div>
              {/* أزرار التفاعل */}
              <div className="flex flex-col gap-2 items-end">
                {(currentUser && profile.id !== currentUser.id) && (
                  <Button
                    variant={following ? "secondary" : "outline"}
                    className={`transition-all w-28 mb-2 ${following ? "border-purple-700 text-purple-800" : "border-pink-700 text-pink-800"}`}
                    onClick={toggleFollow}
                  >
                    <Users className="h-4 w-4 ml-2" />
                    {following ? "إلغاء المتابعة" : "تابع"}
                  </Button>
                )}
                {(currentUser && profile.id !== currentUser.id) && (
                  <Button variant="default" className="w-28" disabled>
                    <Mail className="h-4 w-4 ml-2" />
                    مراسلة
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-gray-700 mb-4">
                {profile?.bio || "لم يتم إضافة نبذة شخصية بعد"}
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {profile?.total_topics}
                  </div>
                  <div className="text-sm text-gray-600">مواضيع</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {profile?.total_comments}
                  </div>
                  <div className="text-sm text-gray-600">تعليقات</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {profile?.reputation_score}
                  </div>
                  <div className="text-sm text-gray-600">نقاط السمعة</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Topics and Comments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              نشاط العضو
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="topics" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="topics">المواضيع ({profile.total_topics})</TabsTrigger>
                <TabsTrigger value="comments">التعليقات ({profile.total_comments})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="topics" className="mt-4">
                {topics.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">لم يقم بكتابة أي مواضيع بعد</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topics.map((topic) => (
                      <div
                        key={topic.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => window.location.href = `/topic/${topic.slug}`}
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800 mb-1">{topic.title}</h4>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            {topic.category_name && (
                              <Badge
                                variant="secondary"
                                style={{
                                  backgroundColor: `${topic.category_color}20`,
                                  color: topic.category_color
                                }}
                              >
                                {topic.category_name}
                              </Badge>
                            )}
                            {topic.is_feed_only && (
                              <Badge variant="outline">المنصة</Badge>
                            )}
                            <span>
                              {formatDistanceToNow(new Date(topic.created_at), {
                                addSuffix: true,
                                locale: ar
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{topic.view_count}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            <span>{topic.reply_count}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="comments" className="mt-4">
                {comments.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">لم يقم بكتابة أي تعليقات بعد</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => window.location.href = `/topic/${comment.topic_slug}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-800">
                            تعليق على: {comment.topic_title}
                          </span>
                          {comment.is_feed_only && (
                            <Badge variant="outline" className="text-xs">المنصة</Badge>
                          )}
                        </div>
                        <p className="text-gray-700 text-sm mb-2 line-clamp-2">
                          {comment.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                        </p>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(comment.created_at), {
                            addSuffix: true,
                            locale: ar
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </ForumLayout>
  );
}
