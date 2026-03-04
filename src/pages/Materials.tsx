import { useState, useMemo } from "react";
import { useMaterials, type Material } from "@/hooks/useMaterials";
import { useAuth } from "@/contexts/AuthContext";
import { useRecordDownload } from "@/hooks/useUserDownloads";
import { useBookmarks, useAddBookmark, useRemoveBookmark } from "@/hooks/useBookmarks";
import { useSubjects } from "@/hooks/useSubjects";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MaterialFilters, { type FilterState, type DateFilter } from "@/components/materials/MaterialFilters";
import MaterialCard from "@/components/materials/MaterialCard";
import MaterialDetailDialog from "@/components/materials/MaterialDetailDialog";
import { FileText } from "lucide-react";
import { Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const getDateThreshold = (range: DateFilter): Date | null => {
  if (range === "all") return null;
  const now = new Date();
  switch (range) {
    case "today": return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case "week": return new Date(now.getTime() - 7 * 86400000);
    case "month": return new Date(now.getTime() - 30 * 86400000);
    case "year": return new Date(now.getTime() - 365 * 86400000);
  }
};

const Materials = () => {
  const { data: materials, isLoading } = useMaterials(undefined, "approved");
  const { data: subjects } = useSubjects();
  const { user, loading } = useAuth();
  const { data: bookmarks } = useBookmarks();
  const recordDownload = useRecordDownload();
  const addBookmark = useAddBookmark();
  const removeBookmark = useRemoveBookmark();
  const { toast } = useToast();

  const [filters, setFilters] = useState<FilterState>({
    search: "", subjectId: "all", fileType: "all", dateRange: "all", sort: "newest",
  });
  const [detailMaterial, setDetailMaterial] = useState<Material | null>(null);

  const bookmarkedIds = new Set(bookmarks?.map((b) => b.material_id) || []);

  const fileTypes = useMemo(() => {
    if (!materials) return [];
    const types = new Set(materials.map((m) => m.file_type.split("/").pop()?.toLowerCase() || "").filter(Boolean));
    return [...types].sort();
  }, [materials]);

  const filteredMaterials = useMemo(() => {
    if (!materials) return [];
    let result = materials;
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter((m) =>
        m.title.toLowerCase().includes(q) || m.subjects?.name.toLowerCase().includes(q) ||
        m.author_profile?.full_name?.toLowerCase().includes(q) || m.description?.toLowerCase().includes(q)
      );
    }
    if (filters.subjectId !== "all") result = result.filter((m) => m.subject_id === filters.subjectId);
    if (filters.fileType !== "all") result = result.filter((m) => m.file_type.split("/").pop()?.toLowerCase() === filters.fileType);
    const threshold = getDateThreshold(filters.dateRange);
    if (threshold) result = result.filter((m) => new Date(m.created_at) >= threshold);
    result = [...result].sort((a, b) => {
      switch (filters.sort) {
        case "oldest": return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "most-downloaded": return (b.downloads || 0) - (a.downloads || 0);
        case "most-viewed": return (b.views || 0) - (a.views || 0);
        default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
    return result;
  }, [materials, filters]);

  if (!loading && !user) return <Navigate to="/auth" replace />;

  const handleDownload = (material: { id: string; file_url: string }) => {
    recordDownload.mutate(material.id);
    window.open(material.file_url, "_blank");
  };

  const handleToggleBookmark = (materialId: string) => {
    if (bookmarkedIds.has(materialId)) {
      removeBookmark.mutate(materialId, { onSuccess: () => toast({ title: "Bookmark removed" }) });
    } else {
      addBookmark.mutate(materialId, { onSuccess: () => toast({ title: "Material bookmarked" }) });
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-background py-12">
        <div className="container px-4 md:px-6">
          <div className="mb-12 text-center">
            <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">Study Materials</h1>
            <p className="mt-4 text-lg text-muted-foreground">Browse all approved study materials across subjects</p>
          </div>
          <div className="mb-8">
            <MaterialFilters filters={filters} onFiltersChange={setFilters} subjects={subjects || []} fileTypes={fileTypes} resultCount={filteredMaterials.length} />
          </div>
          {isLoading || loading ? (
            <div className="flex items-center justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
          ) : filteredMaterials.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center shadow-card">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                {filters.search || filters.subjectId !== "all" ? "No materials found" : "No materials available"}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {filters.search || filters.subjectId !== "all" ? "Try adjusting your filters." : "Check back soon."}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredMaterials.map((material) => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  isBookmarked={bookmarkedIds.has(material.id)}
                  onToggleBookmark={handleToggleBookmark}
                  onDownload={handleDownload}
                  onOpenDetail={setDetailMaterial}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <MaterialDetailDialog
        material={detailMaterial}
        open={!!detailMaterial}
        onOpenChange={(open) => { if (!open) setDetailMaterial(null); }}
        onDownload={handleDownload}
      />
    </div>
  );
};

export default Materials;
