import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import ForumLayout from "@/components/forum/ForumLayout";
import AuthPage from "@/components/auth/AuthPage";
import { useToast } from "@/hooks/use-toast";
import ForumMain from "@/components/forum/ForumMain";

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const { toast } = useToast();

  const enterGuestMode = () => {
    setIsGuest(true);
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setLoading(false);
        
        if (event === 'SIGNED_IN') {
          setIsGuest(false); // Exit guest mode on sign in
          toast({
            title: "مرحباً بك",
            description: "تم تسجيل الدخول بنجاح",
          });
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: "تم تسجيل الخروج",
            description: "نراك قريباً إن شاء الله",
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }
  
  if (session || isGuest) {
    return (
      <ForumLayout session={session}>
        {/* هنا يُمكن وضع بقية عناصر المنتدى الرئيسية كالمنتديات أو المواضيع الأحدث */}
        {/* سيتم وضع ForumMain بداخل التخطيط */}
        <ForumMain />
      </ForumLayout>
    );
  }

  return <AuthPage onGuestBrowse={enterGuestMode} />;
};

export default Index;
