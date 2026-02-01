"use client";

import { useQuery } from "convex/react";
import { api } from "@bakery/backend";
import type { Id } from "@bakery/backend/dataModel";
import { useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Pencil } from "lucide-react";

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

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mt-6 mb-3 text-2xl font-bold first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-5 mb-2 text-xl font-bold">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-4 mb-2 text-lg font-semibold">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mb-3 leading-relaxed last:mb-0">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-3 list-disc pl-6 space-y-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 list-decimal pl-6 space-y-1">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  code: ({ className, children, ...props }) => (
    <code
      className={className ?? "rounded bg-muted px-1.5 py-0.5 font-mono text-sm"}
      {...props}
    >
      {children}
    </code>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-muted-foreground/30 pl-4 italic text-muted-foreground">
      {children}
    </blockquote>
  ),
};

export default function IterationViewPage() {
  const params = useParams();
  const id = params.id as string;
  const iterationId = params.iterationId as string;
  const iteration = useQuery(
    api.bakedGoods.getIteration,
    iterationId ? { id: iterationId as Id<"recipeIterations"> } : "skip"
  );
  const bakedGood = useQuery(
    api.bakedGoods.getBakedGoodWithIterations,
    id ? { id: id as Id<"bakedGoods"> } : "skip"
  );

  if (iteration === undefined) {
    return (
      <div className="p-6 md:p-8 max-w-2xl space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (iteration === null) {
    return (
      <div className="p-6 md:p-8 max-w-2xl">
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

  const bakedGoodName =
    bakedGood && "name" in bakedGood ? bakedGood.name : "Baked good";

  return (
    <div className="p-6 md:p-8 max-w-2xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/baked-goods/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {bakedGoodName}
          </Link>
        </Button>
        <Button size="sm" asChild>
          <Link href={`/baked-goods/${id}/iterations/${iterationId}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">
          {formatDate(iteration.bakeDate)}
        </span>
        {iteration.rating != null && (
          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-primary font-medium">
            {iteration.rating}/5
          </span>
        )}
        <span>
          {iteration.difficulty} · {formatMinutes(iteration.totalTime)}
        </span>
        {iteration.sourceUrl && (
          <a
            href={iteration.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:no-underline"
          >
            Source
          </a>
        )}
      </div>

      {iteration.notes && iteration.notes.trim() && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {iteration.notes}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recipe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose-recipe min-w-0">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {iteration.recipeContent}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
