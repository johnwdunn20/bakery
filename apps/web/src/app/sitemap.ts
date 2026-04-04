import type { MetadataRoute } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@bakery/backend";

const BASE_URL = "https://www.thebakery.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/welcome`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/community`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/tools/calculator`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/tools/substitutions`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  let recipePages: MetadataRoute.Sitemap = [];
  try {
    const publicRecipes = await fetchQuery(api.bakedGoods.listCommunityBakedGoods);
    recipePages = publicRecipes.map((recipe) => ({
      url: `${BASE_URL}/community/${recipe._id}`,
      lastModified: new Date(recipe.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // Sitemap generation should not fail if Convex is unreachable
  }

  return [...staticPages, ...recipePages];
}
