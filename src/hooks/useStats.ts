import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useStats = () => {
  return useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      // Get materials count
      const { count: materialsCount } = await supabase
        .from("materials")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved");

      // Get teachers count
      const { count: teachersCount } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "teacher");

      // Get subjects count
      const { count: subjectsCount } = await supabase
        .from("subjects")
        .select("*", { count: "exact", head: true });

      return {
        materials: materialsCount || 0,
        teachers: teachersCount || 0,
        subjects: subjectsCount || 0,
      };
    },
  });
};
