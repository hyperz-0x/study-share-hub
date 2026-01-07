import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePendingMaterials, useApproveMaterial, useRejectMaterial } from "@/hooks/useMaterials";
import { useAllowedStudents, useAddAllowedStudent, useRemoveAllowedStudent } from "@/hooks/useAllowedStudents";
import { 
  useAllowedTeachers, 
  useTeacherSubjectAssignments, 
  useAssignSubjectToTeacher, 
  useRemoveSubjectFromTeacher,
  useAddAllowedTeacher,
  useRemoveAllowedTeacher
} from "@/hooks/useTeacherManagement";
import { useSubjects } from "@/hooks/useSubjects";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Users,
  Plus,
  Trash2,
  GraduationCap,
  BookOpen,
  X,
} from "lucide-react";

const AdminDashboard = () => {
  const { profile } = useAuth();
  const { data: pendingMaterials, isLoading } = usePendingMaterials();
  const { data: students, isLoading: studentsLoading } = useAllowedStudents();
  const { data: teachers, isLoading: teachersLoading } = useAllowedTeachers();
  const { data: teacherSubjects } = useTeacherSubjectAssignments();
  const { data: subjects } = useSubjects();
  const approveMutation = useApproveMaterial();
  const rejectMutation = useRejectMaterial();
  const addStudentMutation = useAddAllowedStudent();
  const removeStudentMutation = useRemoveAllowedStudent();
  const addTeacherMutation = useAddAllowedTeacher();
  const removeTeacherMutation = useRemoveAllowedTeacher();
  const assignSubjectMutation = useAssignSubjectToTeacher();
  const removeSubjectMutation = useRemoveSubjectFromTeacher();
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

  const getTeacherSubjects = (teacherId: string) => {
    return teacherSubjects?.filter(ts => ts.teacher_id === teacherId) || [];
  };

  const getAvailableSubjectsForTeacher = (teacherId: string) => {
    const assignedSubjectIds = getTeacherSubjects(teacherId).map(ts => ts.subject_id);
    return subjects?.filter(s => !assignedSubjectIds.includes(s.id)) || [];
  };

  const handleApprove = async (materialId: string) => {
    try {
      await approveMutation.mutateAsync(materialId);
      toast({
        title: "Material approved",
        description: "The material is now visible to students. The author has been notified.",
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
        description: "The author has been notified via email.",
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

  const handleAddStudent = async () => {
    if (!newStudentName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter the student's full name.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addStudentMutation.mutateAsync({
        fullName: newStudentName.trim(),
        email: newStudentEmail.trim() || undefined,
      });
      toast({
        title: "Student added",
        description: `${newStudentName} can now register on the platform.`,
      });
      setAddStudentDialogOpen(false);
      setNewStudentName("");
      setNewStudentEmail("");
    } catch (error: any) {
      toast({
        title: "Failed to add student",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRemoveStudent = async (studentId: string, studentName: string) => {
    try {
      await removeStudentMutation.mutateAsync(studentId);
      toast({
        title: "Student removed",
        description: `${studentName} has been removed from the allowed list.`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to remove student",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddTeacher = async () => {
    if (!newTeacherName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter the teacher's full name.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addTeacherMutation.mutateAsync({
        fullName: newTeacherName.trim(),
        email: newTeacherEmail.trim() || undefined,
      });
      toast({
        title: "Teacher added",
        description: `${newTeacherName} can now register as a teacher.`,
      });
      setAddTeacherDialogOpen(false);
      setNewTeacherName("");
      setNewTeacherEmail("");
    } catch (error: any) {
      toast({
        title: "Failed to add teacher",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRemoveTeacher = async (teacherId: string, teacherName: string) => {
    try {
      await removeTeacherMutation.mutateAsync(teacherId);
      toast({
        title: "Teacher removed",
        description: `${teacherName} has been removed.`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to remove teacher",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAssignSubject = async () => {
    if (!selectedTeacherId || !selectedSubjectId) {
      toast({
        title: "Please select a subject",
        variant: "destructive",
      });
      return;
    }

    try {
      await assignSubjectMutation.mutateAsync({
        teacherId: selectedTeacherId,
        subjectId: selectedSubjectId,
      });
      toast({
        title: "Subject assigned",
        description: "The subject has been assigned to the teacher.",
      });
      setAssignSubjectDialogOpen(false);
      setSelectedTeacherId(null);
      setSelectedSubjectId("");
    } catch (error: any) {
      toast({
        title: "Failed to assign subject",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRemoveSubjectAssignment = async (assignmentId: string) => {
    try {
      await removeSubjectMutation.mutateAsync(assignmentId);
      toast({
        title: "Subject removed",
        description: "The subject assignment has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to remove subject",
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

          <Tabs defaultValue="materials" className="space-y-6">
            <TabsList className="grid w-full max-w-lg grid-cols-3">
              <TabsTrigger value="materials" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Materials
              </TabsTrigger>
              <TabsTrigger value="students" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Students
              </TabsTrigger>
              <TabsTrigger value="teachers" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Teachers
              </TabsTrigger>
            </TabsList>

            <TabsContent value="materials" className="space-y-6">
              {/* Stats */}
              <div className="grid gap-4 md:grid-cols-3">
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
            </TabsContent>

            <TabsContent value="students" className="space-y-6">
              {/* Student Stats */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {students?.length || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Allowed Students</p>
                    </div>
                  </div>
                  <Button onClick={() => setAddStudentDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Student
                  </Button>
                </div>
              </div>

              {/* Student List */}
              <div className="rounded-xl border border-border bg-card shadow-card">
                <div className="border-b border-border p-6">
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    Allowed Students
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Students who can register and access the platform
                  </p>
                </div>

                {studentsLoading ? (
                  <div className="flex items-center justify-center p-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : students?.length === 0 ? (
                  <div className="p-12 text-center">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                      No students added
                    </h3>
                    <p className="mt-2 text-muted-foreground">
                      Add students to allow them to register.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {students?.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                            <User className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{student.full_name}</p>
                            {student.email && (
                              <p className="text-sm text-muted-foreground">{student.email}</p>
                            )}
                          </div>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Student</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove {student.full_name} from the allowed list?
                                They will no longer be able to register.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemoveStudent(student.id, student.full_name)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="teachers" className="space-y-6">
              {/* Teacher Stats */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                      <GraduationCap className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {teachers?.length || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Registered Teachers</p>
                    </div>
                  </div>
                  <Button onClick={() => setAddTeacherDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Teacher
                  </Button>
                </div>
              </div>

              {/* Teacher List with Subject Assignments */}
              <div className="rounded-xl border border-border bg-card shadow-card">
                <div className="border-b border-border p-6">
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    Teachers & Subject Assignments
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Manage teachers and assign subjects they can teach
                  </p>
                </div>

                {teachersLoading ? (
                  <div className="flex items-center justify-center p-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : teachers?.length === 0 ? (
                  <div className="p-12 text-center">
                    <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                      No teachers added
                    </h3>
                    <p className="mt-2 text-muted-foreground">
                      Add teachers to allow them to upload materials.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {teachers?.map((teacher) => {
                      const assignedSubjects = getTeacherSubjects(teacher.id);
                      const availableSubjects = getAvailableSubjectsForTeacher(teacher.id);

                      return (
                        <div key={teacher.id} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                                <GraduationCap className="h-5 w-5 text-accent" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{teacher.full_name}</p>
                                {teacher.email && (
                                  <p className="text-sm text-muted-foreground">{teacher.email}</p>
                                )}
                                {/* Assigned Subjects */}
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {assignedSubjects.length === 0 ? (
                                    <span className="text-sm text-muted-foreground italic">
                                      No subjects assigned
                                    </span>
                                  ) : (
                                    assignedSubjects.map((ts) => (
                                      <Badge
                                        key={ts.id}
                                        variant="secondary"
                                        className="flex items-center gap-1"
                                      >
                                        <BookOpen className="h-3 w-3" />
                                        {ts.subjects?.name}
                                        <button
                                          onClick={() => handleRemoveSubjectAssignment(ts.id)}
                                          className="ml-1 rounded-full p-0.5 hover:bg-destructive/20"
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </Badge>
                                    ))
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {availableSubjects.length > 0 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedTeacherId(teacher.id);
                                    setAssignSubjectDialogOpen(true);
                                  }}
                                >
                                  <Plus className="mr-1 h-4 w-4" />
                                  Assign Subject
                                </Button>
                              )}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove Teacher</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove {teacher.full_name}? This will also remove all their subject assignments.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleRemoveTeacher(teacher.id, teacher.full_name)}
                                      className="bg-destructive hover:bg-destructive/90"
                                    >
                                      Remove
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
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
          </Tabs>
        </div>
      </main>
      <Footer />

      {/* Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Reject Material</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejection. This will be shared with the author via email.
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

      {/* Add Student Dialog */}
      <Dialog open={addStudentDialogOpen} onOpenChange={setAddStudentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Add Student</DialogTitle>
            <DialogDescription>
              Add a new student to the allowed list. They will be able to register with this name.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="studentName">Full Name *</Label>
              <Input
                id="studentName"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                placeholder="Enter student's full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentEmail">Email (optional)</Label>
              <Input
                id="studentEmail"
                type="email"
                value={newStudentEmail}
                onChange={(e) => setNewStudentEmail(e.target.value)}
                placeholder="Enter student's email"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddStudentDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddStudent}
                disabled={addStudentMutation.isPending}
              >
                {addStudentMutation.isPending ? "Adding..." : "Add Student"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Teacher Dialog */}
      <Dialog open={addTeacherDialogOpen} onOpenChange={setAddTeacherDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Add Teacher</DialogTitle>
            <DialogDescription>
              Add a new teacher to the allowed list. They will be able to register and upload materials.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teacherName">Full Name *</Label>
              <Input
                id="teacherName"
                value={newTeacherName}
                onChange={(e) => setNewTeacherName(e.target.value)}
                placeholder="Enter teacher's full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacherEmail">Email (optional)</Label>
              <Input
                id="teacherEmail"
                type="email"
                value={newTeacherEmail}
                onChange={(e) => setNewTeacherEmail(e.target.value)}
                placeholder="Enter teacher's email"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddTeacherDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddTeacher}
                disabled={addTeacherMutation.isPending}
              >
                {addTeacherMutation.isPending ? "Adding..." : "Add Teacher"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Subject Dialog */}
      <Dialog open={assignSubjectDialogOpen} onOpenChange={setAssignSubjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Assign Subject</DialogTitle>
            <DialogDescription>
              Select a subject to assign to this teacher.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {selectedTeacherId &&
                    getAvailableSubjectsForTeacher(selectedTeacherId).map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAssignSubjectDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAssignSubject}
                disabled={assignSubjectMutation.isPending || !selectedSubjectId}
              >
                {assignSubjectMutation.isPending ? "Assigning..." : "Assign Subject"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
