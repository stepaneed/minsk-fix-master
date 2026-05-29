import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/admin/CrudPage";

export const Route = createFileRoute("/admin/articles")({
  head: () => ({ meta: [{ title: "Статьи — Админка" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <CrudPage
      config={{
        title: "Статьи",
        table: "articles",
        orderBy: { column: "published_at", ascending: false },
        showActiveToggle: true,
        fields: [
          { name: "title", label: "Заголовок", type: "text", required: true },
          { name: "slug", label: "Slug", type: "slug", required: true },
          { name: "excerpt", label: "Краткое описание", type: "textarea" },
          { name: "body", label: "Текст", type: "textarea" },
          { name: "image_url", label: "Картинка", type: "image" },
          { name: "published_at", label: "Дата публикации", type: "datetime" },
          { name: "is_active", label: "Активно", type: "boolean" },
        ],
        columns: [
          {
            key: "image_url",
            label: "",
            className: "w-16",
            render: (r) =>
              r.image_url ? (
                <img src={r.image_url} alt="" className="h-10 w-16 object-cover rounded" />
              ) : (
                "—"
              ),
          },
          { key: "title", label: "Заголовок", sortable: true },
          { key: "slug", label: "Slug" },
          {
            key: "published_at",
            label: "Опубликовано",
            sortable: true,
            render: (r) => (r.published_at ? new Date(r.published_at).toLocaleDateString("ru-RU") : "—"),
          },
        ],
      }}
    />
  ),
});
