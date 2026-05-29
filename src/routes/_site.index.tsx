import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_site/")({
  head: () => ({
    meta: [
      { title: "МастерФикс — Ремонт бытовой техники в Минске" },
      { name: "description", content: "Профессиональный ремонт бытовой техники с выездом на дом в Минске. Диагностика, гарантия, прозрачные цены." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-foreground md:text-6xl">
        Ремонт бытовой техники в Минске
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Вызовите мастера — приедем в течение часа. Диагностика бесплатно при ремонте.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          to="/services"
          className="inline-flex h-11 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          Выбрать услугу
        </Link>
        <Link
          to="/contacts"
          className="inline-flex h-11 items-center rounded-md border border-input bg-background px-6 text-sm font-medium text-foreground transition hover:bg-secondary"
        >
          Связаться
        </Link>
      </div>
    </section>
  );
}
