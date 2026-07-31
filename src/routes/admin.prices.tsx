import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CrudPage } from "@/components/admin/CrudPage";
import { PriceValue } from "@/components/ui/currency-icon";

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
        filters: [
          {
            key: "service_type_id",
            label: "Вид техники",
            options: types.map((t: any) => ({ value: t.id, label: t.title })),
          },
          {
            key: "kind",
            label: "Класс работ",
            options: [
              { value: "service", label: "Услуга*" },
              { value: "repair", label: "Ремонтные работы" },
            ],
          },
        ],
        showActiveToggle: true,
        fields: [
          { name: "title", label: "Название услуги", type: "text", required: true },
          {
            name: "service_type_id",
            label: "Вид техники",
            type: "select",
            options: types.map((t: any) => ({ value: t.id, label: t.title })),
          },
          {
            name: "kind",
            label: "Класс работ",
            type: "select",
            required: true,
            options: [
              { value: "service", label: "Услуга*" },
              { value: "repair", label: "Ремонтные работы" },
            ],
          },
          { name: "description", label: "Описание", type: "textarea" },
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
            render: (r) => (r.price_from != null ? <PriceValue>{r.price_from}</PriceValue> : "—"),
          },
          {
            key: "price_to",
            label: "До",
            sortable: true,
            render: (r) => (r.price_to != null ? <PriceValue>{r.price_to}</PriceValue> : "—"),
          },
        ],
      }}
    />
  );
}
