import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useModerationLog = () => {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: ["moderation-log"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("moderation_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      // Fetch admin + material names
      const adminIds = [...new Set(data?.map((l) => l.admin_id) || [])];
      const materialIds = [...new Set(data?.map((l) => l.material_id) || [])];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", adminIds);

      const { data: materials } = await supabase
        .from("materials")
        .select("id, title")
        .in("id", materialIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p.full_name]) || []);
      const materialMap = new Map(materials?.map((m) => [m.id, m.title]) || []);

      return (data || []).map((l) => ({
        ...l,
        admin_name: profileMap.get(l.admin_id) || "Unknown",
        material_title: materialMap.get(l.material_id) || "Deleted",
      }));
    },
    enabled: isAdmin,
  });
};

export const useLogModeration = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      materialId,
      action,
      reason,
    }: {
      materialId: string;
      action: "approved" | "rejected";
      reason?: string;
    }) => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase.from("moderation_log").insert({
        admin_id: user.id,
        material_id: materialId,
        action,
        reason,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moderation-log"] });
    },
  });
};
