import type { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@bakery/backend";
import type { Id } from "@bakery/backend/dataModel";
import { notFound } from "next/navigation";
import { PublicBakedGoodDetail } from "@/components/public-baked-good-detail";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const bakedGood = await fetchQuery(api.bakedGoods.getPublicBakedGood, {
    id: id as Id<"bakedGoods">,
  });

  if (!bakedGood) {
    return { title: "Recipe Not Found" };
  }

  const title = bakedGood.name;
  const description =
    bakedGood.description ??
    `${bakedGood.name} by ${bakedGood.authorName} — shared on the Bakery community.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/community/${id}`,
    },
    openGraph: {
      title: `${title} | Bakery Community`,
      description,
      url: `https://www.thebakery.app/community/${id}`,
    },
  };
}

export default async function CommunityRecipePage({ params }: Props) {
  const { id } = await params;
  const bakedGood = await fetchQuery(api.bakedGoods.getPublicBakedGood, {
    id: id as Id<"bakedGoods">,
  });

  if (!bakedGood) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: bakedGood.name,
    description:
      bakedGood.description ??
      `${bakedGood.name} by ${bakedGood.authorName} — shared on the Bakery community.`,
    author: {
      "@type": "Person",
      name: bakedGood.authorName,
    },
    url: `https://www.thebakery.app/community/${id}`,
    isPartOf: {
      "@type": "WebSite",
      name: "Bakery",
      url: "https://www.thebakery.app",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicBakedGoodDetail id={id as Id<"bakedGoods">} />
    </>
  );
}
