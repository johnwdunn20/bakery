"use client";

import { useState } from "react";
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
import { X, Check, Loader2, AlertCircle, CalendarIcon } from "lucide-react";

const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const TIME_PRESETS = [30, 60, 90, 120, 180, 240];

function formatMinutes(min: number) {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

type UploadStatus = "pending" | "uploading" | "done" | "error";

interface SelectedFile {
  file: File;
  previewUrl: string;
  status: UploadStatus;
}

export default function NewIterationPage() {
  const params = useParams();
  const router = useRouter();
  const bakedGoodId = params.id as string;
  const bakedGood = useQuery(
    api.bakedGoods.getBakedGoodWithIterations,
    bakedGoodId ? { id: bakedGoodId as Id<"bakedGoods"> } : "skip"
  );
  const createIteration = useMutation(api.bakedGoods.createIteration);
  const generateUploadUrl = useMutation(api.bakedGoods.generateUploadUrl);
  const addIterationPhoto = useMutation(api.bakedGoods.addIterationPhoto);

  const [recipeContent, setRecipeContent] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [totalTime, setTotalTime] = useState("");
  const [bakeDate, setBakeDate] = useState(new Date().toISOString().slice(0, 10));
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);

  function handleFilesSelected(files: FileList) {
    const newFiles: SelectedFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith("image/")) {
        newFiles.push({
          file,
          previewUrl: URL.createObjectURL(file),
          status: "pending",
        });
      }
    }
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  }

  function removeSelectedFile(index: number) {
    setSelectedFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].previewUrl);
      newFiles.splice(index, 1);
      return newFiles;
    });
  }

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
      const newId = await createIteration({
        bakedGoodId: bakedGoodId as Id<"bakedGoods">,
        recipeContent: recipeContent.trim(),
        difficulty: difficulty.trim(),
        totalTime: totalTimeNum,
        bakeDate: bakeDateTs,
        rating,
        notes: notes.trim() || undefined,
        sourceUrl: sourceUrl.trim() || undefined,
      });
      if (selectedFiles.length > 0) {
        for (let i = 0; i < selectedFiles.length; i++) {
          // Mark as uploading
          setSelectedFiles((prev) =>
            prev.map((f, idx) => (idx === i ? { ...f, status: "uploading" as UploadStatus } : f))
          );
          try {
            const { file } = selectedFiles[i];
            const uploadUrl = await generateUploadUrl();
            const response = await fetch(uploadUrl, { method: "POST", body: file });
            if (!response.ok) throw new Error("Upload failed");
            const { storageId } = (await response.json()) as { storageId: string };
            await addIterationPhoto({
              iterationId: newId,
              storageId: storageId as Id<"_storage">,
              order: i,
            });
            // Mark as done
            setSelectedFiles((prev) =>
              prev.map((f, idx) => (idx === i ? { ...f, status: "done" as UploadStatus } : f))
            );
          } catch {
            // Mark as error but continue
            setSelectedFiles((prev) =>
              prev.map((f, idx) => (idx === i ? { ...f, status: "error" as UploadStatus } : f))
            );
          }
        }
      }
      router.push(`/baked-goods/${bakedGoodId}/iterations/${newId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create iteration.");
      setIsSubmitting(false);
    }
  }

  if (bakedGood === undefined) {
    return (
      <div className="p-6 md:p-8 max-w-4xl">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (bakedGood === null) {
    return (
      <div className="p-6 md:p-8 max-w-4xl">
        <p className="text-muted-foreground">Baked good not found.</p>
        <Button variant="link" asChild>
          <Link href="/my-bakery">Back to My Bakery</Link>
        </Button>
      </div>
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
            <BreadcrumbLink asChild>
              <Link href={`/baked-goods/${bakedGoodId}`}>{bakedGood.name}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>New Iteration</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader>
          <CardTitle>Add iteration</CardTitle>
          <CardDescription>
            Record a bake of <strong>{bakedGood.name}</strong>. Recipe content, difficulty, total
            time, and bake date are required.
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
              <p className="text-xs text-muted-foreground">
                Supports Markdown: **bold**, *italic*, - lists, ## headings
              </p>
            </div>
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty} disabled={isSubmitting}>
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
                        ? new Date(bakeDate).toLocaleDateString(undefined, {
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
                      selected={bakeDate ? new Date(bakeDate) : undefined}
                      onSelect={(date) => setBakeDate(date ? date.toISOString().slice(0, 10) : "")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
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
              <StarRating value={rating} onChange={setRating} disabled={isSubmitting} />
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
            <div className="space-y-3">
              <Label>Photos (optional)</Label>
              {selectedFiles.length > 0 && (
                <PhotoGrid>
                  {selectedFiles.map((sf, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden bg-muted group"
                    >
                      <img
                        src={sf.previewUrl}
                        alt={`Selected photo ${index + 1}`}
                        className={`w-full h-full object-cover ${sf.status === "uploading" ? "opacity-50" : ""}`}
                      />
                      {/* Upload status indicator */}
                      {sf.status === "uploading" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Loader2 className="h-8 w-8 text-white animate-spin" />
                        </div>
                      )}
                      {sf.status === "done" && (
                        <div className="absolute bottom-2 left-2 rounded-full bg-green-500 p-1">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                      {sf.status === "error" && (
                        <div className="absolute bottom-2 left-2 rounded-full bg-destructive p-1">
                          <AlertCircle className="h-4 w-4 text-white" />
                        </div>
                      )}
                      {/* Remove button - only show when not submitting */}
                      {!isSubmitting && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeSelectedFile(index)}
                          aria-label="Remove photo"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </PhotoGrid>
              )}
              <PhotoDropzone onFilesSelected={handleFilesSelected} disabled={isSubmitting} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter className="gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating…" : "Add iteration"}
            </Button>
            <Button type="button" variant="outline" asChild disabled={isSubmitting}>
              <Link href={`/baked-goods/${bakedGoodId}`}>Cancel</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
