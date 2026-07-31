import { createFileRoute, notFound } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { ErrorCodesDetail, errorCodesHead } from "@/components/site/ErrorCodesDetail";

export const Route = createFileRoute("/_site/brand/$slug/$appliance/error")({
  loader: async ({ params }) => {
    const [{ data: brand }, { data: service }] = await Promise.all([
      supabase.from("brands").select("id,slug,title").eq("slug", params.slug).eq("is_active", true).maybeSingle(),
      supabase.from("service_types").select("id,slug,title,title_genitive").eq("slug", params.appliance).eq("is_active", true).maybeSingle(),
    ]);
    if (!service || !brand) throw notFound();
    const { data: codes } = await supabase.from("error_codes").select("id,code,meaning,cause,solution").eq("service_type_id", service.id).eq("brand_id", brand.id).eq("is_active", true).order("sort_order");
    if (!codes?.length) throw notFound();
    return { service, brand, codes };
  },
  head: ({ loaderData, params }) => loaderData ? errorCodesHead(loaderData.service, loaderData.brand, `/brand/${params.slug}/${params.appliance}/error`) : {},
  component: () => <ErrorCodesDetail {...Route.useLoaderData()} />,
});