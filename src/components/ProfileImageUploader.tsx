
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, UploadCloud, Link } from "lucide-react";

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
  const [imageUrl, setImageUrl] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleUrlSubmit = () => {
    if (!imageUrl.trim()) return;
    
    setLoading(true);
    // التحقق من صحة الرابط
    const img = new Image();
    img.onload = () => {
      onChange(imageUrl);
      setImageUrl("");
      setDialogOpen(false);
      setLoading(false);
    };
    img.onerror = () => {
      alert("الرابط غير صحيح أو الصورة غير متاحة");
      setLoading(false);
    };
    img.src = imageUrl;
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div 
        className={`relative ${rounded ? "rounded-full" : "rounded-lg"} overflow-hidden border ${bucket === "covers" ? "w-full h-32 md:h-40" : "w-24 h-24"} bg-gray-200 flex items-center justify-center`}
        style={bucket === "covers" ? {width: "100%"} : {}}
      >
        {url ? (
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
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            size="sm"
            className="mt-0"
            disabled={loading}
            variant="outline"
          >
            <Link className="w-4 h-4 ml-2" />
            {label}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="imageUrl">رابط الصورة *</Label>
              <Input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                dir="ltr"
              />
            </div>
            {imageUrl && (
              <div>
                <Label>معاينة الصورة:</Label>
                <div className="mt-2 border rounded-lg p-2">
                  <img 
                    src={imageUrl} 
                    alt="معاينة" 
                    className="max-w-full h-32 mx-auto object-contain rounded"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtrYp9mN2LHYqSDYutmK2LEg2LXYp9mE2K3YqTwvdGV4dD48L3N2Zz4=';
                    }}
                  />
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUrlSubmit} disabled={!imageUrl.trim() || loading}>
                {loading ? <Loader2 className="animate-spin w-4 h-4 ml-2" /> : null}
                حفظ الصورة
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileImageUploader;
