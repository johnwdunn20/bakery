"use client";

import * as React from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PhotoDropzoneProps {
  onFilesSelected: (files: FileList) => void;
  disabled?: boolean;
  className?: string;
  accept?: string;
  multiple?: boolean;
}

export function PhotoDropzone({
  onFilesSelected,
  disabled = false,
  className,
  accept = "image/*",
  multiple = true,
}: PhotoDropzoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFilesSelected(files);
    }
  }

  function handleClick() {
    if (!disabled) {
      inputRef.current?.click();
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFilesSelected(files);
    }
    // Reset input so the same file can be selected again
    e.target.value = "";
  }

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={handleChange}
        className="sr-only"
      />
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="rounded-full bg-muted p-3">
          <Upload className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">
            {isDragging ? "Drop photos here" : "Click or drag to upload"}
          </p>
          <p className="text-xs text-muted-foreground">
            {multiple ? "Upload multiple photos" : "Upload a photo"}
          </p>
        </div>
      </div>
    </div>
  );
}

interface PhotoPreviewProps {
  src: string;
  alt?: string;
  onRemove?: () => void;
  isRemoving?: boolean;
  className?: string;
}

export function PhotoPreview({
  src,
  alt = "Photo",
  onRemove,
  isRemoving = false,
  className,
}: PhotoPreviewProps) {
  return (
    <div
      className={cn("relative aspect-square rounded-lg overflow-hidden bg-muted group", className)}
    >
      <img src={src} alt={alt} className="w-full h-full object-cover" />
      {onRemove && (
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          disabled={isRemoving}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label="Remove photo"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

interface PhotoGridProps {
  children: React.ReactNode;
  className?: string;
}

export function PhotoGrid({ children, className }: PhotoGridProps) {
  return <div className={cn("grid grid-cols-2 sm:grid-cols-3 gap-3", className)}>{children}</div>;
}
