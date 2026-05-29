import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_site/contacts")({
  head: () => ({ meta: [{ title: "Контакты — МастерФикс" }] }),
  component: () => (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">Контакты</h1>
      <p className="mt-3 text-muted-foreground">Контактные данные появятся здесь.</p>
    </section>
  ),
});
