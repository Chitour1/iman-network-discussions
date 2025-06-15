
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import React from "react";

interface AdminUserMenuProps {
  onEdit: () => void;
  onBan: () => void;
  userId: string;
}

const AdminUserMenu = ({ onEdit, onBan }: AdminUserMenuProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" size="sm" className="ml-1 flex items-center gap-1">
        <Edit size={16} />
        تعديل
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="min-w-[140px]">
      <DropdownMenuItem onClick={onEdit}>تعديل الدور / المعلومات</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={onBan} className="text-red-600">حظر المستخدم</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export default AdminUserMenu;
