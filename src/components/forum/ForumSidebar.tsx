import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
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
  UserPlus
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CategoryStat {
  id: string;
  topic_count: number;
  comment_count: number;
  view_count: number;
  name: string;
  slug: string;
  color: string;
  icon: string;
}

const ForumSidebar = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTopics: 0,
    totalComments: 0,
    todayViews: 0
  });
  const [categories, setCategories] = useState<CategoryStat[]>([]);
  const navigate = useNavigate();

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      Home, BookOpen, Shield, Heart, Star, 
      Megaphone, Users, MessageSquare, UserPlus, TrendingUp
    };
    return icons[iconName] || MessageSquare;
  };

  useEffect(() => {
    fetchStats();
    fetchCategoriesWithCounts();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: siteStats } = await supabase
        .from('site_stats')
        .select('*')
        .single();

      if (siteStats) {
        setStats({
          totalUsers: siteStats.total_users || 0,
          totalTopics: siteStats.total_topics || 0,
          totalComments: siteStats.total_comments || 0,
          todayViews: siteStats.daily_views || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchCategoriesWithCounts = async () => {
    try {
      const { data, error } = await supabase.rpc('get_categories_with_stats' as any);

      if (error) {
        console.error('Error fetching categories with stats via RPC:', error);
        throw error;
      }

      const categoriesData = ((data as any[]) || []).map((cat: any) => ({
        ...cat,
        topic_count: Number(cat.topic_count || 0),
        comment_count: Number(cat.comment_count || 0),
        view_count: Number(cat.view_count || 0),
      }));
      
      setCategories(categoriesData as CategoryStat[]);
    } catch (err) {
      console.error('Error fetching categories with counts:', err);
    }
  };

  const handleCategoryClick = (slug: string) => {
    navigate(`/category/${slug}`);
  };

  return (
    <Sidebar className="border-l border-gray-200">
      <SidebarHeader className="p-4">
        <div className="text-center">
          <h3 className="font-semibold text-gray-800 mb-2">أقسام المنتدى</h3>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => navigate("/")}>
              <Home className="w-4 h-4" />
              <span>الرئيسية</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {categories.map((category) => {
            const IconComponent = getIconComponent(category.icon);
            return (
              <SidebarMenuItem key={category.id}>
                <SidebarMenuButton onClick={() => handleCategoryClick(category.slug)}>
                  <IconComponent className="w-4 h-4" style={{ color: category.color }} />
                  <span className="text-sm">{category.name}</span>
                  <span className="mr-auto text-xs text-gray-500">
                    ({category.topic_count}) / <span className="text-green-700">{category.comment_count}</span>
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>

        <SidebarSeparator />

        {/* إحصائيات المنتدى */}
        <div className="p-4">
          <h4 className="font-semibold text-gray-700 mb-3">إحصائيات المنتدى</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">الأعضاء:</span>
              <span className="font-medium">{stats.totalUsers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">المواضيع:</span>
              <span className="font-medium">{stats.totalTopics.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">التعليقات:</span>
              <span className="font-medium">{stats.totalComments.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">زوار اليوم:</span>
              <span className="font-medium text-green-600">{stats.todayViews.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <SidebarSeparator />

        {/* أوقات الصلاة */}
        <div className="p-4">
          <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            أوقات الصلاة
          </h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>الفجر:</span>
              <span className="font-medium">05:30</span>
            </div>
            <div className="flex justify-between">
              <span>الضحى:</span>
              <span className="font-medium">06:45</span>
            </div>
            <div className="flex justify-between">
              <span>الظهر:</span>
              <span className="font-medium">12:15</span>
            </div>
            <div className="flex justify-between">
              <span>العصر:</span>
              <span className="font-medium">15:30</span>
            </div>
            <div className="flex justify-between">
              <span>المغرب:</span>
              <span className="font-medium">18:00</span>
            </div>
            <div className="flex justify-between">
              <span>العشاء:</span>
              <span className="font-medium">19:30</span>
            </div>
          </div>
        </div>

        <SidebarSeparator />

        {/* قائمة الإدارة */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => navigate("/admin")}>
              <Shield className="w-4 h-4" />
              <span>لوحة الإدارة</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => navigate("/admin/settings")}>
              <Settings className="w-4 h-4" />
              <span>إعدادات المنتدى</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};

export default ForumSidebar;
