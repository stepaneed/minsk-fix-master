import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_site/appliance/$slug")({
  head: () => ({ meta: [{ title: "Тип техники — МастерФикс" }] }),
  component: ApplianceRoute,
});

function ApplianceRoute() {
  const { slug } = Route.useParams();
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">Техника: {slug}</h1>
      <p className="mt-3 text-muted-foreground">Страница типа техники.</p>
    </section>
  );
}
