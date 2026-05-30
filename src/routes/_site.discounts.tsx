import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Gift } from "lucide-react";
import { SecondCTA } from "@/components/site/SecondCTA";

export const Route = createFileRoute("/_site/discounts")({
  head: () => ({
    meta: [
      { title: "Скидки на ремонт техники — МастерФикс" },
      { name: "description", content: "Актуальные скидки на ремонт бытовой техники в Минске." },
      { property: "og:title", content: "Скидки — МастерФикс" },
      { property: "og:url", content: "/discounts" },
    ],
    links: [{ rel: "canonical", href: "/discounts" }],
  }),
  component: DiscountsPage,
});

function DiscountsPage() {
  const { data: items = [] } = useQuery({
    queryKey: ["discounts_all"],
    queryFn: async () => {
      const { data } = await supabase.from("discounts").select("*").eq("is_active", true).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-16">
        <nav className="text-xs text-muted-foreground mb-4">
          <a href="/" className="hover:text-foreground">Главная</a> · <span className="text-foreground">Скидки</span>
        </nav>
        <h1 className="text-4xl font-semibold tracking-tight">Скидки</h1>
        {items.length === 0 ? (
          <p className="mt-6 text-muted-foreground">Активных скидок пока нет. Загляните позже.</p>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((it) => (
              <div key={it.id} className="rounded-2xl border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-2 text-primary">
                  <Gift className="h-5 w-5" />
                  <span className="text-xs font-medium uppercase tracking-wider">Скидка</span>
                </div>
                <h3 className="mt-3 text-lg font-semibold">{it.title}</h3>
                {it.benefit && <div className="mt-2 text-3xl font-bold text-primary">{it.benefit}</div>}
                {it.description && <p className="mt-2 text-sm text-muted-foreground">{it.description}</p>}
                {it.conditions && <p className="mt-3 text-xs text-muted-foreground">{it.conditions}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
      <SecondCTA />
    </>
  );
}
