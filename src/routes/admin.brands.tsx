import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/admin/CrudPage";

export const Route = createFileRoute("/admin/brands")({
  head: () => ({ meta: [{ title: "Бренды — Админка" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <CrudPage
      config={{
        title: "Бренды",
        table: "brands",
        orderBy: { column: "sort_order" },
        showSortHandle: true,
        showActiveToggle: true,
        fields: [
          { name: "title", label: "Название", type: "text", required: true },
          { name: "slug", label: "Slug", type: "slug", required: true },
          { name: "logo_url", label: "Логотип", type: "image" },
          { name: "sort_order", label: "Порядок", type: "number" },
          { name: "is_active", label: "Активно", type: "boolean" },
        ],
        columns: [
          {
            key: "logo_url",
            label: "Логотип",
            className: "w-16",
            render: (r) =>
              r.logo_url ? (
                <img src={r.logo_url} alt="" className="h-10 w-10 object-contain" />
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
