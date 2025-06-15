import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Eye, ThumbsUp, Plus, Pin, Clock, User, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { getContentPreview } from "@/utils/textUtils";
import ForumCategoriesGrid from "./ForumCategoriesGrid";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

// Updated interface to match Supabase response
interface Topic {
  id: string;
  title: string;
  content: string;
  view_count: number;
  reply_count: number;
  like_count: number;
  is_pinned: boolean;
  created_at: string;
  author_id: string;
  category_id: string;
  slug: string;
  profiles: {
    display_name: string;
    username: string;
    avatar_url: string | null;
    bio: string | null;
  } | null;
  categories: {
    name: string;
    color: string;
  } | null;
}
interface ForumStats {
  totalTopics: number;
  totalUsers: number;
  onlineUsers: number;
}
const ForumMain = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [stats, setStats] = useState<ForumStats>({
    totalTopics: 0,
    totalUsers: 0,
    onlineUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [topMembers, setTopMembers] = useState<any[]>([]);
  const [latestMember, setLatestMember] = useState<any | null>(null);
  const [latestTopics, setLatestTopics] = useState<Topic[]>([]);
  const navigate = useNavigate();
  useEffect(() => {
    fetchTopics();
    fetchLatestTopics();
    fetchStats();
    fetchCategories();
    fetchTopMembers();
    fetchLatestMember();
  }, []);
  const fetchStats = async () => {
    try {
      // Get total topics count
      const {
        count: topicsCount
      } = await supabase.from('topics').select('*', {
        count: 'exact',
        head: true
      }).eq('status', 'published');

      // Get total users count
      const {
        count: usersCount
      } = await supabase.from('profiles').select('*', {
        count: 'exact',
        head: true
      });

      // Get online users (users active in last 10 minutes)
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const {
        count: onlineCount
      } = await supabase.from('profiles').select('*', {
        count: 'exact',
        head: true
      }).gte('last_seen_at', tenMinutesAgo);
      setStats({
        totalTopics: topicsCount || 0,
        totalUsers: usersCount || 0,
        onlineUsers: onlineCount || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };
  const fetchTopics = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('topics').select(`
          *,
          profiles (display_name, username, avatar_url, bio),
          categories (name, color)
        `).eq('status', 'published').order('is_pinned', {
        ascending: false
      }).order('created_at', {
        ascending: false
      }).limit(20);
      if (error) throw error;

      // Transform data to ensure proper typing
      const transformedData: Topic[] = (data || []).map(item => {
        // Safe profile extraction with explicit null check
        let profiles: {
          display_name: string;
          username: string;
          avatar_url: string | null;
          bio: string | null;
        } | null = null;
        if (item.profiles && typeof item.profiles === 'object' && item.profiles !== null) {
          const profileObj = item.profiles as any;
          if ('display_name' in profileObj && 'username' in profileObj) {
            profiles = {
              display_name: profileObj.display_name as string,
              username: profileObj.username as string,
              avatar_url: profileObj.avatar_url as string | null,
              bio: profileObj.bio as string | null
            };
          }
        }

        // Safe category extraction with explicit null check
        let categories: {
          name: string;
          color: string;
        } | null = null;
        if (item.categories && typeof item.categories === 'object' && item.categories !== null) {
          const categoryObj = item.categories as any;
          if ('name' in categoryObj && 'color' in categoryObj) {
            categories = {
              name: categoryObj.name as string,
              color: categoryObj.color as string
            };
          }
        }
        return {
          id: item.id,
          title: item.title,
          content: item.content,
          view_count: item.view_count || 0,
          reply_count: item.reply_count || 0,
          like_count: item.like_count || 0,
          is_pinned: item.is_pinned || false,
          created_at: item.created_at,
          author_id: item.author_id,
          category_id: item.category_id,
          slug: item.slug,
          profiles,
          categories
        };
      });
      setTopics(transformedData);
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoading(false);
    }
  };
  const fetchLatestTopics = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('topics').select(`
            id,
            title,
            content,
            view_count,
            reply_count,
            like_count,
            is_pinned,
            created_at,
            author_id,
            category_id,
            slug,
            profiles (display_name, username, avatar_url, bio),
            categories (name, color)
          `).eq('status', 'published').order('created_at', {
        ascending: false
      }).limit(10);
      if (error) throw error;

      // Map to the Topic interface
      const transformedData: Topic[] = (data || []).map(item => {
        // Extract profile info
        let profiles: {
          display_name: string;
          username: string;
          avatar_url: string | null;
          bio: string | null;
        } | null = null;
        if (item.profiles && typeof item.profiles === 'object' && item.profiles !== null) {
          const profileObj = item.profiles as any;
          if ('display_name' in profileObj && 'username' in profileObj) {
            profiles = {
              display_name: profileObj.display_name as string,
              username: profileObj.username as string,
              avatar_url: profileObj.avatar_url as string | null,
              bio: profileObj.bio as string | null
            };
          }
        }

        // Extract category info
        let categories: {
          name: string;
          color: string;
        } | null = null;
        if (item.categories && typeof item.categories === 'object' && item.categories !== null) {
          const categoryObj = item.categories as any;
          if ('name' in categoryObj && 'color' in categoryObj) {
            categories = {
              name: categoryObj.name as string,
              color: categoryObj.color as string
            };
          }
        }
        return {
          id: item.id,
          title: item.title,
          content: item.content,
          view_count: item.view_count || 0,
          reply_count: item.reply_count || 0,
          like_count: item.like_count || 0,
          is_pinned: item.is_pinned || false,
          created_at: item.created_at,
          author_id: item.author_id,
          category_id: item.category_id,
          slug: item.slug,
          profiles,
          categories
        };
      });
      setLatestTopics(transformedData);
    } catch (error) {
      console.error('Error fetching latest topics:', error);
    }
  };
  const fetchCategories = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('categories').select('*').eq('is_active', true).order('sort_order');
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  const fetchTopMembers = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('profiles').select('id, display_name, post_count, reputation_score, username').eq('is_banned', false).order('post_count', {
        ascending: false
      }).order('reputation_score', {
        ascending: false
      }).limit(5);
      if (error) throw error;
      setTopMembers(data || []);
    } catch (error) {
      console.error('Error fetching top members:', error);
    }
  };
  const fetchLatestMember = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('profiles').select('id, display_name, username').order('joined_at', {
        ascending: false
      }).limit(1);
      if (error) throw error;
      setLatestMember(data && data[0] ? data[0] : null);
    } catch (error) {
      console.error('Error fetching latest member:', error);
    }
  };
  const handleCreateTopic = () => {
    navigate('/create-topic');
  };
  const handleTopicClick = (slug: string) => {
    navigate(`/topic/${slug}`);
  };
  const handleMemberClick = (username: string) => {
    navigate(`/profile?u=${username}`);
  };
  if (loading) {
    return <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>)}
          </div>
        </div>
      </main>;
  }
  return <main className="flex-1 p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            
            
          </div>
          <Button onClick={handleCreateTopic} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 ml-2" />
            موضوع جديد
          </Button>
        </div>

        {/* Welcome Message */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">أهلاً وسهلاً بك في شبكة الساحات</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700">نرحب بك في شبكة الساحات للنقاش الإسلامي الحر. هنا يمكنك المشاركة في النقاشات العلمية الهادفة، وتبادل المعرفة والخبرات في بيئة إسلامية حرة ومحترمة.</p>
          </CardContent>
        </Card>

        {/* آخر المواضيع (كاروسيل) */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-100">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex gap-2 items-center">
                <MessageSquare className="w-5 h-5 text-green-600" />
                آخر المواضيع
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <Carousel>
                <CarouselContent>
                  {(latestTopics.length ? latestTopics : topics).slice(0, 10).map(topic => <CarouselItem key={topic.id} className="basis-1/2 p-2">
                      <div onClick={() => handleTopicClick(topic.slug)} className="cursor-pointer bg-white hover:bg-green-50 border border-green-100 rounded-lg p-4 flex gap-3 items-center transition">
                        <Avatar className="w-9 h-9 shrink-0">
                          <AvatarImage src={topic.profiles?.avatar_url ?? undefined} />
                          <AvatarFallback>
                            {topic.profiles?.display_name?.slice(0, 2) ?? "؟؟"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800 text-base line-clamp-1">
                            {topic.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(topic.created_at), {
                          addSuffix: true,
                          locale: ar
                        })}
                          </div>
                        </div>
                      </div>
                    </CarouselItem>)}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </CardContent>
          </Card>
        </div>

        {/* Forum Categories Grid */}
        {categories.length > 0 && <ForumCategoriesGrid categories={categories} />}

        {/* Topics List */}
        <div className="space-y-4">
          {topics.length === 0 ? <Card className="text-center py-12">
              <CardContent>
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">لا توجد مواضيع حالياً</h3>
                <p className="text-gray-500 mb-4">كن أول من يبدأ النقاش في المنتدى</p>
                <Button onClick={handleCreateTopic} className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 ml-2" />
                  أضف موضوع جديد
                </Button>
              </CardContent>
            </Card> : topics.map(topic => <Card key={topic.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {topic.is_pinned && <Pin className="w-4 h-4 text-green-600" />}
                        {topic.categories && <Badge variant="secondary" className="text-xs" style={{
                    backgroundColor: `${topic.categories.color}20`,
                    color: topic.categories.color
                  }}>
                            {topic.categories.name}
                          </Badge>}
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 hover:text-green-600 cursor-pointer" onClick={() => handleTopicClick(topic.slug)}>
                        {topic.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {getContentPreview(topic.content, 150)}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={topic.profiles?.avatar_url || undefined} />
                            <AvatarFallback className="bg-green-100 text-green-700 text-xs">
                              {topic.profiles?.display_name?.slice(0, 2) || "؟؟"}
                            </AvatarFallback>
                          </Avatar>
                          <span>{topic.profiles?.display_name || "مستخدم مجهول"}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>
                            {formatDistanceToNow(new Date(topic.created_at), {
                        addSuffix: true,
                        locale: ar
                      })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center gap-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{topic.view_count}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{topic.reply_count}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{topic.like_count}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>)}
        </div>
      </div>
      {/* مكان الإحصائيات الجديد أسفل الصفحة */}
      <div className="mt-12">
        <div className="bg-white border rounded-lg shadow-sm p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* الكتلة الأساسية للإحصائيات */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.totalTopics}</div>
              <div className="text-sm text-gray-600">إجمالي المواضيع</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
              <div className="text-sm text-gray-600">إجمالي الأعضاء</div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 text-orange-600">
                <span className="text-2xl font-bold">{stats.onlineUsers}</span>
                <Users className="w-5 h-5" />
              </div>
              <div className="text-sm text-gray-600">المتصفحين الآن</div>
            </div>
          </div>
          {/* قائمة أبرز الأعضاء */}
          <div className="flex-1">
            <div className="mb-2 font-bold text-green-700 flex gap-2 items-center justify-center text-center">
              المتواجدون الآن
              <span className="bg-green-100 text-green-700 px-2 rounded text-xs">
                {stats.onlineUsers}
              </span>
            </div>
            <div className="text-sm flex flex-wrap justify-center gap-2">
              {topMembers && topMembers.length > 0 ? topMembers.map(member => <button key={member.id} className="font-semibold underline rounded px-2 py-1 text-green-800 hover:text-green-600 focus:outline-none" type="button" onClick={() => handleMemberClick(member.username)} title={'عدد مواضيعه: ' + (member.post_count || 0) + '، تقييمه: ' + (member.reputation_score || 0)}>
                  {member.display_name || 'عضو'}
                </button>) : <span className="text-gray-400">لا يوجد أعضاء بارزون حاليا</span>}
            </div>
          </div>
          {/* أحدث عضو */}
          <div className="flex-1 mt-4 md:mt-0 md:text-left">
            <div className="text-sm text-blue-700">
              {latestMember && <>
                  نرحب بعضونا الجديد:
                  <button className="inline font-semibold underline ml-1 text-blue-900 hover:text-green-600 focus:outline-none" type="button" onClick={() => handleMemberClick(latestMember.username)} title="عرض الملف الشخصي">
                    {latestMember.display_name}
                  </button>
                </>}
            </div>
          </div>
        </div>
      </div>
    </main>;
};
export default ForumMain;
