import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SecondCTA } from "@/components/site/SecondCTA";
import { safeJsonLd } from "@/lib/utils";

const ALL = "__all__";

export const Route = createFileRoute("/_site/faq/error-codes")({
  head: () => ({
    meta: [
      { title: "Коды ошибок бытовой техники — расшифровка | МастерФикс" },
      {
        name: "description",
        content:
          "Расшифровка кодов ошибок стиральных и посудомоечных машин, холодильников, духовок, кондиционеров и другой техники по брендам: причина и что делать.",
      },
      { property: "og:title", content: "Коды ошибок бытовой техники — МастерФикс" },
      { property: "og:description", content: "Что означает код ошибки вашей техники и как его устранить." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "/faq/error-codes" },
    ],
    links: [{ rel: "canonical", href: "/faq/error-codes" }],
  }),
  component: ErrorCodesPage,
});

function ErrorCodesPage() {
  const [type, setType] = useState(ALL);
  const [brand, setBrand] = useState(ALL);
  const [q, setQ] = useState("");

  const { data: types = [] } = useQuery({
    queryKey: ["service_types_options"],
    queryFn: async () => {
      const { data } = await supabase
        .from("service_types")
        .select("id,title,slug")
        .eq("is_active", true)
        .order("sort_order");
      return data ?? [];
    },
  });

  const { data: codes = [], isLoading } = useQuery({
    queryKey: ["error_codes"],
    queryFn: async () => {
      const { data } = await supabase
        .from("error_codes")
        .select("id,code,meaning,cause,solution,service_type_id,brand_id,sort_order")
        .eq("is_active", true)
        .order("sort_order");
      return data ?? [];
    },
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["brands_options"],
    queryFn: async () => {
      const { data } = await supabase.from("brands").select("id,title").eq("is_active", true).order("title");
      return data ?? [];
    },
  });

  const typeMap = useMemo(() => Object.fromEntries(types.map((t) => [t.id, t.title])), [types]);
  const brandMap = useMemo(() => Object.fromEntries(brands.map((b) => [b.id, b.title])), [brands]);

  // Бренды, для которых вообще есть коды (с учётом выбранного вида техники)
  const brandOptions = useMemo(() => {
    const ids = new Set(
      codes.filter((c) => type === ALL || c.service_type_id === type).map((c) => c.brand_id).filter(Boolean),
    );
    return brands.filter((b) => ids.has(b.id));
  }, [codes, brands, type]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return codes.filter((c) => {
      if (type !== ALL && c.service_type_id !== type) return false;
      if (brand !== ALL && c.brand_id !== brand) return false;
      if (!s) return true;
      return [c.code, c.meaning, c.cause, c.solution].some((v) => (v ?? "").toLowerCase().includes(s));
    });
  }, [codes, type, brand, q]);

  // Группировка: вид техники → бренд
  const grouped = useMemo(() => {
    const map = new Map<string, Map<string, typeof filtered>>();
    for (const c of filtered) {
      const t = typeMap[c.service_type_id ?? ""] ?? "Другая техника";
      const b = brandMap[c.brand_id ?? ""] ?? "Все бренды";
      if (!map.has(t)) map.set(t, new Map());
      const inner = map.get(t)!;
      if (!inner.has(b)) inner.set(b, []);
      inner.get(b)!.push(c);
    }
    return map;
  }, [filtered, typeMap, brandMap]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: filtered.slice(0, 100).map((c) => ({
      "@type": "Question",
      name: `Ошибка ${c.code} — ${brandMap[c.brand_id ?? ""] ?? ""} ${typeMap[c.service_type_id ?? ""] ?? ""}`.trim(),
      acceptedAnswer: {
        "@type": "Answer",
        text: [c.meaning, c.cause, c.solution].filter(Boolean).join(". "),
      },
    })),
  };

  return (
    <>
      <section className="mx-auto max-w-4xl px-4 py-16">
        <nav className="text-xs text-muted-foreground mb-4">
          <Link to="/" className="hover:text-foreground">Главная</Link> ·{" "}
          <Link to="/faq" className="hover:text-foreground">FAQ</Link> ·{" "}
          <span className="text-foreground">Коды ошибок</span>
        </nav>
        <h1 className="text-4xl font-semibold tracking-tight">Коды ошибок бытовой техники</h1>
        <p className="mt-3 text-muted-foreground">
          Выберите вид техники и бренд, чтобы узнать, что означает код ошибки на дисплее, из-за чего он появляется и
          что можно сделать.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Select
            value={type}
            onValueChange={(v) => {
              setType(v);
              setBrand(ALL);
            }}
          >
            <SelectTrigger className="sm:w-56">
              <SelectValue placeholder="Вид техники" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Вся техника</SelectItem>
              {types.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={brand} onValueChange={setBrand}>
            <SelectTrigger className="sm:w-56">
              <SelectValue placeholder="Бренд" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Все бренды</SelectItem>
              {brandOptions.map((b) => (
                <SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск по коду или описанию, например F16"
            className="flex-1"
          />
        </div>

        {isLoading ? (
          <div className="mt-8 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-md" />)}
          </div>
        ) : filtered.length === 0 ? (
          <p className="mt-10 text-muted-foreground">
            Ничего не нашлось. Опишите проблему мастеру — подскажем бесплатно.
          </p>
        ) : (
          <div className="mt-8 space-y-10">
            {Array.from(grouped.entries()).map(([typeTitle, byBrand]) => (
              <div key={typeTitle}>
                <h2 className="mb-3 text-xl font-semibold tracking-tight">{typeTitle}</h2>
                <div className="space-y-6">
                  {Array.from(byBrand.entries()).map(([brandTitle, list]) => (
                    <div key={brandTitle}>
                      <h3 className="mb-1 text-sm font-medium text-muted-foreground">{brandTitle}</h3>
                      <Accordion type="single" collapsible className="w-full">
                        {list.map((c) => (
                          <AccordionItem key={c.id} value={c.id}>
                            <AccordionTrigger>
                              <span className="flex items-center gap-3 text-left">
                                <Badge variant="secondary" className="font-mono">{c.code}</Badge>
                                <span>{c.meaning}</span>
                              </span>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-2 text-muted-foreground">
                              {c.cause && (
                                <p><span className="text-foreground">Причина:</span> {c.cause}</p>
                              )}
                              {c.solution && (
                                <p><span className="text-foreground">Что делать:</span> {c.solution}</p>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {filtered.length > 0 && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
        )}
      </section>
      <SecondCTA title="Не удаётся сбросить ошибку?" subtitle="Мастер приедет в день обращения" />
    </>
  );
}
