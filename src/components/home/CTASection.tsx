import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-8 md:p-12 lg:p-16">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          </div>

          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="mb-4 font-display text-3xl font-bold text-primary-foreground md:text-4xl lg:text-5xl">
              Ready to Transform Your Learning?
            </h2>
            <p className="mb-8 text-lg text-primary-foreground/80">
              Join thousands of students and teachers already using StudyHub to share and access quality study materials.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="group bg-background text-foreground hover:bg-background/90"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
