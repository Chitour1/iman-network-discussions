import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Building, BookOpen, Users } from "lucide-react";
const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    toast
  } = useToast();
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const {
      error
    } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error.message,
        variant: "destructive"
      });
    }
    setLoading(false);
  };
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const redirectUrl = `${window.location.origin}/`;
    const {
      error
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          username,
          display_name: displayName
        }
      }
    });
    if (error) {
      toast({
        title: "خطأ في التسجيل",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "تم إرسال رسالة التأكيد",
        description: "يرجى فحص بريدك الإلكتروني لتأكيد الحساب"
      });
    }
    setLoading(false);
  };
  return <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        {/* Welcome Section */}
        <div className="text-center md:text-right space-y-6">
          <div className="flex justify-center md:justify-end mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center">
              <Building className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-800 mb-4">شبكة الساحات</h1>
          <h2 className="text-2xl text-green-700 mb-4">
            للنقاش الإسلامي
          </h2>
          
          <p className="text-lg text-gray-600 leading-relaxed">
            مرحباً بك في منتدانا الإسلامي الهادف للنقاش البناء وتبادل العلم النافع
          </p>
          
          <div className="space-y-4 text-right">
            <div className="flex items-center justify-center md:justify-end gap-3">
              <span className="text-gray-700">نقاشات علمية هادفة</span>
              <BookOpen className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex items-center justify-center md:justify-end gap-3">
              <span className="text-gray-700">مجتمع من المؤمنين</span>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Auth Form */}
        <Card className="w-full max-w-md mx-auto shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">انضم إلى المنتدى</CardTitle>
            <CardDescription>
              سجل دخولك أو أنشئ حساباً جديداً
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">تسجيل الدخول</TabsTrigger>
                <TabsTrigger value="signup">حساب جديد</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <Input type="email" placeholder="البريد الإلكتروني" value={email} onChange={e => setEmail(e.target.value)} required dir="ltr" />
                  </div>
                  <div>
                    <Input type="password" placeholder="كلمة المرور" value={password} onChange={e => setPassword(e.target.value)} required dir="ltr" />
                  </div>
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                    {loading ? "جاري الدخول..." : "دخول"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <Input type="text" placeholder="اسم المستخدم" value={username} onChange={e => setUsername(e.target.value)} required />
                  </div>
                  <div>
                    <Input type="text" placeholder="الاسم المعروض" value={displayName} onChange={e => setDisplayName(e.target.value)} required />
                  </div>
                  <div>
                    <Input type="email" placeholder="البريد الإلكتروني" value={email} onChange={e => setEmail(e.target.value)} required dir="ltr" />
                  </div>
                  <div>
                    <Input type="password" placeholder="كلمة المرور" value={password} onChange={e => setPassword(e.target.value)} required dir="ltr" />
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                    {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default AuthPage;