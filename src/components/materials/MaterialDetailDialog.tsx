import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMaterialComments, useAddComment, useDeleteComment } from "@/hooks/useMaterialComments";
import { useMaterialRatings, useMyRating, useRateMaterial } from "@/hooks/useMaterialRatings";
import { useReportMaterial } from "@/hooks/useMaterialReports";
import { useRecordView } from "@/hooks/useMaterialViews";
import StarRating from "@/components/materials/StarRating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  FileText, Download, Eye, User, Star, MessageSquare, Flag,
  Send, Trash2, AlertTriangle, Calendar,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import type { Material } from "@/hooks/useMaterials";

interface MaterialDetailDialogProps {
  material: Material | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload?: (material: { id: string; file_url: string }) => void;
}

const MaterialDetailDialog = ({ material, open, onOpenChange, onDownload }: MaterialDetailDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [commentText, setCommentText] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const materialId = material?.id || "";
  const { data: ratings } = useMaterialRatings(materialId);
  const { data: myRating } = useMyRating(materialId);
  const { data: comments } = useMaterialComments(materialId);
  const rateMutation = useRateMaterial();
  const addCommentMutation = useAddComment();
  const deleteCommentMutation = useDeleteComment();
  const reportMutation = useReportMaterial();
  const recordView = useRecordView();

  // Record view when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && material && user) {
      recordView.mutate(material.id);
    }
    onOpenChange(isOpen);
  };

  const handleRate = (rating: number) => {
    if (!material) return;
    rateMutation.mutate(
      { materialId: material.id, rating },
      { onSuccess: () => toast({ title: "Rating saved!" }) }
    );
  };

  const handleAddComment = () => {
    if (!material || !commentText.trim()) return;
    addCommentMutation.mutate(
      { materialId: material.id, content: commentText.trim() },
      {
        onSuccess: () => {
          setCommentText("");
          toast({ title: "Comment added" });
        },
      }
    );
  };

  const handleDeleteComment = (commentId: string) => {
    if (!material) return;
    deleteCommentMutation.mutate({ commentId, materialId: material.id });
  };

  const handleReport = () => {
    if (!material || !reportReason.trim()) return;
    reportMutation.mutate(
      { materialId: material.id, reason: reportReason.trim() },
      {
        onSuccess: () => {
          setReportOpen(false);
          setReportReason("");
          toast({ title: "Report submitted", description: "An admin will review this material." });
        },
      }
    );
  };

  if (!material) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{material.title}</DialogTitle>
            <DialogDescription className="flex flex-wrap items-center gap-2 pt-1">
              <Badge variant="secondary">{material.subjects?.name}</Badge>
              <Badge variant="outline" className="text-xs">
                {material.file_type.split("/").pop()?.toUpperCase()}
              </Badge>
              <span className="flex items-center gap-1 text-xs">
                <User className="h-3 w-3" />
                {material.author_profile?.full_name || "Unknown"}
              </span>
            </DialogDescription>
          </DialogHeader>

          {/* Description */}
          {material.description && (
            <p className="text-sm text-muted-foreground">{material.description}</p>
          )}

          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-muted/50 p-3">
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" /> {material.views || 0} views
            </span>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Download className="h-4 w-4" /> {material.downloads || 0} downloads
            </span>
            {ratings && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-4 w-4 fill-warning text-warning" />
                {ratings.average} ({ratings.count} {ratings.count === 1 ? "rating" : "ratings"})
              </span>
            )}
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" /> {comments?.length || 0} comments
            </span>
          </div>

          {/* Rating Section */}
          {user && (
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium text-foreground">Rate this material</p>
                <p className="text-xs text-muted-foreground">
                  {myRating ? `You rated ${myRating}/5` : "Click stars to rate"}
                </p>
              </div>
              <StarRating value={myRating || 0} onChange={handleRate} />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              className="flex-1 bg-gradient-hero hover:opacity-90"
              onClick={() => onDownload?.(material)}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setReportOpen(true)}
              title="Report issue"
            >
              <Flag className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>

          {/* Comments Section */}
          <div className="space-y-4">
            <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Discussion ({comments?.length || 0})
            </h3>

            {/* Add Comment */}
            {user && (
              <div className="flex gap-2">
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Ask a question or share your thoughts..."
                  rows={2}
                  className="flex-1 resize-none"
                />
                <Button
                  size="icon"
                  onClick={handleAddComment}
                  disabled={!commentText.trim() || addCommentMutation.isPending}
                  className="self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Comments List */}
            {!comments?.length ? (
              <p className="text-center text-sm text-muted-foreground py-4">
                No comments yet. Be the first to share your thoughts!
              </p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="rounded-lg border border-border bg-card p-3"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {comment.author_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      {user?.id === comment.user_id && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Report Issue
            </DialogTitle>
            <DialogDescription>
              Report a problem with "{material.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Describe the issue (e.g., incorrect content, broken file, inappropriate material)..."
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setReportOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleReport}
                disabled={!reportReason.trim() || reportMutation.isPending}
              >
                {reportMutation.isPending ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MaterialDetailDialog;
