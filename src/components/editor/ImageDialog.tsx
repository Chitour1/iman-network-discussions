
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>إدراج صورة من رابط خارجي</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="imageUrl">رابط الصورة *</Label>
            <Input
              id="imageUrl"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="https://example.com/image.jpg"
              dir="ltr"
            />
          </div>
          <div>
            <Label htmlFor="altText">نص بديل (وصف الصورة)</Label>
            <Input
              id="altText"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="وصف مختصر للصورة"
            />
          </div>
          {url && (
            <div>
              <Label>معاينة الصورة:</Label>
              <div className="mt-2 border rounded-lg p-2">
                <img 
                  src={url} 
                  alt={alt || "معاينة"} 
                  className="max-w-full h-32 mx-auto object-contain rounded"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtrYp9mN2LHYqSDYutmK2LEg2LXYp9mE2K3YqTwvdGV4dD48L3N2Zz4=';
                  }}
                />
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={!url}>
              إدراج الصورة
            </Button>
            <Button variant="outline" onClick={onClose}>
              إلغاء
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageDialog;
