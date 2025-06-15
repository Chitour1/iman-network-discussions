
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, MessageSquare, Eye, ThumbsUp, Clock, User, Pin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { getContentPreview } from "@/utils/textUtils";
import ForumLayout from "@/components/forum/ForumLayout";
import { useAuth } from "@/hooks/useAuth";

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  topic_count: number;
}

interface Topic {
  id: string;
  title: string;
  content: string;
  view_count: number;
  reply_count: number;
  like_count: number;
  is_pinned: boolean;
  created_at: string;
  slug: string;
  author_name: string;
}

const CategoryView = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const { session, loading: authLoading } = useAuth();

  useEffect(() => {
    if (slug) {
      fetchCategory();
      fetchTopics();
    }
  }, [slug]);

  const fetchCategory = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setCategory(data);
    } catch (error) {
      console.error('Error fetching category:', error);
      navigate('/');
    }
  };

  const fetchTopics = async () => {
    try {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', slug)
        .single();

      if (categoryData) {
        const { data: topicsData, error } = await supabase
          .from('topics')
          .select(`
            id, title, content, view_count, reply_count, like_count,
            is_pinned, created_at, slug, author_id
          `)
          .eq('category_id', categoryData.id)
          .eq('status', 'published')
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Get author names separately
        const authorIds = topicsData?.map(t => t.author_id) || [];
        const uniqueAuthorIds = [...new Set(authorIds)];

        const { data: authors } = await supabase
          .from('profiles')
          .select('id, display_name')
          .in('id', uniqueAuthorIds);

        const authorMap = new Map(authors?.map(a => [a.id, a.display_name]) || []);

        const transformedTopics: Topic[] = (topicsData || []).map(topic => ({
          id: topic.id,
          title: topic.title,
          content: topic.content,
          view_count: topic.view_count || 0,
          reply_count: topic.reply_count || 0,
          like_count: topic.like_count || 0,
          is_pinned: topic.is_pinned || false,
          created_at: topic.created_at,
          slug: topic.slug,
          author_name: authorMap.get(topic.author_id) || "مستخدم مجهول"
        }));

        setTopics(transformedTopics);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleCreateTopic = () => {
    navigate(`/create-topic?category=${category?.id}`);
  };

  const handleTopicClick = (topicSlug: string) => {
    navigate(`/topic/${topicSlug}`);
  };

  if (authLoading || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 p-6 flex items-center justify-center" dir="rtl">
        <div className="animate-pulse">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <ForumLayout session={session}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة
            </Button>
          </div>
          <Button onClick={handleCreateTopic} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 ml-2" />
            موضوع جديد
          </Button>
        </div>

        {/* Category Info */}
        <Card className="border-2" style={{ borderColor: category?.color }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: category?.color }}
              ></div>
              {category?.name}
            </CardTitle>
            <p className="text-gray-600">{category?.description}</p>
            <div className="text-sm text-gray-500">
              {category?.topic_count} موضوع
            </div>
          </CardHeader>
        </Card>
        
        {!category && !loadingData && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">القسم غير موجود</h2>
            <Button onClick={() => navigate('/')}>العودة للرئيسية</Button>
          </div>
        )}

        {/* Topics List */}
        {category && (
          <div className="space-y-4">
            {topics.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">لا توجد مواضيع في هذا القسم</h3>
                  <p className="text-gray-500 mb-4">كن أول من يبدأ النقاش في هذا القسم</p>
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
                          {topic.is_pinned && (
                            <Badge 
                              variant="secondary"
                              style={{ backgroundColor: `${category?.color}20`, color: category?.color }}
                            >
                              مثبت
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
                          {getContentPreview(topic.content, 150)}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{topic.author_name}</span>
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
        )}
      </div>
    </ForumLayout>
  );
};

export default CategoryView;
