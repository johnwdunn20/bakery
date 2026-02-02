"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  disabled?: boolean;
  className?: string;
}

export function StarRating({
  value,
  onChange,
  disabled = false,
  className,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);

  const displayValue = hoverValue ?? value ?? 0;

  function handleClick(starIndex: number) {
    if (disabled) return;
    // If clicking the same star that's already selected, clear the rating
    if (value === starIndex) {
      onChange(undefined);
    } else {
      onChange(starIndex);
    }
  }

  function handleMouseEnter(starIndex: number) {
    if (disabled) return;
    setHoverValue(starIndex);
  }

  function handleMouseLeave() {
    setHoverValue(null);
  }

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      onMouseLeave={handleMouseLeave}
      role="group"
      aria-label="Rating"
    >
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const isFilled = starIndex <= displayValue;
        const isSelected = value === starIndex;

        return (
          <button
            key={starIndex}
            type="button"
            disabled={disabled}
            onClick={() => handleClick(starIndex)}
            onMouseEnter={() => handleMouseEnter(starIndex)}
            className={cn(
              "p-0.5 rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              disabled
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:scale-110 transition-transform"
            )}
            aria-label={`Rate ${starIndex} out of 5${isSelected ? " (click to clear)" : ""}`}
          >
            <Star
              className={cn(
                "h-6 w-6 transition-colors",
                isFilled
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-transparent text-muted-foreground"
              )}
            />
          </button>
        );
      })}
      {value && (
        <span className="ml-2 text-sm text-muted-foreground">{value}/5</span>
      )}
    </div>
  );
}
