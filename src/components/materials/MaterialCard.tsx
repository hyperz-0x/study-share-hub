import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, User, Bookmark, BookmarkCheck } from "lucide-react";
import type { Material } from "@/hooks/useMaterials";

interface MaterialCardProps {
  material: Material;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onDownload: (material: { id: string; file_url: string }) => void;
}

const MaterialCard = ({ material, isBookmarked, onToggleBookmark, onDownload }: MaterialCardProps) => {
  return (
    <article className="group flex flex-col rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:border-primary/30 hover:shadow-card-hover">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleBookmark(material.id)}
            className="rounded p-1 transition-colors hover:bg-secondary"
            title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
          >
            {isBookmarked ? (
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

      <h3 className="mb-2 line-clamp-2 font-display text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
        {material.title}
      </h3>

      <Link to={`/subjects/${material.subjects?.slug}`} className="mb-2 text-sm text-primary hover:underline">
        {material.subjects?.name}
      </Link>

      {material.description && (
        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{material.description}</p>
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

        <Button className="mt-4 w-full bg-gradient-hero hover:opacity-90" onClick={() => onDownload(material)}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </div>
    </article>
  );
};

export default MaterialCard;
