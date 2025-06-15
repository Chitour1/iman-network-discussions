import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/auth/AuthModal";
import { LogIn, LogOut, User, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
const Header = () => {
  const {
    user,
    loading,
    signOut
  } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();
  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  return <>
      <header className="bg-white shadow-sm border-b" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <button onClick={() => navigate('/')} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">أ</span>
                </div>
                <span className="text-gray-800 mr-2 text-xl font-bold">شبكة الساحات</span>
              </button>
              <Badge variant="secondary" className="mr-2">نسخة تجريبية</Badge>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <button onClick={() => navigate('/')} className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                الرئيسية
              </button>
              <button onClick={() => navigate('/create-topic')} className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1">
                <Plus className="w-4 h-4" />
                موضوع جديد
              </button>
            </nav>

            {/* Auth Section */}
            <div className="flex items-center space-x-4">
              {loading ? <div className="w-8 h-8 animate-pulse bg-gray-200 rounded-full"></div> : user ? <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-700 ml-2">
                    مرحباً، {user.user_metadata?.display_name || user.email}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => navigate('/profile')} className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    الملف الشخصي
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleSignOut} className="flex items-center gap-1">
                    <LogOut className="w-4 h-4" />
                    خروج
                  </Button>
                </div> : <Button onClick={() => setShowAuthModal(true)} className="bg-green-600 hover:bg-green-700 flex items-center gap-1">
                  <LogIn className="w-4 h-4" />
                  تسجيل الدخول
                </Button>}
            </div>
          </div>
        </div>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onAuthSuccess={handleAuthSuccess} />
    </>;
};
export default Header;