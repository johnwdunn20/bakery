"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@bakery/backend";
import type { Id } from "@bakery/backend/dataModel";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X as XIcon } from "lucide-react";

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface CoverPhotoPickerProps {
  bakedGoodId: Id<"bakedGoods">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CoverPhotoPicker({ bakedGoodId, open, onOpenChange }: CoverPhotoPickerProps) {
  const data = useQuery(api.bakedGoods.getAllBakedGoodPhotos, open ? { bakedGoodId } : "skip");
  const setBakedGoodCoverPhoto = useMutation(api.bakedGoods.setBakedGoodCoverPhoto);

  async function handleSelect(storageId: Id<"_storage">) {
    await setBakedGoodCoverPhoto({ bakedGoodId, storageId });
    onOpenChange(false);
  }

  async function handleClear() {
    await setBakedGoodCoverPhoto({ bakedGoodId, storageId: undefined });
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Choose Cover Photo</SheetTitle>
          <SheetDescription>
            Select a photo from any iteration to use as the cover for this baked good.
          </SheetDescription>
        </SheetHeader>

        <div className="py-4 space-y-6">
          {data?.coverPhotoStorageId && (
            <Button variant="outline" size="sm" className="w-full" onClick={handleClear}>
              <XIcon className="mr-2 h-4 w-4" />
              Use default cover
            </Button>
          )}

          {data === undefined && (
            <div className="space-y-4">
              <Skeleton className="h-5 w-32" />
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              </div>
            </div>
          )}

          {data === null && <p className="text-sm text-muted-foreground">Could not load photos.</p>}

          {data?.groups.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No photos yet. Add photos to an iteration first.
            </p>
          )}

          {data?.groups.map((group) => (
            <div key={group.iterationId}>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                {formatDate(group.bakeDate)}
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {group.photos.map((photo) => {
                  const isSelected = photo.storageId === data.coverPhotoStorageId;
                  return (
                    <button
                      key={photo._id}
                      type="button"
                      className="relative aspect-square rounded-lg overflow-hidden bg-muted group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      onClick={() => handleSelect(photo.storageId)}
                    >
                      {photo.url ? (
                        <img
                          src={photo.url}
                          alt=""
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          Unavailable
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-4 w-4 text-primary-foreground" />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
