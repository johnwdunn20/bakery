import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/tools/"],
        disallow: ["/my-bakery", "/baked-goods/"],
      },
    ],
    sitemap: "https://www.thebakery.app/sitemap.xml",
  };
}
