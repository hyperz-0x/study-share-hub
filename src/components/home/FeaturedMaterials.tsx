import { Link } from "react-router-dom";
import { FileText, Download, Eye, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMaterials } from "@/hooks/useMaterials";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

const FeaturedMaterials = () => {
  const { data: materials, isLoading } = useMaterials(undefined, "approved");
  const { user } = useAuth();

  // Take only first 6 materials for the featured section
  const featuredMaterials = materials?.slice(0, 6) || [];

  if (isLoading) {
    return (
      <section className="bg-background py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </div>
      </section>
    );
  }

  if (featuredMaterials.length === 0) {
    return (
      <section className="bg-background py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="mb-2 font-display text-3xl font-bold text-foreground md:text-4xl">
                Study Materials
              </h2>
              <p className="text-muted-foreground">
                {user ? "Top-rated study resources curated for you" : "Sign in to access study materials"}
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-12 text-center shadow-card">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
              No materials available yet
            </h3>
            <p className="mt-2 text-muted-foreground">
              Check back soon for new study materials.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="mb-2 font-display text-3xl font-bold text-foreground md:text-4xl">
              Study Materials
            </h2>
            <p className="text-muted-foreground">
              {user ? "Top-rated study resources curated for you" : "Sign in to access study materials"}
            </p>
          </div>
          {user && (
            <Link to="/materials">
              <Button variant="outline" className="border-border hover:bg-secondary">
                View All Materials
              </Button>
            </Link>
          )}
          {!user && (
            <Link to="/auth">
              <Button className="bg-gradient-hero hover:opacity-90">
                Sign In to Access
              </Button>
            </Link>
          )}
        </div>

        {!user ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center shadow-card">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
              Sign in to view study materials
            </h3>
            <p className="mt-2 text-muted-foreground">
              Please login or create an account to access our collection of study materials.
            </p>
            <Link to="/auth">
              <Button className="mt-6 bg-gradient-hero hover:opacity-90">
                Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredMaterials.map((material, index) => (
              <article
                key={material.id}
                className="group relative flex flex-col rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:border-primary/30 hover:shadow-card-hover"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {material.featured && (
                  <Badge className="absolute -top-2 right-4 bg-gradient-accent text-accent-foreground">
                    Featured
                  </Badge>
                )}

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

                <Link
                  to={`/subjects/${material.subjects?.slug}`}
                  className="mb-2 text-sm text-primary hover:underline"
                >
                  {material.subjects?.name}
                </Link>

                <div className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  {material.author_profile?.full_name || "Unknown author"}
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      {material.downloads || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {material.views || 0}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(material.created_at), { addSuffix: true })}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedMaterials;
