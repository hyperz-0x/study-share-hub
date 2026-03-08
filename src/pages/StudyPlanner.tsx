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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useSubjects } from "@/hooks/useSubjects";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Plus, Target, Clock, Calendar, Trash2, CheckCircle2, BookOpen } from "lucide-react";
import { format, subDays, startOfWeek, addDays } from "date-fns";

const CHART_COLORS = ["hsl(210,85%,45%)", "hsl(145,65%,42%)", "hsl(35,95%,55%)", "hsl(0,75%,55%)", "hsl(270,60%,50%)", "hsl(180,75%,35%)"];

const StudyPlanner = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: subjects } = useSubjects();
  const [goalOpen, setGoalOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [goalForm, setGoalForm] = useState({ title: "", description: "", subject_id: "", target_hours: "", target_date: "" });
  const [sessionForm, setSessionForm] = useState({ subject_id: "", goal_id: "", duration_minutes: "", notes: "", studied_at: format(new Date(), "yyyy-MM-dd") });

  const { data: goals = [] } = useQuery({
    queryKey: ["study-goals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("study_goals").select("*, subjects(name)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["study-sessions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("study_sessions").select("*, subjects(name), study_goals(title)").order("studied_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addGoal = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("study_goals").insert({
        user_id: user!.id,
        title: goalForm.title,
        description: goalForm.description || null,
        subject_id: goalForm.subject_id || null,
        target_hours: goalForm.target_hours ? parseFloat(goalForm.target_hours) : 0,
        target_date: goalForm.target_date || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-goals"] });
      setGoalOpen(false);
      setGoalForm({ title: "", description: "", subject_id: "", target_hours: "", target_date: "" });
      toast({ title: "Goal created!" });
    },
  });

  const toggleGoal = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase.from("study_goals").update({ is_completed: completed }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["study-goals"] }),
  });

  const deleteGoal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("study_goals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["study-goals"] }),
  });

  const addSession = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("study_sessions").insert({
        user_id: user!.id,
        subject_id: sessionForm.subject_id || null,
        goal_id: sessionForm.goal_id || null,
        duration_minutes: parseInt(sessionForm.duration_minutes) || 0,
        notes: sessionForm.notes || null,
        studied_at: sessionForm.studied_at,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-sessions"] });
      setSessionOpen(false);
      setSessionForm({ subject_id: "", goal_id: "", duration_minutes: "", notes: "", studied_at: format(new Date(), "yyyy-MM-dd") });
      toast({ title: "Study session logged!" });
    },
  });

  // Weekly chart data
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(weekStart, i);
    const dayStr = format(day, "yyyy-MM-dd");
    const mins = sessions.filter((s: any) => s.studied_at === dayStr).reduce((sum: number, s: any) => sum + s.duration_minutes, 0);
    return { day: format(day, "EEE"), minutes: mins, hours: +(mins / 60).toFixed(1) };
  });

  // Subject distribution
  const subjectMap = new Map<string, number>();
  sessions.forEach((s: any) => {
    const name = s.subjects?.name || "Other";
    subjectMap.set(name, (subjectMap.get(name) || 0) + s.duration_minutes);
  });
  const subjectData = [...subjectMap.entries()].map(([name, mins]) => ({ name, value: +(mins / 60).toFixed(1) }));

  const totalHoursThisWeek = +(weeklyData.reduce((s, d) => s + d.minutes, 0) / 60).toFixed(1);
  const activeGoals = goals.filter((g: any) => !g.is_completed).length;
  const completedGoals = goals.filter((g: any) => g.is_completed).length;

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center"><p className="text-muted-foreground">Please log in to use the Study Planner.</p></main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <div className="container px-4 py-8 md:px-6">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">Study Planner</h1>
              <p className="text-muted-foreground">Set goals, log sessions, and track your progress</p>
            </div>
            <div className="flex gap-2">
              <Dialog open={goalOpen} onOpenChange={setGoalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-hero hover:opacity-90 gap-2"><Target className="h-4 w-4" />New Goal</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Create Study Goal</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <Input placeholder="Goal title" value={goalForm.title} onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })} />
                    <Textarea placeholder="Description (optional)" value={goalForm.description} onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })} />
                    <Select value={goalForm.subject_id} onValueChange={(v) => setGoalForm({ ...goalForm, subject_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Subject (optional)" /></SelectTrigger>
                      <SelectContent>{subjects?.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <Input type="number" placeholder="Target hours" value={goalForm.target_hours} onChange={(e) => setGoalForm({ ...goalForm, target_hours: e.target.value })} />
                    <Input type="date" value={goalForm.target_date} onChange={(e) => setGoalForm({ ...goalForm, target_date: e.target.value })} />
                    <Button className="w-full" onClick={() => addGoal.mutate()} disabled={!goalForm.title || addGoal.isPending}>Create Goal</Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={sessionOpen} onOpenChange={setSessionOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2"><Clock className="h-4 w-4" />Log Session</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Log Study Session</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <Select value={sessionForm.subject_id} onValueChange={(v) => setSessionForm({ ...sessionForm, subject_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Subject" /></SelectTrigger>
                      <SelectContent>{subjects?.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={sessionForm.goal_id} onValueChange={(v) => setSessionForm({ ...sessionForm, goal_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Linked goal (optional)" /></SelectTrigger>
                      <SelectContent>{goals.filter((g: any) => !g.is_completed).map((g: any) => <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>)}</SelectContent>
                    </Select>
                    <Input type="number" placeholder="Duration (minutes)" value={sessionForm.duration_minutes} onChange={(e) => setSessionForm({ ...sessionForm, duration_minutes: e.target.value })} />
                    <Input type="date" value={sessionForm.studied_at} onChange={(e) => setSessionForm({ ...sessionForm, studied_at: e.target.value })} />
                    <Textarea placeholder="Notes (optional)" value={sessionForm.notes} onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })} />
                    <Button className="w-full" onClick={() => addSession.mutate()} disabled={!sessionForm.duration_minutes || addSession.isPending}>Log Session</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3 mb-8">
            <Card><CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-xl bg-primary/10 p-3"><Clock className="h-6 w-6 text-primary" /></div>
              <div><p className="text-sm text-muted-foreground">This Week</p><p className="text-2xl font-bold text-foreground">{totalHoursThisWeek}h</p></div>
            </CardContent></Card>
            <Card><CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-xl bg-accent/10 p-3"><Target className="h-6 w-6 text-accent" /></div>
              <div><p className="text-sm text-muted-foreground">Active Goals</p><p className="text-2xl font-bold text-foreground">{activeGoals}</p></div>
            </CardContent></Card>
            <Card><CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-xl bg-success/10 p-3"><CheckCircle2 className="h-6 w-6 text-success" /></div>
              <div><p className="text-sm text-muted-foreground">Completed</p><p className="text-2xl font-bold text-foreground">{completedGoals}</p></div>
            </CardContent></Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2 mb-8">
            <Card>
              <CardHeader><CardTitle className="text-lg">Weekly Study Hours</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="day" className="text-muted-foreground" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                    <Bar dataKey="hours" fill="hsl(210,85%,45%)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">Subject Distribution</CardTitle></CardHeader>
              <CardContent className="flex items-center justify-center">
                {subjectData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={subjectData} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${value}h`}>
                        {subjectData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-muted-foreground py-12">Log sessions to see subject breakdown</p>}
              </CardContent>
            </Card>
          </div>

          {/* Goals & Sessions */}
          <Tabs defaultValue="goals">
            <TabsList className="mb-4">
              <TabsTrigger value="goals">Goals</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
            </TabsList>
            <TabsContent value="goals">
              <div className="space-y-3">
                {goals.length === 0 && <p className="text-center text-muted-foreground py-8">No goals yet. Create your first study goal!</p>}
                {goals.map((g: any) => (
                  <Card key={g.id} className={g.is_completed ? "opacity-60" : ""}>
                    <CardContent className="flex items-center gap-4 p-4">
                      <Checkbox checked={g.is_completed} onCheckedChange={(checked) => toggleGoal.mutate({ id: g.id, completed: !!checked })} />
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-foreground ${g.is_completed ? "line-through" : ""}`}>{g.title}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {g.subjects?.name && <Badge variant="secondary">{g.subjects.name}</Badge>}
                          {g.target_hours > 0 && <Badge variant="outline">{g.target_hours}h target</Badge>}
                          {g.target_date && <Badge variant="outline"><Calendar className="h-3 w-3 mr-1" />{format(new Date(g.target_date), "MMM d")}</Badge>}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteGoal.mutate(g.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="sessions">
              <div className="space-y-3">
                {sessions.length === 0 && <p className="text-center text-muted-foreground py-8">No sessions logged yet.</p>}
                {sessions.map((s: any) => (
                  <Card key={s.id}>
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="rounded-lg bg-primary/10 p-2"><BookOpen className="h-5 w-5 text-primary" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap gap-2">
                          {s.subjects?.name && <Badge variant="secondary">{s.subjects.name}</Badge>}
                          <Badge variant="outline">{s.duration_minutes} min</Badge>
                          <span className="text-xs text-muted-foreground">{format(new Date(s.studied_at), "MMM d, yyyy")}</span>
                        </div>
                        {s.notes && <p className="text-sm text-muted-foreground mt-1 truncate">{s.notes}</p>}
                        {s.study_goals?.title && <p className="text-xs text-primary mt-1">Goal: {s.study_goals.title}</p>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StudyPlanner;
