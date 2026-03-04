import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSubject } from "@/hooks/useSubjects";
import { useMaterials, type Material } from "@/hooks/useMaterials";
import { useAuth } from "@/contexts/AuthContext";
import { useBookmarks, useAddBookmark, useRemoveBookmark } from "@/hooks/useBookmarks";
import { useRecordDownload } from "@/hooks/useUserDownloads";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MaterialCard from "@/components/materials/MaterialCard";
import MaterialDetailDialog from "@/components/materials/MaterialDetailDialog";
import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SubjectDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { data: subject, isLoading: subjectLoading } = useSubject(slug || "");
  const { data: materials, isLoading: materialsLoading } = useMaterials(slug, "approved");
  const { data: bookmarks } = useBookmarks();
  const addBookmark = useAddBookmark();
  const removeBookmark = useRemoveBookmark();
  const recordDownload = useRecordDownload();
  const { toast } = useToast();
  const [detailMaterial, setDetailMaterial] = useState<Material | null>(null);

  const bookmarkedIds = new Set(bookmarks?.map((b) => b.material_id) || []);

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

  if (subjectLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-foreground">Subject not found</h1>
            <Link to="/subjects" className="mt-4 inline-block text-primary hover:underline">← Back to subjects</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-background py-8">
        <div className="container px-4 md:px-6">
          <Link to="/subjects" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to subjects
          </Link>

          <div className="mb-8">
            <h1 className="font-display text-4xl font-bold text-foreground">{subject.name}</h1>
            <p className="mt-2 text-lg text-muted-foreground">{subject.description}</p>
            <p className="mt-2 text-sm text-muted-foreground">{materials?.length || 0} approved materials available</p>
          </div>

          {!user ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center shadow-card">
              <Lock className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 font-display text-lg font-semibold text-foreground">Sign in to view materials</h3>
              <p className="mt-2 text-muted-foreground">Please log in to access study materials for {subject.name}.</p>
              <Button asChild className="mt-6 bg-gradient-hero hover:opacity-90"><Link to="/auth">Sign In</Link></Button>
            </div>
          ) : materialsLoading ? (
            <div className="flex items-center justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
          ) : materials?.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center shadow-card">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 font-display text-lg font-semibold text-foreground">No materials yet</h3>
              <p className="mt-2 text-muted-foreground">Be the first to upload study materials for {subject.name}.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {materials?.map((material) => (
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

export default SubjectDetail;
