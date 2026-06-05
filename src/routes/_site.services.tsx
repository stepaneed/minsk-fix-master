import { createFileRoute } from "@tanstack/react-router";
import { ServicesGrid } from "@/components/site/ServicesGrid";
import { BrandsMarquee } from "@/components/site/BrandsMarquee";
import { ContactsBlock } from "@/components/site/ContactsBlock";

export const Route = createFileRoute("/_site/services")({
  head: () => ({
    meta: [
      { title: "Услуги — МастерФикс" },
      { name: "description", content: "Ремонт бытовой техники в Минске на дому: стиральные машины, холодильники, посудомойки и другое." },
      { property: "og:title", content: "Услуги — МастерФикс" },
      { property: "og:description", content: "Ремонт бытовой техники в Минске на дому." },
      { property: "og:url", content: "/services" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
  component: () => (
    <>
      <section className="mx-auto max-w-6xl px-4 pt-12">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Услуги</h1>
        <p className="mt-3 text-muted-foreground">Выберите вид техники для подробной информации и заявки.</p>
      </section>
      <ServicesGrid />
      <BrandsMarquee />
      <ContactsBlock />
    </>
  ),
});
