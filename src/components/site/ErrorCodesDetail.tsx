import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SecondCTA } from "@/components/site/SecondCTA";
import { safeJsonLd } from "@/lib/utils";

type ErrorCode = { id: string; code: string; meaning: string; cause: string | null; solution: string | null };
type Service = { slug: string; title: string; title_genitive: string | null };
type Brand = { slug: string; title: string };

export function ErrorCodesDetail({ service, brand, codes }: { service: Service; brand: Brand; codes: ErrorCode[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: codes.map((item) => ({
      "@type": "Question",
      name: `Ошибка ${item.code} — ${brand.title} ${service.title}`,
      acceptedAnswer: { "@type": "Answer", text: [item.meaning, item.cause, item.solution].filter(Boolean).join(". ") },
    })),
  };

  return (
    <>
      <section className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        <nav className="mb-4 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Главная</Link> ·{" "}
          <Link to="/faq/error-codes" className="hover:text-foreground">Коды ошибок</Link> ·{" "}
          <Link to="/appliance/$slug" params={{ slug: service.slug }} className="hover:text-foreground">{service.title}</Link> ·{" "}
          <span className="text-foreground">{brand.title}</span>
        </nav>
        <h1 className="text-3xl font-semibold md:text-4xl">Коды ошибок {service.title.toLowerCase()} {brand.title}</h1>
        <p className="mt-3 text-muted-foreground">Расшифровка кодов, вероятные причины неисправности и рекомендуемые действия.</p>

        <Accordion type="single" collapsible className="mt-8 w-full">
          {codes.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger>
                <span className="flex items-center gap-3 text-left"><Badge variant="secondary" className="font-mono">{item.code}</Badge>{item.meaning}</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                {item.cause && <p><span className="text-foreground">Причина:</span> {item.cause}</p>}
                {item.solution && <p><span className="text-foreground">Что делать:</span> {item.solution}</p>}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      </section>
      <SecondCTA title="Не удаётся сбросить ошибку?" subtitle="Мастер приедет в день обращения" />
    </>
  );
}

export function errorCodesHead(service: Service, brand: Brand, path: string) {
  const title = `Коды ошибок ${service.title.toLowerCase()} ${brand.title} — МастерФикс`;
  const description = `Расшифровка кодов ошибок ${service.title.toLowerCase()} ${brand.title}: причины неисправностей и что делать.`;
  return { meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary" }], links: [{ rel: "canonical", href: path }] };
}