import { createFileRoute, Link } from "@tanstack/react-router";
import { OrderForm } from "@/components/site/OrderForm";
import { ServicesGrid } from "@/components/site/ServicesGrid";
import { ExtraServicesGrid } from "@/components/site/ExtraServicesGrid";
import { WorkAlgorithm } from "@/components/site/WorkAlgorithm";
import { BrandsMarquee } from "@/components/site/BrandsMarquee";
import { DiscountsBlock } from "@/components/site/DiscountsBlock";
import { ContactsBlock } from "@/components/site/ContactsBlock";
import { CheckCircle2 } from "lucide-react";

const TITLE = "МастерФикс — Ремонт бытовой техники в Минске на дому";
const DESC = "Срочный ремонт стиральных машин, холодильников, посудомоек и другой техники с выездом на дом. Бесплатная диагностика, гарантия до 12 мес.";

export const Route = createFileRoute("/_site/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: "МастерФикс",
        description: DESC,
        areaServed: "Минск",
        telephone: "+375291234567",
        address: { "@type": "PostalAddress", addressLocality: "Минск", addressCountry: "BY" },
        openingHours: "Mo-Su 09:00-21:00",
      }),
    }],
  }),
  component: Home,
});

const advantages = [
  "Выезд мастера в течение 1 часа",
  "Бесплатная диагностика при ремонте",
  "Гарантия от 6 до 12 месяцев",
  "Оригинальные запчасти в наличии",
  "Оплата только после ремонта",
];

function Home() {
  return (
    <>
      {/* 2. Блок заказа (главный) */}
      <section className="bg-gradient-to-b from-secondary to-background">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:py-20 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Ремонт бытовой техники · Минск
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
              Починим вашу технику <span className="text-primary">за один визит</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Мастера с опытом 10+ лет приедут в удобное время. Бесплатная диагностика и прозрачные цены.
            </p>
            <ul className="mt-6 space-y-2">
              {advantages.map((a) => (
                <li key={a} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-[color:var(--success)]" /> {a}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex gap-3">
              <Link to="/services" className="inline-flex h-11 items-center rounded-md border border-input bg-background px-6 text-sm font-medium hover:bg-secondary">
                Все услуги
              </Link>
              <Link to="/contacts" className="inline-flex h-11 items-center rounded-md px-6 text-sm font-medium text-primary hover:underline">
                Контакты →
              </Link>
            </div>
          </div>
          <OrderForm />
        </div>
      </section>

      {/* 3 */}
      <ServicesGrid />
      <ExtraServicesGrid />

      {/* 4 */}
      <WorkAlgorithm />

      {/* 5 */}
      <BrandsMarquee />

      {/* 6 */}
      <DiscountsBlock />

      {/* 7 */}
      <ContactsBlock />
    </>
  );
}
