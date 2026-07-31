import { createFileRoute } from "@tanstack/react-router";
import { ComboPage } from "@/components/site/ComboPage";

export const Route = createFileRoute("/_site/appliance/$slug/$brand/")({
  component: () => {
    const data = Route.useRouteContext() as never;
    return <ComboPage {...data} />;
  },
});