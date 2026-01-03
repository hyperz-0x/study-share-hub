import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Users, FileText } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-background py-16 md:py-24 lg:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="container relative px-4 md:px-6">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm shadow-card animate-fade-up">
            <span className="flex h-2 w-2 rounded-full bg-success" />
            <span className="text-muted-foreground">Trusted by 10,000+ students</span>
          </div>

          {/* Heading */}
          <h1 className="mb-6 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl animate-fade-up [animation-delay:100ms]">
            Your Digital Hub for{" "}
            <span className="text-gradient">Quality Study Materials</span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl animate-fade-up [animation-delay:200ms]">
            Access subject-wise notes, PDFs, and study resources shared by top educators. 
            Learn smarter, not harder.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-up [animation-delay:300ms]">
            <Button size="lg" className="group bg-gradient-hero px-8 hover:opacity-90">
              Start Learning
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline" className="border-border hover:bg-secondary">
              Upload Materials
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3 animate-fade-up [animation-delay:400ms]">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <span className="text-2xl font-bold text-foreground">5,000+</span>
              <span className="text-sm text-muted-foreground">Study Materials</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20">
                <Users className="h-6 w-6 text-accent-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">500+</span>
              <span className="text-sm text-muted-foreground">Expert Teachers</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <BookOpen className="h-6 w-6 text-success" />
              </div>
              <span className="text-2xl font-bold text-foreground">50+</span>
              <span className="text-sm text-muted-foreground">Subjects Covered</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
