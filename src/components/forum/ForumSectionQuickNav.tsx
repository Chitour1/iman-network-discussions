
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function ForumSectionQuickNav() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    supabase
      .from('categories')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => {
        setCategories(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 md:bottom-6 md:right-10" dir="rtl">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg focus:outline-none transition"
            aria-label="انتقل إلى قسم سريع"
            title="انتقل إلى قسم سريع"
          >
            <Menu className="w-7 h-7" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 max-h-96 overflow-y-auto">
          <div className="px-2 py-2 text-center font-medium text-gray-700">الأقسام</div>
          {loading && <div className="p-4 text-center text-gray-500 text-sm">جار التحميل...</div>}
          {categories.map((cat) => (
            <DropdownMenuItem
              key={cat.id}
              onClick={() => navigate(`/category/${cat.slug}`)}
              className="cursor-pointer"
            >
              {cat.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
