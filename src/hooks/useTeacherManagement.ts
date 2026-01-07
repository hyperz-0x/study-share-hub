import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AllowedTeacher {
  id: string;
  full_name: string;
  email: string | null;
  created_at: string;
}

interface TeacherSubject {
  id: string;
  teacher_id: string;
  subject_id: string;
  created_at: string;
  subjects?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export const useAllowedTeachers = () => {
  return useQuery({
    queryKey: ["allowed-teachers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("allowed_teachers")
        .select("*")
        .order("full_name");

      if (error) throw error;
      return data as AllowedTeacher[];
    },
  });
};

export const useTeacherSubjectAssignments = () => {
  return useQuery({
    queryKey: ["teacher-subject-assignments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teacher_subjects")
        .select(`
          *,
          subjects(id, name, slug)
        `);

      if (error) throw error;
      return data as TeacherSubject[];
    },
  });
};

export const useAssignSubjectToTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teacherId, subjectId }: { teacherId: string; subjectId: string }) => {
      const { data, error } = await supabase
        .from("teacher_subjects")
        .insert({
          teacher_id: teacherId,
          subject_id: subjectId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-subject-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-subjects"] });
    },
  });
};

export const useRemoveSubjectFromTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from("teacher_subjects")
        .delete()
        .eq("id", assignmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-subject-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-subjects"] });
    },
  });
};

export const useAddAllowedTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fullName, email }: { fullName: string; email?: string }) => {
      const { data, error } = await supabase
        .from("allowed_teachers")
        .insert({
          full_name: fullName,
          email: email || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allowed-teachers"] });
    },
  });
};

export const useRemoveAllowedTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (teacherId: string) => {
      // First delete all subject assignments
      await supabase
        .from("teacher_subjects")
        .delete()
        .eq("teacher_id", teacherId);

      // Then delete the teacher
      const { error } = await supabase
        .from("allowed_teachers")
        .delete()
        .eq("id", teacherId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allowed-teachers"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-subject-assignments"] });
    },
  });
};
