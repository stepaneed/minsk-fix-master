import { createFileRoute, notFound } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { ComboPage, comboHead } from "@/components/site/ComboPage";

export const Route = createFileRoute("/_site/brand/$slug/$appliance")({
  loader: async ({ params }) => {
    const [{ data: brand }, { data: service }] = await Promise.all([
      supabase.from("brands").select("id,slug,title,logo_url,logo_scale,logo_fit").eq("slug", params.slug).eq("is_active", true).maybeSingle(),
      supabase.from("service_types").select("id,slug,title,title_genitive,description,cover_url").eq("slug", params.appliance).eq("is_active", true).maybeSingle(),
    ]);
    if (!service || !brand) throw notFound();
    return { service, brand };
  },
  head: ({ loaderData, params }) =>
    loaderData
      ? comboHead(loaderData.service, loaderData.brand, `/brand/${params.slug}/${params.appliance}`)
      : {},
  component: () => {
    const data = Route.useLoaderData();
    return <ComboPage service={data.service} brand={data.brand} />;
  },
});
