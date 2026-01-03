import { Link } from "react-router-dom";
import { FileText, Download, Eye, Star, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const materials = [
  {
    id: 1,
    title: "Advanced Calculus - Complete Notes",
    subject: "Mathematics",
    author: "Dr. Sarah Johnson",
    downloads: 1234,
    views: 5678,
    rating: 4.8,
    type: "PDF",
    uploadedAt: "2 days ago",
    featured: true,
  },
  {
    id: 2,
    title: "Organic Chemistry Fundamentals",
    subject: "Science",
    author: "Prof. Michael Chen",
    downloads: 987,
    views: 4321,
    rating: 4.6,
    type: "PDF",
    uploadedAt: "1 week ago",
    featured: false,
  },
  {
    id: 3,
    title: "Shakespeare's Works Analysis",
    subject: "Literature",
    author: "Emily Roberts",
    downloads: 654,
    views: 2345,
    rating: 4.9,
    type: "Notes",
    uploadedAt: "3 days ago",
    featured: true,
  },
  {
    id: 4,
    title: "Python Programming Basics",
    subject: "Computer Science",
    author: "Alex Turner",
    downloads: 2156,
    views: 8901,
    rating: 4.7,
    type: "PDF",
    uploadedAt: "5 days ago",
    featured: false,
  },
  {
    id: 5,
    title: "World Geography - Complete Guide",
    subject: "Geography",
    author: "Dr. Lisa Park",
    downloads: 543,
    views: 1987,
    rating: 4.5,
    type: "Notes",
    uploadedAt: "1 week ago",
    featured: false,
  },
  {
    id: 6,
    title: "Modern Art History",
    subject: "Arts",
    author: "James Wilson",
    downloads: 321,
    views: 1234,
    rating: 4.4,
    type: "PDF",
    uploadedAt: "2 weeks ago",
    featured: false,
  },
];

const FeaturedMaterials = () => {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="mb-2 font-display text-3xl font-bold text-foreground md:text-4xl">
              Featured Materials
            </h2>
            <p className="text-muted-foreground">
              Top-rated study resources curated for you
            </p>
          </div>
          <Link to="/materials">
            <Button variant="outline" className="border-border hover:bg-secondary">
              View All Materials
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {materials.map((material, index) => (
            <article
              key={material.id}
              className="group relative flex flex-col rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:border-primary/30 hover:shadow-card-hover"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {material.featured && (
                <Badge className="absolute -top-2 right-4 bg-gradient-accent text-accent-foreground">
                  Featured
                </Badge>
              )}

              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {material.type}
                </Badge>
              </div>

              <h3 className="mb-2 font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {material.title}
              </h3>

              <p className="mb-1 text-sm text-muted-foreground">{material.subject}</p>
              <p className="mb-4 text-sm text-muted-foreground">by {material.author}</p>

              <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    {material.downloads}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {material.views}
                  </span>
                  <span className="flex items-center gap-1 text-warning">
                    <Star className="h-4 w-4 fill-current" />
                    {material.rating}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {material.uploadedAt}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedMaterials;
