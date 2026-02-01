"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@bakery/backend";
import type { Id } from "@bakery/backend/dataModel";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowDown, ArrowUp, CalendarClock, Copy, Image, List, Plus, Star } from "lucide-react";

type ViewMode = "list" | "timeline";
type SortOption = "date-desc" | "date-asc" | "rating-desc" | "rating-asc";

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatMinutes(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

const SORT_LABELS: Record<SortOption, string> = {
  "date-desc": "Date (newest first)",
  "date-asc": "Date (oldest first)",
  "rating-desc": "Rating (best first)",
  "rating-asc": "Rating (worst first)",
};

function sortIterations<T extends { bakeDate: number; rating?: number | null }>(
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

export default function BakedGoodDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const duplicateIteration = useMutation(api.bakedGoods.duplicateIteration);
  const [duplicatingId, setDuplicatingId] = useState<Id<"recipeIterations"> | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortOption, setSortOption] = useState<SortOption>("date-desc");
  const bakedGood = useQuery(
    api.bakedGoods.getBakedGoodWithIterations,
    id ? { id: id as Id<"bakedGoods"> } : "skip"
  );
  const sortedIterations = useMemo(
    () => (bakedGood?.iterations ? sortIterations(bakedGood.iterations, sortOption) : []),
    [bakedGood?.iterations, sortOption]
  );

  if (bakedGood === undefined) {
    return (
      <div className="p-6 md:p-8 max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (bakedGood === null) {
    return (
      <div className="p-6 md:p-8 max-w-2xl">
        <p className="text-muted-foreground">Baked good not found.</p>
        <Button variant="link" onClick={() => router.push("/my-bakery")}>
          Back to My Bakery
        </Button>
      </div>
    );
  }

  const iterationCount = bakedGood.iterationCount ?? 0;
  const avgRating = bakedGood.avgRating ?? null;
  const bestRating = bakedGood.bestRating ?? null;
  const lastBakedDate = bakedGood.lastBakedDate ?? null;
  const hasIterations = sortedIterations.length > 0;

  function IterationCard({
    it,
  }: {
    it: (typeof sortedIterations)[number];
  }) {
    return (
      <Card className="border bg-card transition-colors hover:bg-accent/50">
        <CardContent className="p-4 flex items-start gap-3">
          <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
            {"firstPhotoUrl" in it && it.firstPhotoUrl ? (
              <img
                src={it.firstPhotoUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <Image className="h-6 w-6 text-muted-foreground" aria-hidden />
            )}
          </div>
          <Link
            href={`/baked-goods/${id}/iterations/${it._id}`}
            className="flex-1 min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
          >
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-medium">{formatDate(it.bakeDate)}</span>
              {it.rating != null && (
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-primary font-medium">
                  {it.rating}/5
                </span>
              )}
              <span className="text-muted-foreground">
                {it.difficulty} · {formatMinutes(it.totalTime)}
              </span>
            </div>
            {(it.recipeContent || it.notes) && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {it.notes?.trim() || it.recipeContent?.trim().split("\n")[0] || ""}
              </p>
            )}
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={duplicatingId !== null}
                aria-label="Duplicate iteration"
                onClick={(e) => e.preventDefault()}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Duplicate iteration?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will create a new iteration with today's date, copying the recipe content, difficulty, and time. You can edit it before saving.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    setDuplicatingId(it._id);
                    try {
                      const newId = await duplicateIteration({ id: it._id });
                      router.push(`/baked-goods/${id}/iterations/${newId}/edit`);
                    } finally {
                      setDuplicatingId(null);
                    }
                  }}
                >
                  Duplicate
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{bakedGood.name}</h1>
        {bakedGood.description && (
          <p className="text-muted-foreground mt-1">{bakedGood.description}</p>
        )}
      </div>

      {iterationCount > 0 && (
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>{iterationCount} {iterationCount === 1 ? "iteration" : "iterations"}</span>
          {avgRating != null && <span>Avg {avgRating.toFixed(1)}</span>}
          {bestRating != null && <span>Best {bestRating}</span>}
          <span>
            {lastBakedDate != null
              ? `Last baked ${formatDate(lastBakedDate)}`
              : "Never baked"}
          </span>
        </div>
      )}

      <Card>
        <CardHeader className={hasIterations ? "flex flex-row items-start justify-between space-y-0" : undefined}>
          <div>
            <CardTitle>Iterations</CardTitle>
            <CardDescription>
              Recipe iterations track each time you bake this good—ingredients, timing, and notes.
            </CardDescription>
          </div>
          {hasIterations && (
            <Button asChild size="sm">
              <Link href={`/baked-goods/${id}/iterations/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Add iteration
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {!hasIterations ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground mb-4">No iterations yet.</p>
              <Button asChild>
                <Link href={`/baked-goods/${id}/iterations/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add iteration
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <div className="flex rounded-md border border-input bg-transparent p-0.5" role="group" aria-label="View mode">
                  <Button
                    type="button"
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-8 rounded-sm px-2"
                    onClick={() => setViewMode("list")}
                    aria-pressed={viewMode === "list"}
                  >
                    <List className="h-4 w-4 mr-1.5" />
                    List
                  </Button>
                  <Button
                    type="button"
                    variant={viewMode === "timeline" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-8 rounded-sm px-2"
                    onClick={() => setViewMode("timeline")}
                    aria-pressed={viewMode === "timeline"}
                  >
                    <CalendarClock className="h-4 w-4 mr-1.5" />
                    Timeline
                  </Button>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5">
                      {sortOption.startsWith("date") ? (
                        <ArrowDown className={sortOption === "date-asc" ? "rotate-180" : ""} />
                      ) : (
                        <Star className="h-4 w-4" />
                      )}
                      {SORT_LABELS[sortOption]}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => setSortOption("date-desc")}>
                      <ArrowDown className="h-4 w-4 mr-2" />
                      {SORT_LABELS["date-desc"]}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption("date-asc")}>
                      <ArrowUp className="h-4 w-4 mr-2" />
                      {SORT_LABELS["date-asc"]}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption("rating-desc")}>
                      <Star className="h-4 w-4 mr-2" />
                      {SORT_LABELS["rating-desc"]}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption("rating-asc")}>
                      <Star className="h-4 w-4 mr-2" />
                      {SORT_LABELS["rating-asc"]}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {viewMode === "list" ? (
                <ul className="space-y-3">
                  {sortedIterations.map((it) => (
                    <li key={it._id}>
                      <IterationCard it={it} />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="relative border-l-2 border-muted pl-6 space-y-0">
                  {sortedIterations.map((it) => (
                    <div key={it._id} className="relative pb-6 last:pb-0">
                      <span
                        className="absolute left-[-29px] top-5 size-3 rounded-full border-2 border-background bg-primary shadow-sm -translate-x-1/2"
                        aria-hidden
                      />
                      <div className="pt-0.5">
                        <IterationCard it={it} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
