import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/admin/CrudPage";

const fields = [
  { name: "title", label: "Заголовок", type: "text" as const, required: true },
  { name: "description", label: "Описание", type: "textarea" as const },
  { name: "benefit", label: "Выгода", type: "text" as const, placeholder: "напр. -20%" },
  { name: "conditions", label: "Условия", type: "textarea" as const },
  { name: "expires_at", label: "Действует до", type: "datetime" as const },
  { name: "sort_order", label: "Порядок", type: "number" as const },
  { name: "is_featured", label: "Избранное (показывать на главной)", type: "boolean" as const },
  { name: "is_active", label: "Активно", type: "boolean" as const },
];

const columns = [
  { key: "sort_order", label: "№", sortable: true },
  { key: "title", label: "Заголовок", sortable: true },
  { key: "benefit", label: "Выгода" },
  { key: "is_featured", label: "★", render: (r: any) => (r.is_featured ? "★" : "—") },
  {
    key: "expires_at",
    label: "До",
    sortable: true,
    render: (r: any) => (r.expires_at ? new Date(r.expires_at).toLocaleDateString("ru-RU") : "—"),
  },
];

export const Route = createFileRoute("/admin/discounts")({
  head: () => ({ meta: [{ title: "Скидки — Админка" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <CrudPage
      config={{
        title: "Скидки",
        table: "discounts",
        orderBy: { column: "sort_order", ascending: true },
        showActiveToggle: true,
        fields,
        columns,
      }}
    />
  ),
});
