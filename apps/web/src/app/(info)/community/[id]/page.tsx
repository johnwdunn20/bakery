import type { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@bakery/backend";
import type { Id } from "@bakery/backend/dataModel";
import { CommunityBakedGoodDetail } from "@/components/community-baked-good-detail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const bakedGood = await fetchQuery(api.bakedGoods.getPublicBakedGood, {
    id: id as Id<"bakedGoods">,
  });

  if (!bakedGood) {
    return {
      title: "Recipe Not Found",
      description: "This recipe is no longer available on Bakery.",
    };
  }

  const title = bakedGood.name;
  const description = bakedGood.description ?? `A recipe by ${bakedGood.authorName} on Bakery.`;

  return {
    title,
    description,
    alternates: { canonical: `/community/${id}` },
    openGraph: {
      title: `${title} | Bakery`,
      description,
      url: `https://www.thebakery.app/community/${id}`,
    },
  };
}

export default async function CommunityBakedGoodPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CommunityBakedGoodDetail id={id} />;
}
