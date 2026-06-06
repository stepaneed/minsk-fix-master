import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Reveal } from "./Reveal";

export function ServicesGrid() {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["service_types_grid"],
    queryFn: async () => {
      const { data } = await supabase
        .from("service_types")
        .select("id,slug,title,description,cover_url")
        .eq("is_active", true)
        .order("sort_order");
      return data ?? [];
    },
  });

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <Reveal>
        <h2 className="text-3xl font-semibold tracking-tight">Виды техники</h2>
        <p className="mt-2 text-muted-foreground">Ремонтируем всю бытовую технику с гарантией</p>
      </Reveal>
      <div className="mt-8 grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border bg-card overflow-hidden">
                <Skeleton className="aspect-[16/10] w-full" />
                <div className="p-5"><Skeleton className="h-5 w-3/4" /><Skeleton className="mt-2 h-4 w-full" /></div>
              </div>
            ))
          : items.map((s: any, i: number) => (
              <Reveal key={s.id} delay={Math.min(i * 40, 240)} className="h-full">
                <Link
                  to="/appliance/$slug"
                  params={{ slug: s.slug }}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:-translate-y-1 hover:border-primary hover:shadow-lg"
                >
                  {s.cover_url ? (
                    <div className="aspect-[16/10] w-full overflow-hidden bg-secondary">
                      <img src={s.cover_url} alt={s.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                  ) : (
                    <div className="aspect-[16/10] w-full bg-secondary" />
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-semibold">{s.title}</h3>
                    {s.description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{s.description}</p>}
                  </div>
                </Link>
              </Reveal>
            ))}
      </div>
    </section>
  );
}

