import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useMaterialComments = (materialId: string) => {
  return useQuery({
    queryKey: ["material-comments", materialId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("material_comments")
        .select("*")
        .eq("material_id", materialId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch profiles for comment authors
      const userIds = [...new Set(data?.map((c) => c.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p.full_name]) || []);

      return (data || []).map((c) => ({
        ...c,
        author_name: profileMap.get(c.user_id) || "Unknown",
      }));
    },
    enabled: !!materialId,
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      materialId,
      content,
      parentId,
    }: {
      materialId: string;
      content: string;
      parentId?: string;
    }) => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase.from("material_comments").insert({
        material_id: materialId,
        user_id: user.id,
        content,
        parent_id: parentId || null,
      });

      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["material-comments", vars.materialId],
      });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, materialId }: { commentId: string; materialId: string }) => {
      const { error } = await supabase
        .from("material_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
      return materialId;
    },
    onSuccess: (materialId) => {
      queryClient.invalidateQueries({
        queryKey: ["material-comments", materialId],
      });
    },
  });
};
