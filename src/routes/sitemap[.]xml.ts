import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

// TODO: replace with your project URL once a project name or custom domain is set.
const BASE_URL = "";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "0.9" },
          { path: "/about", changefreq: "monthly", priority: "0.6" },
          { path: "/contact", changefreq: "monthly", priority: "0.6" },
          { path: "/fleet", changefreq: "weekly", priority: "0.6" },
          { path: "/booking", changefreq: "weekly", priority: "0.7" },
          { path: "/marketing", changefreq: "weekly", priority: "1.0" },
          { path: "/marketing/features", changefreq: "monthly", priority: "0.8" },
          { path: "/marketing/pricing", changefreq: "monthly", priority: "0.8" },
          { path: "/marketing/for-schools", changefreq: "monthly", priority: "0.7" },
          { path: "/marketing/about", changefreq: "monthly", priority: "0.6" },
          { path: "/marketing/contact", changefreq: "monthly", priority: "0.6" },
          { path: "/marketing/blog", changefreq: "weekly", priority: "0.5" },
          { path: "/marketing/legal/terms", changefreq: "yearly", priority: "0.3" },
          { path: "/marketing/legal/privacy", changefreq: "yearly", priority: "0.3" },
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});