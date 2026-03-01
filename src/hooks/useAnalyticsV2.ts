import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useAnalyticsV2 = () => {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: ["analytics-v2"],
    queryFn: async () => {
      // Time-series: uploads per week (last 8 weeks)
      const eightWeeksAgo = new Date();
      eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

      const { data: recentMaterials } = await supabase
        .from("materials")
        .select("id, created_at, status, author_id, subject_id, downloads, views")
        .gte("created_at", eightWeeksAgo.toISOString());

      const { data: recentDownloads } = await supabase
        .from("user_downloads")
        .select("downloaded_at")
        .gte("downloaded_at", eightWeeksAgo.toISOString());

      // Weekly trends
      const weeklyData: { week: string; uploads: number; downloads: number }[] = [];
      for (let i = 7; i >= 0; i--) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - i * 7);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const uploads = (recentMaterials || []).filter(
          (m) => new Date(m.created_at) >= weekStart && new Date(m.created_at) < weekEnd
        ).length;
        const downloads = (recentDownloads || []).filter(
          (d) => new Date(d.downloaded_at) >= weekStart && new Date(d.downloaded_at) < weekEnd
        ).length;

        weeklyData.push({
          week: weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          uploads,
          downloads,
        });
      }

      // Most active teachers
      const teacherCounts = new Map<string, number>();
      (recentMaterials || []).forEach((m) => {
        teacherCounts.set(m.author_id, (teacherCounts.get(m.author_id) || 0) + 1);
      });
      const topTeacherIds = [...teacherCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      const { data: teacherProfiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", topTeacherIds.map(([id]) => id));

      const profileMap = new Map(teacherProfiles?.map((p) => [p.user_id, p.full_name]) || []);

      const topTeachers = topTeacherIds.map(([id, count]) => ({
        name: profileMap.get(id) || "Unknown",
        uploads: count,
      }));

      // Top subjects
      const { data: subjects } = await supabase
        .from("subjects")
        .select("id, name, materials_count")
        .order("materials_count", { ascending: false })
        .limit(5);

      // Top materials by downloads
      const { data: topMaterials } = await supabase
        .from("materials")
        .select("id, title, downloads, views, subjects(name)")
        .eq("status", "approved")
        .order("downloads", { ascending: false })
        .limit(5);

      // Rejection rate
      const total = (recentMaterials || []).length;
      const rejected = (recentMaterials || []).filter((m) => m.status === "rejected").length;
      const rejectionRate = total ? Math.round((rejected / total) * 100) : 0;

      return {
        weeklyData,
        topTeachers,
        topSubjects: subjects || [],
        topMaterials: topMaterials || [],
        rejectionRate,
        totalUploads: total,
        totalRejected: rejected,
      };
    },
    enabled: isAdmin,
  });
};
