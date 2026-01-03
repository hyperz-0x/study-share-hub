import { UserPlus, Upload, CheckCircle2, BookOpen } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Create Account",
    description: "Sign up as a student, teacher, or administrator to get started with the platform.",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: Upload,
    title: "Upload or Browse",
    description: "Teachers upload materials for review. Students browse approved study resources.",
    color: "bg-green-500/10 text-green-600",
  },
  {
    icon: CheckCircle2,
    title: "Admin Approval",
    description: "Admins review and approve uploaded content to ensure quality and accuracy.",
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    icon: BookOpen,
    title: "Learn & Share",
    description: "Access approved materials anytime, anywhere. Learn at your own pace.",
    color: "bg-orange-500/10 text-orange-600",
  },
];

const HowItWorks = () => {
  return (
    <section className="bg-muted/30 py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 font-display text-3xl font-bold text-foreground md:text-4xl">
            How It Works
          </h2>
          <p className="text-muted-foreground">
            A simple, secure process for sharing and accessing quality educational content.
          </p>
        </div>

        <div className="relative mx-auto max-w-5xl">
          {/* Connection line (desktop) */}
          <div className="absolute left-0 right-0 top-16 hidden h-0.5 bg-border lg:block" />

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="relative flex flex-col items-center text-center"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Step number */}
                <div className="relative z-10 mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${step.color}`}>
                  <step.icon className="h-8 w-8" />
                </div>

                {/* Content */}
                <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
