import type { Metadata } from "next";
import { CommunityGrid } from "@/components/community-grid";

export const metadata: Metadata = {
  title: "Community Bakes",
  description:
    "Explore recipes shared by the Bakery community. Discover bread, pastry, and dessert recipes from home bakers, and fork them to start your own experiments.",
  alternates: {
    canonical: "/community",
  },
  openGraph: {
    title: "Community Bakes | Bakery",
    description:
      "Explore recipes shared by the Bakery community. Discover bread, pastry, and dessert recipes from home bakers.",
    url: "https://www.thebakery.app/community",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Community Bakes",
  url: "https://www.thebakery.app/community",
  description:
    "Explore recipes shared by the Bakery community. Discover bread, pastry, and dessert recipes from home bakers.",
  isPartOf: {
    "@type": "WebSite",
    name: "Bakery",
    url: "https://www.thebakery.app",
  },
};

export default function CommunityPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <header className="mb-10 text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Community Bakes</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Recipes shared by bakers like you. Fork them to start your own experiments.
          </p>
        </header>
        <CommunityGrid />
      </div>
    </>
  );
}
