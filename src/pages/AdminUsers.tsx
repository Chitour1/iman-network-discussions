
import ForumLayout from "@/components/forum/ForumLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import React, { useState } from "react";
import AdminUserMenu from "@/components/admin/AdminUserMenu";

const fetchUsers = async () => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id,username,display_name,role,is_banned,ban_expires_at,joined_at");
  if (error) throw error;
  return data;
};

const AdminUsers = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { data: users, isLoading, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchUsers,
  });

  const [editingId, setEditingId] = useState<string | null>(null);

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
                  <TableHead>الانضمام</TableHead>
                  <TableHead>خيارات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">جاري التحميل...</TableCell>
                  </TableRow>
                )}
                {error && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-red-600">{String(error.message)}</TableCell>
                  </TableRow>
                )}
                {users?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500">لا يوجد أعضاء.</TableCell>
                  </TableRow>
                )}
                {users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell dir="ltr">{user.username}</TableCell>
                    <TableCell>{user.display_name ?? <span className="text-gray-400">غير محدد</span>}</TableCell>
                    <TableCell>
                      {user.role === "admin"
                        ? "مدير"
                        : user.role === "moderator"
                        ? "مشرف"
                        : user.role === "user"
                        ? "عضو"
                        : user.role === "pending"
                        ? "بانتظار التفعيل"
                        : user.role}
                    </TableCell>
                    <TableCell>
                      {user.is_banned
                        ? (
                          <span className="text-red-600">
                            محظور {user.ban_expires_at ? `حتى ${new Date(user.ban_expires_at).toLocaleDateString()}` : ""}
                          </span>
                        )
                        : "نشط"
                      }
                    </TableCell>
                    <TableCell>
                      {user.joined_at ? new Date(user.joined_at).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell>
                      <AdminUserMenu
                        onEdit={() => setEditingId(user.id)}
                        onBan={() => { /* implement ban logic here */ }}
                        userId={user.id}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="text-gray-500 mt-6 text-center text-sm">
              يمكنك البحث والتعديل وتغيير الرتب أو حظر المستخدمين من هنا.
            </p>
            {/* يمكن إضافة Dialog أو Modal عند editingId لفتح نافذة تحديث */}
          </CardContent>
        </Card>
      </div>
    </ForumLayout>
  );
};

export default AdminUsers;
