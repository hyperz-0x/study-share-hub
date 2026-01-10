import { useParams, Link } from "react-router-dom";
import { useSubject } from "@/hooks/useSubjects";
import { useMaterials } from "@/hooks/useMaterials";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  Eye,
  Star,
  ArrowLeft,
  Clock,
  User,
  Lock,
} from "lucide-react";

const SubjectDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { data: subject, isLoading: subjectLoading } = useSubject(slug || "");
  const { data: materials, isLoading: materialsLoading } = useMaterials(slug, "approved");

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
            <h1 className="font-display text-2xl font-bold text-foreground">
              Subject not found
            </h1>
            <Link to="/subjects" className="mt-4 inline-block text-primary hover:underline">
              ← Back to subjects
            </Link>
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
          {/* Breadcrumb */}
          <Link
            to="/subjects"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to subjects
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-4xl font-bold text-foreground">
              {subject.name}
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">{subject.description}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {materials?.length || 0} approved materials available
            </p>
          </div>

          {/* Materials Grid */}
          {!user ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center shadow-card">
              <Lock className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                Sign in to view materials
              </h3>
              <p className="mt-2 text-muted-foreground">
                Please log in to access study materials for {subject.name}.
              </p>
              <Button asChild className="mt-6 bg-gradient-hero hover:opacity-90">
                <Link to="/auth">Sign In</Link>
              </Button>
            </div>
          ) : materialsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : materials?.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center shadow-card">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                No materials yet
              </h3>
              <p className="mt-2 text-muted-foreground">
                Be the first to upload study materials for {subject.name}.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {materials?.map((material) => (
                <article
                  key={material.id}
                  className="group flex flex-col rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:border-primary/30 hover:shadow-card-hover"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {material.file_type.split("/").pop()?.toUpperCase() || "FILE"}
                    </Badge>
                  </div>

                  <h3 className="mb-2 font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {material.title}
                  </h3>

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
                      onClick={() => window.open(material.file_url, "_blank")}
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

export default SubjectDetail;
