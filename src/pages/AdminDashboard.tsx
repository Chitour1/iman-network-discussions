
import ForumLayout from "@/components/forum/ForumLayout";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";

const AdminDashboard = () => {
  const { session, user, loading } = useAuth();
  const userId = user?.id;
  const { data: profile, isLoading: profileLoading } = useUserProfile(userId);

  useEffect(() => {
    if (!loading && !profileLoading && profile) {
      const role = profile.role;
      if (role !== "admin" && role !== "moderator") {
        window.location.href = "/";
      }
    }
  }, [profile, loading, profileLoading]);

  return (
    <ForumLayout session={session}>
      <div className="max-w-4xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>لوحة تحكم الإدارة</CardTitle>
            <p className="text-gray-500 mt-1 text-sm">هنا يمكنك إدارة جميع إعدادات المنتدى والمستخدمين والأقسام.</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
              <Link to="/admin/settings" className="block bg-green-50 border border-green-200 rounded-lg p-5 hover:bg-green-100 transition-all">
                إعدادات المنتدى العامة
                <div className="text-xs text-gray-500 mt-1">اسم المنتدى، الوصف، اللغة، التوقيت...</div>
              </Link>
              <Link to="/admin/categories" className="block bg-blue-50 border border-blue-200 rounded-lg p-5 hover:bg-blue-100 transition-all">
                إدارة الأقسام والمنتديات
                <div className="text-xs text-gray-500 mt-1">إنشاء، تعديل أو حذف الأقسام والمنتديات</div>
              </Link>
              <Link to="/admin/users" className="block bg-yellow-50 border border-yellow-200 rounded-lg p-5 hover:bg-yellow-100 transition-all">
                إدارة الأعضاء
                <div className="text-xs text-gray-500 mt-1">البحث، التعديل، تغيير الرتب، حظر المستخدمين إلخ</div>
              </Link>
              <Link to="/admin/permissions" className="block bg-purple-50 border border-purple-200 rounded-lg p-5 hover:bg-purple-100 transition-all">
                إدارة الصلاحيات والمجموعات
                <div className="text-xs text-gray-500 mt-1">تعيين رتب وصلاحيات، التحكم في المجموعات، والميزات الخاصة</div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </ForumLayout>
  );
};

export default AdminDashboard;
