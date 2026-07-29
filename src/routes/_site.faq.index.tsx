import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { SecondCTA } from "@/components/site/SecondCTA";
import { Skeleton } from "@/components/ui/skeleton";
import { safeJsonLd } from "@/lib/utils";

export const Route = createFileRoute("/_site/faq/")({
  head: () => ({
    meta: [
      { title: "Частые вопросы о ремонте техники — МастерФикс" },
      { name: "description", content: "Ответы на популярные вопросы: гарантия, выезд, оплата, сроки ремонта." },
      { property: "og:title", content: "FAQ — МастерФикс" },
      { property: "og:description", content: "Ответы на популярные вопросы о ремонте бытовой техники." },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
  }),
  component: FaqPage,
});

function FaqPage() {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["faq_all"],
    queryFn: async () => {
      const { data } = await supabase.from("faq").select("*").eq("is_active", true).order("sort_order");
      return data ?? [];
    },
  });

  const grouped = items.reduce<Record<string, typeof items>>((acc, it) => {
    const k = it.category ?? "Общие";
    (acc[k] ||= []).push(it);
    return acc;
  }, {});

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.question,
      acceptedAnswer: { "@type": "Answer", text: i.answer },
    })),
  };

  return (
    <>
      <section className="mx-auto max-w-3xl px-4 py-16">
        <nav className="text-xs text-muted-foreground mb-4">
          <a href="/" className="hover:text-foreground">Главная</a> · <span className="text-foreground">FAQ</span>
        </nav>
        <h1 className="text-4xl font-semibold tracking-tight">Частые вопросы</h1>
        <div className="mt-8 space-y-10">
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-md" />)}
            </div>
          )}
          {Object.entries(grouped).map(([cat, list]) => (
            <div key={cat}>
              <h2 className="text-xl font-semibold tracking-tight mb-2">{cat}</h2>
              <Accordion type="single" collapsible className="w-full">
                {list.map((q) => (
                  <AccordionItem key={q.id} value={q.id}>
                    <AccordionTrigger>{q.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{q.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
        )}
      </section>
      <SecondCTA title="Остались вопросы?" subtitle="Перезвоним и подскажем — бесплатно" />
    </>
  );
}
