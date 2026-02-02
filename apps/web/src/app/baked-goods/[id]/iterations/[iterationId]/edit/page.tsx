"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@bakery/backend";
import type { Id } from "@bakery/backend/dataModel";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
} from "@/components/ui/alert-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { StarRating } from "@/components/ui/star-rating";
import { Trash2 } from "lucide-react";

const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const TIME_PRESETS = [30, 60, 90, 120, 180, 240];

function formatDateForInput(ts: number) {
  const d = new Date(ts);
  return d.toISOString().slice(0, 10);
}

function formatMinutes(min: number) {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function IterationEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const iterationId = params.iterationId as string;
  const iteration = useQuery(
    api.bakedGoods.getIteration,
    iterationId ? { id: iterationId as Id<"recipeIterations"> } : "skip"
  );
  const updateIteration = useMutation(api.bakedGoods.updateIteration);
  const generateUploadUrl = useMutation(api.bakedGoods.generateUploadUrl);
  const addIterationPhoto = useMutation(api.bakedGoods.addIterationPhoto);
  const deleteIterationPhoto = useMutation(api.bakedGoods.deleteIterationPhoto);

  const bakedGood = useQuery(
    api.bakedGoods.getBakedGoodWithIterations,
    id ? { id: id as Id<"bakedGoods"> } : "skip"
  );

  const [recipeContent, setRecipeContent] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [totalTime, setTotalTime] = useState("");
  const [bakeDate, setBakeDate] = useState("");
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<Id<"iterationPhotos"> | null>(null);
  const [deletingPhotoId, setDeletingPhotoId] = useState<Id<"iterationPhotos"> | null>(null);

  useEffect(() => {
    if (iteration && !initialized) {
      setRecipeContent(iteration.recipeContent ?? "");
      setDifficulty(iteration.difficulty ?? "Medium");
      setTotalTime(String(iteration.totalTime ?? ""));
      setBakeDate(formatDateForInput(iteration.bakeDate));
      setRating(iteration.rating ?? undefined);
      setNotes(iteration.notes ?? "");
      setSourceUrl(iteration.sourceUrl ?? "");
      setInitialized(true);
    }
  }, [iteration, initialized]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!recipeContent.trim()) {
      setError("Recipe content is required.");
      return;
    }
    const totalTimeNum = parseInt(totalTime, 10);
    if (Number.isNaN(totalTimeNum) || totalTimeNum < 0) {
      setError("Total time must be a non-negative number (minutes).");
      return;
    }
    if (!bakeDate) {
      setError("Bake date is required.");
      return;
    }
    const bakeDateTs = new Date(bakeDate).getTime();
    if (Number.isNaN(bakeDateTs)) {
      setError("Invalid bake date.");
      return;
    }
    setIsSubmitting(true);
    try {
      await updateIteration({
        id: iterationId as Id<"recipeIterations">,
        recipeContent: recipeContent.trim(),
        difficulty: difficulty.trim(),
        totalTime: totalTimeNum,
        bakeDate: bakeDateTs,
        rating,
        notes: notes.trim() || undefined,
        sourceUrl: sourceUrl.trim() || undefined,
      });
      router.push(`/baked-goods/${id}/iterations/${iterationId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update iteration.");
      setIsSubmitting(false);
    }
  }

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploadError(null);
    setIsUploading(true);
    const photoCount = iteration?.photos?.length ?? 0;
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadUrl = await generateUploadUrl();
        const response = await fetch(uploadUrl, { method: "POST", body: file });
        if (!response.ok) throw new Error("Upload failed");
        const { storageId } = (await response.json()) as { storageId: string };
        await addIterationPhoto({
          iterationId: iterationId as Id<"recipeIterations">,
          storageId: storageId as Id<"_storage">,
          order: photoCount + i,
        });
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to upload photos.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }

  if (iteration === undefined) {
    return (
      <div className="p-6 md:p-8 max-w-xl">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (iteration === null) {
    return (
      <div className="p-6 md:p-8 max-w-xl">
        <p className="text-muted-foreground">Iteration not found.</p>
        <Button variant="link" asChild>
          <Link href={id ? `/baked-goods/${id}` : "/my-bakery"}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to baked good
          </Link>
        </Button>
      </div>
    );
  }

  if (!initialized) {
    return (
      <div className="p-6 md:p-8 max-w-xl">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const bakedGoodName = bakedGood && "name" in bakedGood ? bakedGood.name : "Baked Good";

  return (
    <div className="p-6 md:p-8 max-w-xl space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/my-bakery">My Bakery</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/baked-goods/${id}`}>{bakedGoodName}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/baked-goods/${id}/iterations/${iterationId}`}>
                {formatDate(iteration.bakeDate)}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader>
          <CardTitle>Edit iteration</CardTitle>
          <CardDescription>
            Update recipe content, difficulty, timing, rating, and notes.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipeContent">Recipe content</Label>
              <textarea
                id="recipeContent"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={recipeContent}
                onChange={(e) => setRecipeContent(e.target.value)}
                placeholder="Ingredients, steps, etc."
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <select
                id="difficulty"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                disabled={isSubmitting}
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalTime">Total time (minutes)</Label>
              <Input
                id="totalTime"
                type="number"
                min={0}
                value={totalTime}
                onChange={(e) => setTotalTime(e.target.value)}
                placeholder="e.g. 45"
                required
                disabled={isSubmitting}
              />
              <div className="flex flex-wrap gap-2">
                {TIME_PRESETS.map((min) => (
                  <Button
                    key={min}
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={() => setTotalTime(String(min))}
                  >
                    {formatMinutes(min)}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bakeDate">Bake date</Label>
              <div className="flex gap-2">
                <Input
                  id="bakeDate"
                  type="date"
                  value={bakeDate}
                  onChange={(e) => setBakeDate(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() => setBakeDate(new Date().toISOString().slice(0, 10))}
                >
                  Today
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Rating (optional)</Label>
              <StarRating
                value={rating}
                onChange={setRating}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <textarea
                id="notes"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did it turn out?"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sourceUrl">Source URL (optional)</Label>
              <Input
                id="sourceUrl"
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://..."
                disabled={isSubmitting}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter className="gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save changes"}
            </Button>
            <Button type="button" variant="outline" asChild disabled={isSubmitting}>
              <Link href={`/baked-goods/${id}/iterations/${iterationId}`}>
                Cancel
              </Link>
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Photos</CardTitle>
          <CardDescription>Add or remove photos for this iteration.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {iteration.photos && iteration.photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {iteration.photos.map((photo) => (
                <div
                  key={photo._id}
                  className="relative aspect-square rounded-lg overflow-hidden bg-muted"
                >
                  {photo.url ? (
                    <img
                      src={photo.url}
                      alt="Iteration"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                      Unavailable
                    </div>
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 opacity-90 hover:opacity-100"
                    disabled={deletingPhotoId !== null || isSubmitting}
                    aria-label="Remove photo"
                    onClick={() => setPhotoToDelete(photo._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <AlertDialog open={photoToDelete !== null} onOpenChange={(open) => !open && setPhotoToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete photo?</AlertDialogTitle>
                <AlertDialogDescription>
                  This photo will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={async () => {
                    if (!photoToDelete) return;
                    setDeletingPhotoId(photoToDelete);
                    try {
                      await deleteIterationPhoto({ id: photoToDelete });
                    } finally {
                      setDeletingPhotoId(null);
                      setPhotoToDelete(null);
                    }
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <div>
            <Label htmlFor="photo-upload" className="sr-only">
              Add photos
            </Label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              multiple
              disabled={isUploading || isSubmitting}
              onChange={handlePhotoSelect}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground file:text-sm file:font-medium"
            />
            {isUploading && <p className="text-sm text-muted-foreground mt-2">Uploading…</p>}
            {uploadError && <p className="text-sm text-destructive mt-2">{uploadError}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
