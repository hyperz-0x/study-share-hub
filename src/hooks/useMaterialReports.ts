import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useReportMaterial = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      materialId,
      reason,
    }: {
      materialId: string;
      reason: string;
    }) => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase.from("material_reports").insert({
        material_id: materialId,
        user_id: user.id,
        reason,
      });

      if (error) throw error;
    },
  });
};
