
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface VideoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (embedUrl: string) => void;
}

const VideoDialog = ({ isOpen, onClose, onInsert }: VideoDialogProps) => {
  const [url, setUrl] = useState('');

  const convertToEmbedUrl = (url: string): string => {
    // YouTube
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Vimeo
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    
    return url;
  };

  const handleSubmit = () => {
    if (url) {
      const embedUrl = convertToEmbedUrl(url);
      onInsert(embedUrl);
      setUrl('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>إدراج فيديو</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="videoUrl">رابط الفيديو *</Label>
            <Input
              id="videoUrl"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              dir="ltr"
            />
            <p className="text-sm text-gray-500 mt-1">
              يدعم YouTube و Vimeo
            </p>
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

export default VideoDialog;
