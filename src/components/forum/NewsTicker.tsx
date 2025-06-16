
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Newspaper } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  created_at: string;
}

const NewsTicker = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNewsItems();
  }, []);

  const fetchNewsItems = async () => {
    try {
      console.log("جاري جلب الأخبار...");
      
      // البحث عن قسم الأخبار
      const { data: newsCategory, error: categoryError } = await supabase
        .from('categories')
        .select('id, name')
        .eq('slug', 'news')
        .single();

      console.log("قسم الأخبار:", newsCategory);
      console.log("خطأ في قسم الأخبار:", categoryError);

      if (newsCategory) {
        const { data: topics, error: topicsError } = await supabase
          .from('topics')
          .select('id, title, slug, created_at')
          .eq('category_id', newsCategory.id)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(10);

        console.log("مواضيع الأخبار:", topics);
        console.log("خطأ في المواضيع:", topicsError);

        if (topics && topics.length > 0) {
          setNewsItems(topics);
        }
      } else {
        console.log("قسم الأخبار غير موجود، سيتم إنشاؤه...");
        // إنشاء قسم الأخبار إذا لم يكن موجوداً
        const { data: newCategory, error: createError } = await supabase
          .from('categories')
          .insert({
            name: 'الأخبار',
            slug: 'news',
            description: 'قسم الأخبار والمستجدات',
            color: '#DC2626',
            icon: 'Newspaper',
            is_active: true,
            sort_order: 1
          })
          .select()
          .single();

        console.log("تم إنشاء قسم الأخبار:", newCategory);
        if (createError) {
          console.error("خطأ في إنشاء قسم الأخبار:", createError);
        }
      }
    } catch (error) {
      console.error('خطأ في جلب الأخبار:', error);
    } finally {
      setLoading(false);
    }
  };

  // عرض شريط الأخبار حتى لو لم تكن هناك أخبار
  return (
    <div className="mb-8 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg overflow-hidden shadow-lg">
      <div className="flex items-center px-4 py-2 bg-red-800">
        <Newspaper className="w-5 h-5 ml-2" />
        <span className="font-bold text-sm">أخبار عاجلة</span>
      </div>
      <div className="relative overflow-hidden h-12 flex items-center">
        {loading ? (
          <div className="px-8 text-sm">جاري تحميل الأخبار...</div>
        ) : newsItems.length > 0 ? (
          <div className="animate-marquee whitespace-nowrap flex items-center">
            {newsItems.map((item, index) => (
              <span key={item.id} className="inline-flex items-center">
                <a
                  href={`/topic/${item.slug}`}
                  className="hover:underline font-medium text-sm px-8"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = `/topic/${item.slug}`;
                  }}
                >
                  {item.title}
                </a>
                {index < newsItems.length - 1 && (
                  <span className="text-red-200 mx-4">•</span>
                )}
              </span>
            ))}
          </div>
        ) : (
          <div className="px-8 text-sm">لا توجد أخبار حالياً - يمكنك إضافة مواضيع في قسم الأخبار</div>
        )}
      </div>
    </div>
  );
};

export default NewsTicker;
