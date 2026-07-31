import { safeJsonLd } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { OrderForm } from "@/components/site/OrderForm";
import { WorkAlgorithm } from "@/components/site/WorkAlgorithm";
import { ContactsBlock } from "@/components/site/ContactsBlock";
import { CheckCircle2 } from "lucide-react";

export type ComboData = {
  service: { id: string; slug: string; title: string; title_genitive?: string | null; description: string | null; cover_url?: string | null };
  brand: { id: string; slug: string; title: string; logo_url: string | null; logo_scale?: number | null; logo_fit?: string | null };
};

const breakdowns: Record<string, string[]> = {
  "washing-machines": ["Не сливает воду", "Не отжимает", "Шумит при отжиме", "Не греет воду", "Течь снизу"],
  "refrigerators": ["Не морозит", "Намерзает лёд", "Течь воды", "Постоянно работает", "Не запускается"],
  "dishwashers": ["Не сливает воду", "Не моет посуду", "Не нагревает воду", "Постоянно гудит"],
};

function comboTitle(service: ComboData["service"], brand: ComboData["brand"]) {
  const genitive = service.title_genitive || service.title.toLowerCase();
  return `Ремонт ${genitive} ${brand.title}`;
}

export function ComboPage({ service, brand }: ComboData) {
  const issues = breakdowns[service.slug] ?? ["Не включается", "Странный шум", "Не выполняет программу", "Электронные ошибки"];
  const title = comboTitle(service, brand);
  const fit = brand.logo_fit ?? "contain";
  const genitive = service.title_genitive || service.title.toLowerCase();

  return (
    <>
      <nav className="mx-auto max-w-6xl px-4 pt-6 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Главная</Link> ·{" "}
        <Link to="/services" className="hover:text-foreground">Услуги</Link> ·{" "}
        <Link to="/appliance/$slug" params={{ slug: service.slug }} className="hover:text-foreground">{service.title}</Link> ·{" "}
        <span className="text-foreground">{brand.title}</span>
      </nav>
      <section className="relative overflow-hidden bg-gradient-to-b from-secondary to-background">
        {service.cover_url && (
          <>
            <img
              src={service.cover_url}
              alt=""
              loading="lazy"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-25"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
          </>
        )}
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-2 lg:py-16">
          <div>
            {brand.logo_url && (
              <div className="mb-6 flex h-20 w-40 items-center justify-center overflow-hidden rounded-2xl border bg-card p-4">
                <img
                  src={brand.logo_url}
                  alt={brand.title}
                  style={{ transform: `scale(${brand.logo_scale ?? 1})`, objectFit: fit as never }}
                  className="max-h-14 max-w-full"
                />
              </div>
            )}
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{title}</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Профессиональный ремонт {genitive} {brand.title} на дому. Оригинальные запчасти, гарантия до 12 месяцев,
              выезд мастера в день обращения.
            </p>
            <h2 className="mt-8 text-xl font-semibold">Популярные неисправности {brand.title}</h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {issues.map((i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> {i}
                </li>
              ))}
            </ul>
            <Link
              to="/appliance/$slug/$brand/error"
              params={{ slug: service.slug, brand: brand.slug }}
              className="mt-6 inline-flex text-sm font-medium text-primary hover:underline"
            >
              Коды ошибок {brand.title}
            </Link>
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
  const title = `${comboTitle(service, brand)} в Минске — МастерФикс`;
  const genitive = service.title_genitive || service.title.toLowerCase();
  const desc = `Ремонт ${genitive} ${brand.title} на дому. Оригинальные запчасти и гарантия до 12 месяцев.`;
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
      children: safeJsonLd({
        "@context": "https://schema.org",
        "@type": "Service",
        name: comboTitle(service, brand),
        description: desc,
        areaServed: "Минск",
        brand: { "@type": "Brand", name: brand.title },
        provider: { "@type": "LocalBusiness", name: "МастерФикс" },
      }),
    }],
  };
}
