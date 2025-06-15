
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Calendar, Users, Edit2, MessageCircle, Copy } from "lucide-react";
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

export default function PublicProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [topics, setTopics] = useState<TopicType[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const navigate = useNavigate();

  // جلب بيانات المستخدم
  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      let { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, username, bio, avatar_url, created_at, reputation_score")
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-b-2 border-pink-600 rounded-full"></div></div>
  }
  if (!profile) {
    return (
      <ForumLayout session={null}>
        <div className="max-w-xl mx-auto text-center py-24">
          <h2 className="text-xl text-gray-700">العضو غير موجود!</h2>
        </div>
      </ForumLayout>
    );
  }

  return (
    <ForumLayout session={null}>
      <div className="max-w-2xl mx-auto bg-white shadow rounded-xl overflow-hidden mt-6">
        {/* غلاف مؤقت */}
        <div className="bg-gradient-to-r from-pink-100 to-blue-100 h-32 relative">
          <div className="absolute -bottom-12 right-6 z-10">
            <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
              <AvatarImage src={profile.avatar_url || ""} />
              <AvatarFallback className="bg-pink-200 text-pink-600 text-3xl">{profile.display_name?.slice(0,2) || profile.username?.slice(0,2) || "عض"}</AvatarFallback>
            </Avatar>
          </div>
        </div>
        {/* بيانات وأزرار */}
        <div className="pt-16 px-6 pb-4 flex flex-col gap-1">
          <div className="flex flex-row items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{profile.display_name || "عضو"}</h2>
              <div className="flex items-center text-gray-500 gap-2 text-base">
                <span className="cursor-pointer select-all font-mono hover:text-pink-700 duration-100" onClick={copyUsername}>
                  @{profile.username}
                </span>
                <Copy className="w-4 h-4 cursor-pointer" onClick={copyUsername} />
                <span className="inline-block ml-4 text-xs text-gray-400">
                  <Calendar className="inline w-4 h-4" />
                  انضم {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true, locale: ar })}
                </span>
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
          <div className="text-gray-700 mt-2 mb-1" style={{ minHeight: "40px" }}>
            {profile.bio || <span className="text-gray-400">لا يوجد نبذة شخصية بعد.</span>}
          </div>
          {/* عدادات */}
          <div className="flex gap-6 my-2 text-center">
            <div>
              <div className="font-bold text-lg text-green-700">{profile.total_topics}</div>
              <span className="text-sm text-gray-500">مواضيع</span>
            </div>
            <div>
              <div className="font-bold text-lg text-blue-700">{profile.total_comments}</div>
              <span className="text-sm text-gray-500">تعليقات</span>
            </div>
            <div>
              <div className="font-bold text-lg text-purple-700">{profile.reputation_score || 0}</div>
              <span className="text-sm text-gray-500">نقاط السمعة</span>
            </div>
          </div>
        </div>
        {/* المواضيع */}
        <ProfileTabs topics={topics} username={profile.username} />
      </div>
    </ForumLayout>
  );
}

// --- مكون عرض المواضيع/المنشورات
function ProfileTabs({ topics, username }: { topics: TopicType[], username: string }) {
  const [tab, setTab] = useState<"forum"|"feed">("forum");

  return (
    <div className="mt-2">
      <div className="flex items-center border-b">
        <button
          className={`flex-1 py-2 text-lg font-semibold ${tab==="forum"?"text-pink-700 border-b-2 border-pink-600":"text-gray-500"}`}
          onClick={()=>setTab("forum")}
        >منتدى</button>
        <button
          className={`flex-1 py-2 text-lg font-semibold ${tab==="feed"?"text-blue-600 border-b-2 border-blue-500":"text-gray-500"}`}
          onClick={()=>setTab("feed")}
        >المنصة</button>
      </div>
      <div>
        {tab==="forum" && (
          <div className="divide-y mt-2">
            {topics.filter(t=>!t.is_feed_only).length===0 && <div className="text-gray-400 text-center py-6">لا توجد مواضيع في المنتدى</div>}
            {topics.filter(t=>!t.is_feed_only).map(t=>(
              <div key={t.id} className="flex items-center gap-4 py-3 px-5 hover:bg-gray-50 cursor-pointer"
                onClick={()=>window.location.href=`/topic/${t.slug}`}>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-800 truncate">{t.title}</h4>
                  <div className="flex gap-3 items-center mt-1 text-xs text-gray-500">
                    <span className="inline px-2 py-0.5 rounded-full font-mono" style={{background:t.category_color+"20",color:t.category_color}}>
                      {t.category_name}
                    </span>
                    <span>{new Date(t.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1 text-gray-500">
                    <MessageCircle className="w-4 h-4" />
                    <span>{t.reply_count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab==="feed" && (
          <div className="divide-y mt-2">
            {topics.filter(t=>t.is_feed_only).length===0 && <div className="text-gray-400 text-center py-6">لا توجد منشورات في المنصة</div>}
            {topics.filter(t=>t.is_feed_only).map(t=>(
              <div key={t.id} className="flex items-center gap-4 py-3 px-5 hover:bg-gray-50 cursor-pointer"
                onClick={()=>window.location.href=`/topic/${t.slug}`}>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-800 truncate">{t.title}</h4>
                  <div className="flex gap-3 items-center mt-1 text-xs text-gray-500">
                    <span>{new Date(t.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1 text-gray-500">
                    <MessageCircle className="w-4 h-4" />
                    <span>{t.reply_count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

