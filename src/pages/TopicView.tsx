
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, ThumbsUp, MessageSquare, Eye, Clock, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface Topic {
  id: string;
  title: string;
  content: string;
  view_count: number;
  reply_count: number;
  like_count: number;
  created_at: string;
  author_id: string;
  author_name: string;
  category_name: string;
  category_color: string;
}

interface Reply {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  like_count: number;
  author_name: string;
}

const TopicView = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [newReply, setNewReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchTopic();
      fetchReplies();
    }
  }, [slug]);

  const fetchTopic = async () => {
    try {
      const { data: topicData, error } = await supabase
        .from('topics')
        .select(`
          id, title, content, view_count, reply_count, like_count,
          created_at, author_id, category_id
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) throw error;

      // Get author and category info separately
      const [authorResult, categoryResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('display_name')
          .eq('id', topicData.author_id)
          .single(),
        supabase
          .from('categories')
          .select('name, color')
          .eq('id', topicData.category_id)
          .single()
      ]);

      const transformedTopic: Topic = {
        id: topicData.id,
        title: topicData.title,
        content: topicData.content,
        view_count: topicData.view_count || 0,
        reply_count: topicData.reply_count || 0,
        like_count: topicData.like_count || 0,
        created_at: topicData.created_at,
        author_id: topicData.author_id,
        author_name: authorResult.data?.display_name || "مستخدم مجهول",
        category_name: categoryResult.data?.name || "",
        category_color: categoryResult.data?.color || "#3B82F6"
      };

      setTopic(transformedTopic);

      // زيادة عدد المشاهدات
      await supabase
        .from('topics')
        .update({ view_count: (topicData.view_count || 0) + 1 })
        .eq('id', topicData.id);
    } catch (error) {
      console.error('Error fetching topic:', error);
      navigate('/');
    }
  };

  const fetchReplies = async () => {
    try {
      const { data: topicData } = await supabase
        .from('topics')
        .select('id')
        .eq('slug', slug)
        .single();

      if (topicData) {
        const { data: commentsData, error } = await supabase
          .from('comments')
          .select(`
            id, content, created_at, author_id, like_count
          `)
          .eq('topic_id', topicData.id)
          .eq('status', 'approved')
          .order('created_at', { ascending: true });

        if (error) throw error;

        // Get author names separately
        const authorIds = commentsData?.map(c => c.author_id) || [];
        const uniqueAuthorIds = [...new Set(authorIds)];

        const { data: authors } = await supabase
          .from('profiles')
          .select('id, display_name')
          .in('id', uniqueAuthorIds);

        const authorMap = new Map(authors?.map(a => [a.id, a.display_name]) || []);

        const transformedReplies: Reply[] = (commentsData || []).map(comment => ({
          id: comment.id,
          content: comment.content,
          created_at: comment.created_at,
          author_id: comment.author_id,
          like_count: comment.like_count || 0,
          author_name: authorMap.get(comment.author_id) || "مستخدم مجهول"
        }));

        setReplies(transformedReplies);
      }
    } catch (error) {
      console.error('Error fetching replies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReply = async () => {
    if (!newReply.trim() || !topic) return;

    setSubmitting(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('يجب تسجيل الدخول أولاً');

      const { error } = await supabase
        .from('comments')
        .insert({
          content: newReply,
          topic_id: topic.id,
          author_id: user.user.id,
          status: 'approved'
        });

      if (error) throw error;

      setNewReply("");
      fetchReplies();
      toast({
        title: "تم إضافة الرد",
        description: "تم إضافة ردك بنجاح",
      });
    } catch (error) {
      console.error('Error submitting reply:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة الرد",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 p-6" dir="rtl">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 p-6" dir="rtl">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">الموضوع غير موجود</h2>
          <Button onClick={() => navigate('/')}>العودة للرئيسية</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 p-6" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة
          </Button>
        </div>

        {/* Topic */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2 mb-4">
              <Badge 
                variant="secondary"
                style={{ backgroundColor: `${topic?.category_color}20`, color: topic?.category_color }}
              >
                {topic?.category_name}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">{topic?.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{topic?.author_name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>
                  {topic && formatDistanceToNow(new Date(topic.created_at), {
                    addSuffix: true,
                    locale: ar
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{topic?.view_count}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {topic?.content}
              </p>
            </div>
            <div className="flex items-center gap-4 mt-6 pt-4 border-t">
              <Button variant="ghost" size="sm">
                <ThumbsUp className="w-4 h-4 ml-1" />
                {topic?.like_count}
              </Button>
              <div className="flex items-center gap-1 text-gray-500">
                <MessageSquare className="w-4 h-4" />
                <span>{replies.length} رد</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Replies */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">الردود ({replies.length})</h3>
          
          {replies.map((reply) => (
            <Card key={reply.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-green-100 text-green-700 text-sm">
                      {reply.author_name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-800">
                        {reply.author_name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(reply.created_at), {
                          addSuffix: true,
                          locale: ar
                        })}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                    <div className="mt-2">
                      <Button variant="ghost" size="sm">
                        <ThumbsUp className="w-3 h-3 ml-1" />
                        {reply.like_count}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Reply Form */}
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold text-gray-800 mb-3">إضافة رد</h4>
            <Textarea
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="اكتب ردك هنا..."
              className="mb-3"
              rows={4}
            />
            <Button 
              onClick={handleSubmitReply}
              disabled={!newReply.trim() || submitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting ? "جاري الإرسال..." : "إرسال الرد"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TopicView;
