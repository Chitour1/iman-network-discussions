
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Plus } from "lucide-react";
import TopicListItem from "./TopicListItem";
import { Topic } from "@/types/forum";

interface TopicListProps {
  topics: Topic[];
  onTopicClick: (slug: string) => void;
  onCreateTopic: () => void;
}

const TopicList = ({ topics, onTopicClick, onCreateTopic }: TopicListProps) => {
  if (topics.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">لا توجد مواضيع حالياً</h3>
          <p className="text-gray-500 mb-4">كن أول من يبدأ النقاش في المنتدى</p>
          <Button onClick={onCreateTopic} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 ml-2" />
            أضف موضوع جديد
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {topics.map(topic => (
        <TopicListItem key={topic.id} topic={topic} onTopicClick={onTopicClick} />
      ))}
    </div>
  );
};

export default TopicList;
