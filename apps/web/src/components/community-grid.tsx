"use client";

import { useQuery } from "convex/react";
import { api } from "@bakery/backend";
import { CommunityCard } from "@/components/community-card";

export function CommunityGrid() {
  const communityBakedGoods = useQuery(api.bakedGoods.listCommunityBakedGoods);

  if (!communityBakedGoods) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-[340px] rounded-2xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (communityBakedGoods.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-4">🍞</div>
        <h3 className="text-lg font-semibold mb-2">No community bakes yet</h3>
        <p className="text-muted-foreground">Be the first to share a recipe with the community!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {communityBakedGoods.map((bg) => (
        <CommunityCard key={bg._id} bg={bg} />
      ))}
    </div>
  );
}
