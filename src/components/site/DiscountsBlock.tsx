import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Gift, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Reveal } from "./Reveal";

export function DiscountsBlock() {
  const { data, isLoading } = useQuery({
    queryKey: ["discounts_promotions"],
    queryFn: async () => {
      const [d, p] = await Promise.all([
        supabase.from("discounts").select("*").eq("is_active", true),
        supabase.from("promotions").select("*").eq("is_active", true),
      ]);
      return { discounts: d.data ?? [], promotions: p.data ?? [] };
    },
  });

  if (isLoading) {
    return (
      <section className="bg-secondary py-16">
        <div className="mx-auto max-w-6xl px-4">
          <Skeleton className="h-8 w-56" />
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
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

  const items = [
    ...(data?.discounts ?? []).map((x) => ({ ...x, kind: "discount" as const })),
    ...(data?.promotions ?? []).map((x) => ({ ...x, kind: "promotion" as const })),
  ];
  if (items.length === 0) return null;

  return (
    <section className="bg-secondary py-16">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal><h2 className="text-3xl font-semibold tracking-tight">Скидки и акции</h2></Reveal>
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
        </div>
      </div>
    </section>
  );
}
