import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { comboHead } from "@/components/site/ComboPage";

export const Route = createFileRoute("/_site/appliance/$slug/$brand")({
  loader: async ({ params }) => {
    const [{ data: service }, { data: brand }] = await Promise.all([
      supabase.from("service_types").select("id,slug,title,title_genitive,description,cover_url").eq("slug", params.slug).eq("is_active", true).maybeSingle(),
      supabase.from("brands").select("id,slug,title,logo_url,logo_scale,logo_fit").eq("slug", params.brand).eq("is_active", true).maybeSingle(),
    ]);
    if (!service || !brand) throw notFound();
    return { service, brand };
  },
  head: ({ loaderData, params }) =>
    loaderData
      ? comboHead(loaderData.service, loaderData.brand, `/appliance/${params.slug}/${params.brand}`)
      : {},
  component: Outlet,
});
