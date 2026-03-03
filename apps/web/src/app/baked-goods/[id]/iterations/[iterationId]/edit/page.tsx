"use client";

import { useState, useEffect } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { iterationSchema, DIFFICULTIES } from "@bakery/shared/validation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@bakery/backend";
import type { Id } from "@bakery/backend/dataModel";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
import { PhotoDropzone, PhotoGrid } from "@/components/ui/photo-dropzone";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, CalendarIcon, Trash2, X, Loader2 } from "lucide-react";

const TIME_PRESETS = [30, 60, 90, 120, 180, 240];

function formatDateForInput(ts: number) {
  return new Date(ts).toLocaleDateString("en-CA");
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

type IterationFormData = z.infer<typeof iterationSchema>;

export default function IterationEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const iterationId = params.iterationId as string;
  const iteration = useQuery(
    api.bakedGoods.getIteration,
    iterationId ? { id: iterationId as Id<"recipeIterations"> } : "skip"
  );
  const updateIteration = useMutation(api.bakedGoods.updateIteration).withOptimisticUpdate(
    (localStore, args) => {
      const current = localStore.getQuery(api.bakedGoods.getIteration, { id: args.id });
      if (current) {
        localStore.setQuery(
          api.bakedGoods.getIteration,
          { id: args.id },
          {
            ...current,
            ...(args.recipeContent !== undefined && { recipeContent: args.recipeContent }),
            ...(args.difficulty !== undefined && { difficulty: args.difficulty }),
            ...(args.totalTime !== undefined && { totalTime: args.totalTime }),
            ...(args.bakeDate !== undefined && { bakeDate: args.bakeDate }),
            ...(args.rating !== undefined && { rating: args.rating }),
            ...(args.notes !== undefined && { notes: args.notes }),
            ...(args.sourceUrl !== undefined && { sourceUrl: args.sourceUrl }),
            updatedAt: Date.now(),
          }
        );
      }
    }
  );
  const generateUploadUrl = useMutation(api.bakedGoods.generateUploadUrl);
  const addIterationPhoto = useMutation(api.bakedGoods.addIterationPhoto);
  const deleteIterationPhoto = useMutation(api.bakedGoods.deleteIterationPhoto);

  const bakedGood = useQuery(
    api.bakedGoods.getBakedGood,
    id ? { id: id as Id<"bakedGoods"> } : "skip"
  );

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IterationFormData>({
    resolver: zodResolver(iterationSchema) as Resolver<IterationFormData>,
  });

  const bakeDate = watch("bakeDate");
  const [initialized, setInitialized] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<Id<"iterationPhotos"> | null>(null);
  const [deletingPhotoId, setDeletingPhotoId] = useState<Id<"iterationPhotos"> | null>(null);

  useEffect(() => {
    if (iteration && !initialized) {
      reset({
        recipeContent: iteration.recipeContent ?? "",
        difficulty: (iteration.difficulty as IterationFormData["difficulty"]) ?? "Medium",
        totalTime: iteration.totalTime,
        bakeDate: formatDateForInput(iteration.bakeDate),
        rating: iteration.rating ?? undefined,
        notes: iteration.notes ?? "",
        sourceUrl: iteration.sourceUrl ?? "",
      });
      setInitialized(true);
    }
  }, [iteration, initialized, reset]);

  async function onSubmit(data: IterationFormData) {
    setServerError(null);
    const bakeDateTs = new Date(data.bakeDate + "T12:00:00").getTime();
    try {
      await updateIteration({
        id: iterationId as Id<"recipeIterations">,
        recipeContent: data.recipeContent.trim(),
        difficulty: data.difficulty,
        totalTime: data.totalTime,
        bakeDate: bakeDateTs,
        rating: data.rating,
        notes: data.notes?.trim() || undefined,
        sourceUrl: data.sourceUrl?.trim() || undefined,
      });
      router.push(`/baked-goods/${id}/iterations/${iterationId}`);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Failed to update iteration.");
    }
  }

  async function handleFilesSelected(files: FileList) {
    setUploadError(null);
    setIsUploading(true);
    const photoCount = iteration?.photos?.length ?? 0;
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) continue;
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
    }
  }

  if (iteration === undefined) {
    return (
      <div className="p-6 md:p-8 max-w-4xl">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (iteration === null) {
    return (
      <div className="p-6 md:p-8 max-w-4xl">
        <p className="text-muted-foreground">Iteration not found.</p>
        <Button variant="link" asChild>
          <Link href={id ? `/baked-goods/${id}` : "/"}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to baked good
          </Link>
        </Button>
      </div>
    );
  }

  if (!initialized) {
    return (
      <div className="p-6 md:p-8 max-w-4xl">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const bakedGoodName = bakedGood && "name" in bakedGood ? bakedGood.name : "Baked Good";

  return (
    <div className="p-6 md:p-8 max-w-4xl space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">My Bakery</Link>
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipeContent">Recipe content</Label>
              <textarea
                id="recipeContent"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register("recipeContent")}
                placeholder="Ingredients, steps, etc."
                disabled={isSubmitting}
              />
              {errors.recipeContent ? (
                <p className="text-sm text-destructive">{errors.recipeContent.message}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Supports Markdown: **bold**, *italic*, - lists, ## headings
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Controller
                control={control}
                name="difficulty"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTIES.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.difficulty && (
                <p className="text-sm text-destructive">{errors.difficulty.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalTime">Total time (minutes)</Label>
              <Input
                id="totalTime"
                type="number"
                min={1}
                {...register("totalTime", { valueAsNumber: true })}
                placeholder="e.g. 45"
                disabled={isSubmitting}
              />
              {errors.totalTime && (
                <p className="text-sm text-destructive">{errors.totalTime.message}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {TIME_PRESETS.map((min) => (
                  <Button
                    key={min}
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={() => setValue("totalTime", min)}
                  >
                    {formatMinutes(min)}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Bake date</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      disabled={isSubmitting}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {bakeDate
                        ? new Date(bakeDate + "T12:00:00").toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={bakeDate ? new Date(bakeDate + "T12:00:00") : undefined}
                      onSelect={(date) =>
                        setValue("bakeDate", date ? date.toLocaleDateString("en-CA") : "")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() => setValue("bakeDate", new Date().toLocaleDateString("en-CA"))}
                >
                  Today
                </Button>
              </div>
              {errors.bakeDate && (
                <p className="text-sm text-destructive">{errors.bakeDate.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Rating (optional)</Label>
              <Controller
                control={control}
                name="rating"
                render={({ field }) => (
                  <StarRating
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isSubmitting}
                  />
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <textarea
                id="notes"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register("notes")}
                placeholder="How did it turn out?"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sourceUrl">Source URL (optional)</Label>
              <Input
                id="sourceUrl"
                type="url"
                {...register("sourceUrl")}
                placeholder="https://..."
                disabled={isSubmitting}
              />
              {errors.sourceUrl && (
                <p className="text-sm text-destructive">{errors.sourceUrl.message}</p>
              )}
            </div>
            {serverError && <p className="text-sm text-destructive">{serverError}</p>}
          </CardContent>
          <CardFooter className="gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save changes"}
            </Button>
            <Button type="button" variant="outline" asChild disabled={isSubmitting}>
              <Link href={`/baked-goods/${id}/iterations/${iterationId}`}>Cancel</Link>
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
            <PhotoGrid>
              {iteration.photos.map((photo) => (
                <div
                  key={photo._id}
                  className="relative aspect-square rounded-lg overflow-hidden bg-muted group"
                >
                  {photo.url ? (
                    <Image
                      src={photo.url}
                      alt={`Photo of ${bakedGoodName}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                      Unavailable
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                    disabled={deletingPhotoId !== null || isSubmitting}
                    aria-label="Remove photo"
                    onClick={() => setPhotoToDelete(photo._id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </PhotoGrid>
          )}

          <AlertDialog
            open={photoToDelete !== null}
            onOpenChange={(open) => !open && setPhotoToDelete(null)}
          >
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
          <div className="space-y-2">
            <PhotoDropzone
              onFilesSelected={handleFilesSelected}
              disabled={isUploading || isSubmitting}
            />
            {isUploading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Uploading photos...</span>
              </div>
            )}
            {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
