import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import CreateTopicForm from "@/components/forum/CreateTopicForm";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/auth/AuthModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn } from "lucide-react";
import ForumLayout from "@/components/forum/ForumLayout";

interface Category {
  id: string;
  name: string;
}

const CreateTopic = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchParams] = useSearchParams();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const categorySlug = searchParams.get('category');
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const selectedCategoryId = categorySlug 
    ? categories.find(cat => cat.name === categorySlug)?.id 
    : undefined;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 flex items-center justify-center" dir="rtl">
        <div className="animate-pulse">جاري التحميل...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 flex items-center justify-center" dir="rtl">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-center">يجب تسجيل الدخول</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                يجب تسجيل الدخول أولاً لإنشاء موضوع جديد
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  تسجيل الدخول
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md"
                >
                  العودة للرئيسية
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={() => setShowAuthModal(false)}
        />
      </>
    );
  }

  // **لف مكون إنشاء الموضوع داخل تخطيط المنتدى ليظهر في كل الصفحات**
  return (
    <ForumLayout session={null}>
      <CreateTopicForm 
        categories={categories} 
        selectedCategoryId={selectedCategoryId}
      />
    </ForumLayout>
  );
};

export default CreateTopic;
