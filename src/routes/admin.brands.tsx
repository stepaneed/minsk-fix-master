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
          { name: "logo_fit", label: "Кадрирование", type: "select", options: [
            { value: "contain", label: "Вписать (по умолчанию)" },
            { value: "cover", label: "Авто-кадрирование (заполнить)" },
          ] },
          { name: "logo_scale", label: "Масштаб логотипа", type: "scale", previewField: "logo_url" },
          { name: "sort_order", label: "Порядок", type: "number" },
          { name: "is_active", label: "Активно", type: "boolean" },
        ],
        columns: [
          {
            key: "logo_url",
            label: "Логотип",
            className: "w-20",
            render: (r) =>
              r.logo_url ? (
                <div className="flex h-10 w-16 items-center justify-center">
                  <img
                    src={r.logo_url}
                    alt=""
                    style={{ transform: `scale(${r.logo_scale ?? 1})` }}
                    className="max-h-10 max-w-full object-contain"
                  />
                </div>
              ) : (
                "—"
              ),
          },
          { key: "title", label: "Название", sortable: true },
          { key: "slug", label: "Slug" },
          {
            key: "logo_scale",
            label: "Масштаб",
            className: "w-20",
            render: (r) => `${Math.round((r.logo_scale ?? 1) * 100)}%`,
          },
          { key: "sort_order", label: "Порядок", sortable: true, className: "w-24" },
        ],
      }}
    />
  ),
});
