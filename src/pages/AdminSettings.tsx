
import ForumLayout from "@/components/forum/ForumLayout";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminSettings = () => {
  const { session } = useAuth();

  return (
    <ForumLayout session={session}>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>إعدادات المنتدى</CardTitle>
          </CardHeader>
          <CardContent>
            <p>هنا يمكنك إدارة إعدادات المنتدى المختلفة.</p>
            {/* سيتم إضافة المزيد من الإعدادات هنا مستقبلاً */}
          </CardContent>
        </Card>
      </div>
    </ForumLayout>
  );
};

export default AdminSettings;
