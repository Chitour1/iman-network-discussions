
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ForumWelcome = () => (
  <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
    <CardHeader>
      <CardTitle className="text-green-800">أهلاً وسهلاً بك في شبكة الساحات</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-green-700">نرحب بك في شبكة الساحات للنقاش الإسلامي الحر. هنا يمكنك المشاركة في النقاشات العلمية الهادفة، وتبادل المعرفة والخبرات في بيئة إسلامية حرة ومحترمة.</p>
    </CardContent>
  </Card>
);

export default ForumWelcome;
