
import React, { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, UploadCloud } from "lucide-react";

interface ProfileImageUploaderProps {
  bucket: "avatars" | "covers";
  url: string | null;
  userId: string;
  onChange: (url: string) => void;
  rounded?: boolean;
  label?: string;
}

const ProfileImageUploader = ({
  bucket,
  url,
  userId,
  onChange,
  rounded = false,
  label = "تغيير الصورة",
}: ProfileImageUploaderProps) => {
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      alert("الملف كبير جدًا (الحد الأقصى 5MB)");
      return;
    }
    setLoading(true);

    // توليد مسار فريد للصورة
    const ext = file.name.split(".").pop();
    const filePath = `${userId}/${bucket}_${Date.now()}.${ext}`;

    // ارفع للصندوق المطلوب
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert("حدث خطأ أثناء رفع الصورة");
      setLoading(false);
      return;
    }

    // احصل على الرابط العلني
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    if (data.publicUrl) {
      onChange(data.publicUrl); // حدّث رابط الصورة في الأعلى
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        className="hidden"
        onChange={handleFileChange}
        disabled={loading}
      />
      <div 
        className={`relative ${rounded ? "rounded-full" : "rounded-lg"} overflow-hidden border ${bucket === "covers" ? "w-full h-32 md:h-40" : "w-24 h-24"} bg-gray-200 flex items-center justify-center`}
        style={bucket === "covers" ? {width: "100%"} : {}}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt="profile/cover"
            className={`object-cover w-full h-full ${rounded ? "rounded-full" : "rounded-lg"}`}
          />
        ) : (
          <div className="text-gray-400">
            <UploadCloud className="w-10 h-10 mx-auto" />
          </div>
        )}
        {loading && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
            <Loader2 className="animate-spin w-8 h-8 text-pink-700" />
          </div>
        )}
      </div>
      <Button
        type="button"
        size="sm"
        className="mt-0"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        variant="outline"
      >
        {label}
      </Button>
    </div>
  );
};

export default ProfileImageUploader;
