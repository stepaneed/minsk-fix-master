import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Reveal } from "./Reveal";
import { Calculator, PackageOpen, Wrench } from "lucide-react";

const KIND_ICON: Record<string, any> = {
  buyout: Calculator,
  refurbished: PackageOpen,
  parts: Wrench,
};

export function ExtraServicesGrid() {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["extra_services"],
    queryFn: async () => {
      const { data } = await supabase
        .from("extra_services")
        .select("id,kind,slug,title,description,cover_url,icon_url")
        .eq("is_active", true)
        .order("sort_order");
      return data ?? [];
    },
  });

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <Reveal>
        <h2 className="text-3xl font-semibold tracking-tight">Услуги</h2>
        <p className="mt-2 text-muted-foreground">Выкуп, продажа восстановленной техники и запчастей</p>
      </Reveal>
      <div className="mt-8 grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border bg-card overflow-hidden">
                <Skeleton className="aspect-[16/10] w-full" />
                <div className="p-5"><Skeleton className="h-5 w-3/4" /></div>
              </div>
            ))
          : items.map((s: any, i: number) => {
              const Icon = KIND_ICON[s.kind] ?? Wrench;
              return (
                <Reveal key={s.id} delay={Math.min(i * 60, 240)} className="h-full">
                  <Link
                    to="/extra/$kind"
                    params={{ kind: s.kind }}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:-translate-y-1 hover:border-primary hover:shadow-lg"
                  >
                    {s.cover_url ? (
                      <div className="aspect-[16/10] w-full overflow-hidden bg-secondary">
                        <img src={s.cover_url} alt={s.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                    ) : (
                      <div className="aspect-[16/10] flex w-full items-center justify-center bg-secondary">
                        <Icon className="h-16 w-16 text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">{s.title}</h3>
                      </div>
                      {s.description && <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{s.description}</p>}
                    </div>
                  </Link>
                </Reveal>
              );
            })}
      </div>
    </section>
  );
}
