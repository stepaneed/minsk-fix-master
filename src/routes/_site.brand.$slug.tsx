import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OrderForm } from "@/components/site/OrderForm";
import { ContactsBlock } from "@/components/site/ContactsBlock";
import { Wrench } from "lucide-react";

export const Route = createFileRoute("/_site/brand/$slug")({
  loader: async ({ params }) => {
    const { data } = await supabase
      .from("brands")
      .select("id,slug,title,logo_url,logo_scale,logo_fit")
      .eq("slug", params.slug)
      .eq("is_active", true)
      .maybeSingle();
    if (!data) throw notFound();
    return { brand: data };
  },
  head: ({ loaderData, params }) => {
    const title = `Ремонт техники ${loaderData?.brand.title} в Минске — МастерФикс`;
    const desc = `Ремонт техники ${loaderData?.brand.title} на дому. Оригинальные запчасти и гарантия.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `/brand/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/brand/${params.slug}` }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: `Ремонт техники ${loaderData?.brand.title}`,
          description: desc,
          areaServed: "Минск",
          provider: { "@type": "LocalBusiness", name: "МастерФикс" },
        }),
      }],
    };
  },
  component: BrandPage,
});

function BrandPage() {
  const { brand } = Route.useLoaderData();
  const { data: types = [] } = useQuery({
    queryKey: ["service_types_for_brand"],
    queryFn: async () => {
      const { data } = await supabase.from("service_types").select("id,slug,title,description").eq("is_active", true).order("sort_order");
      return data ?? [];
    },
  });

  return (
    <>
      <nav className="mx-auto max-w-6xl px-4 pt-6 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Главная</Link> ·{" "}
        <span className="text-foreground">{brand.title}</span>
      </nav>
      <section className="bg-gradient-to-b from-secondary to-background">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-2 lg:py-16">
          <div>
            {brand.logo_url && (
              <div className="mb-6 flex h-24 w-44 items-center justify-center overflow-hidden rounded-2xl border bg-card p-4">
                <img
                  src={brand.logo_url}
                  alt={brand.title}
                  style={{ transform: `scale(${(brand as any).logo_scale ?? 1})`, objectFit: ((brand as any).logo_fit ?? "contain") as never }}
                  className="max-h-16 max-w-full"
                />
              </div>
            )}
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Ремонт техники {brand.title}</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Сертифицированные мастера, опыт с {brand.title} 10+ лет. Оригинальные запчасти, гарантия до 12 месяцев.
            </p>
          </div>
          <OrderForm />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-semibold tracking-tight">Что ремонтируем</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {types.map((s) => (
            <Link key={s.id} to="/brand/$slug/$appliance" params={{ slug: brand.slug, appliance: s.slug }} className="group rounded-2xl border bg-card p-6 hover:-translate-y-1 hover:border-primary hover:shadow-lg transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Wrench className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
            </Link>
          ))}
        </div>
      </section>

      <ContactsBlock />
    </>
  );
}
