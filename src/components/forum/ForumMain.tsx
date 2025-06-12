
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Eye, 
  ThumbsUp, 
  Plus, 
  Pin,
  Clock,
  User
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

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
  } | null;
  categories: {
    name: string;
    color: string;
  } | null;
}

const ForumMain = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select(`
          *,
          profiles (display_name, username),
          categories (name, color)
        `)
        .eq('status', 'published')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      // Transform data to ensure proper typing
      const transformedData: Topic[] = (data || []).map(item => {
        // Safe profile extraction with explicit null check
        let profiles: { display_name: string; username: string; } | null = null;
        if (item.profiles && 
            typeof item.profiles === 'object' && 
            item.profiles !== null) {
          const profileObj = item.profiles as any;
          if ('display_name' in profileObj && 'username' in profileObj) {
            profiles = {
              display_name: profileObj.display_name as string,
              username: profileObj.username as string
            };
          }
        }

        // Safe category extraction with explicit null check
        let categories: { name: string; color: string; } | null = null;
        if (item.categories && 
            typeof item.categories === 'object' && 
            item.categories !== null) {
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

  const handleCreateTopic = () => {
    navigate('/create-topic');
  };

  const handleTopicClick = (slug: string) => {
    navigate(`/topic/${slug}`);
  };

  if (loading) {
    return (
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">أحدث المواضيع</h1>
            <p className="text-gray-600">تابع آخر النقاشات والمواضيع في المنتدى</p>
          </div>
          <Button onClick={handleCreateTopic} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 ml-2" />
            موضوع جديد
          </Button>
        </div>

        {/* Welcome Message */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">أهلاً وسهلاً بك في شبكة أنا المؤمن</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700">
              نرحب بك في منتدانا الإسلامي المبارك. هنا يمكنك المشاركة في النقاشات العلمية الهادفة، 
              وتبادل المعرفة والخبرات مع إخوانك المؤمنين من جميع أنحاء العالم.
            </p>
          </CardContent>
        </Card>

        {/* Topics List */}
        <div className="space-y-4">
          {topics.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">لا توجد مواضيع حالياً</h3>
                <p className="text-gray-500 mb-4">كن أول من يبدأ النقاش في المنتدى</p>
                <Button onClick={handleCreateTopic} className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 ml-2" />
                  أضف موضوع جديد
                </Button>
              </CardContent>
            </Card>
          ) : (
            topics.map((topic) => (
              <Card key={topic.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {topic.is_pinned && (
                          <Pin className="w-4 h-4 text-green-600" />
                        )}
                        {topic.categories && (
                          <Badge 
                            variant="secondary" 
                            className="text-xs"
                            style={{ backgroundColor: `${topic.categories.color}20`, color: topic.categories.color }}
                          >
                            {topic.categories.name}
                          </Badge>
                        )}
                      </div>
                      
                      <h3 
                        className="text-lg font-semibold text-gray-800 mb-2 hover:text-green-600 cursor-pointer"
                        onClick={() => handleTopicClick(topic.slug)}
                      >
                        {topic.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {topic.content.substring(0, 150)}...
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
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
              </Card>
            ))
          )}
        </div>
      </div>
    </main>
  );
};

export default ForumMain;
