import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function BrandsMarquee() {
  const { data: brands = [] } = useQuery({
    queryKey: ["brands_active"],
    queryFn: async () => {
      const { data } = await supabase
        .from("brands")
        .select("id,slug,title,logo_url")
        .eq("is_active", true)
        .order("sort_order");
      return data ?? [];
    },
  });

  if (brands.length === 0) return null;
  const rows = [brands, [...brands].reverse(), brands];
  const durations = ["38s", "52s", "44s"];

  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-3xl font-semibold tracking-tight">Работаем со всеми брендами</h2>
        <p className="mt-2 text-muted-foreground">Bosch, Samsung, LG, Siemens, Атлант и другие</p>
      </div>
      <div className="relative mt-8 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        {rows.map((row, ri) => (
          <div
            key={ri}
            className="marquee-track py-3"
            style={{ ["--marquee-duration" as never]: durations[ri] }}
          >
            {[...row, ...row].map((b, i) => (
              <Link
                key={`${ri}-${b.id}-${i}`}
                to="/brand/$slug"
                params={{ slug: b.slug }}
                className="mx-3 flex h-16 min-w-[140px] items-center justify-center rounded-xl border bg-card px-6 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {b.logo_url ? <img src={b.logo_url} alt={b.title} className="max-h-10" /> : b.title}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
