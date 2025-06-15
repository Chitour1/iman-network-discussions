
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/toaster";

/**
 * إعدادات المنتدى العامة (الاسم، الوصف، اللغة...)
 */
const AdminGeneralSettings = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("");
  const [timezone, setTimezone] = useState("");
  const [loading, setLoading] = useState(false);

  // جلب البيانات من القاعدة عند أول تحميل
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) {
        toast && toast({
          title: "خطأ بجلب الإعدادات",
          description: error.message,
          variant: "destructive"
        });
      } else if (data) {
        setTitle(data.forum_title ?? "");
        setDescription(data.forum_description ?? "");
        setLanguage(data.forum_language ?? "");
        setTimezone(data.forum_timezone ?? "");
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    // جلب أول سجّل (هناك سجل واحد فقط)
    const { data: current, error: getError } = await supabase
      .from("site_settings")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (getError) {
      toast && toast({
        title: "خطأ",
        description: getError.message,
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    let updateResult;
    if (current) {
      // تحديث السجّل الحالي
      updateResult = await supabase
        .from("site_settings")
        .update({
          forum_title: title,
          forum_description: description,
          forum_language: language,
          forum_timezone: timezone,
          updated_at: new Date().toISOString()
        })
        .eq("id", current.id);
    } else {
      // أول مرة: إضافة سجل جديد
      updateResult = await supabase
        .from("site_settings")
        .insert({
          forum_title: title,
          forum_description: description,
          forum_language: language,
          forum_timezone: timezone
        });
    }

    const { error } = updateResult;
    setLoading(false);
    if (error) {
      toast && toast({
        title: "خطأ عند الحفظ",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast && toast({
        title: "تم الحفظ",
        description: "تم حفظ إعدادات المنتدى بنجاح",
        variant: "default"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>إعدادات المنتدى العامة</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block font-medium">اسم المنتدى</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} disabled={loading} />
          </div>
          <div>
            <label className="block font-medium">الوصف</label>
            <Input value={description} onChange={e => setDescription(e.target.value)} disabled={loading} />
          </div>
          <div>
            <label className="block font-medium">اللغة</label>
            <Input value={language} onChange={e => setLanguage(e.target.value)} disabled={loading} />
          </div>
          <div>
            <label className="block font-medium">المنطقة الزمنية</label>
            <Input value={timezone} onChange={e => setTimezone(e.target.value)} disabled={loading} />
          </div>
          <Button className="mt-3" onClick={handleSave} disabled={loading}>
            {loading ? "جار الحفظ..." : "حفظ الإعدادات"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminGeneralSettings;

