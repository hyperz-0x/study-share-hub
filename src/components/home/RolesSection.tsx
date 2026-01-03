import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookMarked, Shield, ArrowRight } from "lucide-react";

const roles = [
  {
    icon: GraduationCap,
    title: "For Students",
    description: "Access thousands of curated study materials, notes, and PDFs across all subjects. Track your learning progress and bookmark favorites.",
    features: ["Browse subject-wise materials", "Download PDFs & notes", "Bookmark resources", "Track learning history"],
    cta: "Start Learning",
    link: "/student",
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconBg: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: BookMarked,
    title: "For Teachers",
    description: "Share your expertise by uploading study materials. Help students learn better with quality content reviewed by admins.",
    features: ["Upload notes & PDFs", "Track material views", "Receive feedback", "Build your profile"],
    cta: "Start Teaching",
    link: "/teacher",
    gradient: "from-green-500/20 to-emerald-500/20",
    iconBg: "bg-green-500/10 text-green-600",
  },
  {
    icon: Shield,
    title: "For Admins",
    description: "Maintain quality standards by reviewing and approving uploaded content. Manage users and ensure platform integrity.",
    features: ["Review submissions", "Approve/reject content", "Manage users", "Monitor activity"],
    cta: "Admin Access",
    link: "/admin",
    gradient: "from-purple-500/20 to-violet-500/20",
    iconBg: "bg-purple-500/10 text-purple-600",
  },
];

const RolesSection = () => {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 font-display text-3xl font-bold text-foreground md:text-4xl">
            Built for Everyone
          </h2>
          <p className="text-muted-foreground">
            Whether you're a student, teacher, or administrator, StudyHub has the tools you need.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {roles.map((role, index) => (
            <div
              key={role.title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-card transition-all duration-300 hover:shadow-card-hover"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${role.gradient} opacity-0 transition-opacity group-hover:opacity-100`} />

              <div className="relative">
                <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl ${role.iconBg}`}>
                  <role.icon className="h-7 w-7" />
                </div>

                <h3 className="mb-3 font-display text-xl font-bold text-foreground">
                  {role.title}
                </h3>

                <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
                  {role.description}
                </p>

                <ul className="mb-6 space-y-2">
                  {role.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link to={role.link}>
                  <Button className="group/btn w-full bg-gradient-hero hover:opacity-90">
                    {role.cta}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RolesSection;
