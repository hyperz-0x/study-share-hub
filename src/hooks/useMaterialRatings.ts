import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useMaterialRatings = (materialId: string) => {
  return useQuery({
    queryKey: ["material-ratings", materialId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("material_ratings")
        .select("rating")
        .eq("material_id", materialId);

      if (error) throw error;

      const ratings = data || [];
      const avg = ratings.length
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;

      return { average: Math.round(avg * 10) / 10, count: ratings.length };
    },
    enabled: !!materialId,
  });
};

export const useMyRating = (materialId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-rating", materialId, user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data } = await supabase
        .from("material_ratings")
        .select("rating")
        .eq("material_id", materialId)
        .eq("user_id", user.id)
        .maybeSingle();

      return data?.rating || null;
    },
    enabled: !!user && !!materialId,
  });
};

export const useRateMaterial = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      materialId,
      rating,
    }: {
      materialId: string;
      rating: number;
    }) => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase
        .from("material_ratings")
        .upsert(
          { material_id: materialId, user_id: user.id, rating },
          { onConflict: "material_id,user_id" }
        );

      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["material-ratings", vars.materialId] });
      queryClient.invalidateQueries({ queryKey: ["my-rating", vars.materialId] });
    },
  });
};
