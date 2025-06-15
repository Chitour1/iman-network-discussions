import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ForumCategoriesGrid from "./ForumCategoriesGrid";
import { Topic, Category, ForumStatsData, TopMember, LatestMember } from "@/types/forum";
import ForumWelcome from "./ForumWelcome";
import LatestTopics from "./LatestTopics";
import TopicList from "./TopicList";
import ForumStats from "./ForumStats";

const ForumMain = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [stats, setStats] = useState<ForumStatsData>({
    totalTopics: 0,
    totalUsers: 0,
    onlineUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [topMembers, setTopMembers] = useState<TopMember[]>([]);
  const [latestMember, setLatestMember] = useState<LatestMember | null>(null);
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

      const transformedData: Category[] = (data || []).map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description || '',
        color: cat.color || '#3B82F6',
        icon: cat.icon || 'MessageSquare',
        topic_count: cat.topic_count || 0,
        comment_count: cat.post_count || 0,
        view_count: cat.view_count || 0,
        recent_topics_count: 0, // This data is not in the database yet
      }));

      setCategories(transformedData);
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

  const handleNavigateToFeed = () => {
    navigate("/feed");
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
          {/* زر منصة الساحة كأيقونة بارزة */}
          <button
            onClick={handleNavigateToFeed}
            className="flex items-center gap-3 bg-pink-700 hover:bg-pink-800 text-white font-bold px-4 py-2 rounded-lg shadow transition-all text-lg"
            aria-label="تصفح منتدى الساحة كمنصة تواصل اجتماعي"
          >
            {/* أيقونة بسيطة ثريدز/تواصل */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/><path d="M9 12c1.5 2 4.5 2 6 0M12 9v6" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
            <span>منصة الساحة</span>
          </button>
          <Button onClick={handleCreateTopic} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 ml-2" />
            موضوع جديد
          </Button>
        </div>

        {/* Welcome Message */}
        <ForumWelcome />

        {/* آخر المواضيع (كاروسيل) */}
        <LatestTopics topics={(latestTopics.length ? latestTopics : topics).slice(0, 10)} onTopicClick={handleTopicClick} />

        {/* Forum Categories Grid */}
        {categories.length > 0 && <ForumCategoriesGrid categories={categories} />}

        {/* Topics List */}
        <TopicList topics={topics} onTopicClick={handleTopicClick} onCreateTopic={handleCreateTopic} />
      </div>
      
      {/* Forum Stats */}
      <ForumStats stats={stats} topMembers={topMembers} latestMember={latestMember} />
    </main>;
};

export default ForumMain;
