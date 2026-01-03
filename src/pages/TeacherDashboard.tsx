import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubjects } from "@/hooks/useSubjects";
import { useMyMaterials, useUploadMaterial } from "@/hooks/useMaterials";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Upload,
  FileText,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Download,
} from "lucide-react";

const TeacherDashboard = () => {
  const { profile } = useAuth();
  const { data: subjects } = useSubjects();
  const { data: myMaterials, isLoading } = useMyMaterials();
  const uploadMutation = useUploadMaterial();
  const { toast } = useToast();

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !title || !subjectId) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields and select a file.",
        variant: "destructive",
      });
      return;
    }

    try {
      await uploadMutation.mutateAsync({
        title,
        description,
        subjectId,
        file,
      });

      toast({
        title: "Material uploaded!",
        description: "Your material has been submitted for review.",
      });

      setIsUploadOpen(false);
      setTitle("");
      setDescription("");
      setSubjectId("");
      setFile(null);
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-warning/20 text-warning-foreground">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="secondary" className="bg-success/20 text-success">
            <CheckCircle className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="secondary" className="bg-destructive/20 text-destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-background py-8">
        <div className="container px-4 md:px-6">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                Teacher Dashboard
              </h1>
              <p className="text-muted-foreground">
                Welcome back, {profile?.full_name}! Manage your uploaded materials.
              </p>
            </div>

            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-hero hover:opacity-90">
                  <Plus className="mr-2 h-4 w-4" />
                  Upload Material
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="font-display">Upload Study Material</DialogTitle>
                  <DialogDescription>
                    Upload PDFs or notes for students. Materials will be reviewed before publishing.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpload} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter material title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Select value={subjectId} onValueChange={setSubjectId} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects?.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what this material covers..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="file">File *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="file"
                        type="file"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        required
                      />
                    </div>
                    {file && (
                      <p className="text-sm text-muted-foreground">
                        Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsUploadOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gradient-hero hover:opacity-90"
                      disabled={uploadMutation.isPending}
                    >
                      {uploadMutation.isPending ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                          Uploading...
                        </span>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {myMaterials?.length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Uploads</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {myMaterials?.filter((m) => m.status === "approved").length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Approved</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {myMaterials?.filter((m) => m.status === "pending").length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                </div>
              </div>
            </div>
          </div>

          {/* Materials List */}
          <div className="rounded-xl border border-border bg-card shadow-card">
            <div className="border-b border-border p-6">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Your Materials
              </h2>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center p-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : myMaterials?.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                  No materials yet
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Upload your first study material to get started.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {myMaterials?.map((material) => (
                  <div
                    key={material.id}
                    className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{material.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {material.subjects?.name} • {material.file_name}
                        </p>
                        <div className="mt-2 flex items-center gap-4">
                          {getStatusBadge(material.status)}
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Eye className="h-4 w-4" />
                            {material.views || 0}
                          </span>
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Download className="h-4 w-4" />
                            {material.downloads || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(material.file_url, "_blank")}
                    >
                      View File
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TeacherDashboard;
