
import ForumLayout from "@/components/forum/ForumLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import React from "react";

// بيانات وهمية للمجموعات
const groups = [
  {
    id: "1",
    name: "الإدارة",
    permissions: ["حذف مواضيع", "تعيين مشرفين"],
    members: [
      { id: "1", username: "khaled", role: "admin" },
    ],
  },
  {
    id: "2",
    name: "المشرفون",
    permissions: ["حذف تعليقات", "إغلاق مواضيع"],
    members: [
      { id: "2", username: "sara", role: "moderator" },
    ],
  },
];

const AdminPermissions = () => {
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
            <CardTitle>إدارة الصلاحيات والمجموعات</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المجموعة</TableHead>
                  <TableHead>الصلاحيات</TableHead>
                  <TableHead>الأعضاء</TableHead>
                  <TableHead>خيارات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell>{group.name}</TableCell>
                    <TableCell>
                      <ul className="list-disc list-inside text-sm text-gray-700">
                        {group.permissions.map((perm, i) => (
                          <li key={i}>{perm}</li>
                        ))}
                      </ul>
                    </TableCell>
                    <TableCell>
                      {group.members.map((m, i) => (
                        <span
                          key={m.id}
                          className="inline-block rounded bg-gray-200 px-2 py-0.5 ml-1 text-xs"
                        >
                          {m.username} ({m.role === "admin" ? "مدير" : "مشرف"})
                        </span>
                      ))}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" className="ml-1">تعديل</Button>
                      <Button size="sm" variant="destructive">حذف</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="text-gray-500 mt-6 text-center text-sm">
              قريبًا يمكنك إضافة وتعديل صلاحيات المجموعات والتحكم الكامل من هذه الصفحة.
            </p>
          </CardContent>
        </Card>
      </div>
    </ForumLayout>
  );
};
export default AdminPermissions;
