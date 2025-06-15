import { useState, useRef, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Send,
  Type,
  Palette,
  Indent,
  Outdent,
  Minus,
  Hash,
  Settings,
  Eraser,
  Table,
  Subscript,
  Superscript,
  Copyright,
  Shield,
  ArrowRight,
  ArrowLeft,
  PlayCircle,
  Music,
  FileText
} from 'lucide-react';
import EmojiPicker from './EmojiPicker';
import ImageDialog from './ImageDialog';
import LinkDialog from './LinkDialog';
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
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [showTableDialog, setShowTableDialog] = useState(false);

  // ReactQuill modules with proper RTL and Arabic support + video embedding
  const modules = useMemo(() => ({
    toolbar: false, // We'll use custom toolbar
    clipboard: {
      matchVisual: false
    },
    history: {
      delay: 1000,
      maxStack: 50,
      userOnly: false
    }
  }), []);

  const formats = [
    'header', 'font', 'size', 'color', 'background',
    'bold', 'italic', 'underline', 'strike',
    'align', 'direction',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'blockquote', 'code-block', 'code',
    'script', 'clean'
  ];

  const getQuill = () => quillRef.current?.getEditor();

  const handleFormat = (format: string, value?: any) => {
    const quill = getQuill();
    if (quill) {
      if (value === undefined) {
        const currentFormat = quill.getFormat();
        quill.format(format, !currentFormat[format]);
      } else {
        quill.format(format, value);
      }
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    const quill = getQuill();
    if (quill) {
      const range = quill.getSelection();
      if (range) {
        quill.insertText(range.index, emoji);
      }
    }
    setShowEmojiPicker(false);
  };

  const handleImageInsert = (url: string, alt: string) => {
    const quill = getQuill();
    if (quill) {
      const range = quill.getSelection(true) || { index: quill.getLength(), length: 0 };
      // ندرج الصورة كعنصر HTML img بدلاً من insertEmbed فقط
      const html = `<p style="text-align:center;"><img src="${url}" alt="${alt || 'صورة'}" style="max-width:100%;display:inline-block;" /></p>`;
      quill.clipboard.dangerouslyPasteHTML(range.index, html, 'user');
      quill.setSelection(range.index + 1, 0, "user");
      console.log("[WYSIWYG] Image inserted:", { url, alt }); // للمساعدة في تعقب الأخطاء
    }
  };

  const handleLinkInsert = (url: string, text: string, newTab: boolean) => {
    const quill = getQuill();
    if (quill) {
      const range = quill.getSelection();
      if (range) {
        if (text) {
          quill.insertText(range.index, text);
          quill.setSelection(range.index, text.length);
        }
        quill.format('link', url);
      }
    }
  };

  const handleVideoInsert = (embedUrl: string) => {
    const quill = getQuill();
    if (quill) {
      const range = quill.getSelection();
      if (range) {
        // Insert video as iframe HTML for better display
        const videoHtml = `<iframe src="${embedUrl}" width="560" height="315" frameborder="0" allowfullscreen style="max-width: 100%; height: 315px;"></iframe>`;
        const delta = quill.clipboard.convert({ html: videoHtml });
        quill.updateContents(delta, 'user');
        quill.setSelection(range.index + 1);
      }
    }
  };

  const handleTableInsert = (rows: number, cols: number) => {
    const quill = getQuill();
    if (quill) {
      const range = quill.getSelection();
      if (range) {
        let tableHtml = '<table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0;">';
        for (let i = 0; i < rows; i++) {
          tableHtml += '<tr>';
          for (let j = 0; j < cols; j++) {
            tableHtml += '<td style="padding: 8px; border: 1px solid #ddd; min-width: 100px;">خلية</td>';
          }
          tableHtml += '</tr>';
        }
        tableHtml += '</table>';
        
        const delta = quill.clipboard.convert({ html: tableHtml });
        quill.updateContents(delta, 'user');
      }
    }
  };

  const handleUndo = () => {
    const quill = getQuill();
    if (quill && quill.history) {
      quill.history.undo();
    }
  };

  const handleRedo = () => {
    const quill = getQuill();
    if (quill && quill.history) {
      quill.history.redo();
    }
  };

  const handleRemoveFormatting = () => {
    const quill = getQuill();
    if (quill) {
      const range = quill.getSelection();
      if (range && range.length > 0) {
        quill.removeFormat(range.index, range.length);
      }
    }
  };

  const insertHorizontalRule = () => {
    const quill = getQuill();
    if (quill) {
      const range = quill.getSelection();
      if (range) {
        const delta = quill.clipboard.convert({ html: '<hr style="margin: 10px 0;">' });
        quill.updateContents(delta, 'user');
      }
    }
  };

  const insertSpecialChar = (char: string) => {
    const quill = getQuill();
    if (quill) {
      const range = quill.getSelection();
      if (range) {
        quill.insertText(range.index, char);
      }
    }
  };

  const handleFontChange = (font: string) => {
    handleFormat('font', font);
  };

  const handleSizeChange = (size: string) => {
    handleFormat('size', size);
  };

  const handleColorChange = (color: string) => {
    handleFormat('color', color);
  };

  const handleBackgroundChange = (color: string) => {
    handleFormat('background', color);
  };

  const handleHeaderChange = (level: string) => {
    if (level === 'normal') {
      handleFormat('header', false);
    } else {
      handleFormat('header', parseInt(level));
    }
  };

  return (
    <div className="border rounded-lg bg-white" dir="rtl">
      {/* Custom Toolbar */}
      <div className="border-b p-3 bg-gray-50">
        <div className="space-y-3">
          
          {/* Row 1: Headers and Basic Text Formatting */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Headers */}
            <Select onValueChange={handleHeaderChange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="العنوان" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">نص عادي</SelectItem>
                <SelectItem value="1">عنوان كبير</SelectItem>
                <SelectItem value="2">عنوان متوسط</SelectItem>
                <SelectItem value="3">عنوان صغير</SelectItem>
              </SelectContent>
            </Select>

            <Separator orientation="vertical" className="h-6" />

            {/* Basic Formatting */}
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFormat('bold')}
                title="غامق (Ctrl+B)"
              >
                <Bold className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFormat('italic')}
                title="مائل (Ctrl+I)"
              >
                <Italic className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFormat('underline')}
                title="تحته خط (Ctrl+U)"
              >
                <Underline className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFormat('strike')}
                title="يتوسطه خط"
              >
                <Strikethrough className="w-4 h-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Super/Subscript */}
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFormat('script', 'super')}
                title="نص مرتفع"
              >
                <Superscript className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFormat('script', 'sub')}
                title="نص منخفض"
              >
                <Subscript className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Row 2: Font and Colors */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Font Selection */}
            <Select onValueChange={handleFontChange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="نوع الخط" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Arial">Arial</SelectItem>
                <SelectItem value="Tahoma">Tahoma</SelectItem>
                <SelectItem value="Times">Times</SelectItem>
                <SelectItem value="Helvetica">Helvetica</SelectItem>
                <SelectItem value="Georgia">Georgia</SelectItem>
                <SelectItem value="Courier">Courier</SelectItem>
              </SelectContent>
            </Select>

            {/* Font Size */}
            <Select onValueChange={handleSizeChange}>
              <SelectTrigger className="w-24">
                <SelectValue placeholder="الحجم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">صغير</SelectItem>
                <SelectItem value="normal">عادي</SelectItem>
                <SelectItem value="large">كبير</SelectItem>
                <SelectItem value="huge">كبير جداً</SelectItem>
              </SelectContent>
            </Select>

            <Separator orientation="vertical" className="h-6" />

            {/* Text Colors */}
            <input
              type="color"
              title="لون النص"
              className="w-8 h-8 border rounded cursor-pointer"
              onChange={(e) => handleColorChange(e.target.value)}
            />
            <input
              type="color"
              title="لون الخلفية"
              className="w-8 h-8 border rounded cursor-pointer"
              onChange={(e) => handleBackgroundChange(e.target.value)}
            />
          </div>

          {/* Row 3: Alignment and Direction */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Alignment */}
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFormat('align', 'right')}
                title="محاذاة لليمين"
              >
                <AlignRight className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFormat('align', 'center')}
                title="توسيط"
              >
                <AlignCenter className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFormat('align', 'left')}
                title="محاذاة لليسار"
              >
                <AlignLeft className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFormat('align', 'justify')}
                title="ضبط النص"
              >
                <AlignJustify className="w-4 h-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Direction */}
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFormat('direction', 'rtl')}
                title="من اليمين لليسار"
              >
                RTL
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFormat('direction', 'ltr')}
                title="من اليسار لليمين"
              >
                LTR
              </Button>
            </div>
          </div>

          {/* Row 4: Lists and Indentation */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Lists */}
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFormat('list', 'ordered')}
                title="قائمة مرقمة"
              >
                <ListOrdered className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFormat('list', 'bullet')}
                title="قائمة نقطية"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Indentation */}
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFormat('indent', '+1')}
                title="زيادة المسافة البادئة"
              >
                <Indent className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFormat('indent', '-1')}
                title="تقليل المسافة البادئة"
              >
                <Outdent className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Row 5: Insert Media and Links */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Insert Tools */}
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowLinkDialog(true)}
                title="إدراج رابط (Ctrl+K)"
              >
                <Link className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowImageDialog(true)}
                title="إدراج صورة من رابط"
              >
                <Image className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowVideoDialog(true)}
                title="إدراج فيديو مضمن"
              >
                <Video className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowTableDialog(true)}
                title="إدراج جدول"
              >
                <Table className="w-4 h-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Special Content */}
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFormat('blockquote')}
                title="اقتباس"
              >
                <Quote className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFormat('code-block')}
                title="كود برمجي"
              >
                <Code className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={insertHorizontalRule}
                title="خط فاصل أفقي"
              >
                <Minus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Row 6: Special Characters and Emojis */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Special Characters */}
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => insertSpecialChar('©')}
                title="رمز حقوق الطبع"
              >
                <Copyright className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => insertSpecialChar('™')}
                title="رمز العلامة التجارية"
              >
                <Shield className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => insertSpecialChar('←')}
                title="سهم يسار"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => insertSpecialChar('→')}
                title="سهم يمين"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Emoji and Special Characters */}
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
          </div>

          {/* Row 7: History and Cleanup */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* History */}
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={handleUndo}
                title="تراجع (Ctrl+Z)"
              >
                <Undo className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRedo}
                title="إعادة (Ctrl+Y)"
              >
                <Redo className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRemoveFormatting}
                title="محو التنسيق"
              >
                <Eraser className="w-4 h-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* View Options */}
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowHtmlView(!showHtmlView)}
                title={showHtmlView ? "عرض المحرر المرئي" : "عرض HTML"}
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
      </div>

      {/* Editor Content */}
      <div className="min-h-[400px]">
        {showHtmlView ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-[400px] p-4 font-mono text-sm border-0 resize-none focus:outline-none"
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
            className="h-[400px] rtl-editor [&_.ql-editor]:text-right [&_.ql-editor]:dir-rtl [&_.ql-editor]:font-arabic [&_.ql-editor_img]:max-w-full [&_.ql-editor_iframe]:max-w-full"
            style={{ 
              direction: 'rtl',
              fontFamily: 'Arial, sans-serif',
              textAlign: 'right'
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
            <span>عدد الأحرف: {value.replace(/<[^>]*>/g, '').length}</span>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <ImageDialog
        isOpen={showImageDialog}
        onClose={() => setShowImageDialog(false)}
        onInsert={handleImageInsert}
      />

      <LinkDialog
        isOpen={showLinkDialog}
        onClose={() => setShowLinkDialog(false)}
        onInsert={handleLinkInsert}
      />

      <VideoDialog
        isOpen={showVideoDialog}
        onClose={() => setShowVideoDialog(false)}
        onInsert={handleVideoInsert}
      />

      <TableDialog
        isOpen={showTableDialog}
        onClose={() => setShowTableDialog(false)}
        onInsert={handleTableInsert}
      />
    </div>
  );
};

export default WysiwygEditor;
