import type { Metadata } from "next";
import { SplashPage } from "@/components/splash-page";

export const metadata: Metadata = {
  title: "Bakery — Stop Guessing. Start Perfecting.",
  description:
    "The professional-grade toolkit for home bakers. Store recipes, track every variation, calculate baker's percentages, and find ingredient substitutions instantly.",
  openGraph: {
    title: "Bakery — Stop Guessing. Start Perfecting.",
    description:
      "The professional-grade toolkit for home bakers. Store recipes, track every variation, calculate baker's percentages, and find ingredient substitutions instantly.",
    url: "https://www.thebakery.app",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Bakery",
  url: "https://www.thebakery.app",
  description:
    "The professional-grade toolkit for home bakers. Store recipes, track variations with precision, and master the math behind every loaf.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://www.thebakery.app/tools/substitutions?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SplashPage />
    </>
  );
}
