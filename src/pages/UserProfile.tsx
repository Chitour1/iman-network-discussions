
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { User, Mail, Calendar, Users, Edit2, MessageCircle, Copy, MessageSquare, Eye, Settings, Save, Globe, Bell, Shield, Lock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import ForumLayout from "@/components/forum/ForumLayout";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import ProfileImageUploader from "@/components/ProfileImageUploader";

type ProfileData = {
  id: string;
  display_name: string | null;
  username: string;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  website: string | null;
  interests: string | null;
  signature: string | null;
  email: string | null;
  created_at: string;
  total_topics: number;
  total_comments: number;
  reputation_score: number;
  is_online: boolean;
  last_seen_at: string;
  timezone: string | null;
  language: string | null;
  // Privacy settings
  profile_visibility: string | null;
  allow_private_messages: boolean;
  show_online_status: boolean;
  show_email: boolean;
  // Notification settings
  notify_on_reply: boolean;
  notify_on_mention: boolean;
  notify_on_message: boolean;
  email_notifications: boolean;
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

export default function UserProfile() {
  const { username } = useParams();
  const { user: currentUser, session, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [topics, setTopics] = useState<TopicType[]>([]);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  // Form states for editing
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [interests, setInterests] = useState("");
  const [signature, setSignature] = useState("");
  const [timezone, setTimezone] = useState("");
  const [language, setLanguage] = useState("");
  
  // Privacy settings states
  const [profileVisibility, setProfileVisibility] = useState("public");
  const [allowPrivateMessages, setAllowPrivateMessages] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [showEmail, setShowEmail] = useState(false);
  
  // Notification settings states
  const [notifyOnReply, setNotifyOnReply] = useState(true);
  const [notifyOnMention, setNotifyOnMention] = useState(true);
  const [notifyOnMessage, setNotifyOnMessage] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);

  const isOwnProfile = currentUser && profile && currentUser.id === profile.id;

  useEffect(() => {
    if (username) {
      fetchProfile(username);
    } else if (currentUser) {
      fetchCurrentUserProfile();
    }
  }, [username, currentUser]);

  const fetchProfile = async (usernameParam: string) => {
    setLoading(true);
    try {
      let { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", usernameParam)
        .maybeSingle();

      if (!error && data) {
        // Calculate counts
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

        const profileData: ProfileData = {
          ...data,
          total_topics: topicCount || 0,
          total_comments: commentCount || 0,
          is_online: data.last_seen_at ? new Date(data.last_seen_at) > new Date(Date.now() - 15 * 60 * 1000) : false,
          // Set default values for new fields
          website: data.website || "",
          interests: data.interests || "",
          signature: data.signature || "",
          timezone: data.timezone || "Asia/Riyadh",
          language: data.language || "ar",
          profile_visibility: data.profile_visibility || "public",
          allow_private_messages: data.allow_private_messages ?? true,
          show_online_status: data.show_online_status ?? true,
          show_email: data.show_email ?? false,
          notify_on_reply: data.notify_on_reply ?? true,
          notify_on_mention: data.notify_on_mention ?? true,
          notify_on_message: data.notify_on_message ?? true,
          email_notifications: data.email_notifications ?? false,
        };

        setProfile(profileData);
        initializeFormStates(profileData);

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
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile(null);
    }
    setLoading(false);
  };

  const fetchCurrentUserProfile = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (error) throw error;

      // Calculate counts
      const { count: topicCount } = await supabase
        .from('topics')
        .select('*', { count: 'exact' })
        .eq('author_id', currentUser.id)
        .eq('status', 'published');

      const { count: commentCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact' })
        .eq('author_id', currentUser.id)
        .eq('status', 'approved');

      const profileData: ProfileData = {
        ...data,
        total_topics: topicCount || 0,
        total_comments: commentCount || 0,
        is_online: true,
        // Set default values for new fields
        website: data.website || "",
        interests: data.interests || "",
        signature: data.signature || "",
        timezone: data.timezone || "Asia/Riyadh",
        language: data.language || "ar",
        profile_visibility: data.profile_visibility || "public",
        allow_private_messages: data.allow_private_messages ?? true,
        show_online_status: data.show_online_status ?? true,
        show_email: data.show_email ?? false,
        notify_on_reply: data.notify_on_reply ?? true,
        notify_on_mention: data.notify_on_mention ?? true,
        notify_on_message: data.notify_on_message ?? true,
        email_notifications: data.email_notifications ?? false,
      };

      setProfile(profileData);
      initializeFormStates(profileData);

      fetchUserTopics(currentUser.id);
      fetchUserComments(currentUser.id);
    } catch (error) {
      console.error('Error fetching current user profile:', error);
    }
    setLoading(false);
  };

  const initializeFormStates = (profileData: ProfileData) => {
    setDisplayName(profileData.display_name || "");
    setBio(profileData.bio || "");
    setWebsite(profileData.website || "");
    setInterests(profileData.interests || "");
    setSignature(profileData.signature || "");
    setTimezone(profileData.timezone || "Asia/Riyadh");
    setLanguage(profileData.language || "ar");
    setProfileVisibility(profileData.profile_visibility || "public");
    setAllowPrivateMessages(profileData.allow_private_messages);
    setShowOnlineStatus(profileData.show_online_status);
    setShowEmail(profileData.show_email);
    setNotifyOnReply(profileData.notify_on_reply);
    setNotifyOnMention(profileData.notify_on_mention);
    setNotifyOnMessage(profileData.notify_on_message);
    setEmailNotifications(profileData.email_notifications);
  };

  const fetchUserTopics = async (userId: string) => {
    try {
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
    } catch (error) {
      console.error("Error fetching user topics:", error);
      setTopics([]);
    }
  };

  const fetchUserComments = async (userId: string) => {
    try {
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
    } catch (error) {
      console.error("Error fetching user comments:", error);
      setComments([]);
    }
  };

  const handleAvatarChange = async (url: string) => {
    if (!profile) return;
    setProfile({ ...profile, avatar_url: url });
    await supabase
      .from("profiles")
      .update({ avatar_url: url })
      .eq("id", profile.id);
  };

  const handleCoverChange = async (url: string) => {
    if (!profile) return;
    setProfile({ ...profile, cover_url: url });
    await supabase
      .from("profiles")
      .update({ cover_url: url })
      .eq("id", profile.id);
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          bio: bio,
          website: website,
          interests: interests,
          signature: signature,
          timezone: timezone,
          language: language,
        })
        .eq('id', profile.id);

      if (error) throw error;

      setEditing(false);
      if (username) {
        fetchProfile(username);
      } else {
        fetchCurrentUserProfile();
      }
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

  const handleSavePrivacySettings = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          profile_visibility: profileVisibility,
          allow_private_messages: allowPrivateMessages,
          show_online_status: showOnlineStatus,
          show_email: showEmail,
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "تم الحفظ",
        description: "تم تحديث إعدادات الخصوصية بنجاح",
      });
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ إعدادات الخصوصية",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotificationSettings = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          notify_on_reply: notifyOnReply,
          notify_on_mention: notifyOnMention,
          notify_on_message: notifyOnMessage,
          email_notifications: emailNotifications,
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "تم الحفظ",
        description: "تم تحديث إعدادات الإشعارات بنجاح",
      });
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ إعدادات الإشعارات",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

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
        {/* Cover and Profile Image */}
        <div className="relative w-full">
          {isOwnProfile ? (
            <ProfileImageUploader
              bucket="covers"
              url={profile.cover_url}
              userId={profile.id}
              rounded={false}
              label="تغيير صورة الغلاف"
              onChange={handleCoverChange}
            />
          ) : (
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
          )}
          
          <div className="absolute right-8 -bottom-10 z-10">
            {isOwnProfile ? (
              <ProfileImageUploader
                bucket="avatars"
                url={profile.avatar_url}
                userId={profile.id}
                rounded={true}
                label="تغيير صورة البروفايل"
                onChange={handleAvatarChange}
              />
            ) : (
              <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
                <AvatarImage src={profile.avatar_url || ""} />
                <AvatarFallback className="bg-pink-200 text-pink-600 text-3xl">
                  {profile.display_name?.slice(0,2) || profile.username?.slice(0,2) || "عض"}
                </AvatarFallback>
              </Avatar>
            )}
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
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-gray-800">
                      {profile?.display_name || "عضو جديد"}
                    </h1>
                    {profile.is_online && profile.show_online_status && (
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    )}
                  </div>
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
                  {profile.last_seen_at && !profile.is_online && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">
                        آخر ظهور {formatDistanceToNow(new Date(profile.last_seen_at), {
                          addSuffix: true,
                          locale: ar
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col gap-2 items-end">
                {isOwnProfile && (
                  <Button
                    variant={editing ? "outline" : "ghost"}
                    onClick={() => setEditing(!editing)}
                  >
                    <Settings className="w-4 h-4 ml-2" />
                    {editing ? "إلغاء" : "تعديل"}
                  </Button>
                )}
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
                {(currentUser && profile.id !== currentUser.id && profile.allow_private_messages) && (
                  <Button variant="default" className="w-28" disabled>
                    <Mail className="h-4 w-4 ml-2" />
                    مراسلة
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Basic Info */}
            <div className="space-y-4">
              <p className="text-gray-700">
                {profile?.bio || "لم يتم إضافة نبذة شخصية بعد"}
              </p>
              
              {profile.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {profile.website}
                  </a>
                </div>
              )}
              
              {profile.interests && (
                <div>
                  <span className="text-sm font-medium text-gray-700">الاهتمامات: </span>
                  <span className="text-gray-600">{profile.interests}</span>
                </div>
              )}
              
              <div className="grid grid-cols-3 gap-4 pt-4">
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

        {/* Main Content Tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              {isOwnProfile ? "ملفي الشخصي" : "نشاط العضو"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className={`grid w-full ${isOwnProfile ? "grid-cols-5" : "grid-cols-2"}`}>
                <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                <TabsTrigger value="topics">المواضيع ({profile.total_topics})</TabsTrigger>
                <TabsTrigger value="comments">التعليقات ({profile.total_comments})</TabsTrigger>
                {isOwnProfile && (
                  <>
                    <TabsTrigger value="privacy">الخصوصية</TabsTrigger>
                    <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
                  </>
                )}
              </TabsList>
              
              <TabsContent value="overview" className="mt-4">
                {editing && isOwnProfile ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="block text-sm font-medium text-gray-700 mb-1">
                        الاسم المعروض
                      </Label>
                      <Input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="أدخل اسمك المعروض"
                      />
                    </div>
                    <div>
                      <Label className="block text-sm font-medium text-gray-700 mb-1">
                        نبذة شخصية
                      </Label>
                      <Textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="اكتب نبذة عن نفسك..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label className="block text-sm font-medium text-gray-700 mb-1">
                        الموقع الإلكتروني
                      </Label>
                      <Input
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://example.com"
                        type="url"
                      />
                    </div>
                    <div>
                      <Label className="block text-sm font-medium text-gray-700 mb-1">
                        الاهتمامات
                      </Label>
                      <Input
                        value={interests}
                        onChange={(e) => setInterests(e.target.value)}
                        placeholder="مثال: الأدب، التقنية، الرياضة"
                      />
                    </div>
                    <div>
                      <Label className="block text-sm font-medium text-gray-700 mb-1">
                        التوقيع الشخصي
                      </Label>
                      <Textarea
                        value={signature}
                        onChange={(e) => setSignature(e.target.value)}
                        placeholder="توقيع يظهر أسفل مشاركاتك"
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="block text-sm font-medium text-gray-700 mb-1">
                          المنطقة الزمنية
                        </Label>
                        <Input
                          value={timezone}
                          onChange={(e) => setTimezone(e.target.value)}
                          placeholder="Asia/Riyadh"
                        />
                      </div>
                      <div>
                        <Label className="block text-sm font-medium text-gray-700 mb-1">
                          اللغة المفضلة
                        </Label>
                        <Input
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          placeholder="ar"
                        />
                      </div>
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
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">معلومات أساسية</h4>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium">الاسم:</span> {profile.display_name || "غير محدد"}</div>
                          <div><span className="font-medium">المعرف:</span> @{profile.username}</div>
                          {profile.show_email && profile.email && (
                            <div><span className="font-medium">البريد:</span> {profile.email}</div>
                          )}
                          <div><span className="font-medium">تاريخ الانضمام:</span> {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true, locale: ar })}</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">الإحصائيات</h4>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium">المواضيع:</span> {profile.total_topics}</div>
                          <div><span className="font-medium">التعليقات:</span> {profile.total_comments}</div>
                          <div><span className="font-medium">نقاط السمعة:</span> {profile.reputation_score}</div>
                          <div><span className="font-medium">الحالة:</span> {profile.is_online && profile.show_online_status ? "متصل" : "غير متصل"}</div>
                        </div>
                      </div>
                    </div>
                    
                    {profile.signature && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-800 mb-1">التوقيع</h4>
                        <p className="text-sm text-gray-600">{profile.signature}</p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="topics" className="mt-4">
                {topics.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">{isOwnProfile ? "لم تقم بكتابة أي مواضيع بعد" : "لم يقم بكتابة أي مواضيع بعد"}</p>
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
                    <p className="text-gray-600">{isOwnProfile ? "لم تقم بكتابة أي تعليقات بعد" : "لم يقم بكتابة أي تعليقات بعد"}</p>
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

              {isOwnProfile && (
                <TabsContent value="privacy" className="mt-4">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        إعدادات الخصوصية
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium">رؤية الملف الشخصي</Label>
                            <p className="text-xs text-gray-500">من يمكنه رؤية ملفك الشخصي</p>
                          </div>
                          <select 
                            value={profileVisibility} 
                            onChange={(e) => setProfileVisibility(e.target.value)}
                            className="border rounded px-3 py-1"
                          >
                            <option value="public">عام</option>
                            <option value="members">الأعضاء فقط</option>
                            <option value="friends">الأصدقاء فقط</option>
                          </select>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium">السماح بالرسائل الخاصة</Label>
                            <p className="text-xs text-gray-500">هل تريد استقبال رسائل خاصة</p>
                          </div>
                          <Switch 
                            checked={allowPrivateMessages} 
                            onCheckedChange={setAllowPrivateMessages}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium">إظهار حالة الاتصال</Label>
                            <p className="text-xs text-gray-500">إظهار ما إذا كنت متصلاً أم لا</p>
                          </div>
                          <Switch 
                            checked={showOnlineStatus} 
                            onCheckedChange={setShowOnlineStatus}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium">إظهار البريد الإلكتروني</Label>
                            <p className="text-xs text-gray-500">إظهار بريدك الإلكتروني للأعضاء</p>
                          </div>
                          <Switch 
                            checked={showEmail} 
                            onCheckedChange={setShowEmail}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleSavePrivacySettings}
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Lock className="w-4 h-4 ml-2" />
                      {saving ? "جاري الحفظ..." : "حفظ إعدادات الخصوصية"}
                    </Button>
                  </div>
                </TabsContent>
              )}

              {isOwnProfile && (
                <TabsContent value="notifications" className="mt-4">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        إعدادات الإشعارات
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium">الإشعار عند الرد على موضوعك</Label>
                            <p className="text-xs text-gray-500">تلقي إشعار عندما يرد أحد على موضوعك</p>
                          </div>
                          <Switch 
                            checked={notifyOnReply} 
                            onCheckedChange={setNotifyOnReply}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium">الإشعار عند الإشارة إليك</Label>
                            <p className="text-xs text-gray-500">تلقي إشعار عندما يذكرك أحد بالاسم</p>
                          </div>
                          <Switch 
                            checked={notifyOnMention} 
                            onCheckedChange={setNotifyOnMention}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium">الإشعار عند استقبال رسالة خاصة</Label>
                            <p className="text-xs text-gray-500">تلقي إشعار عند استقبال رسالة خاصة</p>
                          </div>
                          <Switch 
                            checked={notifyOnMessage} 
                            onCheckedChange={setNotifyOnMessage}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium">الإشعارات عبر البريد الإلكتروني</Label>
                            <p className="text-xs text-gray-500">تلقي إشعارات عبر البريد الإلكتروني</p>
                          </div>
                          <Switch 
                            checked={emailNotifications} 
                            onCheckedChange={setEmailNotifications}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleSaveNotificationSettings}
                      disabled={saving}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Bell className="w-4 h-4 ml-2" />
                      {saving ? "جاري الحفظ..." : "حفظ إعدادات الإشعارات"}
                    </Button>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </ForumLayout>
  );
}
