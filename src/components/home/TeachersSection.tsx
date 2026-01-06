import { Link } from "react-router-dom";
import { useTeachersWithSubjects } from "@/hooks/useTeacherSubjects";
import { Badge } from "@/components/ui/badge";
import { User, BookOpen } from "lucide-react";

const TeachersSection = () => {
  const { data: teachers, isLoading } = useTeachersWithSubjects();

  if (isLoading) {
    return (
      <section className="bg-secondary/30 py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </div>
      </section>
    );
  }

  if (!teachers || teachers.length === 0) return null;

  return (
    <section className="bg-secondary/30 py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="mb-2 font-display text-3xl font-bold text-foreground md:text-4xl">
            Our Faculty
          </h2>
          <p className="text-muted-foreground">
            Expert teachers dedicated to your success
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher) => (
            <article
              key={teacher.id}
              className="group rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:border-primary/30 hover:shadow-card-hover"
            >
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-hero">
                  <User className="h-7 w-7 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {teacher.full_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">Faculty Member</p>
                </div>
              </div>

              {teacher.subjects.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>Teaches:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {teacher.subjects.map((subject) => (
                      <Link key={subject.id} to={`/subjects/${subject.slug}`}>
                        <Badge
                          variant="secondary"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          {subject.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {teacher.subjects.length === 0 && (
                <p className="text-sm text-muted-foreground italic">
                  No subjects assigned yet
                </p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeachersSection;
