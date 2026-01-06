import { useAuth } from "@/contexts/AuthContext";
import { useUserDownloads } from "@/hooks/useUserDownloads";
import { useBookmarks, useRemoveBookmark } from "@/hooks/useBookmarks";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  FileText,
  Download,
  Bookmark,
  BookmarkX,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const StudentDashboard = () => {
  const { profile } = useAuth();
  const { data: downloads, isLoading: downloadsLoading } = useUserDownloads();
  const { data: bookmarks, isLoading: bookmarksLoading } = useBookmarks();
  const removeBookmark = useRemoveBookmark();
  const { toast } = useToast();

  const handleRemoveBookmark = (materialId: string) => {
    removeBookmark.mutate(materialId, {
      onSuccess: () => {
        toast({ title: "Bookmark removed" });
      },
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-background py-8">
        <div className="container px-4 md:px-6">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-hero">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold text-foreground">
                  Student Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Welcome, {profile?.full_name}! Track your learning progress.
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Download className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {downloads?.length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Downloaded Materials</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                  <Bookmark className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {bookmarks?.length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Bookmarked Materials</p>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="downloads" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="downloads" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Downloads
              </TabsTrigger>
              <TabsTrigger value="bookmarks" className="flex items-center gap-2">
                <Bookmark className="h-4 w-4" />
                Bookmarks
              </TabsTrigger>
            </TabsList>

            <TabsContent value="downloads" className="space-y-6">
              <div className="rounded-xl border border-border bg-card shadow-card">
                <div className="border-b border-border p-6">
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    Downloaded Materials
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Materials you've downloaded for studying
                  </p>
                </div>

                {downloadsLoading ? (
                  <div className="flex items-center justify-center p-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : downloads?.length === 0 ? (
                  <div className="p-12 text-center">
                    <Download className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                      No downloads yet
                    </h3>
                    <p className="mt-2 text-muted-foreground">
                      Start exploring materials to build your collection.
                    </p>
                    <Link to="/materials">
                      <Button className="mt-4 bg-gradient-hero hover:opacity-90">
                        Browse Materials
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {downloads?.map((download) => (
                      <div key={download.id} className="p-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-medium text-foreground">
                                {download.materials?.title}
                              </h3>
                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                {download.materials?.subjects && (
                                  <Link to={`/subjects/${download.materials.subjects.slug}`}>
                                    <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                                      {download.materials.subjects.name}
                                    </Badge>
                                  </Link>
                                )}
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  {formatDistanceToNow(new Date(download.downloaded_at), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(download.materials?.file_url, "_blank")}
                          >
                            <ExternalLink className="mr-1 h-4 w-4" />
                            Open
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="bookmarks" className="space-y-6">
              <div className="rounded-xl border border-border bg-card shadow-card">
                <div className="border-b border-border p-6">
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    Bookmarked Materials
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Materials you've saved for later
                  </p>
                </div>

                {bookmarksLoading ? (
                  <div className="flex items-center justify-center p-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : bookmarks?.length === 0 ? (
                  <div className="p-12 text-center">
                    <Bookmark className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                      No bookmarks yet
                    </h3>
                    <p className="mt-2 text-muted-foreground">
                      Bookmark materials to easily find them later.
                    </p>
                    <Link to="/materials">
                      <Button className="mt-4 bg-gradient-hero hover:opacity-90">
                        Browse Materials
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {bookmarks?.map((bookmark) => (
                      <div key={bookmark.id} className="p-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                              <Bookmark className="h-5 w-5 text-warning" />
                            </div>
                            <div>
                              <h3 className="font-medium text-foreground">
                                {bookmark.materials?.title}
                              </h3>
                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                {bookmark.materials?.subjects && (
                                  <Link to={`/subjects/${bookmark.materials.subjects.slug}`}>
                                    <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                                      {bookmark.materials.subjects.name}
                                    </Badge>
                                  </Link>
                                )}
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  {formatDistanceToNow(new Date(bookmark.created_at), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(bookmark.materials?.file_url, "_blank")}
                            >
                              <ExternalLink className="mr-1 h-4 w-4" />
                              Open
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleRemoveBookmark(bookmark.material_id)}
                            >
                              <BookmarkX className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StudentDashboard;
