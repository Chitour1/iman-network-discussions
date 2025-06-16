
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Pin, Star, Eye, Move, Trash } from "lucide-react";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { useTopicActions } from "@/hooks/useTopicActions";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TopicAdminActionsProps {
  topicId: string;
  isPinned: boolean;
  isFeatured: boolean;
  currentCategoryId: string;
}

const TopicAdminActions = ({ topicId, isPinned, isFeatured, currentCategoryId }: TopicAdminActionsProps) => {
  const { data: permissions, isLoading } = useUserPermissions();
  const { pinTopic, featureTopic, hideTopic, moveTopic, deleteTopic } = useTopicActions();
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const { data: categories } = useQuery({
    queryKey: ["categories-for-move"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // Don't show anything while loading or if no permissions
  if (isLoading || !permissions) return null;

  const hasAnyPermission = (
    permissions.pin_topic ||
    permissions.feature_topic ||
    permissions.hide_topic ||
    permissions.move_topic ||
    permissions.delete_topic ||
    permissions.update_topic
  );

  if (!hasAnyPermission) return null;

  const handleMoveTopic = () => {
    if (selectedCategoryId && selectedCategoryId !== currentCategoryId) {
      moveTopic.mutate({ topicId, categoryId: selectedCategoryId });
      setShowMoveDialog(false);
      setSelectedCategoryId("");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="ml-2">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[180px]">
          {permissions.pin_topic && (
            <DropdownMenuItem
              onClick={() => pinTopic.mutate({ topicId, isPinned: !isPinned })}
              disabled={pinTopic.isPending}
            >
              <Pin className="w-4 h-4 ml-2" />
              {isPinned ? "إلغاء التثبيت" : "تثبيت الموضوع"}
            </DropdownMenuItem>
          )}
          
          {permissions.feature_topic && (
            <DropdownMenuItem
              onClick={() => featureTopic.mutate({ topicId, isFeatured: !isFeatured })}
              disabled={featureTopic.isPending}
            >
              <Star className="w-4 h-4 ml-2" />
              {isFeatured ? "إلغاء التمييز" : "تمييز الموضوع"}
            </DropdownMenuItem>
          )}

          {permissions.move_topic && (
            <DropdownMenuItem onClick={() => setShowMoveDialog(true)}>
              <Move className="w-4 h-4 ml-2" />
              نقل إلى قسم آخر
            </DropdownMenuItem>
          )}

          {permissions.hide_topic && (
            <DropdownMenuItem
              onClick={() => hideTopic.mutate({ topicId })}
              disabled={hideTopic.isPending}
            >
              <Eye className="w-4 h-4 ml-2" />
              إخفاء الموضوع
            </DropdownMenuItem>
          )}

          {permissions.delete_topic && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => deleteTopic.mutate({ topicId })}
                disabled={deleteTopic.isPending}
                className="text-red-600 focus:text-red-600"
              >
                <Trash className="w-4 h-4 ml-2" />
                حذف الموضوع
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>نقل الموضوع إلى قسم آخر</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">اختر القسم الجديد:</label>
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر قسم..." />
                </SelectTrigger>
                <SelectContent>
                  {categories?.filter(cat => cat.id !== currentCategoryId).map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowMoveDialog(false)}>
                إلغاء
              </Button>
              <Button 
                onClick={handleMoveTopic}
                disabled={!selectedCategoryId || selectedCategoryId === currentCategoryId || moveTopic.isPending}
              >
                نقل الموضوع
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TopicAdminActions;
