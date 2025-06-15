
import React from "react";
import { 
  Home, 
  BookOpen, 
  Users, 
  MessageSquare, 
  Star,
  TrendingUp,
  Calendar,
  Settings,
  Shield,
  Heart,
  Megaphone,
  UserPlus
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  topic_count: number;
}

const iconMap: { [key: string]: any } = {
  Home,
  BookOpen,
  Shield,
  Heart,
  Star,
  Megaphone,
  Users,
  MessageSquare,
  UserPlus,
  TrendingUp,
  Calendar,
  Settings
};

type Props = {
  categories: Category[];
};

const ForumCategoriesGrid: React.FC<Props> = ({ categories }) => {
  const navigate = useNavigate();

  return (
    <div className="my-8">
      <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
        <Star className="w-5 h-5 text-yellow-500" />
        أقسام المنتدى
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const Icon = iconMap[cat.icon] || MessageSquare;
          return (
            <div
              key={cat.id}
              className="bg-white rounded-lg border shadow-sm p-4 flex items-start gap-4 hover:shadow-md transition cursor-pointer group"
              onClick={() => navigate(`/category/${cat.slug}`)}
            >
              <div
                className="rounded-full p-2 bg-gradient-to-br from-gray-50 to-gray-100 border"
                style={{ color: cat.color }}
              >
                <Icon className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <h3 className="font-semibold text-gray-800 text-lg group-hover:text-green-600">{cat.name}</h3>
                  <span className="ml-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{cat.topic_count}</span>
                </div>
                <p className="text-gray-500 text-sm mt-1 line-clamp-2">{cat.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ForumCategoriesGrid;
