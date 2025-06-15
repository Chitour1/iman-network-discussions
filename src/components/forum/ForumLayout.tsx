
import { Session } from "@supabase/supabase-js";
import ForumHeader from "./ForumHeader";
import ForumWelcome from "./ForumWelcome";
import { useLocation } from "react-router-dom";

interface ForumLayoutProps {
  session: Session | null;
  children: React.ReactNode;
}

const ForumLayout = ({ session, children }: ForumLayoutProps) => {
  const location = useLocation();
  const isIndexPage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50" dir="rtl">
      <div className="flex flex-col min-h-screen">
        <ForumHeader session={session} />
        <main className="flex-1 p-4 md:p-6">
          <div className="container mx-auto">
            {!isIndexPage && (
              <div className="mb-6">
                <ForumWelcome />
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ForumLayout;
