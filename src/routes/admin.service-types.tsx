import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/admin/CrudPage";

export const Route = createFileRoute("/admin/service-types")({
  head: () => ({ meta: [{ title: "Виды техники — Админка" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <CrudPage
      config={{
        title: "Виды техники",
        table: "service_types",
        orderBy: { column: "sort_order" },
        showSortHandle: true,
        showActiveToggle: true,
        fields: [
          { name: "title", label: "Название", type: "text", required: true },
          { name: "title_genitive", label: "Название (родительный падеж)", type: "text", placeholder: "напр. стиральных машин" },
          { name: "slug", label: "Slug (URL)", type: "slug", required: true },
          { name: "description", label: "Описание", type: "textarea" },
          { name: "icon_url", label: "Иконка", type: "image" },
          { name: "cover_url", label: "Фоновое фото", type: "image" },
          { name: "sort_order", label: "Порядок", type: "number" },
          { name: "is_active", label: "Активно", type: "boolean" },
        ],
        columns: [
          {
            key: "icon_url",
            label: "Иконка",
            className: "w-16",
            render: (r) =>
              r.icon_url ? (
                <img src={r.icon_url} alt="" className="h-10 w-10 object-cover rounded" />
              ) : (
                "—"
              ),
          },
          { key: "title", label: "Название", sortable: true },
          { key: "slug", label: "Slug" },
          { key: "sort_order", label: "Порядок", sortable: true, className: "w-24" },
        ],
      }}
    />
  ),
});
