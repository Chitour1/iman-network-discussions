
import ForumLayout from "@/components/forum/ForumLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import React from "react";

// بيانات وهمية للأعضاء
const users = [
  { id: "1", username: "khaled", display_name: "خالد", role: "admin", status: "نشط" },
  { id: "2", username: "sara", display_name: "سارة", role: "moderator", status: "نشط" },
  { id: "3", username: "rami", display_name: "رامي", role: "user", status: "محظور" },
];

const AdminUsers = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  return (
    <ForumLayout session={session}>
      <div className="max-w-4xl mx-auto py-8">
        <Button
          variant="ghost"
          className="mb-4 flex items-center gap-1 font-bold text-base text-gray-600 hover:text-black"
          onClick={() => navigate("/admin")}
        >
          <ArrowLeft className="ml-1" size={20} />
          عودة للوحة الإدارة
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>إدارة الأعضاء</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم المستخدم</TableHead>
                  <TableHead>الاسم المعروض</TableHead>
                  <TableHead>الدور</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>خيارات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell dir="ltr">{user.username}</TableCell>
                    <TableCell>{user.display_name}</TableCell>
                    <TableCell>
                      {user.role === "admin" ? "مدير" : user.role === "moderator" ? "مشرف" : "عضو"}
                    </TableCell>
                    <TableCell>{user.status}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" className="ml-1">تعديل</Button>
                      <Button size="sm" variant="destructive">حظر</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="text-gray-500 mt-6 text-center text-sm">
              يمكنك في المستقبل البحث، التعديل، تغيير الرتب، أو حظر المستخدمين عن طريق هذه الصفحة.
            </p>
          </CardContent>
        </Card>
      </div>
    </ForumLayout>
  );
};
export default AdminUsers;
