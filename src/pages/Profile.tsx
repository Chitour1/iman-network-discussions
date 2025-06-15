
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Calendar, MessageSquare, Eye, Settings, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface UserProfile {
  id: string;
  display_name: string;
  username: string;
  bio: string;
  avatar_url: string;
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
  categories: {
    name: string;
    color: string;
  };
}

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [topics, setTopics] = useState<UserTopic[]>([]);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
    fetchUserTopics();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.user.id)
        .single();

      if (error) throw error;
      
      setProfile(data);
      setDisplayName(data.display_name || "");
      setBio(data.bio || "");
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserTopics = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('topics')
        .select(`
          id, title, slug, view_count, reply_count, created_at,
          categories (name, color)
        `)
        .eq('author_id', user.user.id)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setTopics(data || []);
    } catch (error) {
      console.error('Error fetching user topics:', error);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 p-6" dir="rtl">
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 p-6" dir="rtl">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">خطأ في تحميل الملف الشخصي</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 p-6" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Card */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="bg-green-100 text-green-700 text-2xl">
                    {profile.display_name?.slice(0, 2) || "عض"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {profile.display_name || "عضو جديد"}
                  </h1>
                  <p className="text-gray-600">@{profile.username}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500">
                      انضم {formatDistanceToNow(new Date(profile.created_at), {
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
                  {profile.bio || "لم يتم إضافة نبذة شخصية بعد"}
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {profile.total_topics}
                    </div>
                    <div className="text-sm text-gray-600">مواضيع</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {profile.total_comments}
                    </div>
                    <div className="text-sm text-gray-600">تعليقات</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {profile.reputation_score}
                    </div>
                    <div className="text-sm text-gray-600">نقاط السمعة</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Topics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              مواضيعي الأخيرة
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                        <Badge
                          variant="secondary"
                          style={{
                            backgroundColor: `${topic.categories.color}20`,
                            color: topic.categories.color
                          }}
                        >
                          {topic.categories.name}
                        </Badge>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
