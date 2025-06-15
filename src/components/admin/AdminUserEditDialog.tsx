
import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AdminUserEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: {
    id: string;
    username: string;
    display_name?: string | null;
    role: "admin" | "moderator" | "member" | "pending";
  } | null;
}

const AdminUserEditDialog: React.FC<AdminUserEditDialogProps> = ({ open, onOpenChange, user }) => {
  // يمكن تطوير النموذج ليحتوي على عناصر حقيقية لاحقاً
  if (!user) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل العضو</DialogTitle>
          </DialogHeader>
          <div className="mb-4 space-y-2">
            <div>
              <span className="font-bold">اسم المستخدم: </span>
              <span dir="ltr">{user.username}</span>
            </div>
            <div>
              <span className="font-bold">الاسم المعروض: </span>
              <span>{user.display_name ?? "غير محدد"}</span>
            </div>
            <div>
              <span className="font-bold">الدور الحالي: </span>
              <span>
                {user.role === "admin"
                  ? "مدير"
                  : user.role === "moderator"
                  ? "مشرف"
                  : user.role === "member"
                  ? "عضو"
                  : user.role === "pending"
                  ? "بانتظار التفعيل"
                  : user.role}
              </span>
            </div>
            <div className="text-gray-500 text-xs">قريباً يمكنك تعديل بيانات العضو هنا.</div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
};

export default AdminUserEditDialog;
