import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, ChevronDown, Phone, Send, MessageCircle, Clock } from "lucide-react";
import { useContacts } from "@/components/site/ContactsBlock";
import { Button } from "@/components/ui/button";

function scrollToOrder() {
  const el = document.getElementById("order");
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Header() {
  const { data: c } = useContacts();
  const [menuOpen, setMenuOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const [drop, setDrop] = useState<string | null>(null);

  useEffect(() => {
    const onClick = () => setDrop(null);
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  type NavLink = { to: string; label: string };
  const dropdowns: Record<string, { label: string; links: NavLink[] }> = {
    services: { label: "Услуги", links: [
      { to: "/services", label: "Все услуги" },
      { to: "/appliance/washing-machines", label: "Стиральные машины" },
      { to: "/appliance/refrigerators", label: "Холодильники" },
      { to: "/appliance/dishwashers", label: "Посудомоечные машины" },
    ]},
    prices: { label: "Цены", links: [
      { to: "/prices", label: "Все цены" },
      { to: "/discounts", label: "Скидки" },
      { to: "/promotions", label: "Акции" },
    ]},
    faq: { label: "FAQ", links: [
      { to: "/faq", label: "Частые вопросы" },
      { to: "/contacts", label: "Контакты" },
    ]},
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" className="text-lg font-semibold tracking-tight">МастерФикс</Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {Object.entries(dropdowns).map(([key, dd]) => (
            <div key={key} className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setDrop(drop === key ? null : key)}
                className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm text-foreground hover:bg-secondary"
              >
                {dd.label} <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {drop === key && (
                <div className="absolute left-0 top-full mt-1 min-w-[220px] rounded-xl border bg-popover p-2 shadow-lg">
                  {dd.links.map((l) => (
                    <Link key={l.to} to={l.to as never} className="block rounded-md px-3 py-2 text-sm hover:bg-secondary" onClick={() => setDrop(null)}>
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {c?.schedule && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> {c.schedule}
            </div>
          )}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setMsgOpen((v) => !v)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground"
              aria-label="Мессенджеры"
            >
              <MessageCircle className="h-4 w-4" />
            </button>
            {msgOpen && (
              <div className="absolute right-0 top-full mt-2 flex gap-2 rounded-xl border bg-popover p-2 shadow-lg">
                {c?.telegram && <a href={c.telegram} target="_blank" rel="noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground"><Send className="h-4 w-4" /></a>}
                {c?.whatsapp && <a href={c.whatsapp} target="_blank" rel="noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground"><MessageCircle className="h-4 w-4" /></a>}
                {c?.viber && <a href={c.viber} target="_blank" rel="noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground"><MessageCircle className="h-4 w-4" /></a>}
              </div>
            )}
          </div>
          {c?.phone && (
            <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5 text-sm font-semibold hover:text-primary">
              <Phone className="h-4 w-4" /> {c.phone}
            </a>
          )}
          <Button size="sm" onClick={scrollToOrder}>Оформить заказ</Button>
        </div>

        <button className="lg:hidden" onClick={() => setMenuOpen((v) => !v)} aria-label="Меню">
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t bg-background lg:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {Object.values(dropdowns).flatMap((dd) => dd.links).map((l) => (
              <Link key={l.to} to={l.to as never} className="rounded-md px-3 py-2 text-sm hover:bg-secondary" onClick={() => setMenuOpen(false)}>
                {l.label}
              </Link>
            ))}
            {c?.phone && (
              <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="rounded-md px-3 py-2 text-sm font-semibold">📞 {c.phone}</a>
            )}
            <Button className="mt-2" onClick={() => { setMenuOpen(false); scrollToOrder(); }}>Оформить заказ</Button>
          </nav>
        </div>
      )}
    </header>
  );
}
