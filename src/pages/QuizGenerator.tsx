import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubjects } from "@/hooks/useSubjects";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Brain, Loader2, CheckCircle, XCircle, RotateCcw, Trophy, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface Quiz {
  title: string;
  questions: QuizQuestion[];
}

const QuizGenerator = () => {
  const { user, loading } = useAuth();
  const { data: subjects } = useSubjects();
  const { toast } = useToast();

  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState("5");
  const [difficulty, setDifficulty] = useState("medium");
  const [isGenerating, setIsGenerating] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!loading && !user) return <Navigate to="/auth" replace />;

  const generateQuiz = async () => {
    if (!topic.trim() && !subject) {
      toast({ title: "Please enter a topic or select a subject", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    setQuiz(null);
    setAnswers({});
    setSubmitted(false);

    try {
      const { data, error } = await supabase.functions.invoke("ai-quiz-generator", {
        body: { subject, topic, numQuestions: parseInt(numQuestions), difficulty },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setQuiz(data);
    } catch (e: any) {
      toast({ title: "Generation failed", description: e.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const selectAnswer = (qIndex: number, optIndex: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleSubmit = () => {
    if (!quiz) return;
    if (Object.keys(answers).length < quiz.questions.length) {
      toast({ title: "Answer all questions before submitting", variant: "destructive" });
      return;
    }
    setSubmitted(true);
  };

  const score = quiz ? quiz.questions.filter((q, i) => answers[i] === q.correctIndex).length : 0;
  const totalQ = quiz?.questions.length || 0;

  const resetQuiz = () => {
    setQuiz(null);
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-background py-8">
        <div className="container px-4 md:px-6 max-w-3xl">
          {/* Header */}
          <div className="mb-8 flex items-center gap-3 animate-fade-up">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-accent shadow-glow">
              <Brain className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">AI Quiz Generator</h1>
              <p className="text-muted-foreground">Generate quizzes on any topic instantly</p>
            </div>
          </div>

          {/* Config */}
          {!quiz && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card animate-scale-in space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                    <SelectContent>
                      {subjects?.map((s) => (
                        <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Topic</Label>
                  <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Quadratic Equations, Photosynthesis" />
                </div>
                <div className="space-y-2">
                  <Label>Number of Questions</Label>
                  <Select value={numQuestions} onValueChange={setNumQuestions}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["3", "5", "10"].map((n) => (
                        <SelectItem key={n} value={n}>{n} questions</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={generateQuiz}
                disabled={isGenerating}
                className="w-full bg-gradient-hero hover:opacity-90 transition-all duration-300 hover:scale-[1.02] hover:shadow-glow"
                size="lg"
              >
                {isGenerating ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Generating Quiz...</>
                ) : (
                  <><Sparkles className="mr-2 h-5 w-5" />Generate Quiz</>
                )}
              </Button>
            </div>
          )}

          {/* Loading */}
          {isGenerating && (
            <div className="mt-12 flex flex-col items-center justify-center gap-4 animate-fade-up">
              <div className="relative">
                <div className="h-20 w-20 rounded-full border-4 border-primary/20" />
                <div className="absolute inset-0 h-20 w-20 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
              <p className="text-muted-foreground font-medium">Creating your quiz...</p>
            </div>
          )}

          {/* Quiz */}
          {quiz && !isGenerating && (
            <div className="space-y-6 animate-fade-up">
              {/* Title & Score */}
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-bold text-foreground">{quiz.title}</h2>
                <Button variant="outline" onClick={resetQuiz} className="transition-all duration-300 hover:scale-105">
                  <RotateCcw className="mr-2 h-4 w-4" />New Quiz
                </Button>
              </div>

              {submitted && (
                <div className={cn(
                  "rounded-2xl p-6 text-center shadow-card animate-scale-in",
                  score >= totalQ * 0.7 ? "bg-success/10 border border-success/30" : "bg-warning/10 border border-warning/30"
                )}>
                  <Trophy className={cn("mx-auto h-10 w-10", score >= totalQ * 0.7 ? "text-success" : "text-warning")} />
                  <p className="mt-2 font-display text-2xl font-bold text-foreground">{score} / {totalQ}</p>
                  <p className="text-muted-foreground">{score >= totalQ * 0.7 ? "Great job! 🎉" : "Keep practicing! 💪"}</p>
                </div>
              )}

              {/* Questions */}
              {quiz.questions.map((q, qi) => (
                <div key={qi} className="rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-card-hover">
                  <p className="mb-4 font-medium text-foreground">
                    <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-hero text-xs font-bold text-primary-foreground">
                      {qi + 1}
                    </span>
                    {q.question}
                  </p>
                  <div className="grid gap-2">
                    {q.options.map((opt, oi) => {
                      const isSelected = answers[qi] === oi;
                      const isCorrect = q.correctIndex === oi;
                      const showResult = submitted;
                      return (
                        <button
                          key={oi}
                          onClick={() => selectAnswer(qi, oi)}
                          className={cn(
                            "flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all duration-200",
                            !showResult && isSelected && "border-primary bg-primary/10 text-foreground",
                            !showResult && !isSelected && "border-border bg-card hover:border-primary/50 hover:bg-primary/5",
                            showResult && isCorrect && "border-success bg-success/10 text-foreground",
                            showResult && isSelected && !isCorrect && "border-destructive bg-destructive/10 text-foreground",
                            showResult && !isSelected && !isCorrect && "border-border bg-card opacity-60",
                            !submitted && "cursor-pointer hover:scale-[1.01]"
                          )}
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-xs font-medium">
                            {String.fromCharCode(65 + oi)}
                          </span>
                          <span className="flex-1">{opt}</span>
                          {showResult && isCorrect && <CheckCircle className="h-5 w-5 text-success" />}
                          {showResult && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-destructive" />}
                        </button>
                      );
                    })}
                  </div>
                  {submitted && (
                    <div className="mt-3 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground animate-fade-up">
                      <strong>Explanation:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))}

              {!submitted && (
                <Button
                  onClick={handleSubmit}
                  className="w-full bg-gradient-hero hover:opacity-90 transition-all duration-300 hover:scale-[1.02] hover:shadow-glow"
                  size="lg"
                >
                  Submit Answers
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default QuizGenerator;
