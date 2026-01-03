import { Link } from "react-router-dom";
import { 
  Calculator, 
  FlaskConical, 
  BookText, 
  Globe2, 
  Code, 
  Palette,
  Music,
  Dumbbell
} from "lucide-react";

const subjects = [
  { name: "Mathematics", icon: Calculator, count: 245, color: "bg-blue-500/10 text-blue-600" },
  { name: "Science", icon: FlaskConical, count: 189, color: "bg-green-500/10 text-green-600" },
  { name: "Literature", icon: BookText, count: 156, color: "bg-purple-500/10 text-purple-600" },
  { name: "Geography", icon: Globe2, count: 98, color: "bg-orange-500/10 text-orange-600" },
  { name: "Computer Science", icon: Code, count: 312, color: "bg-cyan-500/10 text-cyan-600" },
  { name: "Arts", icon: Palette, count: 87, color: "bg-pink-500/10 text-pink-600" },
  { name: "Music", icon: Music, count: 64, color: "bg-yellow-500/10 text-yellow-700" },
  { name: "Physical Education", icon: Dumbbell, count: 45, color: "bg-red-500/10 text-red-600" },
];

const SubjectsSection = () => {
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

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {subjects.map((subject, index) => (
            <Link
              key={subject.name}
              to={`/subjects/${subject.name.toLowerCase().replace(" ", "-")}`}
              className="group rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:border-primary/30 hover:shadow-card-hover"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg ${subject.color}`}>
                <subject.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-1 font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                {subject.name}
              </h3>
              <p className="text-sm text-muted-foreground">{subject.count} materials</p>
            </Link>
          ))}
        </div>

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
