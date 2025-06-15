
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ImageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (url: string, alt: string) => void;
}

const ImageDialog = ({ isOpen, onClose, onInsert }: ImageDialogProps) => {
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');

  const handleSubmit = () => {
    if (url) {
      onInsert(url, alt);
      setUrl('');
      setAlt('');
      onClose();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          // Convert to base64 for demo purposes
          const reader = new FileReader();
          reader.onload = (event) => {
            const result = event.target?.result as string;
            setUrl(result);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>إدراج صورة</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="url" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url">من رابط</TabsTrigger>
            <TabsTrigger value="paste">لصق</TabsTrigger>
          </TabsList>
          
          <TabsContent value="url" className="space-y-4">
            <div>
              <Label htmlFor="imageUrl">رابط الصورة *</Label>
              <Input
                id="imageUrl"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                dir="ltr"
              />
            </div>
            <div>
              <Label htmlFor="altText">نص بديل</Label>
              <Input
                id="altText"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                placeholder="وصف الصورة"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="paste" className="space-y-4">
            <div>
              <Label>الصق صورة هنا</Label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
                onPaste={handlePaste}
                tabIndex={0}
              >
                <p className="text-gray-500">اضغط Ctrl+V للصق صورة من الحافظة</p>
                {url && (
                  <img src={url} alt="معاينة" className="mt-4 max-w-full h-32 mx-auto object-contain" />
                )}
              </div>
            </div>
            {url && (
              <div>
                <Label htmlFor="pasteAlt">نص بديل</Label>
                <Input
                  id="pasteAlt"
                  value={alt}
                  onChange={(e) => setAlt(e.target.value)}
                  placeholder="وصف الصورة"
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={!url}>
            إدراج
          </Button>
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageDialog;
