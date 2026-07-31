import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { ComboPage } from "@/components/site/ComboPage";

const parentRoute = getRouteApi("/_site/appliance/$slug/$brand");

export const Route = createFileRoute("/_site/appliance/$slug/$brand/")({
  component: () => {
    const data = parentRoute.useLoaderData();
    return <ComboPage service={data.service} brand={data.brand} />;
  },
});