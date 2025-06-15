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
          
        </div>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onAuthSuccess={handleAuthSuccess} />
    </>;
};
export default Header;