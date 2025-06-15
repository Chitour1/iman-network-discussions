
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

const EmojiPicker = ({ onEmojiSelect }: EmojiPickerProps) => {
  const emojis = {
    smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'],
    gestures: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐', '✋', '🖖', '👏', '🙌', '🤲', '🤝', '🙏'],
    hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'],
    objects: ['📱', '💻', '⌨️', '🖥', '🖨', '🖱', '🖲', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽', '🎞', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙', '🎚', '🎛'],
    flags: ['🏁', '🚩', '🎌', '🏴', '🏳️', '🏳️‍🌈', '🏳️‍⚧️', '🏴‍☠️', '🇦🇪', '🇸🇦', '🇪🇬', '🇮🇶', '🇯🇴', '🇰🇼', '🇱🇧', '🇱🇾', '🇲🇦', '🇴🇲', '🇵🇸', '🇶🇦', '🇸🇾', '🇹🇳', '🇾🇪']
  };

  return (
    <Card className="w-80 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">اختر رمز تعبيري</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="smileys" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="smileys" className="text-xs">😊</TabsTrigger>
            <TabsTrigger value="gestures" className="text-xs">👋</TabsTrigger>
            <TabsTrigger value="hearts" className="text-xs">❤️</TabsTrigger>
            <TabsTrigger value="objects" className="text-xs">📱</TabsTrigger>
            <TabsTrigger value="flags" className="text-xs">🏁</TabsTrigger>
          </TabsList>
          
          {Object.entries(emojis).map(([category, emojiList]) => (
            <TabsContent key={category} value={category} className="mt-2">
              <div className="grid grid-cols-8 gap-1 max-h-32 overflow-y-auto">
                {emojiList.map((emoji, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-gray-100"
                    onClick={() => onEmojiSelect(emoji)}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EmojiPicker;
