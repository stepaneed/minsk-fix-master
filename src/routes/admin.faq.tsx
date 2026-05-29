import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/admin/CrudPage";

export const Route = createFileRoute("/admin/faq")({
  head: () => ({ meta: [{ title: "FAQ — Админка" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <CrudPage
      config={{
        title: "FAQ",
        table: "faq",
        orderBy: { column: "sort_order" },
        showSortHandle: true,
        showActiveToggle: true,
        fields: [
          { name: "question", label: "Вопрос", type: "text", required: true },
          { name: "answer", label: "Ответ", type: "textarea", required: true },
          { name: "category", label: "Категория", type: "text" },
          { name: "sort_order", label: "Порядок", type: "number" },
          { name: "is_active", label: "Активно", type: "boolean" },
        ],
        columns: [
          {
            key: "question",
            label: "Вопрос",
            sortable: true,
            render: (r) => <span className="line-clamp-2 max-w-md block">{r.question}</span>,
          },
          { key: "category", label: "Категория", render: (r) => r.category || "—" },
          { key: "sort_order", label: "Порядок", sortable: true, className: "w-24" },
        ],
      }}
    />
  ),
});
