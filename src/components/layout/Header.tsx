import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Menu, X, ChevronDown, Phone, Send, MessageCircle, Phone as PhoneIcon, Clock, Shield } from "lucide-react";
import { useContacts, MESSENGERS } from "@/components/site/ContactsBlock";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function scrollToOrder() {
  const el = document.getElementById("order");
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

const MESSENGER_ICON_MAP = { telegram: Send, whatsapp: MessageCircle, viber: PhoneIcon } as const;

export function Header() {
  const { data: c } = useContacts();
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: services = [] } = useQuery({
    queryKey: ["header_services"],
    queryFn: async () => {
      const { data } = await supabase
        .from("service_types")
        .select("slug,title")
        .eq("is_active", true)
        .order("sort_order");
      return data ?? [];
    },
  });

  const dropdowns = [
    {
      key: "services",
      label: "Услуги",
      links: [
        { to: "/services", label: "Все услуги", params: undefined as undefined },
        ...services.map((s) => ({
          to: "/appliance/$slug",
          label: s.title,
          params: { slug: s.slug },
        })),
      ],
    },
    {
      key: "prices",
      label: "Цены",
      links: [
        { to: "/prices", label: "Прайс-лист", params: undefined },
        { to: "/discounts", label: "Скидки", params: undefined },
        { to: "/promotions", label: "Акции", params: undefined },
      ],
    },
    {
      key: "faq",
      label: "FAQ",
      links: [
        { to: "/faq", label: "Частые вопросы", params: undefined },
        { to: "/contacts", label: "Контакты", params: undefined },
      ],
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" className="text-lg font-semibold tracking-tight">МастерФикс</Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {dropdowns.map((dd) => (
            <DropdownMenu key={dd.key}>
              <DropdownMenuTrigger className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm text-foreground outline-none hover:bg-secondary data-[state=open]:bg-secondary">
                {dd.label} <ChevronDown className="h-3.5 w-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[240px]">
                {dd.links.map((l, i) => (
                  <DropdownMenuItem key={i} asChild>
                    {l.params ? (
                      <Link to={l.to as never} params={l.params as never} className="cursor-pointer">
                        {l.label}
                      </Link>
                    ) : (
                      <Link to={l.to as never} className="cursor-pointer">
                        {l.label}
                      </Link>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {c?.schedule && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> {c.schedule}
            </div>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground"
                aria-label="Мессенджеры"
              >
                <MessageCircle className="h-4 w-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56 p-2">
              <div className="flex flex-col gap-1.5">
                {MESSENGERS.map(({ key, label, color }) => {
                  const href = c?.[key];
                  if (!href) return null;
                  const Icon = MESSENGER_ICON_MAP[key];
                  return (
                    <a
                      key={key}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
                      style={{ backgroundColor: color }}
                    >
                      <Icon className="h-4 w-4" /> {label}
                    </a>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
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
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t bg-background lg:hidden">
          <nav className="mx-auto max-w-6xl px-4 py-2">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="block border-b py-4 text-base font-medium"
            >
              Главная
            </Link>

            <Accordion type="multiple" className="w-full">
              <AccordionItem value="services">
                <AccordionTrigger className="text-base font-medium">Услуги</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col">
                    {services.map((s) => (
                      <Link
                        key={s.slug}
                        to="/appliance/$slug"
                        params={{ slug: s.slug }}
                        onClick={() => setMenuOpen(false)}
                        className="py-2.5 pl-2 text-sm text-muted-foreground hover:text-foreground"
                      >
                        {s.title}
                      </Link>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="prices">
                <AccordionTrigger className="text-base font-medium">Цены</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col">
                    <Link to="/prices" onClick={() => setMenuOpen(false)} className="py-2.5 pl-2 text-sm text-muted-foreground hover:text-foreground">Прайс-лист выполняемых услуг</Link>
                    <Link to="/discounts" onClick={() => setMenuOpen(false)} className="py-2.5 pl-2 text-sm text-muted-foreground hover:text-foreground">Скидки</Link>
                    <Link to="/promotions" onClick={() => setMenuOpen(false)} className="py-2.5 pl-2 text-sm text-muted-foreground hover:text-foreground">Акции</Link>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq">
                <AccordionTrigger className="text-base font-medium">Часто задаваемые вопросы</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col">
                    <Link to="/faq" onClick={() => setMenuOpen(false)} className="py-2.5 pl-2 text-sm text-muted-foreground hover:text-foreground">Вопросы и ответы</Link>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Link
              to="/contacts"
              onClick={() => setMenuOpen(false)}
              className="block border-b py-4 text-base font-medium"
            >
              Контакты
            </Link>

            {c?.phone && (
              <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="block py-3 text-sm font-semibold">
                📞 {c.phone}
              </a>
            )}
            <Button className="my-3 w-full" onClick={() => { setMenuOpen(false); scrollToOrder(); }}>
              Оформить заказ
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
