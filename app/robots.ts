import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: "https://chihogiin.jp/sitemap.xml",
    host: "https://chihogiin.jp",
  };
}
