
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PermissionKey =
  | "delete_topic"
  | "update_topic"
  | "move_topic"
  | "hide_topic"
  | "pin_topic"
  | "feature_topic";

export type GroupRole = "admin" | "moderator" | "member";

export interface GroupPermissionRow {
  id: string;
  group_role: GroupRole;
  permission: PermissionKey;
  enabled: boolean;
}

export const useGroupPermissions = () => {
  return useQuery({
    queryKey: ["group-permissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("group_permissions")
        .select("*");
      if (error) throw error;
      return data as GroupPermissionRow[];
    },
  });
};

export const useUpdateGroupPermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      enabled,
    }: {
      id: string;
      enabled: boolean;
    }) => {
      const { error } = await supabase
        .from("group_permissions")
        .update({ enabled })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-permissions"] });
    },
  });
};
