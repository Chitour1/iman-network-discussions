
import ForumLayout from "@/components/forum/ForumLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

const AdminCategories = () => {
  const { session } = useAuth();

  return (
    <ForumLayout session={session}>
      <div className="max-w-4xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>إدارة الأقسام والمنتديات</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">هنا يمكنك إنشاء، تعديل وحذف الأقسام والمنتديات. (هذه الصفحة تحت الإنشاء حالياً)</p>
          </CardContent>
        </Card>
      </div>
    </ForumLayout>
  );
};
export default AdminCategories;
