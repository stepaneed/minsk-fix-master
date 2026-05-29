import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_site/prices")({
  head: () => ({ meta: [{ title: "Цены — МастерФикс" }] }),
  component: () => (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">Цены</h1>
      <p className="mt-3 text-muted-foreground">Таблица цен появится здесь.</p>
    </section>
  ),
});
