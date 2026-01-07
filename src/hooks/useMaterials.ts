import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Material {
  id: string;
  title: string;
  description: string | null;
  subject_id: string;
  author_id: string;
  file_url: string;
  file_name: string;
  file_size: number | null;
  file_type: string;
  status: "pending" | "approved" | "rejected";
  downloads: number | null;
  views: number | null;
  featured: boolean | null;
  created_at: string;
  subjects?: {
    name: string;
    slug: string;
  } | null;
  author_profile?: {
    full_name: string;
  } | null;
}

export const useMaterials = (subjectSlug?: string, status?: "pending" | "approved" | "rejected") => {
  return useQuery({
    queryKey: ["materials", subjectSlug, status],
    queryFn: async () => {
      let query = supabase
        .from("materials")
        .select(`
          *,
          subjects(name, slug)
        `)
        .order("created_at", { ascending: false });

      if (subjectSlug) {
        const { data: subject } = await supabase
          .from("subjects")
          .select("id")
          .eq("slug", subjectSlug)
          .maybeSingle();

        if (subject) {
          query = query.eq("subject_id", subject.id);
        }
      }

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch author profiles separately
      const authorIds = [...new Set(data?.map(m => m.author_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", authorIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      return (data || []).map(material => ({
        ...material,
        author_profile: profileMap.get(material.author_id) || null,
      })) as Material[];
    },
  });
};

export const useMyMaterials = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-materials", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("materials")
        .select(`
          *,
          subjects(name, slug)
        `)
        .eq("author_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Material[];
    },
    enabled: !!user,
  });
};

export const usePendingMaterials = () => {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: ["pending-materials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("materials")
        .select(`
          *,
          subjects(name, slug)
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch author profiles separately
      const authorIds = [...new Set(data?.map(m => m.author_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", authorIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      return (data || []).map(material => ({
        ...material,
        author_profile: profileMap.get(material.author_id) || null,
      })) as Material[];
    },
    enabled: isAdmin,
  });
};

export const useUploadMaterial = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      title,
      description,
      subjectId,
      file,
    }: {
      title: string;
      description: string;
      subjectId: string;
      file: File;
    }) => {
      if (!user) throw new Error("Must be logged in");

      // Upload file to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("materials")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("materials")
        .getPublicUrl(fileName);

      // Create material record
      const { data, error } = await supabase
        .from("materials")
        .insert({
          title,
          description,
          subject_id: subjectId,
          author_id: user.id,
          file_url: publicUrl,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      queryClient.invalidateQueries({ queryKey: ["my-materials"] });
    },
  });
};

export const useApproveMaterial = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (materialId: string) => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase
        .from("materials")
        .update({
          status: "approved" as const,
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", materialId);

      if (error) throw error;

      // Send email notification
      try {
        await supabase.functions.invoke("send-material-notification", {
          body: { materialId, action: "approved" },
        });
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      queryClient.invalidateQueries({ queryKey: ["pending-materials"] });
    },
  });
};

export const useRejectMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ materialId, reason }: { materialId: string; reason: string }) => {
      const { error } = await supabase
        .from("materials")
        .update({
          status: "rejected" as const,
          rejection_reason: reason,
        })
        .eq("id", materialId);

      if (error) throw error;

      // Send email notification
      try {
        await supabase.functions.invoke("send-material-notification", {
          body: { materialId, action: "rejected", rejectionReason: reason },
        });
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      queryClient.invalidateQueries({ queryKey: ["pending-materials"] });
    },
  });
};
