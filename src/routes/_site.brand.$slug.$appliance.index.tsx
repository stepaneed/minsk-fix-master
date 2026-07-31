import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { ComboPage } from "@/components/site/ComboPage";

const parentRoute = getRouteApi("/_site/brand/$slug/$appliance");

export const Route = createFileRoute("/_site/brand/$slug/$appliance/")({
  component: () => {
    const data = parentRoute.useLoaderData();
    return <ComboPage service={data.service} brand={data.brand} />;
  },
});