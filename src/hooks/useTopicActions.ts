
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useTopicActions = () => {
  const queryClient = useQueryClient();

  const pinTopic = useMutation({
    mutationFn: async ({ topicId, isPinned }: { topicId: string; isPinned: boolean }) => {
      const { error } = await supabase
        .from("topics")
        .update({ is_pinned: isPinned })
        .eq("id", topicId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics"] });
      toast.success("تم تحديث حالة التثبيت بنجاح");
    },
    onError: () => {
      toast.error("حدث خطأ في تحديث حالة التثبيت");
    },
  });

  const featureTopic = useMutation({
    mutationFn: async ({ topicId, isFeatured }: { topicId: string; isFeatured: boolean }) => {
      const { error } = await supabase
        .from("topics")
        .update({ is_featured: isFeatured })
        .eq("id", topicId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics"] });
      toast.success("تم تحديث حالة التمييز بنجاح");
    },
    onError: () => {
      toast.error("حدث خطأ في تحديث حالة التمييز");
    },
  });

  const hideTopic = useMutation({
    mutationFn: async ({ topicId }: { topicId: string }) => {
      const { error } = await supabase
        .from("topics")
        .update({ status: "archived" })
        .eq("id", topicId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics"] });
      toast.success("تم إخفاء الموضوع بنجاح");
    },
    onError: () => {
      toast.error("حدث خطأ في إخفاء الموضوع");
    },
  });

  const moveTopic = useMutation({
    mutationFn: async ({ topicId, categoryId }: { topicId: string; categoryId: string }) => {
      const { error } = await supabase
        .from("topics")
        .update({ category_id: categoryId })
        .eq("id", topicId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics"] });
      toast.success("تم نقل الموضوع بنجاح");
    },
    onError: () => {
      toast.error("حدث خطأ في نقل الموضوع");
    },
  });

  const deleteTopic = useMutation({
    mutationFn: async ({ topicId }: { topicId: string }) => {
      const { error } = await supabase
        .from("topics")
        .delete()
        .eq("id", topicId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics"] });
      toast.success("تم حذف الموضوع بنجاح");
    },
    onError: () => {
      toast.error("حدث خطأ في حذف الموضوع");
    },
  });

  return {
    pinTopic,
    featureTopic,
    hideTopic,
    moveTopic,
    deleteTopic,
  };
};
