
import ForumLayout from "@/components/forum/ForumLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import React from "react";

const fetchUsers = async () => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id,username,display_name,role");
  if (error) throw error;
  return data;
};

const AdminPermissions = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { data: users, isLoading, error } = useQuery({
    queryKey: ["admin-permissions-users"],
    queryFn: fetchUsers,
  });

  // تجميع الأعضاء حسب الدور
  const groups = [
    {
      id: "admins",
      name: "الإدارة",
      role: "admin",
      members: users?.filter(u => u.role === "admin") || [],
      permissions: [
        "حذف مواضيع",
        "تعيين مشرفين",
        "تغيير إعدادات الموقع",
      ],
    },
    {
      id: "moderators",
      name: "المشرفون",
      role: "moderator",
      members: users?.filter(u => u.role === "moderator") || [],
      permissions: [
        "حذف تعليقات",
        "إغلاق مواضيع",
      ],
    },
    {
      id: "users",
      name: "الأعضاء",
      role: "user",
      members: users?.filter(u => u.role === "user") || [],
      permissions: [
        "كتابة مواضيع جديدة",
        "الرد على المشاركات",
      ],
    },
  ];

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
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={4}>جاري التحميل...</TableCell>
                  </TableRow>
                )}
                {error && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-red-600">{String(error.message)}</TableCell>
                  </TableRow>
                )}
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
                      {group.members.length === 0
                        ? <span className="text-gray-400">لا يوجد حاليا أعضاء</span>
                        : group.members.map((m, idx) => (
                          <span
                            key={m.id}
                            className="inline-block rounded bg-gray-200 px-2 py-0.5 ml-1 text-xs"
                          >
                            {m.username} ({m.display_name ?? "بدون اسم معرض"})
                          </span>
                        ))}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" className="ml-1">تعديل</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="text-gray-500 mt-6 text-center text-sm">
              قريبًا يمكنك إضافة وتعديل صلاحيات وعناصر المجموعات مباشرة من هنا.
            </p>
          </CardContent>
        </Card>
      </div>
    </ForumLayout>
  );
};

export default AdminPermissions;
