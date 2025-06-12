
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import CreateTopicForm from "@/components/forum/CreateTopicForm";
import { useSearchParams } from "react-router-dom";

interface Category {
  id: string;
  name: string;
}

const CreateTopic = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get('category');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const selectedCategoryId = categorySlug 
    ? categories.find(cat => cat.name === categorySlug)?.id 
    : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50" dir="rtl">
      <CreateTopicForm 
        categories={categories} 
        selectedCategoryId={selectedCategoryId}
      />
    </div>
  );
};

export default CreateTopic;
