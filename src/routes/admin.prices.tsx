import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CrudPage } from "@/components/admin/CrudPage";

export const Route = createFileRoute("/admin/prices")({
  head: () => ({ meta: [{ title: "Цены — Админка" }, { name: "robots", content: "noindex" }] }),
  component: PricesPage,
});

function PricesPage() {
  const { data: types = [] } = useQuery({
    queryKey: ["admin", "service_types", "options"],
    queryFn: async () => {
      const { data } = await supabase.from("service_types").select("id, title").order("title");
      return data || [];
    },
  });

  const typeMap = Object.fromEntries(types.map((t: any) => [t.id, t.title]));

  return (
    <CrudPage
      config={{
        title: "Цены",
        table: "prices",
        orderBy: { column: "title" },
        showActiveToggle: true,
        fields: [
          { name: "title", label: "Название услуги", type: "text", required: true },
          {
            name: "service_type_id",
            label: "Вид техники",
            type: "select",
            options: types.map((t: any) => ({ value: t.id, label: t.title })),
          },
          { name: "price_from", label: "Цена от", type: "number" },
          { name: "price_to", label: "Цена до", type: "number" },
          { name: "is_active", label: "Активно", type: "boolean" },
        ],
        columns: [
          { key: "title", label: "Услуга", sortable: true },
          {
            key: "service_type_id",
            label: "Вид техники",
            render: (r) => typeMap[r.service_type_id] || "—",
          },
          {
            key: "price_from",
            label: "От",
            sortable: true,
            render: (r) => (r.price_from != null ? `${r.price_from} ₽` : "—"),
          },
          {
            key: "price_to",
            label: "До",
            sortable: true,
            render: (r) => (r.price_to != null ? `${r.price_to} ₽` : "—"),
          },
        ],
      }}
    />
  );
}
