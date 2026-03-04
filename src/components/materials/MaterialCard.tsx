import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, User, Bookmark, BookmarkCheck, Star, MessageSquare } from "lucide-react";
import { useMaterialRatings } from "@/hooks/useMaterialRatings";
import { useMaterialComments } from "@/hooks/useMaterialComments";
import type { Material } from "@/hooks/useMaterials";

interface MaterialCardProps {
  material: Material;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onDownload: (material: { id: string; file_url: string }) => void;
  onOpenDetail?: (material: Material) => void;
}

const MaterialCard = ({ material, isBookmarked, onToggleBookmark, onDownload, onOpenDetail }: MaterialCardProps) => {
  const { data: ratings } = useMaterialRatings(material.id);
  const { data: comments } = useMaterialComments(material.id);

  return (
    <article
      className="group flex flex-col rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:border-primary/30 hover:shadow-card-hover cursor-pointer"
      onClick={() => onOpenDetail?.(material)}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleBookmark(material.id); }}
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

      <Link
        to={`/subjects/${material.subjects?.slug}`}
        className="mb-2 text-sm text-primary hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
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
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{material.views || 0}</span>
            <span className="flex items-center gap-1"><Download className="h-4 w-4" />{material.downloads || 0}</span>
            {ratings && ratings.count > 0 && (
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-warning text-warning" />
                {ratings.average}
              </span>
            )}
            {comments && comments.length > 0 && (
              <span className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                {comments.length}
              </span>
            )}
          </div>
        </div>

        <Button
          className="mt-4 w-full bg-gradient-hero hover:opacity-90"
          onClick={(e) => { e.stopPropagation(); onDownload(material); }}
        >
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </div>
    </article>
  );
};

export default MaterialCard;
