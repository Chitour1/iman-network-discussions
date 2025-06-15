
import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AdminUserEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: {
    id: string;
    username: string;
    display_name?: string | null;
    role: "admin" | "moderator" | "member" | "pending";
    is_banned?: boolean;
    ban_expires_at?: string | null;
  } | null;
}

const roles = [
  { value: "admin", label: "مدير" },
  { value: "moderator", label: "مشرف" },
  { value: "member", label: "عضو" },
  { value: "pending", label: "بانتظار التفعيل" },
];

const AdminUserEditDialog: React.FC<AdminUserEditDialogProps> = ({ open, onOpenChange, user }) => {
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = React.useState(user?.display_name ?? "");
  const [role, setRole] = React.useState(user?.role ?? "member");
  const [banExpiresAt, setBanExpiresAt] = React.useState<string>(user?.ban_expires_at ?? "");
  const [isBanned, setIsBanned] = React.useState(!!user?.is_banned);

  React.useEffect(() => {
    setDisplayName(user?.display_name ?? "");
    setRole(user?.role ?? "member");
    setBanExpiresAt(user?.ban_expires_at ?? "");
    setIsBanned(!!user?.is_banned);
  }, [user]);

  // Mutation لتحديث بيانات العضو
  const updateUser = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const updates: any = {
        display_name: displayName ?? null,
        role,
        is_banned: isBanned,
        ban_expires_at: isBanned && banExpiresAt ? banExpiresAt : null,
      };
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      onOpenChange(false);
    },
  });

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تعديل بيانات العضو</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={e => {
            e.preventDefault();
            updateUser.mutate();
          }}
        >
          <div className="mb-4 space-y-3">
            <div>
              <label className="block font-bold mb-1">اسم المستخدم:</label>
              <input
                type="text"
                value={user.username}
                readOnly
                className="w-full px-3 py-2 bg-gray-100 rounded border"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">الاسم المعروض:</label>
              <input
                type="text"
                value={displayName ?? ""}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">الدور:</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              >
                {roles.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer mb-1">
                <input
                  type="checkbox"
                  checked={isBanned}
                  onChange={e => setIsBanned(e.target.checked)}
                  className="w-4 h-4 accent-red-600"
                />
                <span className={`font-bold ${isBanned ? 'text-red-600' : ''}`}>حظر العضو</span>
              </label>
              {isBanned && (
                <div className="mt-2">
                  <label className="block font-bold mb-1">تاريخ انتهاء الحظر (اختياري):</label>
                  <input
                    type="datetime-local"
                    value={banExpiresAt ? banExpiresAt.slice(0, 16) : ""}
                    onChange={e => setBanExpiresAt(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              )}
              {user.is_banned && user.ban_expires_at && (
                <div className="text-xs text-red-500 mt-1">
                  العضو محظور حتى: {new Date(user.ban_expires_at).toLocaleString()}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إغلاق
            </Button>
            <Button type="submit" disabled={updateUser.isPending}>
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminUserEditDialog;
