
import { useState, useRef, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link,
  Image,
  Video,
  Quote,
  Code,
  Smile,
  Undo,
  Redo,
  Eye,
  Save,
  Send
} from 'lucide-react';
import EmojiPicker from './EmojiPicker';
import ImageDialog from './ImageDialog';

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  onSaveDraft?: () => void;
  onPreview?: () => void;
  isSubmitting?: boolean;
  showSubmitButtons?: boolean;
}

const WysiwygEditor = ({
  value,
  onChange,
  placeholder = "اكتب محتواك هنا...",
  onSubmit,
  onSaveDraft,
  onPreview,
  isSubmitting = false,
  showSubmitButtons = true
}: WysiwygEditorProps) => {
  const quillRef = useRef<ReactQuill>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showHtmlView, setShowHtmlView] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);

  // ReactQuill modules with proper toolbar configuration
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link', 'image', 'video'],
      ['blockquote', 'code-block'],
      [{ 'direction': 'rtl' }],
      ['clean']
    ],
    clipboard: {
      matchVisual: false
    }
  }), []);

  const formats = [
    'header', 'font', 'size', 'color', 'background',
    'bold', 'italic', 'underline', 'strike',
    'align', 'direction',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'blockquote', 'code-block', 'code'
  ];

  const handleEmojiSelect = (emoji: string) => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      if (range) {
        quill.insertText(range.index, emoji);
      }
    }
    setShowEmojiPicker(false);
  };

  const handleImageInsert = (url: string, alt: string) => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      if (range) {
        quill.insertEmbed(range.index, 'image', url);
      }
    }
  };

  const handleInsertTable = () => {
    const rows = parseInt(prompt('عدد الصفوف:') || '2');
    const cols = parseInt(prompt('عدد الأعمدة:') || '2');
    
    if (rows && cols && quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      if (range) {
        let tableHtml = '<table border="1" style="border-collapse: collapse; width: 100%;">';
        for (let i = 0; i < rows; i++) {
          tableHtml += '<tr>';
          for (let j = 0; j < cols; j++) {
            tableHtml += '<td style="padding: 8px; border: 1px solid #ddd;">خلية</td>';
          }
          tableHtml += '</tr>';
        }
        tableHtml += '</table>';
        
        const delta = quill.clipboard.convert({ html: tableHtml });
        quill.updateContents(delta, 'user');
      }
    }
  };

  return (
    <div className="border rounded-lg bg-white" dir="rtl">
      {/* Custom Toolbar */}
      <div className="border-b p-2 bg-gray-50">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Text Formatting */}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const quill = quillRef.current?.getEditor();
                if (quill) {
                  quill.format('bold', !quill.getFormat().bold);
                }
              }}
              title="غامق"
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const quill = quillRef.current?.getEditor();
                if (quill) {
                  quill.format('italic', !quill.getFormat().italic);
                }
              }}
              title="مائل"
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const quill = quillRef.current?.getEditor();
                if (quill) {
                  quill.format('underline', !quill.getFormat().underline);
                }
              }}
              title="تحته خط"
            >
              <Underline className="w-4 h-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Alignment */}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const quill = quillRef.current?.getEditor();
                if (quill) {
                  quill.format('align', 'right');
                }
              }}
              title="محاذاة لليمين"
            >
              <AlignRight className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const quill = quillRef.current?.getEditor();
                if (quill) {
                  quill.format('align', 'center');
                }
              }}
              title="توسيط"
            >
              <AlignCenter className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const quill = quillRef.current?.getEditor();
                if (quill) {
                  quill.format('align', 'left');
                }
              }}
              title="محاذاة لليسار"
            >
              <AlignLeft className="w-4 h-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Lists */}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const quill = quillRef.current?.getEditor();
                if (quill) {
                  quill.format('list', 'ordered');
                }
              }}
              title="قائمة مرقمة"
            >
              <ListOrdered className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const quill = quillRef.current?.getEditor();
                if (quill) {
                  quill.format('list', 'bullet');
                }
              }}
              title="قائمة نقطية"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Insert Tools */}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowImageDialog(true)}
              title="إدراج صورة"
            >
              <Image className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const quill = quillRef.current?.getEditor();
                if (quill) {
                  quill.format('blockquote', !quill.getFormat().blockquote);
                }
              }}
              title="اقتباس"
            >
              <Quote className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleInsertTable}
              title="إدراج جدول"
            >
              <span className="text-xs">📊</span>
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Emoji */}
          <div className="relative">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              title="رموز تعبيرية"
            >
              <Smile className="w-4 h-4" />
            </Button>
            {showEmojiPicker && (
              <div className="absolute top-full left-0 z-50 mt-1">
                <EmojiPicker onEmojiSelect={handleEmojiSelect} />
              </div>
            )}
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* View Options */}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowHtmlView(!showHtmlView)}
              title="عرض HTML"
            >
              <Code className="w-4 h-4" />
            </Button>
            {onPreview && (
              <Button
                size="sm"
                variant="outline"
                onClick={onPreview}
                title="معاينة"
              >
                <Eye className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="min-h-[300px]">
        {showHtmlView ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-[300px] p-4 font-mono text-sm border-0 resize-none focus:outline-none"
            dir="ltr"
            placeholder="<p>اكتب HTML هنا...</p>"
          />
        ) : (
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            modules={modules}
            formats={formats}
            className="h-[300px]"
            style={{ 
              direction: 'rtl',
              fontFamily: 'Arial, sans-serif'
            }}
          />
        )}
      </div>

      {/* Submit Buttons */}
      {showSubmitButtons && (
        <div className="border-t p-4 flex gap-3 justify-between">
          <div className="flex gap-2">
            {onSubmit && (
              <Button 
                onClick={onSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  "جاري النشر..."
                ) : (
                  <>
                    <Send className="w-4 h-4 ml-2" />
                    نشر
                  </>
                )}
              </Button>
            )}
            {onSaveDraft && (
              <Button 
                onClick={onSaveDraft}
                variant="outline"
              >
                <Save className="w-4 h-4 ml-2" />
                حفظ كمسودة
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>عدد الكلمات: {value.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length}</span>
          </div>
        </div>
      )}

      {/* Image Dialog */}
      <ImageDialog
        isOpen={showImageDialog}
        onClose={() => setShowImageDialog(false)}
        onInsert={handleImageInsert}
      />
    </div>
  );
};

export default WysiwygEditor;
