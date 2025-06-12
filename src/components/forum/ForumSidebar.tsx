
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
  Shield
} from "lucide-react";

const ForumSidebar = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTopics: 0,
    totalComments: 0,
    todayViews: 0
  });

  useEffect(() => {
    fetchStats();
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

  const menuItems = [
    { icon: Home, label: "الرئيسية", href: "/" },
    { icon: BookOpen, label: "العلوم الشرعية", href: "/categories/sharia" },
    { icon: MessageSquare, label: "النقاش العام", href: "/categories/general" },
    { icon: Users, label: "التعارف", href: "/categories/introductions" },
    { icon: Star, label: "المواضيع المميزة", href: "/featured" },
    { icon: TrendingUp, label: "الأكثر نشاطاً", href: "/trending" },
  ];

  const adminItems = [
    { icon: Shield, label: "لوحة الإدارة", href: "/admin" },
    { icon: Settings, label: "إعدادات المنتدى", href: "/admin/settings" },
  ];

  return (
    <Sidebar className="border-l border-gray-200">
      <SidebarHeader className="p-4">
        <div className="text-center">
          <h3 className="font-semibold text-gray-800 mb-2">أقسام المنتدى</h3>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton>
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
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

        {/* قائمة الإدارة (إذا كان المستخدم أدمن) */}
        <SidebarMenu>
          {adminItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton>
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};

export default ForumSidebar;
