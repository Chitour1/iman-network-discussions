
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { Topic } from "@/types/forum";

interface LatestTopicsProps {
  topics: Topic[];
  onTopicClick: (slug: string) => void;
}

const LatestTopics = ({ topics, onTopicClick }: LatestTopicsProps) => {
  if (topics.length === 0) return null;

  return (
    <div className="mb-8">
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-100">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex gap-2 items-center">
            <MessageSquare className="w-5 h-5 text-green-600" />
            آخر المواضيع
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Carousel>
            <CarouselContent>
              {topics.map(topic => (
                <CarouselItem key={topic.id} className="basis-1/2 p-2">
                  <div onClick={() => onTopicClick(topic.slug)} className="cursor-pointer bg-white hover:bg-green-50 border border-green-100 rounded-lg p-4 flex gap-3 items-center transition">
                    <Avatar className="w-9 h-9 shrink-0">
                      <AvatarImage src={topic.profiles?.avatar_url ?? undefined} />
                      <AvatarFallback>
                        {topic.profiles?.display_name?.slice(0, 2) ?? "؟؟"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 text-base line-clamp-1">
                        {topic.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(topic.created_at), {
                          addSuffix: true,
                          locale: ar
                        })}
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </CardContent>
      </Card>
    </div>
  );
};

export default LatestTopics;
