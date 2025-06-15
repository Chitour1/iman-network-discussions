
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  MessageSquare, 
  Eye, 
  TrendingUp, 
  Shield, 
  Settings,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminStats {
  totalUsers: number;
  totalTopics: number;
  totalComments: number;
  pendingTopics: number;
  pendingComments: number;
  todayViews: number;
}

interface PendingItem {
  id: string;
  title?: string;
  content: string;
  author_name: string;
  created_at: string;
  type: 'topic' | 'comment';
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalTopics: 0,
    totalComments: 0,
    pendingTopics: 0,
    pendingComments: 0,
    todayViews: 0
  });
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
    fetchStats();
    fetchPendingItems();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        window.location.href = '/';
        return;
      }

      // Check if user has admin role - for now we'll allow access until the admin system is properly set up
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.user.id)
        .single();

      // Temporarily allow users with 'admin' role in the role field
      if (profile?.role !== 'admin') {
        toast({
          title: "غير مصرح",
          description: "ليس لديك صلاحية للوصول إلى لوحة الإدارة",
          variant: "destructive",
        });
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      window.location.href = '/';
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch site stats
      const { data: siteStats } = await supabase
        .from('site_stats')
        .select('*')
        .single();

      // Count pending items
      const { count: pendingTopicsCount } = await supabase
        .from('topics')
        .select('*', { count: 'exact' })
        .eq('status', 'pending');

      const { count: pendingCommentsCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact' })
        .eq('status', 'pending');

      setStats({
        totalUsers: siteStats?.total_users || 0,
        totalTopics: siteStats?.total_topics || 0,
        totalComments: siteStats?.total_comments || 0,
        pendingTopics: pendingTopicsCount || 0,
        pendingComments: pendingCommentsCount || 0,
        todayViews: siteStats?.daily_views || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchPendingItems = async () => {
    try {
      // Fetch pending topics with author info
      const { data: pendingTopics } = await supabase
        .from('topics')
        .select(`
          id, title, content, created_at,
          author_id
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch pending comments with author info
      const { data: pendingComments } = await supabase
        .from('comments')
        .select(`
          id, content, created_at,
          author_id
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);

      // Get author names separately
      const topicAuthorIds = pendingTopics?.map(t => t.author_id) || [];
      const commentAuthorIds = pendingComments?.map(c => c.author_id) || [];
      const allAuthorIds = [...new Set([...topicAuthorIds, ...commentAuthorIds])];

      const { data: authors } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', allAuthorIds);

      const authorMap = new Map(authors?.map(a => [a.id, a.display_name]) || []);

      const allPending: PendingItem[] = [
        ...(pendingTopics || []).map(topic => ({
          id: topic.id,
          title: topic.title,
          content: topic.content,
          author_name: authorMap.get(topic.author_id) || 'مجهول',
          created_at: topic.created_at,
          type: 'topic' as const
        })),
        ...(pendingComments || []).map(comment => ({
          id: comment.id,
          content: comment.content,
          author_name: authorMap.get(comment.author_id) || 'مجهول',
          created_at: comment.created_at,
          type: 'comment' as const
        }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setPendingItems(allPending);
    } catch (error) {
      console.error('Error fetching pending items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, type: 'topic' | 'comment') => {
    try {
      const table = type === 'topic' ? 'topics' : 'comments';
      const { error } = await supabase
        .from(table)
        .update({ status: 'approved' })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "تم الموافقة",
        description: `تم الموافقة على ${type === 'topic' ? 'الموضوع' : 'التعليق'} بنجاح`,
      });

      fetchStats();
      fetchPendingItems();
    } catch (error) {
      console.error('Error approving item:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الموافقة",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (id: string, type: 'topic' | 'comment') => {
    try {
      const table = type === 'topic' ? 'topics' : 'comments';
      const { error } = await supabase
        .from(table)
        .update({ status: 'rejected' })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "تم الرفض",
        description: `تم رفض ${type === 'topic' ? 'الموضوع' : 'التعليق'}`,
      });

      fetchStats();
      fetchPendingItems();
    } catch (error) {
      console.error('Error rejecting item:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الرفض",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 p-6" dir="rtl">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="bg-white rounded-lg p-6 shadow-sm h-32"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">لوحة الإدارة</h1>
            <p className="text-gray-600">إدارة شبكة الساحات للنقاش الإسلامي الحر</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin/settings')}>
            <Settings className="w-4 h-4 ml-2" />
            إعدادات المنتدى
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي الأعضاء</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي المواضيع</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTopics.toLocaleString()}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي التعليقات</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalComments.toLocaleString()}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">زوار اليوم</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.todayViews.toLocaleString()}</p>
                </div>
                <Eye className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              عناصر في انتظار الموافقة
              {(stats.pendingTopics + stats.pendingComments) > 0 && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  {stats.pendingTopics + stats.pendingComments}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingItems.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-600">لا توجد عناصر في انتظار الموافقة</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingItems.map((item) => (
                  <div key={`${item.type}-${item.id}`} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={item.type === 'topic' ? 'default' : 'secondary'}>
                            {item.type === 'topic' ? 'موضوع' : 'تعليق'}
                          </Badge>
                          <span className="text-sm text-gray-500">بواسطة {item.author_name}</span>
                        </div>
                        {item.title && (
                          <h4 className="font-medium text-gray-800 mb-1">{item.title}</h4>
                        )}
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {item.content.substring(0, 200)}...
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-600 hover:bg-green-50"
                          onClick={() => handleApprove(item.id, item.type)}
                        >
                          <CheckCircle className="w-4 h-4 ml-1" />
                          موافقة
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => handleReject(item.id, item.type)}
                        >
                          <XCircle className="w-4 h-4 ml-1" />
                          رفض
                        </Button>
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

export default AdminDashboard;
