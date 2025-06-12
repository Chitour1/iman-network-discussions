
import { Session } from "@supabase/supabase-js";
import ForumHeader from "./ForumHeader";
import ForumSidebar from "./ForumSidebar";
import ForumMain from "./ForumMain";
import { SidebarProvider } from "@/components/ui/sidebar";

interface ForumLayoutProps {
  session: Session;
}

const ForumLayout = ({ session }: ForumLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50" dir="rtl">
      <SidebarProvider>
        <div className="flex min-h-screen">
          <ForumSidebar />
          <div className="flex-1 flex flex-col">
            <ForumHeader session={session} />
            <ForumMain />
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default ForumLayout;
