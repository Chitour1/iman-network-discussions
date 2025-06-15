
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ForumStatsData, TopMember, LatestMember } from "@/types/forum";

interface ForumStatsProps {
  stats: ForumStatsData;
  topMembers: TopMember[];
  latestMember: LatestMember | null;
}

const ForumStats = ({ stats, topMembers, latestMember }: ForumStatsProps) => {
  const navigate = useNavigate();

  const handleMemberClick = (username: string) => {
    navigate(`/profile?u=${username}`);
  };

  return (
    <div className="mt-12">
      <div className="bg-white border rounded-lg shadow-sm p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* الكتلة الأساسية للإحصائيات */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">{stats.totalTopics}</div>
            <div className="text-sm text-gray-600">إجمالي المواضيع</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
            <div className="text-sm text-gray-600">إجمالي الأعضاء</div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-2 text-orange-600">
              <span className="text-2xl font-bold">{stats.onlineUsers}</span>
              <Users className="w-5 h-5" />
            </div>
            <div className="text-sm text-gray-600">المتصفحين الآن</div>
          </div>
        </div>
        {/* قائمة أبرز الأعضاء */}
        <div className="flex-1">
          <div className="mb-2 font-bold text-green-700 flex gap-2 items-center justify-center text-center">
            المتواجدون الآن
            <span className="bg-green-100 text-green-700 px-2 rounded text-xs">
              {stats.onlineUsers}
            </span>
          </div>
          <div className="text-sm flex flex-wrap justify-center gap-2">
            {topMembers && topMembers.length > 0 ? (
              topMembers.map((member) => (
                <button
                  key={member.id}
                  className="font-semibold underline rounded px-2 py-1 text-green-800 hover:text-green-600 focus:outline-none"
                  type="button"
                  onClick={() => handleMemberClick(member.username)}
                  title={'عدد مواضيعه: ' + (member.post_count || 0) + '، تقييمه: ' + (member.reputation_score || 0)}
                >
                  {member.display_name || 'عضو'}
                </button>
              ))
            ) : (
              <span className="text-gray-400">لا يوجد أعضاء بارزون حاليا</span>
            )}
          </div>
        </div>
        {/* أحدث عضو */}
        <div className="flex-1 mt-4 md:mt-0 md:text-left">
          <div className="text-sm text-blue-700">
            {latestMember && (
              <>
                نرحب بعضونا الجديد:
                <button
                  className="inline font-semibold underline ml-1 text-blue-900 hover:text-green-600 focus:outline-none"
                  type="button"
                  onClick={() => handleMemberClick(latestMember.username)}
                  title="عرض الملف الشخصي"
                >
                  {latestMember.display_name}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumStats;
