import { Link } from "react-router-dom";
import { useSubjects } from "@/hooks/useSubjects";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { 
  Calculator, 
  FlaskConical, 
  BookText, 
  Globe2, 
  Code, 
  Palette,
  Music,
  Dumbbell,
  LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Calculator,
  FlaskConical,
  BookText,
  Globe2,
  Code,
  Palette,
  Music,
  Dumbbell,
};

const colorMap: Record<string, string> = {
  blue: "bg-blue-500/10 text-blue-600",
  green: "bg-green-500/10 text-green-600",
  purple: "bg-purple-500/10 text-purple-600",
  orange: "bg-orange-500/10 text-orange-600",
  cyan: "bg-cyan-500/10 text-cyan-600",
  pink: "bg-pink-500/10 text-pink-600",
  yellow: "bg-yellow-500/10 text-yellow-700",
  red: "bg-red-500/10 text-red-600",
};

const Subjects = () => {
  const { data: subjects, isLoading } = useSubjects();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-background py-12">
        <div className="container px-4 md:px-6">
          <div className="mb-12 text-center">
            <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
              Browse Subjects
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Explore study materials organized by subject area
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {subjects?.map((subject) => {
                const Icon = iconMap[subject.icon || "BookText"] || BookText;
                const colorClass = colorMap[subject.color || "blue"] || colorMap.blue;

                return (
                  <Link
                    key={subject.id}
                    to={`/subjects/${subject.slug}`}
                    className="group rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:border-primary/30 hover:shadow-card-hover"
                  >
                    <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl ${colorClass}`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <h2 className="mb-2 font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                      {subject.name}
                    </h2>
                    <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                      {subject.description}
                    </p>
                    <p className="text-sm font-medium text-primary">
                      {subject.materials_count || 0} materials →
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Subjects;
