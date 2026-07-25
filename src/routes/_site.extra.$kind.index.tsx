import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BuyoutCalculator } from "@/components/site/BuyoutCalculator";
import { ProductFilter, filterProducts, type Product } from "@/components/site/ProductFilter";
import { OrderForm } from "@/components/site/OrderForm";
import { Badge } from "@/components/ui/badge";

const ALLOWED = ["buyout", "refurbished", "parts"] as const;

export const Route = createFileRoute("/_site/extra/$kind/")({
  params: {
    parse: (raw: Record<string, string>) => {
      if (!ALLOWED.includes(raw.kind as (typeof ALLOWED)[number])) throw notFound();
      return { kind: raw.kind as (typeof ALLOWED)[number] };
    },
    stringify: (p: { kind: string }) => ({ kind: p.kind }),
  },
  head: ({ params }) => {
    const titles: Record<string, string> = {
      buyout: "Выкуп бытовой техники",
      refurbished: "Продажа восстановленной техники",
      parts: "Продажа запчастей",
    };
    const t = `${titles[params.kind]} — МастерФикс`;
    return {
      meta: [
        { title: t },
        { name: "description", content: titles[params.kind] + " в Минске." },
        { property: "og:title", content: t },
      ],
      links: [{ rel: "canonical", href: `/extra/${params.kind}` }],
    };
  },
  component: ExtraServicePage,
  errorComponent: () => <div className="mx-auto max-w-6xl p-8">Не удалось загрузить страницу. Попробуйте позже.</div>,
  notFoundComponent: () => <div className="mx-auto max-w-6xl p-8">Услуга не найдена.</div>,
});

function ExtraServicePage() {
  const { kind } = Route.useParams();
  const { data: service } = useQuery({
    queryKey: ["extra_service", kind],
    queryFn: async () => {
      const { data } = await supabase
        .from("extra_services")
        .select("*")
        .eq("kind", kind)
        .maybeSingle();
      return data;
    },
  });

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pt-10">
        <nav className="text-xs text-muted-foreground">
          <Link to="/">Главная</Link> · <Link to="/services">Услуги</Link> · <span className="text-foreground">{service?.title ?? "..."}</span>
        </nav>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">{service?.title ?? "..."}</h1>
        {service?.description && <p className="mt-3 max-w-3xl text-muted-foreground">{service.description}</p>}
      </section>

      {kind === "buyout" && service && (
        <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-2">
          <BuyoutCalculator settings={service.settings} />
          <OrderForm compact />
        </section>
      )}

      {kind !== "buyout" && service && <ProductsCatalog serviceId={service.id} kind={kind} />}
    </>
  );
}

function ProductsCatalog({ serviceId, kind }: { serviceId: string; kind: string }) {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", serviceId],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*, product_images(url,role,sort_order)")
        .eq("service_id", serviceId)
        .eq("is_active", true)
        .order("sort_order");
      return (data ?? []) as Product[];
    },
  });
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const filtered = useMemo(() => filterProducts(products, selected), [products, selected]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <ProductFilter products={products} selected={selected} onChange={setSelected} />
        <div>
          <div className="mb-4 text-sm text-muted-foreground">Найдено: {filtered.length}</div>
          {isLoading ? (
            <div className="text-muted-foreground">Загрузка...</div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">Товары не найдены</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => {
                const imgs = (p.product_images ?? []).slice().sort((a, b) => a.sort_order - b.sort_order);
                const main = imgs.find((i) => i.role === "main") ?? imgs[0];
                const hasDiscount = p.old_price && p.price && p.old_price > p.price;
                return (
                  <Link
                    key={p.id}
                    to="/extra/$kind/$product"
                    params={{ kind, product: p.slug }}
                    className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:-translate-y-1 hover:border-primary hover:shadow-lg"
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-secondary">
                      {main ? (
                        <img src={main.url} alt={p.title} className="h-full w-full object-contain transition-transform group-hover:scale-105" />
                      ) : null}
                      {hasDiscount && <Badge className="absolute top-2 left-2 bg-destructive">-{Math.round((1 - (p.price! / p.old_price!)) * 100)}%</Badge>}
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="font-medium line-clamp-2">{p.title}</h3>
                      <div className="mt-auto pt-3">
                        {p.price != null && (
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-semibold">{p.price} BYN</span>
                            {hasDiscount && <span className="text-sm text-muted-foreground line-through">{p.old_price} BYN</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
