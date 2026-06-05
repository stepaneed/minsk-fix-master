import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { OrderForm } from "@/components/site/OrderForm";
import { WorkAlgorithm } from "@/components/site/WorkAlgorithm";
import { BrandsMarquee } from "@/components/site/BrandsMarquee";
import { ContactsBlock } from "@/components/site/ContactsBlock";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_site/appliance/$slug/")({
  loader: async ({ params }) => {
    const { data } = await supabase
      .from("service_types")
      .select("id,slug,title,title_genitive,description,icon_url")
      .eq("slug", params.slug)
      .eq("is_active", true)
      .maybeSingle();
    if (!data) throw notFound();
    return { service: data };
  },
  head: ({ loaderData, params }) => {
    const genitive = loaderData?.service.title_genitive || loaderData?.service.title?.toLowerCase();
    const title = `Ремонт ${genitive} в Минске — МастерФикс`;
    const desc = loaderData?.service.description ?? `Ремонт ${genitive} на дому с гарантией`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `/appliance/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/appliance/${params.slug}` }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: loaderData?.service.title,
          description: desc,
          areaServed: "Минск",
          provider: { "@type": "LocalBusiness", name: "МастерФикс" },
        }),
      }],
    };
  },
  component: AppliancePage,
});

const breakdowns: Record<string, string[]> = {
  "washing-machines": ["Не сливает воду", "Не отжимает", "Шумит при отжиме", "Не греет воду", "Течь снизу"],
  "refrigerators": ["Не морозит", "Намерзает лёд", "Течь воды", "Постоянно работает", "Не запускается"],
  "dishwashers": ["Не сливает воду", "Не моет посуду", "Не нагревает воду", "Постоянно гудит"],
};

function AppliancePage() {
  const { service } = Route.useLoaderData();
  const { slug } = Route.useParams();
  const issues = breakdowns[slug] ?? ["Не включается", "Странный шум", "Не выполняет программу", "Электронные ошибки"];
  const genitive = service.title_genitive || service.title.toLowerCase();
  const h1 = `Ремонт ${genitive}`;

  return (
    <>
      <nav className="mx-auto max-w-6xl px-4 pt-6 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Главная</Link> ·{" "}
        <Link to="/services" className="hover:text-foreground">Услуги</Link> ·{" "}
        <span className="text-foreground">{service.title}</span>
      </nav>
      <section className="bg-gradient-to-b from-secondary to-background">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-2 lg:py-16">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{h1}</h1>
            <p className="mt-4 text-lg text-muted-foreground">{service.description ?? "Выезд мастера в течение часа. Диагностика бесплатно при ремонте."}</p>
            <h2 className="mt-8 text-xl font-semibold">Популярные неисправности</h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {issues.map((i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> {i}
                </li>
              ))}
            </ul>
          </div>
          <OrderForm defaultTypeId={service.id} />
        </div>
      </section>

      <WorkAlgorithm />
      <BrandsMarquee applianceSlug={slug} />
      <ContactsBlock />
    </>
  );
}
