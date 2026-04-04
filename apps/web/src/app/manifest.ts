import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bakery — Your Personal Baking Journal",
    short_name: "Bakery",
    description:
      "The professional-grade toolkit for home bakers. Store recipes, track variations with precision, and master the math behind every loaf.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#f97316",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
