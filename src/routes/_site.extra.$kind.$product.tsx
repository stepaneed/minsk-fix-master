import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductGallery } from "@/components/site/ProductGallery";
import { OrderForm } from "@/components/site/OrderForm";
import { Badge } from "@/components/ui/badge";

const ALLOWED = ["refurbished", "parts"] as const;

export const Route = createFileRoute("/_site/extra/$kind/$product")({
  params: {
    parse: (raw) => {
      if (!ALLOWED.includes(raw.kind as any)) throw notFound();
      return { kind: raw.kind as (typeof ALLOWED)[number], product: raw.product };
    },
    stringify: (p) => p,
  },
  head: ({ params }) => ({
    meta: [{ title: `${params.product} — МастерФикс` }],
    links: [{ rel: "canonical", href: `/extra/${params.kind}/${params.product}` }],
  }),
  component: ProductPage,
  errorComponent: ({ error }) => <div className="mx-auto max-w-6xl p-8">Ошибка: {error.message}</div>,
  notFoundComponent: () => <div className="mx-auto max-w-6xl p-8">Товар не найден.</div>,
});

function ProductPage() {
  const { kind, product: slug } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["product", kind, slug],
    queryFn: async () => {
      const { data: svc } = await supabase.from("extra_services").select("id,title").eq("kind", kind).maybeSingle();
      if (!svc) return null;
      const { data: p } = await supabase
        .from("products")
        .select("*, product_images(id,url,role,sort_order)")
        .eq("service_id", svc.id)
        .eq("slug", slug)
        .maybeSingle();
      return p ? { product: p, service: svc } : null;
    },
  });

  if (isLoading) return <div className="mx-auto max-w-6xl p-8 text-muted-foreground">Загрузка...</div>;
  if (!data) return <div className="mx-auto max-w-6xl p-8">Товар не найден.</div>;

  const { product, service } = data;
  const hasDiscount = product.old_price && product.price && product.old_price > product.price;
  const attrs = Object.entries((product.attributes ?? {}) as Record<string, unknown>);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <nav className="text-xs text-muted-foreground">
        <Link to="/">Главная</Link> · <Link to="/services">Услуги</Link> ·{" "}
        <Link to="/extra/$kind" params={{ kind }}>{service.title}</Link> · <span className="text-foreground">{product.title}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <ProductGallery images={(product.product_images ?? []) as any} title={product.title} />
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{product.title}</h1>
          {product.price != null && (
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-semibold">{product.price} BYN</span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-muted-foreground line-through">{product.old_price} BYN</span>
                  <Badge className="bg-destructive">-{Math.round((1 - (product.price! / product.old_price!)) * 100)}%</Badge>
                </>
              )}
            </div>
          )}
          {product.description && <p className="mt-5 text-muted-foreground">{product.description}</p>}

          {attrs.length > 0 && (
            <div className="mt-6 rounded-xl border bg-card p-4">
              <h3 className="mb-3 font-semibold">Характеристики</h3>
              <dl className="grid gap-1 text-sm">
                {attrs.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-border/40 py-1.5 last:border-0">
                    <dt className="capitalize text-muted-foreground">{k}</dt>
                    <dd className="text-right">{String(v)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="mt-8">
            <OrderForm compact />
          </div>
        </div>
      </div>
    </section>
  );
}
