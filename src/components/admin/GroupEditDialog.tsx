
import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface GroupEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group?: { id: string; name: string } | null;
}

const GroupEditDialog: React.FC<GroupEditDialogProps> = ({ open, onOpenChange, group }) => {
  if (!group) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تعديل المجموعة</DialogTitle>
        </DialogHeader>
        <div className="my-4">
          <div className="font-bold mb-2">اسم المجموعة:</div>
          <div>{group.name}</div>
          <div className="text-gray-500 text-xs mt-4">سيتم دعم تعديل صلاحيات وعناصر المجموعة قريبا.</div>
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

export default GroupEditDialog;
