import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/$")({
  head: () => ({ meta: [{ title: "Админка — МастерФикс" }] }),
  component: AdminRoute,
});

function AdminRoute() {
  const { _splat } = Route.useParams();
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Админка</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Раздел: <code className="rounded bg-secondary px-1.5 py-0.5">{_splat || "/"}</code>
      </p>
      <p className="mt-6 text-muted-foreground">Здесь будет панель управления контентом и заказами.</p>
    </div>
  );
}
