
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

/**
 * إعدادات المنتدى العامة (الاسم، الوصف، اللغة...)
 */
const AdminGeneralSettings = () => {
  // في الخطوات القادمة سيتم جلب هذه البيانات من قاعدة البيانات
  const [title, setTitle] = useState("شبكة الساحات");
  const [description, setDescription] = useState("منتدى للنقاش الإسلامي الحر");
  const [language, setLanguage] = useState("ar");
  const [timezone, setTimezone] = useState("Asia/Riyadh");

  const handleSave = () => {
    // في المستقبل يتم حفظ الإعدادات في قاعدة البيانات
    alert("تم حفظ إعدادات المنتدى (هذا تمثيلي فقط الآن)");
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
            <Input value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block font-medium">الوصف</label>
            <Input value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div>
            <label className="block font-medium">اللغة</label>
            <Input value={language} onChange={e => setLanguage(e.target.value)} />
          </div>
          <div>
            <label className="block font-medium">المنطقة الزمنية</label>
            <Input value={timezone} onChange={e => setTimezone(e.target.value)} />
          </div>
          <Button className="mt-3" onClick={handleSave}>
            حفظ الإعدادات
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminGeneralSettings;
