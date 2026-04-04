"use client";

import { useQuery } from "convex/react";
import { api } from "@bakery/backend";
import { Button } from "@/components/ui/button";
import { CommunityCard } from "@/components/community-card";
import Link from "next/link";

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col py-6 gap-6 animate-pulse">
      <div className="h-48 sm:h-64 bg-muted -mt-6" />
      <div className="px-6 space-y-2">
        <div className="h-5 w-2/3 bg-muted rounded" />
        <div className="h-4 w-full bg-muted rounded" />
      </div>
      <div className="px-6 flex justify-between items-center border-t border-border pt-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-muted" />
          <div className="h-4 w-20 bg-muted rounded" />
        </div>
        <div className="h-8 w-16 bg-muted rounded" />
      </div>
    </div>
  );
}

export function SplashCommunityShowcase() {
  const communityBakedGoods = useQuery(api.bakedGoods.listCommunityBakedGoods);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
        {communityBakedGoods === undefined ? (
          [1, 2, 3].map((i) => <CardSkeleton key={i} />)
        ) : communityBakedGoods.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <p className="text-lg text-muted-foreground">
              No community bakes yet &mdash; be the first to share!
            </p>
          </div>
        ) : (
          communityBakedGoods.map((bg) => <CommunityCard key={bg._id} bg={bg} tall />)
        )}
      </div>

      {communityBakedGoods && communityBakedGoods.length > 0 && (
        <div className="mt-16 text-center">
          <Button asChild variant="outline" size="lg" className="rounded-full px-8">
            <Link href="/community">View All Community Bakes</Link>
          </Button>
        </div>
      )}
    </>
  );
}
