
import { Session } from "@supabase/supabase-js";
import ForumHeader from "./ForumHeader";
import ForumSidebar from "./ForumSidebar";
import ForumWelcome from "./ForumWelcome";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useNavigate, useLocation } from "react-router-dom";

interface ForumLayoutProps {
  session: Session | null;
  children: React.ReactNode;
}

const ForumLayout = ({ session, children }: ForumLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // فقط أظهر زر "موضوع جديد" إذا لم يكن في صفحة الإنشاء نفسها
  const showNewTopicButton = !location.pathname.startsWith("/create-topic");

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50" dir="rtl">
      <SidebarProvider>
        {/* رأسية المنتدى دائما بالأعلى */}
        <ForumHeader session={session} />
        <div className="flex min-h-screen pt-20"> {/* pt-20 لضبط المسافة بعد الرأسية الثابتة */}
          <ForumSidebar />
          <div className="flex-1 flex flex-col px-4">
            {/* منطقة العلويّة (بطاقة ترحيب وزر موضوع جديد) */}
            <div className="w-full max-w-4xl mx-auto space-y-4 mt-2 mb-6">
              {showNewTopicButton && (
                <div className="flex justify-between items-center">
                  <div></div>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => navigate("/create-topic")}
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    موضوع جديد
                  </Button>
                </div>
              )}
              <ForumWelcome />
            </div>
            {/* محتوى الصفحة المتغير */}
            <main className="flex-1 w-full max-w-4xl mx-auto">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default ForumLayout;
