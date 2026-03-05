import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FileText, Download, Eye, User, Bookmark, BookmarkCheck, Star, MessageSquare, Trash2 } from "lucide-react";
import { useMaterialRatings } from "@/hooks/useMaterialRatings";
import { useMaterialComments } from "@/hooks/useMaterialComments";
import { useDeleteMaterial } from "@/hooks/useDeleteMaterial";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
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
  const { user, isAdmin, isTeacher } = useAuth();
  const deleteMutation = useDeleteMaterial();
  const { toast } = useToast();

  const canDelete = isAdmin || (isTeacher && user?.id === material.author_id);

  const handleDelete = () => {
    deleteMutation.mutate(material.id, {
      onSuccess: () => toast({ title: "Material deleted" }),
      onError: (e: any) => toast({ title: "Delete failed", description: e.message, variant: "destructive" }),
    });
  };

  return (
    <article
      className="group relative flex flex-col rounded-2xl border border-border bg-gradient-card p-6 shadow-card transition-all duration-500 hover:border-primary/30 hover:shadow-card-hover hover:-translate-y-1 cursor-pointer animate-fade-up"
      onClick={() => onOpenDetail?.(material)}
    >
      {/* Gradient accent top bar */}
      <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-hero opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-transform duration-300 group-hover:scale-110">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div className="flex items-center gap-2">
          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="rounded-lg p-1.5 text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
                  title="Delete material"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Material</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{material.title}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleBookmark(material.id); }}
            className="rounded-lg p-1.5 transition-all duration-200 hover:bg-secondary hover:scale-110"
            title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-5 w-5 text-primary" />
            ) : (
              <Bookmark className="h-5 w-5 text-muted-foreground hover:text-primary" />
            )}
          </button>
          <Badge variant="secondary" className="text-xs font-medium">
            {material.file_type.split("/").pop()?.toUpperCase() || "FILE"}
          </Badge>
        </div>
      </div>

      <h3 className="mb-2 line-clamp-2 font-display text-lg font-semibold text-foreground transition-colors duration-200 group-hover:text-primary">
        {material.title}
      </h3>

      <Link
        to={`/subjects/${material.subjects?.slug}`}
        className="mb-2 inline-flex w-fit text-sm text-primary hover:underline"
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
          className="mt-4 w-full rounded-xl bg-gradient-hero hover:opacity-90 transition-all duration-300 hover:scale-[1.02] hover:shadow-glow"
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
