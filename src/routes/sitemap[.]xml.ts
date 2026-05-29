import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = "";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const supabase = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
        );
        const [{ data: types }, { data: brands }] = await Promise.all([
          supabase.from("service_types").select("slug").eq("is_active", true),
          supabase.from("brands").select("slug").eq("is_active", true),
        ]);
        const paths = [
          "/", "/services", "/prices", "/discounts", "/promotions", "/faq", "/contacts",
          ...(types ?? []).map((t) => `/appliance/${t.slug}`),
          ...(brands ?? []).map((b) => `/brand/${b.slug}`),
        ];
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...paths.map((p) => `  <url><loc>${BASE_URL}${p}</loc><changefreq>weekly</changefreq></url>`),
          `</urlset>`,
        ].join("\n");
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
