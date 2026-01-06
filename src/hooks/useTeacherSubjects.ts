import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TeacherWithSubjects {
  id: string;
  full_name: string;
  email: string | null;
  subjects: {
    id: string;
    name: string;
    slug: string;
  }[];
}

export const useTeachersWithSubjects = () => {
  return useQuery({
    queryKey: ["teachers-with-subjects"],
    queryFn: async () => {
      // Get all teachers
      const { data: teachers, error: teachersError } = await supabase
        .from("allowed_teachers")
        .select("*");

      if (teachersError) throw teachersError;

      // Get teacher-subject mappings with subject details
      const { data: teacherSubjects, error: tsError } = await supabase
        .from("teacher_subjects")
        .select(`
          teacher_id,
          subject_id,
          subjects(id, name, slug)
        `);

      if (tsError) throw tsError;

      // Map subjects to teachers
      const teacherMap = new Map<string, TeacherWithSubjects>();
      
      teachers?.forEach(teacher => {
        teacherMap.set(teacher.id, {
          id: teacher.id,
          full_name: teacher.full_name,
          email: teacher.email,
          subjects: [],
        });
      });

      teacherSubjects?.forEach(ts => {
        if (ts.teacher_id && ts.subjects) {
          const teacher = teacherMap.get(ts.teacher_id);
          if (teacher) {
            teacher.subjects.push({
              id: ts.subjects.id,
              name: ts.subjects.name,
              slug: ts.subjects.slug,
            });
          }
        }
      });

      return Array.from(teacherMap.values());
    },
  });
};
