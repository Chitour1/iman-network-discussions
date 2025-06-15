
import ForumLayout from "@/components/forum/ForumLayout";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import CategoryFormDialog from "@/components/admin/CategoryFormDialog";
import CategoryTableRow from "@/components/admin/CategoryTableRow";
import { toast } from "@/hooks/use-toast";

// واجهة القسم
interface Category {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  color: string | null;
  icon: string | null;
}

const fetchCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,description,slug,color,icon")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data || [];
};

const AdminCategories = () => {
  const { session } = useAuth();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const queryClient = useQueryClient();

  const { data: categories, isLoading, error } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: fetchCategories,
  });

  const handleAdd = () => {
    setEditingCategory(null);
    setOpenDialog(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setOpenDialog(true);
  };

  const handleSuccess = () => {
    setOpenDialog(false);
    setEditingCategory(null);
    queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
  };

  return (
    <ForumLayout session={session}>
      <div className="max-w-4xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>إدارة الأقسام والمنتديات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-6">
              <span className="font-medium text-lg">قائمة الأقسام</span>
              <Button onClick={handleAdd}>+ إضافة قسم جديد</Button>
            </div>
            {isLoading ? (
              <div className="text-center text-gray-500 py-8">جاري التحميل...</div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">حدث خطأ أثناء جلب الأقسام</div>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الاسم</TableHead>
                      <TableHead>الوصف</TableHead>
                      <TableHead>اختصار الرابط</TableHead>
                      <TableHead>أيقونة</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories && categories.length > 0 ? (
                      categories.map((cat) => (
                        <CategoryTableRow
                          key={cat.id}
                          category={cat}
                          onEdit={() => handleEdit(cat)}
                          onDelete={handleSuccess}
                        />
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500">
                          لا توجد أقسام بعد
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <CategoryFormDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        editingCategory={editingCategory}
        onSuccess={handleSuccess}
      />
    </ForumLayout>
  );
};
export default AdminCategories;
