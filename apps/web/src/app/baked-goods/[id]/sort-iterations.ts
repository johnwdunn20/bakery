export type SortOption = "date-desc" | "date-asc" | "rating-desc" | "rating-asc";

export const SORT_LABELS: Record<SortOption, string> = {
  "date-desc": "Date (newest first)",
  "date-asc": "Date (oldest first)",
  "rating-desc": "Rating (best first)",
  "rating-asc": "Rating (worst first)",
};

export function sortIterations<T extends { bakeDate: number; rating?: number | null }>(
  items: T[],
  sort: SortOption
): T[] {
  const arr = [...items];
  switch (sort) {
    case "date-desc":
      return arr.sort((a, b) => b.bakeDate - a.bakeDate);
    case "date-asc":
      return arr.sort((a, b) => a.bakeDate - b.bakeDate);
    case "rating-desc":
      return arr.sort((a, b) => {
        const ra = a.rating ?? -1;
        const rb = b.rating ?? -1;
        return rb - ra;
      });
    case "rating-asc":
      return arr.sort((a, b) => {
        const ra = a.rating ?? 11;
        const rb = b.rating ?? 11;
        return ra - rb;
      });
    default:
      return arr;
  }
}
