
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Eye, ThumbsUp, Pin, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { getContentPreview } from "@/utils/textUtils";
import { Topic } from "@/types/forum";

interface TopicListItemProps {
  topic: Topic;
  onTopicClick: (slug: string) => void;
}

const TopicListItem = ({ topic, onTopicClick }: TopicListItemProps) => (
  <Card key={topic.id} className="hover:shadow-md transition-shadow">
    <CardContent className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {topic.is_pinned && <Pin className="w-4 h-4 text-green-600" />}
            {topic.categories && (
              <Badge
                variant="secondary"
                className="text-xs"
                style={{
                  backgroundColor: `${topic.categories.color}20`,
                  color: topic.categories.color,
                }}
              >
                {topic.categories.name}
              </Badge>
            )}
          </div>
          
          <h3
            className="text-lg font-semibold text-gray-800 mb-2 hover:text-green-600 cursor-pointer"
            onClick={() => onTopicClick(topic.slug)}
          >
            {topic.title}
          </h3>
          
          <p className="text-gray-600 mb-3 line-clamp-2">
            {getContentPreview(topic.content, 150)}
          </p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={topic.profiles?.avatar_url || undefined} />
                <AvatarFallback className="bg-green-100 text-green-700 text-xs">
                  {topic.profiles?.display_name?.slice(0, 2) || "؟؟"}
                </AvatarFallback>
              </Avatar>
              <span>{topic.profiles?.display_name || "مستخدم مجهول"}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>
                {formatDistanceToNow(new Date(topic.created_at), {
                  addSuffix: true,
                  locale: ar,
                })}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-2 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{topic.view_count}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            <span>{topic.reply_count}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <ThumbsUp className="w-4 h-4" />
            <span>{topic.like_count}</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default TopicListItem;
