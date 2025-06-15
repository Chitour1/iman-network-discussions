
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useSiteSettings, useUpdateSiteSettings } from "@/hooks/useSiteSettings";
import { useToast } from "@/hooks/use-toast";

/**
 * إعدادات المنتدى العامة (الاسم، الوصف، اللغة...)
 */
const AdminGeneralSettings = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const { mutate: updateSettings, isPending } = useUpdateSiteSettings();
  const { toast } = useToast();

  // حالة الإدخال
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("ar");
  const [timezone, setTimezone] = useState("Asia/Riyadh");

  // عند جلب الإعدادات من القاعدة
  useEffect(() => {
    if (settings) {
      setTitle(settings.forum_title ?? "");
      setDescription(settings.forum_description ?? "");
      setLanguage(settings.forum_language ?? "ar");
      setTimezone(settings.forum_timezone ?? "Asia/Riyadh");
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings(
      {
        forum_title: title,
        forum_description: description,
        forum_language: language,
        forum_timezone: timezone,
      },
      {
        onSuccess: () => {
          toast({
            title: "تم الحفظ",
            description: "تم حفظ إعدادات المنتدى بنجاح.",
          });
        },
        onError: (e: any) => {
          toast({
            title: "خطأ أثناء الحفظ",
            description: typeof e === "string" ? e : e?.message ?? "حدث خطأ. حاول مجددًا.",
            variant: "destructive",
          });
        },
      }
    );
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
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              disabled={isLoading || isPending}
            />
          </div>
          <div>
            <label className="block font-medium">الوصف</label>
            <Input
              value={description}
              onChange={e => setDescription(e.target.value)}
              disabled={isLoading || isPending}
            />
          </div>
          <div>
            <label className="block font-medium">اللغة</label>
            <Input
              value={language}
              onChange={e => setLanguage(e.target.value)}
              disabled={isLoading || isPending}
            />
          </div>
          <div>
            <label className="block font-medium">المنطقة الزمنية</label>
            <Input
              value={timezone}
              onChange={e => setTimezone(e.target.value)}
              disabled={isLoading || isPending}
            />
          </div>
          <Button className="mt-3" onClick={handleSave} disabled={isPending || isLoading}>
            {isPending ? "يتم الحفظ..." : "حفظ الإعدادات"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminGeneralSettings;
