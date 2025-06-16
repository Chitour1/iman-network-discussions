
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

  useEffect(() => {
    fetchNewsItems();
  }, []);

  const fetchNewsItems = async () => {
    try {
      // البحث عن قسم الأخبار
      const { data: newsCategory } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', 'news')
        .single();

      if (newsCategory) {
        const { data: topics } = await supabase
          .from('topics')
          .select('id, title, slug, created_at')
          .eq('category_id', newsCategory.id)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(10);

        if (topics) {
          setNewsItems(topics);
        }
      }
    } catch (error) {
      console.error('Error fetching news items:', error);
    }
  };

  if (newsItems.length === 0) return null;

  return (
    <div className="mb-8 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg overflow-hidden shadow-lg">
      <div className="flex items-center px-4 py-2 bg-red-800">
        <Newspaper className="w-5 h-5 ml-2" />
        <span className="font-bold text-sm">أخبار عاجلة</span>
      </div>
      <div className="relative overflow-hidden h-12 flex items-center">
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
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default NewsTicker;
