import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/welcome", "/tools/", "/terms", "/community"],
        disallow: ["/", "/baked-goods/"],
      },
    ],
    sitemap: "https://www.thebakery.app/sitemap.xml",
  };
}
