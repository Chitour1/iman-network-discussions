
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Mail, Calendar, MessageSquare, Eye, Settings, Save, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import ForumLayout from "@/components/forum/ForumLayout";
import ProfileImageUploader from "@/components/ProfileImageUploader";

interface UserProfile {
  id: string;
  display_name: string;
  username: string;
  bio: string;
  avatar_url: string;
  cover_url: string;
  created_at: string;
  total_topics: number;
  total_comments: number;
  reputation_score: number;
}

interface UserTopic {
  id: string;
  title: string;
  slug: string;
  view_count: number;
  reply_count: number;
  created_at: string;
  category_name: string;
  category_color: string;
  is_feed_only: boolean;
}

interface UserComment {
  id: string;
  content: string;
  created_at: string;
  topic_title: string;
  topic_slug: string;
  is_feed_only: boolean;
}

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [topics, setTopics] = useState<UserTopic[]>([]);
  const [comments, setComments] = useState<UserComment[]>([]);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string>("");
  const { toast } = useToast();
  const { session, loading: authLoading } = useAuth();

  useEffect(() => {
    fetchProfile();
    fetchUserTopics();
    fetchUserComments();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, display_name, username, bio, avatar_url, created_at, reputation_score, cover_url
        `)
        .eq('id', user.user.id)
        .single();

      if (error) throw error;

      // Calculate topic and comment counts manually for now
      const { count: topicCount } = await supabase
        .from('topics')
        .select('*', { count: 'exact' })
        .eq('author_id', user.user.id)
        .eq('status', 'published');

      const { count: commentCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact' })
        .eq('author_id', user.user.id)
        .eq('status', 'approved');

      const transformedProfile: UserProfile = {
        id: data.id,
        display_name: data.display_name || "",
        username: data.username,
        bio: data.bio || "",
        avatar_url: data.avatar_url || "",
        cover_url: data.cover_url || "",
        created_at: data.created_at,
        total_topics: topicCount || 0,
        total_comments: commentCount || 0,
        reputation_score: data.reputation_score || 0
      };

      setProfile(transformedProfile);
      setDisplayName(transformedProfile.display_name);
      setBio(transformedProfile.bio);
      setCoverUrl(transformedProfile.cover_url);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserTopics = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: topicsData, error } = await supabase
        .from('topics')
        .select(`
          id, title, slug, view_count, reply_count, created_at, category_id, is_feed_only
        `)
        .eq('author_id', user.user.id)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Get category info separately
      const categoryIds = topicsData?.map(t => t.category_id) || [];
      const uniqueCategoryIds = [...new Set(categoryIds)];

      const { data: categories } = await supabase
        .from('categories')
        .select('id, name, color')
        .in('id', uniqueCategoryIds);

      const categoryMap = new Map(categories?.map(c => [c.id, { name: c.name, color: c.color }]) || []);

      const transformedTopics: UserTopic[] = (topicsData || []).map(topic => {
        const category = categoryMap.get(topic.category_id);
        return {
          id: topic.id,
          title: topic.title,
          slug: topic.slug,
          view_count: topic.view_count || 0,
          reply_count: topic.reply_count || 0,
          created_at: topic.created_at,
          category_name: category?.name || "",
          category_color: category?.color || "#3B82F6",
          is_feed_only: topic.is_feed_only || false
        };
      });

      setTopics(transformedTopics);
    } catch (error) {
      console.error('Error fetching user topics:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchUserComments = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: commentsData, error } = await supabase
        .from('comments')
        .select(`
          id, content, created_at,
          topics!inner(title, slug, is_feed_only)
        `)
        .eq('author_id', user.user.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const transformedComments: UserComment[] = (commentsData || []).map((comment: any) => ({
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        topic_title: comment.topics.title,
        topic_slug: comment.topics.slug,
        is_feed_only: comment.topics.is_feed_only || false
      }));

      setComments(transformedComments);
    } catch (error) {
      console.error('Error fetching user comments:', error);
    }
  };

  // تعديل صورة البروفايل
  const handleAvatarChange = async (url: string) => {
    if (!profile) return;
    setProfile({ ...profile, avatar_url: url });
    await supabase
      .from("profiles")
      .update({ avatar_url: url })
      .eq("id", profile.id);
  };
  // تعديل الغلاف
  const handleCoverChange = async (url: string) => {
    if (!profile) return;
    setProfile({ ...profile, cover_url: url });
    setCoverUrl(url);
    await supabase
      .from("profiles")
      .update({ cover_url: url })
      .eq("id", profile.id);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          bio: bio
        })
        .eq('id', user.user.id);

      if (error) throw error;

      setEditing(false);
      fetchProfile();
      toast({
        title: "تم الحفظ",
        description: "تم تحديث ملفك الشخصي بنجاح",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ التغييرات",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 p-6 flex items-center justify-center" dir="rtl">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="bg-white rounded-lg p-6 shadow-sm h-48"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <ForumLayout session={session}>
        <div className="max-w-4xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">خطأ في تحميل الملف الشخصي</h2>
        </div>
      </ForumLayout>
    );
  }

  return (
    <ForumLayout session={session}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* غلاف الملف الشخصي */}
        <div className="relative w-full">
          <ProfileImageUploader
            bucket="covers"
            url={profile.cover_url}
            userId={profile.id}
            rounded={false}
            label="تغيير صورة الغلاف"
            onChange={handleCoverChange}
          />
          {/* صورة البروفايل دائرية */}
          <div className="absolute right-8 -bottom-10 z-10">
            <ProfileImageUploader
              bucket="avatars"
              url={profile.avatar_url}
              userId={profile.id}
              rounded={true}
              label="تغيير صورة البروفايل"
              onChange={handleAvatarChange}
            />
          </div>
        </div>
        {/* Profile Card */}
        <Card className="shadow-lg mt-14">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-green-100 text-green-700 text-2xl">
                    {profile?.display_name?.slice(0, 2) || "عض"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {profile?.display_name || "عضو جديد"}
                  </h1>
                  <p className="text-gray-600">@{profile?.username}</p>
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
              <Button
                variant={editing ? "outline" : "ghost"}
                onClick={() => setEditing(!editing)}
              >
                <Settings className="w-4 h-4 ml-2" />
                {editing ? "إلغاء" : "تعديل"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الاسم المعروض
                  </label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="أدخل اسمك المعروض"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نبذة شخصية
                  </label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="اكتب نبذة عن نفسك..."
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-4 h-4 ml-2" />
                  {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
                </Button>
              </div>
            ) : (
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
            )}
          </CardContent>
        </Card>

        {/* User Activity Tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              نشاطي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="topics" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="topics">مواضيعي ({profile.total_topics})</TabsTrigger>
                <TabsTrigger value="comments">تعليقاتي ({profile.total_comments})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="topics" className="mt-4">
                {topics.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">لم تقم بكتابة أي مواضيع بعد</p>
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
                    <p className="text-gray-600">لم تقم بكتابة أي تعليقات بعد</p>
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
};

export default Profile;
