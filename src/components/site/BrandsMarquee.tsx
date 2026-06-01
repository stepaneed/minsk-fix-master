import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const ROWS = 5;
const DURATIONS = ["60s", "70s", "55s", "65s", "75s"];

export function BrandsMarquee({ applianceSlug }: { applianceSlug?: string } = {}) {
  const { data: brands = [], isLoading } = useQuery({
    queryKey: ["brands_active"],
    queryFn: async () => {
      const { data } = await supabase
        .from("brands")
        .select("id,slug,title,logo_url,logo_scale,logo_fit")
        .eq("is_active", true)
        .order("sort_order");
      return data ?? [];
    },
  });

  if (isLoading) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-16">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-2 h-4 w-80" />
        <div className="mt-8 space-y-3">
          {Array.from({ length: ROWS }).map((_, r) => (
            <div key={r} className="flex gap-3 overflow-hidden">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-[140px] shrink-0 rounded-xl" />
              ))}
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (brands.length === 0) return null;

  const rows: typeof brands[] = Array.from({ length: ROWS }, () => []);
  brands.forEach((b, i) => rows[i % ROWS].push(b));

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight">Работаем со всеми брендами</h2>
        <p className="mt-2 text-muted-foreground">Bosch, Samsung, LG, Siemens, Атлант и другие</p>
      </div>
      <div className="marquee-mask relative mt-8 space-y-3 overflow-hidden rounded-2xl">
        {rows.map((row, ri) => (
          <div
            key={ri}
            className={`marquee-track ${ri % 2 === 1 ? "marquee-reverse" : ""}`}
            style={{ ["--marquee-duration" as never]: DURATIONS[ri] }}
          >
            {[...row, ...row].map((b, i) => {
              const scale = (b as any).logo_scale ?? 1;
              const fit = (b as any).logo_fit ?? "contain";
              const linkProps = applianceSlug
                ? { to: "/appliance/$slug/$brand" as const, params: { slug: applianceSlug, brand: b.slug } }
                : { to: "/brand/$slug" as const, params: { slug: b.slug } };
              return (
                <Link
                  key={`${ri}-${b.id}-${i}`}
                  {...linkProps}
                  className="mx-2 flex h-16 w-[140px] shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
                  title={b.title}
                >
                  {b.logo_url ? (
                    <img
                      src={b.logo_url}
                      alt={b.title}
                      loading="lazy"
                      style={{ transform: `scale(${scale})`, objectFit: fit as never }}
                      className="max-h-9 max-w-[110px]"
                      onError={(e) => {
                        const img = e.currentTarget;
                        img.style.display = "none";
                        img.parentElement!.textContent = b.title;
                      }}
                    />
                  ) : (
                    b.title
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
