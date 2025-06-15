
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Category = {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  color: string | null;
  icon: string | null;
};

interface Props {
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
}

export default function CategoryTableRow({ category, onEdit, onDelete }: Props) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("categories").delete().eq("id", category.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ description: "تم حذف القسم بنجاح", variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      onDelete();
    },
    onError: (error: any) => {
      toast({ description: "فشل حذف القسم: " + error.message, variant: "destructive" });
    },
  });

  return (
    <TableRow>
      <TableCell className="font-medium flex items-center gap-1">
        {category.color && (
          <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ background: category.color }} />
        )}
        {category.name}
      </TableCell>
      <TableCell>{category.description ?? "-"}</TableCell>
      <TableCell dir="ltr">{category.slug}</TableCell>
      <TableCell>
        {category.icon ? (
          <span className="text-base">{category.icon}</span>
        ) : (
          <span className="text-gray-300">—</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onEdit}>
            تعديل
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              if (window.confirm("سيتم حذف القسم نهائياً، هل أنت متأكد؟")) mutate();
            }}
            disabled={isPending}
          >
            حذف
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
