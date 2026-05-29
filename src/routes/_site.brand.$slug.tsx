import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_site/brand/$slug")({
  head: () => ({ meta: [{ title: "Бренд — МастерФикс" }] }),
  component: BrandRoute,
});

function BrandRoute() {
  const { slug } = Route.useParams();
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">Бренд: {slug}</h1>
      <p className="mt-3 text-muted-foreground">Страница бренда.</p>
    </section>
  );
}
