import { createFileRoute, notFound } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { ErrorCodesDetail, errorCodesHead } from "@/components/site/ErrorCodesDetail";

export const Route = createFileRoute("/_site/appliance/$slug/$brand/error")({
  loader: async ({ params }) => {
    const [{ data: service }, { data: brand }] = await Promise.all([
      supabase.from("service_types").select("id,slug,title,title_genitive").eq("slug", params.slug).eq("is_active", true).maybeSingle(),
      supabase.from("brands").select("id,slug,title").eq("slug", params.brand).eq("is_active", true).maybeSingle(),
    ]);
    if (!service || !brand) throw notFound();
    const { data: codes } = await supabase.from("error_codes").select("id,code,meaning,cause,solution").eq("service_type_id", service.id).eq("brand_id", brand.id).eq("is_active", true).order("sort_order");
    if (!codes?.length) throw notFound();
    return { service, brand, codes };
  },
  head: ({ loaderData, params }) => loaderData ? errorCodesHead(loaderData.service, loaderData.brand, `/appliance/${params.slug}/${params.brand}/error`) : {},
  component: () => <ErrorCodesDetail {...Route.useLoaderData()} />,
});