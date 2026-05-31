import { Link } from "@tanstack/react-router";
import { OrderForm } from "@/components/site/OrderForm";
import { WorkAlgorithm } from "@/components/site/WorkAlgorithm";
import { ContactsBlock } from "@/components/site/ContactsBlock";
import { CheckCircle2 } from "lucide-react";

export type ComboData = {
  service: { id: string; slug: string; title: string; description: string | null };
  brand: { id: string; slug: string; title: string; logo_url: string | null; logo_scale?: number | null };
};

const breakdowns: Record<string, string[]> = {
  "washing-machines": ["Не сливает воду", "Не отжимает", "Шумит при отжиме", "Не греет воду", "Течь снизу"],
  "refrigerators": ["Не морозит", "Намерзает лёд", "Течь воды", "Постоянно работает", "Не запускается"],
  "dishwashers": ["Не сливает воду", "Не моет посуду", "Не нагревает воду", "Постоянно гудит"],
};

export function ComboPage({ service, brand }: ComboData) {
  const issues = breakdowns[service.slug] ?? ["Не включается", "Странный шум", "Не выполняет программу", "Электронные ошибки"];

  return (
    <>
      <nav className="mx-auto max-w-6xl px-4 pt-6 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Главная</Link> ·{" "}
        <Link to="/brand/$slug" params={{ slug: brand.slug }} className="hover:text-foreground">{brand.title}</Link> ·{" "}
        <span className="text-foreground">{service.title}</span>
      </nav>
      <section className="bg-gradient-to-b from-secondary to-background">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-2 lg:py-16">
          <div>
            {brand.logo_url && (
              <div className="mb-6 flex h-20 w-40 items-center justify-center rounded-2xl border bg-card p-4">
                <img
                  src={brand.logo_url}
                  alt={brand.title}
                  style={{ transform: `scale(${brand.logo_scale ?? 1})` }}
                  className="max-h-14 max-w-full object-contain"
                />
              </div>
            )}
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Ремонт {service.title.toLowerCase()} {brand.title}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Профессиональный ремонт техники {brand.title} на дому. Оригинальные запчасти, гарантия до 12 месяцев,
              выезд мастера в день обращения.
            </p>
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
      <ContactsBlock />
    </>
  );
}

export function comboHead(service: ComboData["service"], brand: ComboData["brand"], path: string) {
  const title = `Ремонт ${service.title.toLowerCase()} ${brand.title} в Минске — МастерФикс`;
  const desc = `Ремонт ${service.title} ${brand.title} на дому. Оригинальные запчасти и гарантия до 12 месяцев.`;
  return {
    meta: [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { property: "og:url", content: path },
    ],
    links: [{ rel: "canonical", href: path }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Service",
        name: `Ремонт ${service.title} ${brand.title}`,
        description: desc,
        areaServed: "Минск",
        brand: { "@type": "Brand", name: brand.title },
        provider: { "@type": "LocalBusiness", name: "МастерФикс" },
      }),
    }],
  };
}
