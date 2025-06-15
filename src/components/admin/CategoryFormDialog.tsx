
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// واجهة الإدخال للنموذج
interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCategory: {
    id: string;
    name: string;
    description: string | null;
    slug: string;
    color: string | null;
    icon: string | null;
  } | null;
  onSuccess: () => void;
}

export default function CategoryFormDialog({
  open,
  onOpenChange,
  editingCategory,
  onSuccess,
}: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm({
    defaultValues: editingCategory
      ? {
          name: editingCategory.name,
          description: editingCategory.description ?? "",
          slug: editingCategory.slug,
          color: editingCategory.color ?? "#3B82F6",
          icon: editingCategory.icon ?? "",
        }
      : {
          name: "",
          description: "",
          slug: "",
          color: "#3B82F6",
          icon: "",
        },
  });

  const queryClient = useQueryClient();

  // إعادة تعيين النموذج عند تغيير القسم الذي يتم تعديله أو عند الإغلاق
  React.useEffect(() => {
    if (editingCategory) {
      reset({
        name: editingCategory.name,
        description: editingCategory.description ?? "",
        slug: editingCategory.slug,
        color: editingCategory.color ?? "#3B82F6",
        icon: editingCategory.icon ?? "",
      });
    } else {
      reset({
        name: "",
        description: "",
        slug: "",
        color: "#3B82F6",
        icon: "",
      });
    }
  }, [editingCategory, open, reset]);

  const addOrUpdateCategory = async (form: any) => {
    if (editingCategory) {
      // تعديل قسم
      const { error } = await supabase
        .from("categories")
        .update({
          name: form.name,
          description: form.description,
          slug: form.slug,
          color: form.color,
          icon: form.icon || null,
        })
        .eq("id", editingCategory.id);
      if (error) throw error;
      return "تم تعديل القسم بنجاح";
    } else {
      // إضافة قسم
      const { error } = await supabase.from("categories").insert([
        {
          name: form.name,
          description: form.description,
          slug: form.slug,
          color: form.color,
          icon: form.icon || null,
        },
      ]);
      if (error) throw error;
      return "تمت إضافة قسم جديد";
    }
  };

  const mutation = useMutation({
    mutationFn: addOrUpdateCategory,
    onSuccess: (msg) => {
      toast({ description: msg as string, variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      onSuccess();
    },
    onError: (error: any) => {
      toast({ description: "حدث خطأ: " + error.message, variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingCategory ? "تعديل القسم" : "إضافة قسم جديد"}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
          className="space-y-4 mt-3"
        >
          <div>
            <Input
              type="text"
              {...register("name", { required: "اسم القسم مطلوب" })}
              placeholder="اسم القسم"
              autoFocus
              className={errors.name ? "border-red-400" : ""}
            />
            {errors.name && (
              <div className="text-xs text-destructive mt-1">{errors.name.message as string}</div>
            )}
          </div>
          <div>
            <Input
              type="text"
              {...register("slug", { required: "الاختصار مطلوب (بالإنجليزية بدون مسافات)" })}
              placeholder="اختصار الرابط"
              className={errors.slug ? "border-red-400" : ""}
            />
            {errors.slug && (
              <div className="text-xs text-destructive mt-1">{errors.slug.message as string}</div>
            )}
          </div>
          <div>
            <Input
              type="text"
              {...register("description")}
              placeholder="الوصف (اختياري)"
            />
          </div>
          <div>
            <Input
              type="color"
              {...register("color")}
              className="h-8 w-16"
            />
            <span className="text-xs mr-2">لون القسم</span>
          </div>
          <div>
            <Input
              type="text"
              {...register("icon")}
              placeholder="أيقونة (مثال: star, folder...)"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting || mutation.isPending}>
              {editingCategory ? "حفظ التغييرات" : "إضافة"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
