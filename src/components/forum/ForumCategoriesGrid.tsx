
import React from "react";
import { 
  Home, 
  BookOpen, 
  Users, 
  MessageSquare, 
  Star,
  TrendingUp,
  Calendar,
  Settings,
  Shield,
  Heart,
  Megaphone,
  UserPlus,
  Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  topic_count: number;
  comment_count: number;
  view_count: number;
  recent_topics_count: number;
}

const iconMap: { [key: string]: any } = {
  Home,
  BookOpen,
  Shield,
  Heart,
  Star,
  Megaphone,
  Users,
  MessageSquare,
  UserPlus,
  TrendingUp,
  Calendar,
  Settings,
  Eye
};

type Props = {
  categories: Category[];
};

const ForumCategoriesGrid: React.FC<Props> = ({ categories }) => {
  const navigate = useNavigate();

  // جلب الإحصائيات المحدثة من قاعدة البيانات
  const { data: categoriesWithStats } = useQuery({
    queryKey: ['categories-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_categories_with_stats');
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // تحديث كل 30 ثانية
  });

  // دمج البيانات الأساسية مع الإحصائيات المحدثة
  const categoriesData = categoriesWithStats || categories;

  return (
    <div className="my-8">
      <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
        <Star className="w-5 h-5 text-yellow-500" />
        أقسام المنتدى
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {categoriesData.map((cat) => {
          const Icon = iconMap[cat.icon] || MessageSquare;
          return (
            <div
              key={cat.id}
              className="bg-white rounded-lg border shadow-sm p-4 flex flex-col justify-between hover:shadow-md transition cursor-pointer group"
              onClick={() => navigate(`/category/${cat.slug}`)}
            >
              <div className="flex items-start gap-4">
                <div
                  className="rounded-full p-2 bg-gradient-to-br from-gray-50 to-gray-100 border"
                  style={{ color: cat.color }}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <h3 className="font-semibold text-gray-800 text-lg group-hover:text-green-600">{cat.name}</h3>
                  </div>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">{cat.description}</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-around text-xs text-gray-600">
                <div className="flex flex-col items-center gap-1" title="المواضيع">
                  <span className="font-semibold">{cat.topic_count ?? 0}</span>
                  <span className="text-gray-400">المواضيع</span>
                </div>
                <div className="flex flex-col items-center gap-1" title="التعليقات">
                  <span className="font-semibold">{cat.comment_count ?? 0}</span>
                  <span className="text-gray-400">التعليقات</span>
                </div>
                <div className="flex flex-col items-center gap-1" title="المشاهدات">
                  <span className="font-semibold">{cat.view_count ?? 0}</span>
                  <span className="text-gray-400">المشاهدات</span>
                </div>
                {cat.recent_topics_count > 0 && (
                  <div className="flex flex-col items-center gap-1 text-green-600" title="مواضيع جديدة">
                    <span className="font-semibold">{cat.recent_topics_count}</span>
                    <span className="text-green-500">جديدة</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ForumCategoriesGrid;
