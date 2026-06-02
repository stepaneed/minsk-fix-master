import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Gift, Sparkles, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Reveal } from "./Reveal";

export function DiscountsBlock() {
  const { data, isLoading } = useQuery({
    queryKey: ["discounts_promotions_top"],
    queryFn: async () => {
      const [d, p] = await Promise.all([
        supabase.from("discounts").select("*").eq("is_active", true).order("sort_order").order("created_at", { ascending: false }),
        supabase.from("promotions").select("*").eq("is_active", true).order("sort_order").order("created_at", { ascending: false }),
      ]);
      return { discounts: d.data ?? [], promotions: p.data ?? [] };
    },
  });

  if (isLoading) {
    return (
      <section className="bg-secondary py-16">
        <div className="mx-auto max-w-6xl px-4">
          <Skeleton className="h-8 w-56" />
          <div className="mt-8 grid auto-rows-fr gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-background p-6">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="mt-3 h-5 w-3/4" />
                <Skeleton className="mt-3 h-8 w-32" />
                <Skeleton className="mt-3 h-4 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const merged = [
    ...(data?.discounts ?? []).map((x) => ({ ...x, kind: "discount" as const })),
    ...(data?.promotions ?? []).map((x) => ({ ...x, kind: "promotion" as const })),
  ].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  if (merged.length === 0) return null;

  const items = merged.slice(0, 5);

  return (
    <section className="bg-secondary py-16">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <h2 className="text-3xl font-semibold tracking-tight">Скидки и акции</h2>
        </Reveal>
        <div className="mt-8 grid auto-rows-fr gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <Reveal key={`${it.kind}-${it.id}`} delay={Math.min(i * 60, 300)} className="h-full">
              <div className="flex h-full flex-col rounded-2xl bg-background p-6 shadow-sm">
                <div className="flex items-center gap-2 text-primary">
                  {it.kind === "discount" ? <Gift className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                  <span className="text-xs font-medium uppercase tracking-wider">
                    {it.kind === "discount" ? "Скидка" : "Акция"}
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-semibold">{it.title}</h3>
                {it.benefit && <div className="mt-2 text-3xl font-bold text-primary">{it.benefit}</div>}
                {it.description && <p className="mt-2 text-sm text-muted-foreground">{it.description}</p>}
                {it.conditions && <p className="mt-auto pt-3 text-xs text-muted-foreground">{it.conditions}</p>}
              </div>
            </Reveal>
          ))}
          <Reveal delay={Math.min(items.length * 60, 300)} className="h-full">
            <Link
              to="/promotions"
              className="group flex h-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-primary/40 bg-background/50 p-6 text-center transition-all hover:border-primary hover:bg-background"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <ArrowRight className="h-6 w-6" />
              </div>
              <div>
                <div className="text-lg font-semibold">Все скидки и акции</div>
                <div className="mt-1 text-sm text-muted-foreground">Посмотреть полный список предложений</div>
              </div>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
