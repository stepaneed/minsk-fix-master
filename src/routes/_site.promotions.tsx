import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_site/promotions")({
  head: () => ({ meta: [{ title: "Акции — МастерФикс" }] }),
  component: () => (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">Акции</h1>
      <p className="mt-3 text-muted-foreground">Активные акции появятся здесь.</p>
    </section>
  ),
});
