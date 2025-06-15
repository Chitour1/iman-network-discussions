
import { Session } from "@supabase/supabase-js";
import ForumHeader from "./ForumHeader";
import ForumSidebar from "./ForumSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

interface ForumLayoutProps {
  session: Session | null;
  children: React.ReactNode;
}

const ForumLayout = ({ session, children }: ForumLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50" dir="rtl">
      <SidebarProvider>
        <div className="flex min-h-screen">
          <ForumSidebar />
          <div className="flex-1 flex flex-col">
            <ForumHeader session={session} />
            <main className="flex-1 p-4 md:p-6">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default ForumLayout;
