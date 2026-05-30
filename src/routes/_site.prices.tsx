import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SecondCTA } from "@/components/site/SecondCTA";

export const Route = createFileRoute("/_site/prices")({
  head: () => ({
    meta: [
      { title: "Цены на ремонт техники в Минске — МастерФикс" },
      { name: "description", content: "Прейскурант на ремонт бытовой техники по видам. Прозрачные цены без скрытых платежей." },
      { property: "og:title", content: "Цены — МастерФикс" },
      { property: "og:description", content: "Прейскурант на ремонт бытовой техники в Минске." },
      { property: "og:url", content: "/prices" },
    ],
    links: [{ rel: "canonical", href: "/prices" }],
  }),
  component: PricesPage,
});

function PricesPage() {
  const { data } = useQuery({
    queryKey: ["prices_grouped"],
    queryFn: async () => {
      const [types, prices] = await Promise.all([
        supabase.from("service_types").select("id,slug,title").eq("is_active", true).order("sort_order"),
        supabase.from("prices").select("*").eq("is_active", true),
      ]);
      return { types: types.data ?? [], prices: prices.data ?? [] };
    },
  });

  const types = data?.types ?? [];
  const prices = data?.prices ?? [];

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-16">
        <nav className="text-xs text-muted-foreground mb-4">
          <a href="/" className="hover:text-foreground">Главная</a> · <span className="text-foreground">Цены</span>
        </nav>
        <h1 className="text-4xl font-semibold tracking-tight">Прейскурант</h1>
        <p className="mt-3 text-muted-foreground">Окончательная цена зависит от сложности — её мастер озвучит после диагностики.</p>

        {types.length > 0 && (
          <Tabs defaultValue={types[0].id} className="mt-8">
            <TabsList className="flex flex-wrap h-auto">
              {types.map((t) => (
                <TabsTrigger key={t.id} value={t.id}>{t.title}</TabsTrigger>
              ))}
            </TabsList>
            {types.map((t) => {
              const rows = prices.filter((p) => p.service_type_id === t.id);
              return (
                <TabsContent key={t.id} value={t.id} className="mt-6">
                  <div className="overflow-hidden rounded-2xl border">
                    <table className="w-full text-sm">
                      <thead className="bg-secondary">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium">Услуга</th>
                          <th className="px-4 py-3 text-right font-medium">Цена, BYN</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.length === 0 ? (
                          <tr><td colSpan={2} className="px-4 py-6 text-center text-muted-foreground">Цены уточняйте по телефону</td></tr>
                        ) : rows.map((r) => (
                          <tr key={r.id} className="border-t">
                            <td className="px-4 py-3">{r.title}</td>
                            <td className="px-4 py-3 text-right font-medium">
                              {r.price_from}{r.price_to ? ` – ${r.price_to}` : ""}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </section>
      <SecondCTA title="Не нашли свою технику?" subtitle="Опишите проблему — рассчитаем стоимость" />
    </>
  );
}
