import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useRecordView = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (materialId: string) => {
      if (!user) return;
      await supabase
        .from("material_views")
        .insert({ user_id: user.id, material_id: materialId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["material-views"] });
      queryClient.invalidateQueries({ queryKey: ["recent-views"] });
    },
  });
};

export const useRecentViews = (limit = 10) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["recent-views", user?.id, limit],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("material_views")
        .select(
          `
          id,
          material_id,
          viewed_at,
          materials(
            id, title, description, file_url, file_name, file_type,
            downloads, views, created_at,
            subjects(name, slug)
          )
        `
        )
        .eq("user_id", user.id)
        .order("viewed_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Deduplicate by material_id, keep most recent
      const seen = new Set<string>();
      return (data || []).filter((v) => {
        if (seen.has(v.material_id)) return false;
        seen.add(v.material_id);
        return true;
      });
    },
    enabled: !!user,
  });
};

export const useWeeklyActivity = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["weekly-activity", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const { data: views } = await supabase
        .from("material_views")
        .select("viewed_at")
        .eq("user_id", user.id)
        .gte("viewed_at", sevenDaysAgo.toISOString());

      const { data: downloads } = await supabase
        .from("user_downloads")
        .select("downloaded_at")
        .eq("user_id", user.id)
        .gte("downloaded_at", sevenDaysAgo.toISOString());

      // Build day-by-day activity
      const days: { day: string; views: number; downloads: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayStr = d.toLocaleDateString("en-US", { weekday: "short" });
        const dateStr = d.toISOString().split("T")[0];

        const dayViews = (views || []).filter(
          (v) => v.viewed_at.split("T")[0] === dateStr
        ).length;
        const dayDownloads = (downloads || []).filter(
          (d) => d.downloaded_at.split("T")[0] === dateStr
        ).length;

        days.push({ day: dayStr, views: dayViews, downloads: dayDownloads });
      }

      return days;
    },
    enabled: !!user,
  });
};

export const useSubjectProgress = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["subject-progress", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get all subjects
      const { data: subjects } = await supabase
        .from("subjects")
        .select("id, name, slug, materials_count, color, icon");

      // Get user's downloads grouped by subject
      const { data: downloads } = await supabase
        .from("user_downloads")
        .select("materials(subject_id)")
        .eq("user_id", user.id);

      // Get user's views grouped by subject
      const { data: views } = await supabase
        .from("material_views")
        .select("materials(subject_id)")
        .eq("user_id", user.id);

      const downloadsBySubject = new Map<string, number>();
      (downloads || []).forEach((d: any) => {
        const sid = d.materials?.subject_id;
        if (sid) downloadsBySubject.set(sid, (downloadsBySubject.get(sid) || 0) + 1);
      });

      const viewsBySubject = new Map<string, number>();
      (views || []).forEach((v: any) => {
        const sid = v.materials?.subject_id;
        if (sid) viewsBySubject.set(sid, (viewsBySubject.get(sid) || 0) + 1);
      });

      return (subjects || []).map((s) => ({
        ...s,
        userDownloads: downloadsBySubject.get(s.id) || 0,
        userViews: viewsBySubject.get(s.id) || 0,
        progress: s.materials_count
          ? Math.min(100, Math.round(((downloadsBySubject.get(s.id) || 0) / s.materials_count) * 100))
          : 0,
      }));
    },
    enabled: !!user,
  });
};
