
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ForumWelcome = () => (
  <Card className="bg-transparent shadow-none border-none p-0">
    <CardHeader className="p-0 pb-2">
      <CardTitle className="text-green-800">أهلاً وسهلاً بك في شبكة الساحات</CardTitle>
    </CardHeader>
    <CardContent className="p-0">
      <p className="text-green-700">نرحب بك في شبكة الساحات للنقاش الإسلامي الحر. هنا يمكنك المشاركة في النقاشات العلمية الهادفة، وتبادل المعرفة والخبرات في بيئة إسلامية حرة ومحترمة.</p>
    </CardContent>
  </Card>
);

export default ForumWelcome;
