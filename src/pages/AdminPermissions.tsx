
import ForumLayout from "@/components/forum/ForumLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const AdminPermissions = () => {
  return (
    <ForumLayout>
      <div className="max-w-4xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>إدارة الصلاحيات والمجموعات</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">هنا يمكنك تعيين رتب وصلاحيات المستخدمين والتحكم في المجموعات. (هذه الصفحة تحت الإنشاء حالياً)</p>
          </CardContent>
        </Card>
      </div>
    </ForumLayout>
  );
};
export default AdminPermissions;
