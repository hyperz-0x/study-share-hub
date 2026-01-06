import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useUserDownloads = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-downloads", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_downloads")
        .select(`
          id,
          material_id,
          downloaded_at,
          materials(
            id,
            title,
            description,
            file_url,
            file_name,
            file_type,
            downloads,
            views,
            created_at,
            subjects(name, slug)
          )
        `)
        .eq("user_id", user.id)
        .order("downloaded_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const useRecordDownload = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (materialId: string) => {
      if (!user) return;

      // Record the download (upsert to avoid duplicates)
      await supabase
        .from("user_downloads")
        .upsert(
          { user_id: user.id, material_id: materialId },
          { onConflict: "user_id,material_id" }
        );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-downloads"] });
    },
  });
};
