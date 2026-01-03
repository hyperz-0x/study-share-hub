import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePendingMaterials, useApproveMaterial, useRejectMaterial } from "@/hooks/useMaterials";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  User,
} from "lucide-react";

const AdminDashboard = () => {
  const { profile } = useAuth();
  const { data: pendingMaterials, isLoading } = usePendingMaterials();
  const approveMutation = useApproveMaterial();
  const rejectMutation = useRejectMaterial();
  const { toast } = useToast();

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleApprove = async (materialId: string) => {
    try {
      await approveMutation.mutateAsync(materialId);
      toast({
        title: "Material approved",
        description: "The material is now visible to students.",
      });
    } catch (error: any) {
      toast({
        title: "Approval failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleReject = async () => {
    if (!selectedMaterialId || !rejectionReason.trim()) {
      toast({
        title: "Rejection reason required",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }

    try {
      await rejectMutation.mutateAsync({
        materialId: selectedMaterialId,
        reason: rejectionReason,
      });
      toast({
        title: "Material rejected",
        description: "The author has been notified.",
      });
      setRejectDialogOpen(false);
      setSelectedMaterialId(null);
      setRejectionReason("");
    } catch (error: any) {
      toast({
        title: "Rejection failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-background py-8">
        <div className="container px-4 md:px-6">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-hero">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold text-foreground">
                  Admin Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Welcome, {profile?.full_name}! Review and manage content submissions.
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {pendingMaterials?.length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">-</p>
                  <p className="text-sm text-muted-foreground">Approved Today</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                  <XCircle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">-</p>
                  <p className="text-sm text-muted-foreground">Rejected Today</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Materials */}
          <div className="rounded-xl border border-border bg-card shadow-card">
            <div className="border-b border-border p-6">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Pending Review
              </h2>
              <p className="text-sm text-muted-foreground">
                Review and approve or reject submitted materials
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center p-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : pendingMaterials?.length === 0 ? (
              <div className="p-12 text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-success/50" />
                <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                  All caught up!
                </h3>
                <p className="mt-2 text-muted-foreground">
                  No materials pending review.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {pendingMaterials?.map((material) => (
                  <div key={material.id} className="p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{material.title}</h3>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">{material.subjects?.name}</Badge>
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                              <User className="h-3 w-3" />
                              {material.author_profile?.full_name || "Unknown"}
                            </span>
                          </div>
                          {material.description && (
                            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                              {material.description}
                            </p>
                          )}
                          <div className="mt-2 text-xs text-muted-foreground">
                            {material.file_name} • {material.file_type}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(material.file_url, "_blank")}
                        >
                          <ExternalLink className="mr-1 h-4 w-4" />
                          Preview
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            setSelectedMaterialId(material.id);
                            setRejectDialogOpen(true);
                          }}
                          disabled={rejectMutation.isPending}
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className="bg-success hover:bg-success/90"
                          onClick={() => handleApprove(material.id)}
                          disabled={approveMutation.isPending}
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {/* Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Reject Material</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejection. This will be shared with the author.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this material is being rejected..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={rejectMutation.isPending}
              >
                {rejectMutation.isPending ? "Rejecting..." : "Reject Material"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
