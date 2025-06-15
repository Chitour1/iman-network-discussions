
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ProfileCoverImage from "@/components/profile/ProfileCoverImage";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import { Button } from "@/components/ui/button";
import FeedNewPostForm from "@/components/feed/FeedNewPostForm";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function ProfilePublic() {
  const { username } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  useEffect(() => {
    async function fetchProfile() {
      if (!username) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();
      if (error || !data) {
        setProfile(null);
        return;
      }
      setProfile(data);
      setCoverUrl(data.cover_url || "");
      setAvatarUrl(data.avatar_url || "");
    }

    fetchProfile();
  }, [username]);

  useEffect(() => {
    async function fetchTopics() {
      if (!profile?.id) return;
      const { data } = await supabase
        .from("topics")
        .select("id, title, slug, created_at, reply_count")
        .eq("author_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(10);
      setTopics(data || []);
    }
    fetchTopics();
  }, [profile]);

  const isOwner = user && profile && user.id === profile.id;

  // تعديل صورة الغلاف/الصورة الشخصية بالرابط فقط
  async function handleSaveImages() {
    const updates: any = {};
    if (coverUrl !== (profile.cover_url || "")) updates.cover_url = coverUrl;
    if (avatarUrl !== (profile.avatar_url || "")) updates.avatar_url = avatarUrl;
    if (!Object.keys(updates).length) {
      setEditMode(false);
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", profile.id);
    if (error) {
      toast({ title: "خطأ", description: "تعذر حفظ التغييرات" });
    } else {
      setProfile({ ...profile, ...updates });
      toast({ title: "تم التحديث بنجاح" });
      setEditMode(false);
    }
  }

  if (profile === null) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center text-gray-500">
        لم يتم العثور على المستخدم المطلوب.
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg mt-8 mb-10 overflow-hidden" dir="rtl">
      {/* صورة الغلاف */}
      <ProfileCoverImage url={profile.cover_url} />
      <div className="p-4 pb-0">
        <div className="flex items-center">
          {/* الصورة الشخصية */}
          <ProfileAvatar url={profile.avatar_url} size={96} />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800">{profile.display_name || "عضو"}</h2>
            <div className="text-gray-500">@{profile.username}</div>
            {profile.bio && <div className="mt-2">{profile.bio}</div>}
          </div>
          {isOwner && (
            <Button size="sm" variant={editMode ? "secondary" : "outline"} className="ml-2" onClick={() => setEditMode(!editMode)}>
              {editMode ? "إلغاء" : "تعديل"}
            </Button>
          )}
        </div>
        {editMode && isOwner && (
          <div className="mt-3 space-y-2">
            <div>
              <label className="block text-sm mb-1">رابط صورة الغلاف</label>
              <input
                type="text"
                className="w-full border rounded px-2 py-1"
                placeholder="https://image.url/cover.jpg"
                value={coverUrl}
                onChange={e => setCoverUrl(e.target.value)}
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">رابط الصورة الشخصية</label>
              <input
                type="text"
                className="w-full border rounded px-2 py-1"
                placeholder="https://image.url/avatar.jpg"
                value={avatarUrl}
                onChange={e => setAvatarUrl(e.target.value)}
                dir="ltr"
              />
            </div>
            <Button className="mt-1" onClick={handleSaveImages}>
              حفظ الصور
            </Button>
          </div>
        )}
      </div>
      {/* المنشورات الأخيرة */}
      <div className="px-4 pt-4">
        <h4 className="text-pink-700 font-semibold text-lg mb-2">آخر المشاركات</h4>
        {topics.length === 0 ? (
          <div className="text-gray-400 text-center mb-5">لم ينشر هذا العضو أي منشور بعد.</div>
        ) : (
          <ul className="space-y-2">
            {topics.map(topic => (
              <li key={topic.id} className="bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition">
                <a href={`/topic/${topic.slug}`} className="text-pink-700 font-semibold">{topic.title}</a>
                <div className="text-xs text-gray-400 mt-1">{new Date(topic.created_at).toLocaleDateString()} • {topic.reply_count} رد</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
