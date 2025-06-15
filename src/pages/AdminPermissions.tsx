
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
import GroupEditDialog from "@/components/admin/GroupEditDialog";
import { useGroupPermissions, useUpdateGroupPermission, PermissionKey, GroupRole } from "@/hooks/useGroupPermissions";

const roles: { role: GroupRole; name: string }[] = [
  { role: "admin", name: "الإدارة" },
  { role: "moderator", name: "المشرفون" },
  { role: "member", name: "الأعضاء" },
];
const ALL_PERMISSIONS: { key: PermissionKey; label: string }[] = [
  { key: "delete_topic", label: "حذف موضوع" },
  { key: "update_topic", label: "تعديل موضوع" },
  { key: "move_topic", label: "نقل موضوع" },
  { key: "hide_topic", label: "إخفاء موضوع" },
  { key: "pin_topic", label: "تثبيت موضوع" },
  { key: "feature_topic", label: "تمييز موضوع" },
];

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

  const { data: permissions, isLoading: loadingPerms } = useGroupPermissions();
  const updatePermission = useUpdateGroupPermission();

  // تجميع الأعضاء حسب الدور
  const groups = roles.map(roleObj => ({
    id: roleObj.role,
    name: roleObj.name,
    role: roleObj.role,
    members: users?.filter(u => u.role === roleObj.role) || [],
  }));

  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);

  const editingGroup = groups.find((g) => g.id === editingGroupId) || null;

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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الصلاحية</TableHead>
                    {roles.map(r => (
                      <TableHead key={r.role}>{r.name}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ALL_PERMISSIONS.map(perm => (
                    <TableRow key={perm.key}>
                      <TableCell className="font-bold">{perm.label}</TableCell>
                      {roles.map(role => {
                        const row = permissions?.find(p =>
                          p.group_role === role.role && p.permission === perm.key
                        );
                        return (
                          <TableCell key={role.role}>
                            {loadingPerms || !row ? (
                              <div className="text-gray-400">...</div>
                            ) : (
                              <input
                                type="checkbox"
                                checked={!!row.enabled}
                                className="w-5 h-5 accent-green-600"
                                onChange={e => {
                                  updatePermission.mutate({
                                    id: row.id,
                                    enabled: e.target.checked,
                                  });
                                }}
                                disabled={updatePermission.isPending}
                              />
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-gray-500 mt-6 text-center text-sm">
              يمكنك التحكم في الصلاحيات الفعليّة لكل مجموعة من هنا. أي تغيير يُطبّق مباشرةً.
            </p>
            <GroupEditDialog
              open={!!editingGroupId}
              onOpenChange={open => setEditingGroupId(open ? editingGroupId : null)}
              group={editingGroup}
            />
          </CardContent>
        </Card>
      </div>
    </ForumLayout>
  );
};

export default AdminPermissions;
