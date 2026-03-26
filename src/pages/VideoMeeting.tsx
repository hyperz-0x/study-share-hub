import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Video, VideoOff, Plus, Trash2, Users, Calendar, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const VideoMeeting = () => {
  const { user, isTeacher, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [activeMeetingRoom, setActiveMeetingRoom] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newSubjectId, setNewSubjectId] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: subjects } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data } = await supabase.from("subjects").select("id, name").order("name");
      return data || [];
    },
  });

  const { data: meetings, isLoading } = useQuery({
    queryKey: ["meetings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("meetings")
        .select("*")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const createMeeting = useMutation({
    mutationFn: async () => {
      const roomId = `ln-studyhub-${crypto.randomUUID().slice(0, 8)}`;
      const { error } = await supabase.from("meetings").insert({
        title: newTitle,
        description: newDescription || null,
        room_id: roomId,
        host_id: user!.id,
        subject_id: newSubjectId || null,
        is_active: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      setNewTitle("");
      setNewDescription("");
      setNewSubjectId("");
      setDialogOpen(false);
      toast({ title: "Meeting created!" });
    },
    onError: () => toast({ title: "Failed to create meeting", variant: "destructive" }),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("meetings").update({ is_active: !is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["meetings"] }),
  });

  const deleteMeeting = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("meetings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      toast({ title: "Meeting deleted" });
    },
  });

  const canManage = isTeacher || isAdmin;

  if (activeMeetingRoom) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <h2 className="text-lg font-semibold text-foreground">Live Meeting</h2>
          <Button variant="destructive" size="sm" onClick={() => setActiveMeetingRoom(null)}>
            <VideoOff className="mr-2 h-4 w-4" /> Leave Meeting
          </Button>
        </div>
        <iframe
          src={`https://meet.jit.si/${activeMeetingRoom}#userInfo.displayName="${user?.email?.split("@")[0] || "User"}"`}
          className="flex-1 w-full border-0"
          allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container px-4 py-8 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Video Meetings</h1>
            <p className="text-muted-foreground mt-1">Join or create live video sessions</p>
          </div>
          {canManage && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-hero hover:opacity-90">
                  <Plus className="mr-2 h-4 w-4" /> New Meeting
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Meeting</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <Input placeholder="Meeting title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                  <Textarea placeholder="Description (optional)" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
                  <Select value={newSubjectId} onValueChange={setNewSubjectId}>
                    <SelectTrigger><SelectValue placeholder="Subject (optional)" /></SelectTrigger>
                    <SelectContent>
                      {subjects?.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button className="w-full" onClick={() => createMeeting.mutate()} disabled={!newTitle.trim()}>
                    Create Meeting
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : !meetings?.length ? (
          <Card className="text-center py-16">
            <CardContent>
              <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No meetings yet.{canManage ? " Create one to get started!" : ""}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {meetings.map((m) => (
              <Card key={m.id} className="group hover:shadow-lg transition-all duration-300 border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{m.title}</CardTitle>
                      {m.description && <CardDescription className="mt-1">{m.description}</CardDescription>}
                    </div>
                    <Badge variant={m.is_active ? "default" : "secondary"} className={m.is_active ? "bg-green-500/90 text-white" : ""}>
                      {m.is_active ? "Live" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(m.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    {m.is_active && (
                      <Button size="sm" className="flex-1 bg-gradient-hero" onClick={() => setActiveMeetingRoom(m.room_id)}>
                        <Users className="mr-1 h-3.5 w-3.5" /> Join
                      </Button>
                    )}
                    {canManage && m.host_id === user?.id && (
                      <>
                        <Button size="sm" variant={m.is_active ? "outline" : "default"} onClick={() => toggleActive.mutate({ id: m.id, is_active: m.is_active })}>
                          {m.is_active ? <VideoOff className="h-3.5 w-3.5" /> : <Video className="h-3.5 w-3.5" />}
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteMeeting.mutate(m.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                    {isAdmin && m.host_id !== user?.id && (
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteMeeting.mutate(m.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default VideoMeeting;
