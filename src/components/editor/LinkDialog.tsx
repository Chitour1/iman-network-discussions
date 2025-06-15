
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface LinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (url: string, text: string, newTab: boolean) => void;
}

const LinkDialog = ({ isOpen, onClose, onInsert }: LinkDialogProps) => {
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [newTab, setNewTab] = useState(true);

  const handleSubmit = () => {
    if (url) {
      onInsert(url, text || url, newTab);
      setUrl('');
      setText('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>إدراج رابط</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="url">رابط الصفحة *</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              dir="ltr"
            />
          </div>
          <div>
            <Label htmlFor="text">نص الرابط</Label>
            <Input
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="اتركه فارغاً لاستخدام الرابط"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="newTab"
              checked={newTab}
              onCheckedChange={setNewTab}
            />
            <Label htmlFor="newTab">فتح في نافذة جديدة</Label>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={!url}>
              إدراج
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

export default LinkDialog;
