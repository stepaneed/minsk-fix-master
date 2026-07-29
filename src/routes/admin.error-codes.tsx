import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CrudPage } from "@/components/admin/CrudPage";

export const Route = createFileRoute("/admin/error-codes")({
  head: () => ({ meta: [{ title: "Коды ошибок — Админка" }, { name: "robots", content: "noindex" }] }),
  component: ErrorCodesAdmin,
});

function ErrorCodesAdmin() {
  const { data: types = [] } = useQuery({
    queryKey: ["admin", "service_types", "options"],
    queryFn: async () => {
      const { data } = await supabase.from("service_types").select("id, title").order("title");
      return data || [];
    },
  });
  const { data: brands = [] } = useQuery({
    queryKey: ["admin", "brands", "options"],
    queryFn: async () => {
      const { data } = await supabase.from("brands").select("id, title").order("title");
      return data || [];
    },
  });

  const typeMap = Object.fromEntries(types.map((t: any) => [t.id, t.title]));
  const brandMap = Object.fromEntries(brands.map((b: any) => [b.id, b.title]));

  return (
    <CrudPage
      config={{
        title: "Коды ошибок",
        table: "error_codes",
        orderBy: { column: "code" },
        showActiveToggle: true,
        pageSize: 30,
        filters: [
          {
            key: "service_type_id",
            label: "Вид техники",
            options: types.map((t: any) => ({ value: t.id, label: t.title })),
          },
          {
            key: "brand_id",
            label: "Бренд",
            options: brands.map((b: any) => ({ value: b.id, label: b.title })),
          },
        ],
        fields: [
          {
            name: "service_type_id",
            label: "Вид техники",
            type: "select",
            required: true,
            options: types.map((t: any) => ({ value: t.id, label: t.title })),
          },
          {
            name: "brand_id",
            label: "Бренд",
            type: "select",
            options: brands.map((b: any) => ({ value: b.id, label: b.title })),
          },
          { name: "code", label: "Код ошибки", type: "text", required: true },
          { name: "meaning", label: "Что означает", type: "text", required: true },
          { name: "cause", label: "Вероятная причина", type: "textarea" },
          { name: "solution", label: "Что делать", type: "textarea" },
          { name: "sort_order", label: "Порядок", type: "number" },
          { name: "is_active", label: "Активно", type: "boolean" },
        ],
        columns: [
          { key: "code", label: "Код", className: "w-28 font-medium" },
          {
            key: "service_type_id",
            label: "Вид техники",
            value: (r: any) => typeMap[r.service_type_id] ?? "",
            render: (r: any) => typeMap[r.service_type_id] || "—",
          },
          {
            key: "brand_id",
            label: "Бренд",
            value: (r: any) => brandMap[r.brand_id] ?? "",
            render: (r: any) => brandMap[r.brand_id] || "Все бренды",
          },
          {
            key: "meaning",
            label: "Значение",
            render: (r: any) => <span className="line-clamp-2 block max-w-md">{r.meaning}</span>,
          },
          {
            key: "solution",
            label: "Что делать",
            render: (r: any) => (
              <span className="line-clamp-2 block max-w-sm text-muted-foreground">{r.solution || "—"}</span>
            ),
          },
          { key: "sort_order", label: "Порядок", className: "w-20" },
        ],
      }}
    />
  );
}
