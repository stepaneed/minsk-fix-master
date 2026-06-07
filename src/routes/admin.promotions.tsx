import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/admin/CrudPage";

export const Route = createFileRoute("/admin/promotions")({
  head: () => ({ meta: [{ title: "Акции — Админка" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <CrudPage
      config={{
        title: "Акции",
        table: "promotions",
        orderBy: { column: "sort_order", ascending: true },
        showActiveToggle: true,
        fields: [
          { name: "title", label: "Заголовок", type: "text", required: true },
          { name: "description", label: "Описание", type: "textarea" },
          { name: "benefit", label: "Выгода", type: "text" },
          { name: "conditions", label: "Условия", type: "textarea" },
          { name: "expires_at", label: "Действует до", type: "datetime" },
          { name: "image_url", label: "Фоновое изображение", type: "image" },
          { name: "sort_order", label: "Порядок", type: "number" },
          { name: "is_featured", label: "Избранное (показывать на главной)", type: "boolean" },
          { name: "is_active", label: "Активно", type: "boolean" },
        ],
        columns: [
          { key: "sort_order", label: "№", sortable: true },
          { key: "title", label: "Заголовок", sortable: true },
          { key: "benefit", label: "Выгода" },
          { key: "is_featured", label: "★", render: (r: any) => (r.is_featured ? "★" : "—") },
          {
            key: "expires_at",
            label: "До",
            sortable: true,
            render: (r: any) =>
              r.expires_at ? new Date(r.expires_at).toLocaleDateString("ru-RU") : "—",
          },
        ],
      }}
    />
  ),
});
