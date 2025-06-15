
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSiteSettings() {
  return useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1);
      if (error) throw error;
      if (!data || !data.length) throw new Error("لا توجد إعدادات بالموقع.");
      return data[0];
    },
  });
}

export function useUpdateSiteSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<any>) => {
      // نجلب أول سجل (جدول الإعدادات يحوي سجل واحد عادة)
      const { data: cur, error: getError } = await supabase
        .from("site_settings")
        .select("id")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (getError) throw getError;
      if (!cur) throw new Error("لا يوجد سجل إعدادات لتحديثه.");
      const { error } = await supabase
        .from("site_settings")
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq("id", cur.id);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site_settings"] });
    },
  });
}
