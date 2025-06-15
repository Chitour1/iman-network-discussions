import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, ThumbsUp, MessageSquare, Eye, Clock, User, Plus, Minus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import WysiwygEditor from "@/components/editor/WysiwygEditor";
import ForumLayout from "@/components/forum/ForumLayout";
import { useAuth } from "@/hooks/useAuth";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useGroupPermissions, PermissionKey } from "@/hooks/useGroupPermissions";

interface Topic {
  id: string;
  title: string;
  content: string;
  view_count: number;
  reply_count: number;
  like_count: number;
  created_at: string;
  updated_at: string | null;
  author_id: string;
  category_id: string;
  category_name: string;
  category_color: string;
  category_slug: string;
  author_name: string;
  author_avatar: string | null;
  author_bio: string | null;
  author_signature: string | null;
  author_username: string;
}

interface Reply {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  like_count: number;
  author_name: string;
  author_avatar: string | null;
  author_bio: string | null;
  author_signature: string | null;
  author_username: string;
}

const TopicView = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session, user, loading: authLoading } = useAuth();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [newReply, setNewReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [contentFontSize, setContentFontSize] = useState<number>(() => {
    const savedSize = localStorage.getItem('forum-font-size');
    return savedSize ? parseInt(savedSize, 10) : 18; // text-lg is 18px
  });

  // جلب صلاحيات المجموعة الخاصة بالمستخدم الحالي
  const { data: groupPermissions } = useGroupPermissions();

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
          created_at, updated_at, author_id, category_id
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) throw error;

      // Get author and category info separately
      const [authorResult, categoryResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('username, display_name, avatar_url, bio, signature')
          .eq('id', topicData.author_id)
          .single(),
        supabase
          .from('categories')
          .select('name, color, slug')
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
        updated_at: topicData.updated_at,
        author_id: topicData.author_id,
        category_id: topicData.category_id,
        author_name: authorResult.data?.display_name || "مستخدم مجهول",
        author_avatar: authorResult.data?.avatar_url || null,
        author_bio: authorResult.data?.bio || null,
        author_signature: authorResult.data?.signature || null,
        author_username: authorResult.data?.username || "",
        category_name: categoryResult.data?.name || "",
        category_color: categoryResult.data?.color || "#3B82F6",
        category_slug: categoryResult.data?.slug || "",
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

        // Get author names and info separately
        const authorIds = commentsData?.map(c => c.author_id) || [];
        const uniqueAuthorIds = [...new Set(authorIds)];

        // جلب username مع بيانات المؤلفين
        const { data: authors } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url, bio, signature')
          .in('id', uniqueAuthorIds);

        const authorMap = new Map(authors?.map(a => [a.id, a]) || []);

        const transformedReplies: Reply[] = (commentsData || []).map(comment => {
          const author = authorMap.get(comment.author_id);
          return {
            id: comment.id,
            content: comment.content,
            created_at: comment.created_at,
            author_id: comment.author_id,
            like_count: comment.like_count || 0,
            author_name: author?.display_name || "مستخدم مجهول",
            author_avatar: author?.avatar_url || null,
            author_bio: author?.bio || null,
            author_signature: author?.signature || null,
            author_username: author?.username || "",
          };
        });

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
      if (!user) throw new Error('يجب تسجيل الدخول أولاً');

      const { error } = await supabase
        .from('comments')
        .insert({
          content: newReply,
          topic_id: topic.id,
          author_id: user.id,
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

  const handleSaveDraft = async () => {
    toast({
      title: "تم الحفظ",
      description: "تم حفظ مسودة الرد",
    });
  };

  const handlePreview = () => {
    setShowPreview(!showPreview);
  };

  const handleFontSizeChange = (newSize: number) => {
    // Clamp font size between 12px and 32px for readability
    const clampedSize = Math.max(12, Math.min(32, newSize));
    setContentFontSize(clampedSize);
    localStorage.setItem('forum-font-size', clampedSize.toString());
  };

  const canEdit = () => {
    if (!topic || !user) return false;
    if (user.id !== topic.author_id) return false;
    // التعديل مسموح خلال ساعتين
    const createdAt = new Date(topic.created_at);
    return (Date.now() - createdAt.getTime()) < 2 * 60 * 60 * 1000;
  };

  const canDelete = () => {
    if (!topic || !user) return false;
    if (user.id !== topic.author_id) return false;
    // الحذف مسموح خلال ساعة واحدة
    const createdAt = new Date(topic.created_at);
    return (Date.now() - createdAt.getTime()) < 1 * 60 * 60 * 1000;
  };

  const handleDelete = async () => {
    if (!canDelete()) return;
    if (!window.confirm("هل أنت متأكد أنك تريد حذف الموضوع؟ لا يمكن التراجع.")) return;
    try {
      const { error } = await supabase
        .from('topics')
        .delete()
        .eq('id', topic?.id);
      if (error) throw error;
      toast({ title: "تم الحذف", description: "تم حذف الموضوع بنجاح" });
      navigate('/');
    } catch (e) {
      toast({ title: "خطأ", description: "حدث خطأ أثناء الحذف", variant: "destructive" });
    }
  };

  const can = (permission: PermissionKey): boolean => {
    if (!groupPermissions || !user) return false;
    // admin == كل شيء، أو تحقق فعلي من الجدول
    return !!groupPermissions.find(
      p => p.group_role === user.role && p.permission === permission && p.enabled
    );
  };

  if (loading || authLoading) {
    return (
      <ForumLayout session={session}>
        <div>
          <div className="animate-pulse space-y-4">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </ForumLayout>
    );
  }

  if (!topic) {
    return (
      <ForumLayout session={session}>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">الموضوع غير موجود</h2>
          <Button onClick={() => navigate('/')}>العودة للرئيسية</Button>
        </div>
      </ForumLayout>
    );
  }

  return (
    <ForumLayout session={session}>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="font-semibold text-base">
                شبكة الساحات للحوار الإسلامي الحر
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                href={
                  topic?.category_slug
                    ? `/category/${encodeURIComponent(topic.category_slug)}`
                    : "#"
                }
                className="font-semibold text-base"
              >
                {topic?.category_name || ""}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold text-base">
                {topic?.title || ""}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* حذف زر العودة القديم */}
        {/* <div className="flex items-center justify-between gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">حجم الخط:</span>
            <Button variant="outline" size="icon" className="w-8 h-8" onClick={() => handleFontSizeChange(contentFontSize + 1)}>
              <Plus className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="w-8 h-8" onClick={() => handleFontSizeChange(contentFontSize - 1)}>
              <Minus className="w-4 h-4" />
            </Button>
          </div>
        </div> */}

        {/* إضافة زر التحكم بحجم الخط فقط جهة اليمين */}
        <div className="flex items-center justify-end gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">حجم الخط:</span>
            <Button variant="outline" size="icon" className="w-8 h-8" onClick={() => handleFontSizeChange(contentFontSize + 1)}>
              <Plus className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="w-8 h-8" onClick={() => handleFontSizeChange(contentFontSize - 1)}>
              <Minus className="w-4 h-4" />
            </Button>
          </div>
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
            
            {/* Author Info */}
            <div className="flex items-start gap-3 mt-4 p-4 bg-gray-50 rounded-lg">
              <Avatar className="w-12 h-12">
                <AvatarImage src={topic?.author_avatar || undefined} />
                <AvatarFallback className="bg-green-100 text-green-700">
                  {topic?.author_name?.slice(0, 2) || "؟؟"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {/* استخدم Link مع username */}
                  {topic?.author_username ? (
                    <Link
                      to={`/u/${encodeURIComponent(topic.author_username)}`}
                      className="font-medium text-gray-800 hover:text-green-700 transition-colors"
                      tabIndex={0}
                      aria-label={`ملف ${topic?.author_name}`}
                      style={{ textDecoration: "none" }}
                    >
                      {topic?.author_name}
                    </Link>
                  ) : (
                    <span className="font-medium text-gray-800">
                      {topic?.author_name}
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {topic && formatDistanceToNow(new Date(topic.created_at), {
                      addSuffix: true,
                      locale: ar
                    })}
                  </span>
                </div>
                {topic?.author_bio && (
                  <p className="text-sm text-gray-600 mb-2">{topic.author_bio}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{topic?.view_count} مشاهدة</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none" style={{ fontSize: `${contentFontSize}px` }}>
              <div 
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: topic?.content || '' }}
                dir="rtl"
              />
              {topic?.updated_at && topic.updated_at !== topic.created_at && (
                <div className="mt-2 text-xs text-yellow-600 font-semibold">
                  تم تعديل هذا الموضوع مؤخرًا
                </div>
              )}
            </div>
            
            {/* Author Signature */}
            {topic?.author_signature && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600 italic">
                  {topic.author_signature}
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-4 mt-6 pt-4 border-t">
              <Button variant="ghost" size="sm">
                <ThumbsUp className="w-4 h-4 ml-1" />
                {topic?.like_count}
              </Button>
              <div className="flex items-center gap-1 text-gray-500">
                <MessageSquare className="w-4 h-4" />
                <span>{replies.length} رد</span>
              </div>
              {/* أزرار الإدارة الديناميكية */}
              {(can("delete_topic") || can("update_topic") || can("move_topic") || can("hide_topic") || can("pin_topic") || can("feature_topic")) && (
                <div className="flex items-center gap-2 ml-2">
                  {can("delete_topic") && (
                    <Button variant="outline" size="sm" onClick={handleDelete}>حذف</Button>
                  )}
                  {can("update_topic") && (
                    <Button variant="outline" size="sm" /*onClick={handleEdit}*/>تعديل</Button>
                  )}
                  {can("move_topic") && (
                    <Button variant="outline" size="sm" /*onClick={handleMove}*/>نقل</Button>
                  )}
                  {can("hide_topic") && (
                    <Button variant="outline" size="sm" /*onClick={handleHide}*/>إخفاء</Button>
                  )}
                  {can("pin_topic") && (
                    <Button variant="outline" size="sm" /*onClick={handlePin}*/>تثبيت</Button>
                  )}
                  {can("feature_topic") && (
                    <Button variant="outline" size="sm" /*onClick={handleFeature}*/>تمييز</Button>
                  )}
                </div>
              )}
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
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={reply.author_avatar || undefined} />
                    <AvatarFallback className="bg-green-100 text-green-700 text-sm">
                      {reply.author_name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {/* استخدم Link مع username للردود */}
                      {reply.author_username ? (
                        <Link
                          to={`/u/${encodeURIComponent(reply.author_username)}`}
                          className="font-medium text-gray-800 hover:text-green-700 transition-colors"
                          tabIndex={0}
                          aria-label={`ملف ${reply.author_name}`}
                          style={{ textDecoration: "none" }}
                        >
                          {reply.author_name}
                        </Link>
                      ) : (
                        <span className="font-medium text-gray-800">
                          {reply.author_name}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(reply.created_at), {
                          addSuffix: true,
                          locale: ar
                        })}
                      </span>
                    </div>
                    {reply.author_bio && (
                      <p className="text-xs text-gray-500 mb-2">{reply.author_bio}</p>
                    )}
                    <div 
                      className="text-gray-700"
                      dangerouslySetInnerHTML={{ __html: reply.content }}
                      dir="rtl"
                      style={{ fontSize: `${contentFontSize}px` }}
                    />
                    
                    {/* Reply Author Signature */}
                    {reply.author_signature && (
                      <div className="mt-3 pt-2 border-t border-gray-100">
                        <div className="text-xs text-gray-500 italic">
                          {reply.author_signature}
                        </div>
                      </div>
                    )}
                    
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
            {showPreview ? (
              <div className="space-y-4">
                <Card className="min-h-[200px] p-4">
                  <div 
                    className="prose max-w-none" 
                    dangerouslySetInnerHTML={{ __html: newReply }}
                    dir="rtl"
                  />
                </Card>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSubmitReply}
                    disabled={!newReply.trim() || submitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {submitting ? "جاري الإرسال..." : "إرسال الرد"}
                  </Button>
                  <Button 
                    onClick={() => setShowPreview(false)}
                    variant="outline"
                  >
                    العودة للتحرير
                  </Button>
                </div>
              </div>
            ) : (
              <WysiwygEditor
                value={newReply}
                onChange={setNewReply}
                placeholder="اكتب ردك هنا..."
                onSubmit={handleSubmitReply}
                onSaveDraft={handleSaveDraft}
                onPreview={handlePreview}
                isSubmitting={submitting}
                showSubmitButtons={true}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </ForumLayout>
  );
};

export default TopicView;
