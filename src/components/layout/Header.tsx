
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/auth/AuthModal";
import { LogIn, LogOut, User, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
const HEADER_HEIGHT = 64; // تقريبًا 16 في Tailwind = 64px

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
  return (
    <>
      <header
        className="bg-white shadow-sm border-b fixed top-0 left-0 w-full z-50"
        dir="rtl"
        style={{ height: HEADER_HEIGHT }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          {/* يمكن إضافة محتوى الرأسية هنا لاحقًا */}
        </div>
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
};
export default Header;
