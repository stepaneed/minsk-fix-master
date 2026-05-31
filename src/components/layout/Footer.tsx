import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useContacts } from "@/components/site/ContactsBlock";
import { supabase } from "@/integrations/supabase/client";

export function Footer() {
  const { data: c } = useContacts();
  const { data: services = [] } = useQuery({
    queryKey: ["footer_services"],
    queryFn: async () => {
      const { data } = await supabase
        .from("service_types")
        .select("slug,title")
        .eq("is_active", true)
        .order("sort_order");
      return data ?? [];
    },
  });

  return (
    <footer className="mt-16 border-t bg-secondary">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="font-semibold">МастерФикс</div>
          <p className="mt-2 text-sm text-muted-foreground">Ремонт бытовой техники в Минске с выездом на дом.</p>
        </div>
        <div>
          <div className="text-sm font-semibold">Услуги</div>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/services" className="hover:text-foreground">Все услуги</Link></li>
            {services.map((s) => (
              <li key={s.slug}>
                <Link to="/appliance/$slug" params={{ slug: s.slug }} className="hover:text-foreground">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold">Компания</div>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/prices" className="hover:text-foreground">Цены</Link></li>
            <li><Link to="/discounts" className="hover:text-foreground">Скидки</Link></li>
            <li><Link to="/promotions" className="hover:text-foreground">Акции</Link></li>
            <li><Link to="/faq" className="hover:text-foreground">FAQ</Link></li>
            <li><Link to="/contacts" className="hover:text-foreground">Контакты</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold">Контакты</div>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {c?.phone && <li><a href={`tel:${c.phone.replace(/\s/g, "")}`} className="hover:text-foreground">{c.phone}</a></li>}
            {c?.schedule && <li>{c.schedule}</li>}
            {c?.address && <li>{c.address}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} МастерФикс. Все права защищены.
        </div>
      </div>
    </footer>
  );
}
