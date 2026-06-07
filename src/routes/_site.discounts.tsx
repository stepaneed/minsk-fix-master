import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SecondCTA } from "@/components/site/SecondCTA";
import { Skeleton } from "@/components/ui/skeleton";
import { CardCover } from "@/components/site/CardCover";
import { usePromoOverlay } from "@/lib/usePromoOverlay";

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
  const overlay = usePromoOverlay();
  const { data: items = [], isLoading } = useQuery({
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
        {isLoading ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border bg-card p-6">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="mt-3 h-5 w-3/4" />
                <Skeleton className="mt-3 h-8 w-32" />
                <Skeleton className="mt-3 h-4 w-full" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="mt-6 text-muted-foreground">Активных скидок пока нет. Загляните позже.</p>
        ) : (
          <div className="mt-8 grid auto-rows-fr gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((it) => (
              <div key={it.id} className="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm">
                <CardCover
                  src={it.image_url}
                  alt={it.title}
                  toClass="to-card"
                  overlayOpacity={it.image_url ? overlay : 0}
                  badge={
                    it.benefit ? (
                      <span className="text-4xl font-bold leading-none text-primary drop-shadow-sm md:text-5xl">
                        {it.benefit}
                      </span>
                    ) : (
                      <span className="text-xs font-medium uppercase tracking-wider text-primary">Скидка</span>
                    )
                  }
                />
                <div className="relative z-10 -mt-6 flex flex-1 flex-col p-6">
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Скидка</div>
                  <h3 className="mt-2 text-lg font-semibold">{it.title}</h3>
                  {it.description && <p className="mt-2 text-sm text-muted-foreground">{it.description}</p>}
                  {it.conditions && <p className="mt-auto pt-3 text-xs text-muted-foreground">{it.conditions}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      <SecondCTA />
    </>
  );
}
