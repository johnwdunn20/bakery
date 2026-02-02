"use client";

import { useMemo, useState, useEffect } from "react";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowDown, ArrowUp, CalendarClock, Copy, Image, List, Loader2, Pencil, Plus, Star, Trash2 } from "lucide-react";

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
  const updateBakedGood = useMutation(api.bakedGoods.updateBakedGood);
  const deleteBakedGood = useMutation(api.bakedGoods.deleteBakedGood);
  const [duplicatingId, setDuplicatingId] = useState<Id<"recipeIterations"> | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortOption, setSortOption] = useState<SortOption>("date-desc");
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const bakedGood = useQuery(
    api.bakedGoods.getBakedGoodWithIterations,
    id ? { id: id as Id<"bakedGoods"> } : "skip"
  );
  const sortedIterations = useMemo(
    () => (bakedGood?.iterations ? sortIterations(bakedGood.iterations, sortOption) : []),
    [bakedGood?.iterations, sortOption]
  );

  // Initialize edit form when bakedGood loads or sheet opens
  useEffect(() => {
    if (bakedGood && isEditSheetOpen) {
      setEditName(bakedGood.name);
      setEditDescription(bakedGood.description ?? "");
      setUpdateError(null);
    }
  }, [bakedGood, isEditSheetOpen]);

  async function handleUpdateBakedGood() {
    if (!editName.trim()) {
      setUpdateError("Name is required.");
      return;
    }
    setUpdateError(null);
    setIsUpdating(true);
    try {
      await updateBakedGood({
        id: id as Id<"bakedGoods">,
        name: editName.trim(),
        description: editDescription.trim() || undefined,
      });
      setIsEditSheetOpen(false);
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : "Failed to update.");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDeleteBakedGood() {
    setIsDeleting(true);
    try {
      await deleteBakedGood({ id: id as Id<"bakedGoods"> });
      router.push("/my-bakery");
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : "Failed to delete.");
      setIsDeleting(false);
    }
  }

  if (bakedGood === undefined) {
    return (
      <div className="p-6 md:p-8 max-w-4xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (bakedGood === null) {
    return (
      <div className="p-6 md:p-8 max-w-4xl">
        <p className="text-muted-foreground">Baked good not found.</p>
        <Button variant="link" onClick={() => router.push("/my-bakery")}>
          Back to My Bakery
        </Button>
      </div>
    );
  }

  const iterationCount = bakedGood.iterationCount ?? 0;
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
          <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
            {"firstPhotoUrl" in it && it.firstPhotoUrl ? (
              <img
                src={it.firstPhotoUrl}
                alt={`Photo from ${formatDate(it.bakeDate)} bake`}
                className="w-full h-full object-cover"
              />
            ) : (
              <Image className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
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
    <div className="p-6 md:p-8 max-w-4xl space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/my-bakery">My Bakery</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{bakedGood.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{bakedGood.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {bakedGood.description && <>{bakedGood.description} · </>}
            {iterationCount} {iterationCount === 1 ? "iteration" : "iterations"}
            {lastBakedDate != null && <> · Last baked {formatDate(lastBakedDate)}</>}
          </p>
        </div>
        <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Edit baked good">
              <Pencil className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Edit Baked Good</SheetTitle>
              <SheetDescription>
                Update the name and description of this baked good.
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Sourdough Bread"
                  disabled={isUpdating || isDeleting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description (optional)</Label>
                <textarea
                  id="edit-description"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="A brief description..."
                  disabled={isUpdating || isDeleting}
                />
              </div>
              {updateError && (
                <p className="text-sm text-destructive">{updateError}</p>
              )}
            </div>
            <SheetFooter className="flex-col gap-2 sm:flex-col">
              <Button
                onClick={handleUpdateBakedGood}
                disabled={isUpdating || isDeleting}
                className="w-full"
              >
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isUpdating ? "Saving..." : "Save changes"}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    disabled={isUpdating || isDeleting}
                    className="w-full"
                  >
                    {isDeleting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    {isDeleting ? "Deleting..." : "Delete Baked Good"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this baked good?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete &quot;{bakedGood.name}&quot; and all {iterationCount} {iterationCount === 1 ? "iteration" : "iterations"}. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={handleDeleteBakedGood}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

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
                        className="absolute left-[calc(-1.5rem-1px)] top-5 size-3 rounded-full border-2 border-background bg-primary shadow-sm -translate-x-1/2"
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
