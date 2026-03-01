import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePendingMaterials, useApproveMaterial, useRejectMaterial } from "@/hooks/useMaterials";
import { useAllowedStudents, useAddAllowedStudent, useRemoveAllowedStudent } from "@/hooks/useAllowedStudents";
import { 
  useAllowedTeachers, useTeacherSubjectAssignments, useAssignSubjectToTeacher, 
  useRemoveSubjectFromTeacher, useAddAllowedTeacher, useRemoveAllowedTeacher
} from "@/hooks/useTeacherManagement";
import { useSubjects } from "@/hooks/useSubjects";
import { useRejectionTemplates, useAddRejectionTemplate, useDeleteRejectionTemplate } from "@/hooks/useRejectionTemplates";
import { useModerationLog, useLogModeration } from "@/hooks/useModerationLog";
import { useAnalyticsV2 } from "@/hooks/useAnalyticsV2";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Shield, FileText, CheckCircle, XCircle, Clock, ExternalLink, User, Users,
  Plus, Trash2, GraduationCap, BookOpen, X, BarChart3, History, AlertTriangle, ListChecks,
} from "lucide-react";
import { formatDistanceToNow, differenceInHours } from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const AdminDashboard = () => {
  const { profile } = useAuth();
  const { data: pendingMaterials, isLoading } = usePendingMaterials();
  const { data: students, isLoading: studentsLoading } = useAllowedStudents();
  const { data: teachers, isLoading: teachersLoading } = useAllowedTeachers();
  const { data: teacherSubjects } = useTeacherSubjectAssignments();
  const { data: subjects } = useSubjects();
  const { data: rejectionTemplates } = useRejectionTemplates();
  const { data: moderationLog } = useModerationLog();
  const { data: analytics } = useAnalyticsV2();
  const approveMutation = useApproveMaterial();
  const rejectMutation = useRejectMaterial();
  const logModeration = useLogModeration();
  const addStudentMutation = useAddAllowedStudent();
  const removeStudentMutation = useRemoveAllowedStudent();
  const addTeacherMutation = useAddAllowedTeacher();
  const removeTeacherMutation = useRemoveAllowedTeacher();
  const assignSubjectMutation = useAssignSubjectToTeacher();
  const removeSubjectMutation = useRemoveSubjectFromTeacher();
  const addTemplateMutation = useAddRejectionTemplate();
  const deleteTemplateMutation = useDeleteRejectionTemplate();
  const { toast } = useToast();

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [addStudentDialogOpen, setAddStudentDialogOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [addTeacherDialogOpen, setAddTeacherDialogOpen] = useState(false);
  const [newTeacherName, setNewTeacherName] = useState("");
  const [newTeacherEmail, setNewTeacherEmail] = useState("");
  const [assignSubjectDialogOpen, setAssignSubjectDialogOpen] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [newTemplateTitle, setNewTemplateTitle] = useState("");
  const [newTemplateReason, setNewTemplateReason] = useState("");

  const getTeacherSubjects = (teacherId: string) =>
    teacherSubjects?.filter((ts) => ts.teacher_id === teacherId) || [];
  const getAvailableSubjectsForTeacher = (teacherId: string) => {
    const assignedSubjectIds = getTeacherSubjects(teacherId).map((ts) => ts.subject_id);
    return subjects?.filter((s) => !assignedSubjectIds.includes(s.id)) || [];
  };

  // Materials needing review > 48h
  const urgentMaterials = pendingMaterials?.filter(
    (m) => differenceInHours(new Date(), new Date(m.created_at)) > 48
  ) || [];

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const handleApprove = async (materialId: string) => {
    try {
      await approveMutation.mutateAsync(materialId);
      logModeration.mutate({ materialId, action: "approved" });
      toast({ title: "Material approved" });
    } catch (error: any) {
      toast({ title: "Approval failed", description: error.message, variant: "destructive" });
    }
  };

  const handleBulkApprove = async () => {
    for (const id of selectedIds) {
      await handleApprove(id);
    }
    setSelectedIds(new Set());
  };

  const handleReject = async () => {
    if (!selectedMaterialId || !rejectionReason.trim()) {
      toast({ title: "Rejection reason required", variant: "destructive" });
      return;
    }
    try {
      await rejectMutation.mutateAsync({ materialId: selectedMaterialId, reason: rejectionReason });
      logModeration.mutate({ materialId: selectedMaterialId, action: "rejected", reason: rejectionReason });
      toast({ title: "Material rejected" });
      setRejectDialogOpen(false); setSelectedMaterialId(null); setRejectionReason("");
    } catch (error: any) {
      toast({ title: "Rejection failed", description: error.message, variant: "destructive" });
    }
  };

  const handleBulkReject = () => {
    if (selectedIds.size === 0) return;
    // Open reject dialog for bulk - will reject all with same reason
    setSelectedMaterialId([...selectedIds][0]);
    setRejectDialogOpen(true);
  };

  const handleAddStudent = async () => {
    if (!newStudentName.trim()) { toast({ title: "Name required", variant: "destructive" }); return; }
    try {
      await addStudentMutation.mutateAsync({ fullName: newStudentName.trim(), email: newStudentEmail.trim() || undefined });
      toast({ title: "Student added" }); setAddStudentDialogOpen(false); setNewStudentName(""); setNewStudentEmail("");
    } catch (error: any) { toast({ title: "Failed", description: error.message, variant: "destructive" }); }
  };
  const handleRemoveStudent = async (id: string, name: string) => {
    try { await removeStudentMutation.mutateAsync(id); toast({ title: `${name} removed` }); }
    catch (error: any) { toast({ title: "Failed", description: error.message, variant: "destructive" }); }
  };
  const handleAddTeacher = async () => {
    if (!newTeacherName.trim()) { toast({ title: "Name required", variant: "destructive" }); return; }
    try {
      await addTeacherMutation.mutateAsync({ fullName: newTeacherName.trim(), email: newTeacherEmail.trim() || undefined });
      toast({ title: "Teacher added" }); setAddTeacherDialogOpen(false); setNewTeacherName(""); setNewTeacherEmail("");
    } catch (error: any) { toast({ title: "Failed", description: error.message, variant: "destructive" }); }
  };
  const handleRemoveTeacher = async (id: string, name: string) => {
    try { await removeTeacherMutation.mutateAsync(id); toast({ title: `${name} removed` }); }
    catch (error: any) { toast({ title: "Failed", description: error.message, variant: "destructive" }); }
  };
  const handleAssignSubject = async () => {
    if (!selectedTeacherId || !selectedSubjectId) { toast({ title: "Select a subject", variant: "destructive" }); return; }
    try {
      await assignSubjectMutation.mutateAsync({ teacherId: selectedTeacherId, subjectId: selectedSubjectId });
      toast({ title: "Subject assigned" }); setAssignSubjectDialogOpen(false); setSelectedTeacherId(null); setSelectedSubjectId("");
    } catch (error: any) { toast({ title: "Failed", description: error.message, variant: "destructive" }); }
  };
  const handleRemoveSubjectAssignment = async (assignmentId: string) => {
    try { await removeSubjectMutation.mutateAsync(assignmentId); toast({ title: "Subject removed" }); }
    catch (error: any) { toast({ title: "Failed", description: error.message, variant: "destructive" }); }
  };
  const handleAddTemplate = async () => {
    if (!newTemplateTitle.trim() || !newTemplateReason.trim()) { toast({ title: "Fill all fields", variant: "destructive" }); return; }
    try {
      await addTemplateMutation.mutateAsync({ title: newTemplateTitle, reason: newTemplateReason });
      toast({ title: "Template added" }); setTemplateDialogOpen(false); setNewTemplateTitle(""); setNewTemplateReason("");
    } catch (error: any) { toast({ title: "Failed", description: error.message, variant: "destructive" }); }
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
                <h1 className="font-display text-3xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-muted-foreground">Welcome, {profile?.full_name}!</p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="materials" className="space-y-6">
            <TabsList className="grid w-full max-w-2xl grid-cols-5">
              <TabsTrigger value="materials" className="flex items-center gap-1 text-xs"><FileText className="h-4 w-4" />Materials</TabsTrigger>
              <TabsTrigger value="students" className="flex items-center gap-1 text-xs"><Users className="h-4 w-4" />Students</TabsTrigger>
              <TabsTrigger value="teachers" className="flex items-center gap-1 text-xs"><GraduationCap className="h-4 w-4" />Teachers</TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-1 text-xs"><BarChart3 className="h-4 w-4" />Analytics</TabsTrigger>
              <TabsTrigger value="audit" className="flex items-center gap-1 text-xs"><History className="h-4 w-4" />Audit Log</TabsTrigger>
            </TabsList>

            {/* MATERIALS TAB */}
            <TabsContent value="materials" className="space-y-6">
              {/* Stats */}
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10"><Clock className="h-6 w-6 text-warning" /></div>
                    <div><p className="text-2xl font-bold text-foreground">{pendingMaterials?.length || 0}</p><p className="text-sm text-muted-foreground">Pending</p></div>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10"><AlertTriangle className="h-6 w-6 text-destructive" /></div>
                    <div><p className="text-2xl font-bold text-foreground">{urgentMaterials.length}</p><p className="text-sm text-muted-foreground">&gt;48h Queue</p></div>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10"><CheckCircle className="h-6 w-6 text-success" /></div>
                    <div><p className="text-2xl font-bold text-foreground">{moderationLog?.filter((l) => l.action === "approved").length || 0}</p><p className="text-sm text-muted-foreground">Approved</p></div>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10"><ListChecks className="h-6 w-6 text-primary" /></div>
                    <div><p className="text-2xl font-bold text-foreground">{rejectionTemplates?.length || 0}</p><p className="text-sm text-muted-foreground">Templates</p></div>
                  </div>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedIds.size > 0 && (
                <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
                  <span className="text-sm font-medium text-foreground">{selectedIds.size} selected</span>
                  <Button size="sm" className="bg-success hover:bg-success/90" onClick={handleBulkApprove}>
                    <CheckCircle className="mr-1 h-4 w-4" />Approve All
                  </Button>
                  <Button size="sm" variant="destructive" onClick={handleBulkReject}>
                    <XCircle className="mr-1 h-4 w-4" />Reject All
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>Clear</Button>
                </div>
              )}

              {/* Rejection Templates */}
              <div className="rounded-xl border border-border bg-card p-4 shadow-card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground">Rejection Templates</h3>
                  <Button size="sm" variant="outline" onClick={() => setTemplateDialogOpen(true)}>
                    <Plus className="mr-1 h-3 w-3" />Add Template
                  </Button>
                </div>
                {rejectionTemplates?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {rejectionTemplates.map((t) => (
                      <Badge key={t.id} variant="secondary" className="flex items-center gap-1 cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => { setRejectionReason(t.reason); }}>
                        {t.title}
                        <button onClick={(e) => { e.stopPropagation(); deleteTemplateMutation.mutate(t.id); }} className="ml-1 rounded-full p-0.5 hover:bg-destructive/20">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">No templates yet. Add common rejection reasons for quick use.</p>}
              </div>

              {/* Pending Materials */}
              <div className="rounded-xl border border-border bg-card shadow-card">
                <div className="border-b border-border p-6">
                  <h2 className="font-display text-xl font-semibold text-foreground">Pending Review</h2>
                  <p className="text-sm text-muted-foreground">Review and approve or reject submitted materials</p>
                </div>
                {isLoading ? (
                  <div className="flex items-center justify-center p-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
                ) : !pendingMaterials?.length ? (
                  <div className="p-12 text-center">
                    <CheckCircle className="mx-auto h-12 w-12 text-success/50" />
                    <h3 className="mt-4 font-display text-lg font-semibold text-foreground">All caught up!</h3>
                    <p className="mt-2 text-muted-foreground">No materials pending review.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {pendingMaterials.map((material) => {
                      const isUrgent = differenceInHours(new Date(), new Date(material.created_at)) > 48;
                      return (
                        <div key={material.id} className={`p-6 ${isUrgent ? "bg-destructive/5" : ""}`}>
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex items-start gap-4">
                              <Checkbox checked={selectedIds.has(material.id)} onCheckedChange={() => toggleSelect(material.id)} className="mt-1" />
                              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10"><FileText className="h-6 w-6 text-primary" /></div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium text-foreground">{material.title}</h3>
                                  {isUrgent && <Badge variant="destructive" className="text-xs">Overdue</Badge>}
                                </div>
                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                  <Badge variant="secondary">{material.subjects?.name}</Badge>
                                  <span className="flex items-center gap-1 text-sm text-muted-foreground"><User className="h-3 w-3" />{material.author_profile?.full_name || "Unknown"}</span>
                                </div>
                                {material.description && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{material.description}</p>}
                                <div className="mt-2 text-xs text-muted-foreground">
                                  {material.file_name} • Submitted {formatDistanceToNow(new Date(material.created_at), { addSuffix: true })}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => window.open(material.file_url, "_blank")}>
                                <ExternalLink className="mr-1 h-4 w-4" />Preview
                              </Button>
                              <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10"
                                onClick={() => { setSelectedMaterialId(material.id); setRejectDialogOpen(true); }} disabled={rejectMutation.isPending}>
                                <XCircle className="mr-1 h-4 w-4" />Reject
                              </Button>
                              <Button size="sm" className="bg-success hover:bg-success/90" onClick={() => handleApprove(material.id)} disabled={approveMutation.isPending}>
                                <CheckCircle className="mr-1 h-4 w-4" />Approve
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* STUDENTS TAB */}
            <TabsContent value="students" className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10"><Users className="h-6 w-6 text-primary" /></div>
                    <div><p className="text-2xl font-bold text-foreground">{students?.length || 0}</p><p className="text-sm text-muted-foreground">Allowed Students</p></div>
                  </div>
                  <Button onClick={() => setAddStudentDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />Add Student</Button>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card shadow-card">
                <div className="border-b border-border p-6"><h2 className="font-display text-xl font-semibold text-foreground">Allowed Students</h2></div>
                {studentsLoading ? (
                  <div className="flex items-center justify-center p-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
                ) : !students?.length ? (
                  <div className="p-12 text-center"><Users className="mx-auto h-12 w-12 text-muted-foreground/50" /><h3 className="mt-4 font-display text-lg font-semibold text-foreground">No students added</h3></div>
                ) : (
                  <div className="divide-y divide-border">
                    {students.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary"><User className="h-5 w-5 text-muted-foreground" /></div>
                          <div><p className="font-medium text-foreground">{student.full_name}</p>{student.email && <p className="text-sm text-muted-foreground">{student.email}</p>}</div>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                          <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Remove Student</AlertDialogTitle><AlertDialogDescription>Remove {student.full_name}?</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleRemoveStudent(student.id, student.full_name)} className="bg-destructive hover:bg-destructive/90">Remove</AlertDialogAction></AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TEACHERS TAB */}
            <TabsContent value="teachers" className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10"><GraduationCap className="h-6 w-6 text-accent" /></div>
                    <div><p className="text-2xl font-bold text-foreground">{teachers?.length || 0}</p><p className="text-sm text-muted-foreground">Teachers</p></div>
                  </div>
                  <Button onClick={() => setAddTeacherDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />Add Teacher</Button>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card shadow-card">
                <div className="border-b border-border p-6"><h2 className="font-display text-xl font-semibold text-foreground">Teachers & Subject Assignments</h2></div>
                {teachersLoading ? (
                  <div className="flex items-center justify-center p-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
                ) : !teachers?.length ? (
                  <div className="p-12 text-center"><GraduationCap className="mx-auto h-12 w-12 text-muted-foreground/50" /><h3 className="mt-4 font-display text-lg font-semibold text-foreground">No teachers added</h3></div>
                ) : (
                  <div className="divide-y divide-border">
                    {teachers.map((teacher) => {
                      const assignedSubjects = getTeacherSubjects(teacher.id);
                      const availableSubjects = getAvailableSubjectsForTeacher(teacher.id);
                      return (
                        <div key={teacher.id} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10"><GraduationCap className="h-5 w-5 text-accent" /></div>
                              <div>
                                <p className="font-medium text-foreground">{teacher.full_name}</p>
                                {teacher.email && <p className="text-sm text-muted-foreground">{teacher.email}</p>}
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {assignedSubjects.length === 0 ? (
                                    <span className="text-sm text-muted-foreground italic">No subjects assigned</span>
                                  ) : assignedSubjects.map((ts) => (
                                    <Badge key={ts.id} variant="secondary" className="flex items-center gap-1">
                                      <BookOpen className="h-3 w-3" />{ts.subjects?.name}
                                      <button onClick={() => handleRemoveSubjectAssignment(ts.id)} className="ml-1 rounded-full p-0.5 hover:bg-destructive/20"><X className="h-3 w-3" /></button>
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {availableSubjects.length > 0 && (
                                <Button variant="outline" size="sm" onClick={() => { setSelectedTeacherId(teacher.id); setAssignSubjectDialogOpen(true); }}>
                                  <Plus className="mr-1 h-4 w-4" />Assign Subject
                                </Button>
                              )}
                              <AlertDialog>
                                <AlertDialogTrigger asChild><Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Remove Teacher</AlertDialogTitle><AlertDialogDescription>Remove {teacher.full_name}?</AlertDialogDescription></AlertDialogHeader>
                                  <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleRemoveTeacher(teacher.id, teacher.full_name)} className="bg-destructive hover:bg-destructive/90">Remove</AlertDialogAction></AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ANALYTICS TAB */}
            <TabsContent value="analytics" className="space-y-6">
              {analytics && (
                <>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                      <p className="text-sm text-muted-foreground">Total Uploads (8 wks)</p>
                      <p className="text-3xl font-bold text-foreground">{analytics.totalUploads}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                      <p className="text-sm text-muted-foreground">Rejection Rate</p>
                      <p className="text-3xl font-bold text-destructive">{analytics.rejectionRate}%</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                      <p className="text-sm text-muted-foreground">Total Rejected</p>
                      <p className="text-3xl font-bold text-foreground">{analytics.totalRejected}</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                    <h3 className="mb-4 font-display text-lg font-semibold text-foreground">Weekly Trends</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={analytics.weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="uploads" name="Uploads" fill="hsl(210 85% 45%)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="downloads" name="Downloads" fill="hsl(145 65% 42%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                      <h3 className="mb-3 font-display text-lg font-semibold text-foreground">Top Teachers</h3>
                      <div className="space-y-3">
                        {analytics.topTeachers.map((t, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <span className="text-sm text-foreground">{t.name}</span>
                            <Badge variant="secondary">{t.uploads} uploads</Badge>
                          </div>
                        ))}
                        {!analytics.topTeachers.length && <p className="text-sm text-muted-foreground">No data yet</p>}
                      </div>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                      <h3 className="mb-3 font-display text-lg font-semibold text-foreground">Top Materials</h3>
                      <div className="space-y-3">
                        {analytics.topMaterials.map((m: any, i: number) => (
                          <div key={i} className="flex items-center justify-between">
                            <div>
                              <span className="text-sm text-foreground">{m.title}</span>
                              <span className="ml-2 text-xs text-muted-foreground">{m.subjects?.name}</span>
                            </div>
                            <Badge variant="secondary">{m.downloads || 0} downloads</Badge>
                          </div>
                        ))}
                        {!analytics.topMaterials.length && <p className="text-sm text-muted-foreground">No data yet</p>}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            {/* AUDIT LOG TAB */}
            <TabsContent value="audit" className="space-y-6">
              <div className="rounded-xl border border-border bg-card shadow-card">
                <div className="border-b border-border p-6">
                  <h2 className="font-display text-xl font-semibold text-foreground">Moderation Audit Log</h2>
                  <p className="text-sm text-muted-foreground">Recent moderation actions</p>
                </div>
                {!moderationLog?.length ? (
                  <div className="p-12 text-center"><History className="mx-auto h-12 w-12 text-muted-foreground/50" /><h3 className="mt-4 font-display text-lg font-semibold text-foreground">No activity yet</h3></div>
                ) : (
                  <div className="divide-y divide-border">
                    {moderationLog.map((log) => (
                      <div key={log.id} className="p-4 flex items-center gap-4">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${log.action === "approved" ? "bg-success/10" : "bg-destructive/10"}`}>
                          {log.action === "approved" ? <CheckCircle className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-destructive" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground">
                            <span className="font-medium">{log.admin_name}</span>
                            {" "}{log.action}{" "}
                            <span className="font-medium">{log.material_title}</span>
                          </p>
                          {log.reason && <p className="text-xs text-muted-foreground truncate">Reason: {log.reason}</p>}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                        </span>
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

      {/* Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Reject Material</DialogTitle>
            <DialogDescription>Provide a reason for rejection. This will be shared with the author.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {rejectionTemplates && rejectionTemplates.length > 0 && (
              <div>
                <Label className="text-xs text-muted-foreground">Quick templates:</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {rejectionTemplates.map((t) => (
                    <Badge key={t.id} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground" onClick={() => setRejectionReason(t.reason)}>
                      {t.title}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea id="reason" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Explain why..." rows={4} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleReject} disabled={rejectMutation.isPending}>
                {rejectMutation.isPending ? "Rejecting..." : "Reject Material"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Student Dialog */}
      <Dialog open={addStudentDialogOpen} onOpenChange={setAddStudentDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">Add Student</DialogTitle><DialogDescription>Add a new student to the allowed list.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Full Name *</Label><Input value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)} placeholder="Full name" /></div>
            <div className="space-y-2"><Label>Email (optional)</Label><Input type="email" value={newStudentEmail} onChange={(e) => setNewStudentEmail(e.target.value)} placeholder="Email" /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddStudentDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddStudent} disabled={addStudentMutation.isPending}>{addStudentMutation.isPending ? "Adding..." : "Add Student"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Teacher Dialog */}
      <Dialog open={addTeacherDialogOpen} onOpenChange={setAddTeacherDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">Add Teacher</DialogTitle><DialogDescription>Add a new teacher to the allowed list.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Full Name *</Label><Input value={newTeacherName} onChange={(e) => setNewTeacherName(e.target.value)} placeholder="Full name" /></div>
            <div className="space-y-2"><Label>Email (optional)</Label><Input type="email" value={newTeacherEmail} onChange={(e) => setNewTeacherEmail(e.target.value)} placeholder="Email" /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddTeacherDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddTeacher} disabled={addTeacherMutation.isPending}>{addTeacherMutation.isPending ? "Adding..." : "Add Teacher"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Subject Dialog */}
      <Dialog open={assignSubjectDialogOpen} onOpenChange={setAssignSubjectDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">Assign Subject</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
              <SelectTrigger><SelectValue placeholder="Select a subject" /></SelectTrigger>
              <SelectContent>
                {selectedTeacherId && getAvailableSubjectsForTeacher(selectedTeacherId).map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAssignSubjectDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAssignSubject} disabled={assignSubjectMutation.isPending}>{assignSubjectMutation.isPending ? "Assigning..." : "Assign"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Template Dialog */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">Add Rejection Template</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Template Name</Label><Input value={newTemplateTitle} onChange={(e) => setNewTemplateTitle(e.target.value)} placeholder="e.g. Low Quality" /></div>
            <div className="space-y-2"><Label>Rejection Reason</Label><Textarea value={newTemplateReason} onChange={(e) => setNewTemplateReason(e.target.value)} placeholder="The rejection reason text..." rows={3} /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddTemplate} disabled={addTemplateMutation.isPending}>Add Template</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
