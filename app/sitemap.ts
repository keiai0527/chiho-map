import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";
import { getAllMembers, getCities } from "@/lib/data";

const SITE = SITE_URL;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cities = await getCities();
  const members = await getAllMembers();
  const now = new Date();

  return [
    { url: `${SITE}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    ...cities.map((c) => ({
      url: `${SITE}/${c.id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...members.map((m) => ({
      url: `${SITE}/giin/${m.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
