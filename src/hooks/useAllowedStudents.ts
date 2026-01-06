import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface AllowedStudent {
  id: string;
  full_name: string;
  email: string | null;
  created_at: string;
}

export const useAllowedStudents = () => {
  return useQuery({
    queryKey: ["allowed-students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("allowed_students")
        .select("*")
        .order("full_name", { ascending: true });

      if (error) throw error;
      return data as AllowedStudent[];
    },
  });
};

export const useAddAllowedStudent = () => {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  return useMutation({
    mutationFn: async ({ fullName, email }: { fullName: string; email?: string }) => {
      if (!isAdmin) throw new Error("Admin access required");

      const { error } = await supabase
        .from("allowed_students")
        .insert({ full_name: fullName, email: email || null });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allowed-students"] });
    },
  });
};

export const useRemoveAllowedStudent = () => {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  return useMutation({
    mutationFn: async (studentId: string) => {
      if (!isAdmin) throw new Error("Admin access required");

      const { error } = await supabase
        .from("allowed_students")
        .delete()
        .eq("id", studentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allowed-students"] });
    },
  });
};
