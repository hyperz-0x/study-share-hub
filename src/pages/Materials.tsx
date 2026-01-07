import { useState, useMemo } from "react";
import { useMaterials } from "@/hooks/useMaterials";
import { useAuth } from "@/contexts/AuthContext";
import { useRecordDownload } from "@/hooks/useUserDownloads";
import { useBookmarks, useAddBookmark, useRemoveBookmark } from "@/hooks/useBookmarks";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, Navigate } from "react-router-dom";
import { FileText, Download, Eye, User, Bookmark, BookmarkCheck, Search, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Materials = () => {
  const { data: materials, isLoading } = useMaterials(undefined, "approved");
  const { user, loading } = useAuth();
  const { data: bookmarks } = useBookmarks();
  const recordDownload = useRecordDownload();
  const addBookmark = useAddBookmark();
  const removeBookmark = useRemoveBookmark();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  // Redirect to auth if not logged in
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  const bookmarkedMaterialIds = new Set(bookmarks?.map(b => b.material_id) || []);

  // Filter materials based on search query
  const filteredMaterials = useMemo(() => {
    if (!materials) return [];
    if (!searchQuery.trim()) return materials;

    const query = searchQuery.toLowerCase();
    return materials.filter((material) => {
      const titleMatch = material.title.toLowerCase().includes(query);
      const subjectMatch = material.subjects?.name.toLowerCase().includes(query);
      const authorMatch = material.author_profile?.full_name?.toLowerCase().includes(query);
      const descriptionMatch = material.description?.toLowerCase().includes(query);
      return titleMatch || subjectMatch || authorMatch || descriptionMatch;
    });
  }, [materials, searchQuery]);

  const handleDownload = (material: { id: string; file_url: string }) => {
    recordDownload.mutate(material.id);
    window.open(material.file_url, "_blank");
  };

  const handleToggleBookmark = (materialId: string) => {
    if (bookmarkedMaterialIds.has(materialId)) {
      removeBookmark.mutate(materialId, {
        onSuccess: () => {
          toast({ title: "Bookmark removed" });
        },
      });
    } else {
      addBookmark.mutate(materialId, {
        onSuccess: () => {
          toast({ title: "Material bookmarked" });
        },
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-background py-12">
        <div className="container px-4 md:px-6">
          <div className="mb-12 text-center">
            <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
              Study Materials
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Browse all approved study materials across subjects
            </p>
          </div>

          {/* Search Bar */}
          <div className="mx-auto mb-8 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by title, subject, or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Found {filteredMaterials.length} result{filteredMaterials.length !== 1 ? "s" : ""} for "{searchQuery}"
              </p>
            )}
          </div>

          {isLoading || loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center shadow-card">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                {searchQuery ? "No materials found" : "No materials available"}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search terms."
                  : "Check back soon for new study materials."}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredMaterials.map((material) => (
                <article
                  key={material.id}
                  className="group flex flex-col rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:border-primary/30 hover:shadow-card-hover"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleBookmark(material.id)}
                        className="p-1 rounded hover:bg-secondary transition-colors"
                        title={bookmarkedMaterialIds.has(material.id) ? "Remove bookmark" : "Add bookmark"}
                      >
                        {bookmarkedMaterialIds.has(material.id) ? (
                          <BookmarkCheck className="h-5 w-5 text-primary" />
                        ) : (
                          <Bookmark className="h-5 w-5 text-muted-foreground hover:text-primary" />
                        )}
                      </button>
                      <Badge variant="secondary" className="text-xs">
                        {material.file_type.split("/").pop()?.toUpperCase() || "FILE"}
                      </Badge>
                    </div>
                  </div>

                  <h3 className="mb-2 font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {material.title}
                  </h3>

                  <Link
                    to={`/subjects/${material.subjects?.slug}`}
                    className="mb-2 text-sm text-primary hover:underline"
                  >
                    {material.subjects?.name}
                  </Link>

                  {material.description && (
                    <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                      {material.description}
                    </p>
                  )}

                  <div className="mt-auto">
                    <div className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      {material.author_profile?.full_name || "Unknown author"}
                    </div>

                    <div className="flex items-center justify-between border-t border-border pt-4">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {material.views || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          {material.downloads || 0}
                        </span>
                      </div>
                    </div>

                    <Button
                      className="mt-4 w-full bg-gradient-hero hover:opacity-90"
                      onClick={() => handleDownload(material)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Materials;
