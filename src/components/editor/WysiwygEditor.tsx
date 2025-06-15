
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
import LinkDialog from './LinkDialog';
import ImageDialog from './ImageDialog';
import VideoDialog from './VideoDialog';
import TableDialog from './TableDialog';

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

  // Custom toolbar modules
  const modules = useMemo(() => ({
    toolbar: {
      container: '#toolbar',
      handlers: {
        emoji: () => setShowEmojiPicker(!showEmojiPicker),
        preview: () => onPreview?.(),
        insertLink: () => handleInsertLink(),
        insertImage: () => handleInsertImage(),
        insertVideo: () => handleInsertVideo(),
        insertTable: () => handleInsertTable(),
        toggleHtml: () => setShowHtmlView(!showHtmlView)
      }
    },
    clipboard: {
      matchVisual: false
    }
  }), [showEmojiPicker, showHtmlView, onPreview]);

  const formats = [
    'header', 'font', 'size', 'color', 'background',
    'bold', 'italic', 'underline', 'strike',
    'align', 'direction',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'blockquote', 'code-block', 'code',
    'table'
  ];

  const handleInsertLink = () => {
    const url = prompt('أدخل رابط الصفحة:');
    const text = prompt('أدخل نص الرابط:') || url;
    if (url && quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      if (range) {
        quill.insertText(range.index, text || url);
        quill.formatText(range.index, text?.length || url.length, 'link', url);
      }
    }
  };

  const handleInsertImage = () => {
    const url = prompt('أدخل رابط الصورة:');
    if (url && quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      if (range) {
        quill.insertEmbed(range.index, 'image', url);
      }
    }
  };

  const handleInsertVideo = () => {
    const url = prompt('أدخل رابط الفيديو (YouTube/Vimeo):');
    if (url && quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      if (range) {
        // Convert YouTube URL to embed format
        let embedUrl = url;
        if (url.includes('youtube.com/watch?v=')) {
          const videoId = url.split('v=')[1]?.split('&')[0];
          embedUrl = `https://www.youtube.com/embed/${videoId}`;
        } else if (url.includes('youtu.be/')) {
          const videoId = url.split('youtu.be/')[1]?.split('?')[0];
          embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }
        quill.insertEmbed(range.index, 'video', embedUrl);
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

  return (
    <div className="border rounded-lg bg-white" dir="rtl">
      {/* Custom Toolbar */}
      <div id="toolbar" className="border-b p-2">
        <div className="flex flex-wrap gap-1 items-center">
          {/* Text Formatting */}
          <div className="flex gap-1">
            <button className="ql-bold" title="غامق">
              <Bold className="w-4 h-4" />
            </button>
            <button className="ql-italic" title="مائل">
              <Italic className="w-4 h-4" />
            </button>
            <button className="ql-underline" title="تحته خط">
              <Underline className="w-4 h-4" />
            </button>
            <button className="ql-strike" title="يتوسطه خط">
              <Strikethrough className="w-4 h-4" />
            </button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Font and Size */}
          <select className="ql-font" title="نوع الخط">
            <option value="">افتراضي</option>
            <option value="serif">Serif</option>
            <option value="monospace">Monospace</option>
          </select>
          
          <select className="ql-size" title="حجم الخط">
            <option value="small">صغير</option>
            <option value="">عادي</option>
            <option value="large">كبير</option>
            <option value="huge">كبير جداً</option>
          </select>

          <Separator orientation="vertical" className="h-6" />

          {/* Colors */}
          <select className="ql-color" title="لون النص"></select>
          <select className="ql-background" title="لون الخلفية"></select>

          <Separator orientation="vertical" className="h-6" />

          {/* Alignment */}
          <div className="flex gap-1">
            <button className="ql-align" value="" title="محاذاة لليسار">
              <AlignLeft className="w-4 h-4" />
            </button>
            <button className="ql-align" value="center" title="توسيط">
              <AlignCenter className="w-4 h-4" />
            </button>
            <button className="ql-align" value="right" title="محاذاة لليمين">
              <AlignRight className="w-4 h-4" />
            </button>
            <button className="ql-align" value="justify" title="ضبط النص">
              <AlignJustify className="w-4 h-4" />
            </button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Lists */}
          <div className="flex gap-1">
            <button className="ql-list" value="ordered" title="قائمة مرقمة">
              <ListOrdered className="w-4 h-4" />
            </button>
            <button className="ql-list" value="bullet" title="قائمة نقطية">
              <List className="w-4 h-4" />
            </button>
          </div>

          <button className="ql-indent" value="-1" title="تقليل المسافة البادئة">«</button>
          <button className="ql-indent" value="+1" title="زيادة المسافة البادئة">»</button>

          <Separator orientation="vertical" className="h-6" />

          {/* Insert Tools */}
          <div className="flex gap-1">
            <button onClick={handleInsertLink} title="إدراج رابط">
              <Link className="w-4 h-4" />
            </button>
            <button onClick={handleInsertImage} title="إدراج صورة">
              <Image className="w-4 h-4" />
            </button>
            <button onClick={handleInsertVideo} title="إدراج فيديو">
              <Video className="w-4 h-4" />
            </button>
            <button className="ql-blockquote" title="اقتباس">
              <Quote className="w-4 h-4" />
            </button>
            <button className="ql-code-block" title="كود برمجي">
              <Code className="w-4 h-4" />
            </button>
            <button onClick={handleInsertTable} title="إدراج جدول">
              <span className="text-xs">📊</span>
            </button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Emoji */}
          <div className="relative">
            <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} title="رموز تعبيرية">
              <Smile className="w-4 h-4" />
            </button>
            {showEmojiPicker && (
              <div className="absolute top-full left-0 z-50 mt-1">
                <EmojiPicker onEmojiSelect={handleEmojiSelect} />
              </div>
            )}
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Undo/Redo */}
          <div className="flex gap-1">
            <button className="ql-undo" title="تراجع">
              <Undo className="w-4 h-4" />
            </button>
            <button className="ql-redo" title="إعادة">
              <Redo className="w-4 h-4" />
            </button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* View Options */}
          <div className="flex gap-1">
            <button onClick={() => setShowHtmlView(!showHtmlView)} title="عرض HTML">
              <Code className="w-4 h-4" />
            </button>
            {onPreview && (
              <button onClick={onPreview} title="معاينة">
                <Eye className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Direction */}
          <Separator orientation="vertical" className="h-6" />
          <button className="ql-direction" value="rtl" title="من اليمين لليسار">RTL</button>
          <button className="ql-direction" value="ltr" title="من اليسار لليمين">LTR</button>

          {/* Remove Formatting */}
          <button className="ql-clean" title="محو التنسيق">🧽</button>
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
            style={{ direction: 'rtl' }}
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
    </div>
  );
};

export default WysiwygEditor;
