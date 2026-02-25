import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Subject } from "@/hooks/useSubjects";

export type SortOption = "newest" | "oldest" | "most-downloaded" | "most-viewed";
export type DateFilter = "all" | "today" | "week" | "month" | "year";

export interface FilterState {
  search: string;
  subjectId: string;
  fileType: string;
  dateRange: DateFilter;
  sort: SortOption;
}

interface MaterialFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  subjects: Subject[];
  fileTypes: string[];
  resultCount: number;
}

const dateLabels: Record<DateFilter, string> = {
  all: "All time",
  today: "Today",
  week: "This week",
  month: "This month",
  year: "This year",
};

const sortLabels: Record<SortOption, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  "most-downloaded": "Most downloaded",
  "most-viewed": "Most viewed",
};

const MaterialFilters = ({
  filters,
  onFiltersChange,
  subjects,
  fileTypes,
  resultCount,
}: MaterialFiltersProps) => {
  const update = (partial: Partial<FilterState>) =>
    onFiltersChange({ ...filters, ...partial });

  const activeCount = [
    filters.subjectId !== "all",
    filters.fileType !== "all",
    filters.dateRange !== "all",
    filters.sort !== "newest",
  ].filter(Boolean).length;

  const clearAll = () =>
    onFiltersChange({
      search: "",
      subjectId: "all",
      fileType: "all",
      dateRange: "all",
      sort: "newest",
    });

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative mx-auto max-w-xl">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by title, subject, or author..."
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          className="pl-10 pr-10"
        />
        {filters.search && (
          <button
            onClick={() => update({ search: "" })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <Badge variant="secondary" className="h-5 min-w-[20px] px-1.5 text-xs">
              {activeCount}
            </Badge>
          )}
        </div>

        <Select value={filters.subjectId} onValueChange={(v) => update({ subjectId: v })}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All subjects</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.fileType} onValueChange={(v) => update({ fileType: v })}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="File type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {fileTypes.map((t) => (
              <SelectItem key={t} value={t}>
                {t.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.dateRange} onValueChange={(v) => update({ dateRange: v as DateFilter })}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Date" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(dateLabels).map(([k, label]) => (
              <SelectItem key={k} value={k}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.sort} onValueChange={(v) => update({ sort: v as SortOption })}>
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(sortLabels).map(([k, label]) => (
              <SelectItem key={k} value={k}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="text-muted-foreground">
            <X className="mr-1 h-3 w-3" />
            Clear all
          </Button>
        )}
      </div>

      {/* Result count */}
      {(filters.search || activeCount > 0) && (
        <p className="text-center text-sm text-muted-foreground">
          Found {resultCount} result{resultCount !== 1 ? "s" : ""}
          {filters.search && <> for &quot;{filters.search}&quot;</>}
        </p>
      )}
    </div>
  );
};

export default MaterialFilters;
