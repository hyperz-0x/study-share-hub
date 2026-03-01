import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useRejectionTemplates = () => {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: ["rejection-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rejection_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin,
  });
};

export const useAddRejectionTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, reason }: { title: string; reason: string }) => {
      const { error } = await supabase
        .from("rejection_templates")
        .insert({ title, reason });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rejection-templates"] });
    },
  });
};

export const useDeleteRejectionTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from("rejection_templates")
        .delete()
        .eq("id", templateId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rejection-templates"] });
    },
  });
};
