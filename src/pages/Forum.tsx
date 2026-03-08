import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useSubjects } from "@/hooks/useSubjects";
import { Plus, MessageSquare, Eye, CheckCircle2, Pin, Trash2, ArrowLeft, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const Forum = () => {
  const { user, profile, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: subjects } = useSubjects();
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [threadForm, setThreadForm] = useState({ title: "", content: "", subject_id: "" });
  const [replyContent, setReplyContent] = useState("");

  const { data: threads = [] } = useQuery({
    queryKey: ["forum-threads", subjectFilter],
    queryFn: async () => {
      let query = supabase.from("forum_threads").select("*, subjects(name)").order("is_pinned", { ascending: false }).order("created_at", { ascending: false });
      if (subjectFilter !== "all") query = query.eq("subject_id", subjectFilter);
      const { data, error } = await query;
      if (error) throw error;
      // Fetch profiles for all user_ids
      const userIds = [...new Set((data || []).map((t: any) => t.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds);
      const profileMap = new Map(profiles?.map((p) => [p.user_id, p.full_name]) || []);
      return (data || []).map((t: any) => ({ ...t, author_name: profileMap.get(t.user_id) || "Unknown" }));
    },
    enabled: !!user,
  });

  const { data: currentThread } = useQuery({
    queryKey: ["forum-thread", selectedThread],
    queryFn: async () => {
      const { data, error } = await supabase.from("forum_threads").select("*, subjects(name)").eq("id", selectedThread!).single();
      if (error) throw error;
      const { data: prof } = await supabase.from("profiles").select("full_name").eq("user_id", data.user_id).single();
      return { ...data, author_name: prof?.full_name || "Unknown" };
    },
    enabled: !!selectedThread,
  });

  const { data: replies = [] } = useQuery({
    queryKey: ["forum-replies", selectedThread],
    queryFn: async () => {
      const { data, error } = await supabase.from("forum_replies").select("*").eq("thread_id", selectedThread!).order("created_at", { ascending: true });
      if (error) throw error;
      const userIds = [...new Set((data || []).map((r: any) => r.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds);
      const profileMap = new Map(profiles?.map((p) => [p.user_id, p.full_name]) || []);
      return (data || []).map((r: any) => ({ ...r, author_name: profileMap.get(r.user_id) || "Unknown" }));
    },
    enabled: !!selectedThread,
  });

  const createThread = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("forum_threads").insert({
        user_id: user!.id,
        title: threadForm.title,
        content: threadForm.content,
        subject_id: threadForm.subject_id || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-threads"] });
      setCreateOpen(false);
      setThreadForm({ title: "", content: "", subject_id: "" });
      toast({ title: "Thread created!" });
    },
  });

  const postReply = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("forum_replies").insert({
        thread_id: selectedThread!,
        user_id: user!.id,
        content: replyContent,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-replies", selectedThread] });
      setReplyContent("");
      toast({ title: "Reply posted!" });
    },
  });

  const deleteThread = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("forum_threads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-threads"] });
      setSelectedThread(null);
    },
  });

  const toggleResolved = useMutation({
    mutationFn: async ({ id, resolved }: { id: string; resolved: boolean }) => {
      const { error } = await supabase.from("forum_threads").update({ is_resolved: resolved }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-thread", selectedThread] });
      queryClient.invalidateQueries({ queryKey: ["forum-threads"] });
    },
  });

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center"><p className="text-muted-foreground">Please log in to access the Discussion Forum.</p></main>
        <Footer />
      </div>
    );
  }

  // Thread detail view
  if (selectedThread && currentThread) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-background">
          <div className="container px-4 py-8 md:px-6 max-w-3xl">
            <Button variant="ghost" className="mb-4 gap-2" onClick={() => setSelectedThread(null)}>
              <ArrowLeft className="h-4 w-4" />Back to Forum
            </Button>
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {currentThread.is_pinned && <Pin className="h-4 w-4 text-accent" />}
                      {currentThread.is_resolved && <Badge className="bg-success/10 text-success border-0">Resolved</Badge>}
                      {currentThread.subjects?.name && <Badge variant="secondary">{currentThread.subjects.name}</Badge>}
                    </div>
                    <CardTitle className="text-xl">{currentThread.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      by {(currentThread as any).profiles?.full_name || "Unknown"} · {formatDistanceToNow(new Date(currentThread.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {(currentThread.user_id === user.id || isAdmin) && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => toggleResolved.mutate({ id: currentThread.id, resolved: !currentThread.is_resolved })}>
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteThread.mutate(currentThread.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-wrap">{currentThread.content}</p>
              </CardContent>
            </Card>

            <h3 className="font-semibold text-foreground mb-4">{replies.length} {replies.length === 1 ? "Reply" : "Replies"}</h3>
            <div className="space-y-4 mb-6">
              {replies.map((r: any) => (
                <Card key={r.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-foreground">{r.profiles?.full_name || "Unknown"}</span>
                      <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</span>
                      {r.is_answer && <Badge className="bg-success/10 text-success border-0 text-xs">Answer</Badge>}
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{r.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardContent className="p-4">
                <Textarea placeholder="Write your reply..." value={replyContent} onChange={(e) => setReplyContent(e.target.value)} className="mb-3" />
                <Button onClick={() => postReply.mutate()} disabled={!replyContent.trim() || postReply.isPending} className="gap-2">
                  <Send className="h-4 w-4" />Post Reply
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Thread list view
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <div className="container px-4 py-8 md:px-6">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">Discussion Forum</h1>
              <p className="text-muted-foreground">Ask questions, share knowledge, and learn together</p>
            </div>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-hero hover:opacity-90 gap-2"><Plus className="h-4 w-4" />New Thread</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Start a Discussion</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <Input placeholder="Thread title" value={threadForm.title} onChange={(e) => setThreadForm({ ...threadForm, title: e.target.value })} />
                  <Select value={threadForm.subject_id} onValueChange={(v) => setThreadForm({ ...threadForm, subject_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Subject (optional)" /></SelectTrigger>
                    <SelectContent>{subjects?.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <Textarea placeholder="Describe your question or topic..." value={threadForm.content} onChange={(e) => setThreadForm({ ...threadForm, content: e.target.value })} rows={5} />
                  <Button className="w-full" onClick={() => createThread.mutate()} disabled={!threadForm.title || !threadForm.content || createThread.isPending}>Create Thread</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mb-6">
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Filter by subject" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects?.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {threads.length === 0 && <p className="text-center text-muted-foreground py-12">No threads yet. Start the first discussion!</p>}
            {threads.map((t: any) => (
              <Card key={t.id} className="cursor-pointer transition-all hover:shadow-card-hover" onClick={() => setSelectedThread(t.id)}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-lg bg-primary/10 p-2.5">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {t.is_pinned && <Pin className="h-3.5 w-3.5 text-accent" />}
                      <p className="font-medium text-foreground truncate">{t.title}</p>
                      {t.is_resolved && <Badge className="bg-success/10 text-success border-0 text-xs">Resolved</Badge>}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {t.subjects?.name && <Badge variant="secondary" className="text-xs">{t.subjects.name}</Badge>}
                      <span className="text-xs text-muted-foreground">by {t.profiles?.full_name || "Unknown"}</span>
                      <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Forum;
