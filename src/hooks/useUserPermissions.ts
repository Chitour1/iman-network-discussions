
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { PermissionKey } from "@/hooks/useGroupPermissions";

export interface UserPermissions {
  delete_topic: boolean;
  update_topic: boolean;
  move_topic: boolean;
  hide_topic: boolean;
  pin_topic: boolean;
  feature_topic: boolean;
}

export const useUserPermissions = () => {
  const { user } = useAuth();
  const { data: profile } = useUserProfile(user?.id);

  return useQuery({
    queryKey: ["user-permissions", profile?.role],
    queryFn: async (): Promise<UserPermissions> => {
      if (!profile?.role) {
        return {
          delete_topic: false,
          update_topic: false,
          move_topic: false,
          hide_topic: false,
          pin_topic: false,
          feature_topic: false,
        };
      }

      const { data, error } = await supabase
        .from("group_permissions")
        .select("permission, enabled")
        .eq("group_role", profile.role);

      if (error) throw error;

      const permissions: UserPermissions = {
        delete_topic: false,
        update_topic: false,
        move_topic: false,
        hide_topic: false,
        pin_topic: false,
        feature_topic: false,
      };

      data?.forEach((perm) => {
        permissions[perm.permission as PermissionKey] = perm.enabled;
      });

      return permissions;
    },
    enabled: !!profile?.role,
  });
};
