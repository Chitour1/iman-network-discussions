
import ForumLayout from "@/components/forum/ForumLayout";
import { useAuth } from "@/hooks/useAuth";
import AdminGeneralSettings from "@/components/admin/AdminGeneralSettings";

const AdminSettings = () => {
  const { session } = useAuth();

  return (
    <ForumLayout session={session}>
      <div className="max-w-3xl mx-auto py-8">
        <AdminGeneralSettings />
      </div>
    </ForumLayout>
  );
};

export default AdminSettings;
