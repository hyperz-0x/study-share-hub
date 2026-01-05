import { Link } from "react-router-dom";
import { 
  Code, 
  FileCode, 
  Globe, 
  GitBranch, 
  Terminal,
  LucideIcon
} from "lucide-react";
import { useSubjects } from "@/hooks/useSubjects";

const iconMap: Record<string, LucideIcon> = {
  Code,
  FileCode,
  Globe,
  GitBranch,
  Terminal,
};

const colorMap: Record<string, string> = {
  blue: "bg-blue-500/10 text-blue-600",
  green: "bg-green-500/10 text-green-600",
  purple: "bg-purple-500/10 text-purple-600",
  orange: "bg-orange-500/10 text-orange-600",
  cyan: "bg-cyan-500/10 text-cyan-600",
};

const SubjectsSection = () => {
  const { data: subjects, isLoading } = useSubjects();

  return (
    <section className="bg-muted/30 py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 font-display text-3xl font-bold text-foreground md:text-4xl">
            Browse by Subject
          </h2>
          <p className="text-muted-foreground">
            Find study materials organized by subject for easy access and learning.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjects?.map((subject, index) => {
              const IconComponent = iconMap[subject.icon || "Code"] || Code;
              const colorClass = colorMap[subject.color || "blue"] || colorMap.blue;
              
              return (
                <Link
                  key={subject.id}
                  to={`/subjects/${subject.slug}`}
                  className="group rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:border-primary/30 hover:shadow-card-hover"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg ${colorClass}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <h3 className="mb-1 font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                    {subject.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{subject.materials_count || 0} materials</p>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            to="/subjects"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            View all subjects
            <span className="text-lg">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SubjectsSection;
