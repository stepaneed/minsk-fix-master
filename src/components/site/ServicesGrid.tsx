import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Wrench,
  Refrigerator,
  WashingMachine,
  Microwave,
  AirVent,
  Tv,
  Coffee,
  Utensils,
  Flame,
  Droplets,
  Wind,
  Cpu,
  Cog,
  Zap,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Reveal } from "./Reveal";

function iconForSlug(slug: string) {
  const s = (slug || "").toLowerCase();
  if (s.includes("fridge") || s.includes("refrig") || s.includes("холод")) return Refrigerator;
  if (s.includes("wash") || s.includes("стираль")) return WashingMachine;
  if (s.includes("dish") || s.includes("посуд")) return Utensils;
  if (s.includes("microwave") || s.includes("микровол") || s.includes("свч")) return Microwave;
  if (s.includes("oven") || s.includes("дух") || s.includes("плит") || s.includes("stove")) return Flame;
  if (s.includes("hood") || s.includes("вытяж")) return Wind;
  if (s.includes("cond") || s.includes("кондиц") || s.includes("ac") || s.includes("split")) return AirVent;
  if (s.includes("tv") || s.includes("телевиз")) return Tv;
  if (s.includes("coffee") || s.includes("кофе")) return Coffee;
  if (s.includes("boiler") || s.includes("water") || s.includes("бойлер") || s.includes("водонаг")) return Droplets;
  if (s.includes("dryer") || s.includes("сушил")) return Wind;
  if (s.includes("computer") || s.includes("комп") || s.includes("ноутб") || s.includes("laptop")) return Cpu;
  if (s.includes("electric") || s.includes("электр")) return Zap;
  if (s.includes("small") || s.includes("мелкая")) return Cog;
  return Wrench;
}

export function ServicesGrid() {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["service_types_grid"],
    queryFn: async () => {
      const { data } = await supabase
        .from("service_types")
        .select("id,slug,title,description,icon_url")
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
      <div className="mt-8 grid auto-rows-fr grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl border bg-card p-6">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <Skeleton className="mt-4 h-5 w-3/4" />
                <Skeleton className="mt-2 h-4 w-full" />
              </div>
            ))
          : items.map((s, i) => {
              const Icon = iconForSlug(s.slug);
              return (
                <Reveal key={s.id} delay={Math.min(i * 40, 240)} className="h-full">
                  <Link
                    to="/appliance/$slug"
                    params={{ slug: s.slug }}
                    className="group flex h-full flex-col rounded-2xl border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary hover:shadow-lg"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      {s.icon_url ? (
                        <img src={s.icon_url} alt="" loading="lazy" className="h-7 w-7" />
                      ) : (
                        <Icon className="h-6 w-6" />
                      )}
                    </div>
                    <h3 className="mt-4 font-semibold">{s.title}</h3>
                    {s.description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{s.description}</p>}
                  </Link>
                </Reveal>
              );
            })}
      </div>
    </section>
  );
}
