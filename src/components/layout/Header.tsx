import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Menu, ChevronDown, Phone, Send, MessageCircle, Phone as PhoneIcon, Clock, Shield, Home, Wrench, Tag, HelpCircle, DollarSign, Percent, Sparkles } from "lucide-react";
import { useContacts, MESSENGERS } from "@/components/site/ContactsBlock";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

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
        .select("slug,title,icon_url")
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

  const closeMenu = () => setMenuOpen(false);

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
          <Link
            to="/admin"
            className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <Shield className="h-3.5 w-3.5" /> Админ
          </Link>
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

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <button className="lg:hidden" aria-label="Меню">
              <Menu className="h-6 w-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[85%] max-w-sm overflow-y-auto p-0 sm:max-w-sm">
            <SheetTitle className="sr-only">Меню</SheetTitle>
            <div className="flex h-full flex-col">
              <div className="border-b px-5 py-4">
                <Link to="/" onClick={closeMenu} className="text-lg font-semibold tracking-tight">
                  МастерФикс
                </Link>
              </div>

              <nav className="flex-1 overflow-y-auto px-2 py-2">
                <Link
                  to="/"
                  onClick={closeMenu}
                  className="flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium hover:bg-secondary"
                >
                  <Home className="h-5 w-5 text-muted-foreground" />
                  Главная
                </Link>

                <Accordion type="multiple" className="w-full">
                  <AccordionItem value="services" className="border-b-0">
                    <div className="flex items-center">
                      <Link
                        to="/services"
                        onClick={closeMenu}
                        className="flex flex-1 items-center gap-3 rounded-md px-3 py-3 text-base font-medium hover:bg-secondary"
                      >
                        <Wrench className="h-5 w-5 text-muted-foreground" />
                        Услуги
                      </Link>
                      <AccordionTrigger className="px-3 py-3 hover:no-underline" />
                    </div>
                    <AccordionContent>
                      <div className="flex flex-col pb-1">
                        {services.map((s: any) => (
                          <Link
                            key={s.slug}
                            to="/appliance/$slug"
                            params={{ slug: s.slug }}
                            onClick={closeMenu}
                            className="flex items-center gap-3 rounded-md px-6 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                          >
                            {s.icon_url ? (
                              <img src={s.icon_url} alt="" loading="lazy" className="h-5 w-5 object-contain" />
                            ) : (
                              <Wrench className="h-4 w-4" />
                            )}
                            {s.title}
                          </Link>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="prices" className="border-b-0">
                    <div className="flex items-center">
                      <Link
                        to="/prices"
                        onClick={closeMenu}
                        className="flex flex-1 items-center gap-3 rounded-md px-3 py-3 text-base font-medium hover:bg-secondary"
                      >
                        <Tag className="h-5 w-5 text-muted-foreground" />
                        Цены
                      </Link>
                      <AccordionTrigger className="px-3 py-3 hover:no-underline" />
                    </div>
                    <AccordionContent>
                      <div className="flex flex-col pb-1">
                        <Link to="/prices" onClick={closeMenu} className="flex items-center gap-3 rounded-md px-6 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"><DollarSign className="h-4 w-4" />Прайс-лист</Link>
                        <Link to="/discounts" onClick={closeMenu} className="flex items-center gap-3 rounded-md px-6 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"><Percent className="h-4 w-4" />Скидки</Link>
                        <Link to="/promotions" onClick={closeMenu} className="flex items-center gap-3 rounded-md px-6 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"><Sparkles className="h-4 w-4" />Акции</Link>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="faq" className="border-b-0">
                    <div className="flex items-center">
                      <Link
                        to="/faq"
                        onClick={closeMenu}
                        className="flex flex-1 items-center gap-3 rounded-md px-3 py-3 text-base font-medium hover:bg-secondary"
                      >
                        <HelpCircle className="h-5 w-5 text-muted-foreground" />
                        FAQ
                      </Link>
                      <AccordionTrigger className="px-3 py-3 hover:no-underline" />
                    </div>
                    <AccordionContent>
                      <div className="flex flex-col pb-1">
                        <Link to="/faq" onClick={closeMenu} className="flex items-center gap-3 rounded-md px-6 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"><HelpCircle className="h-4 w-4" />Вопросы и ответы</Link>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <Link
                  to="/contacts"
                  onClick={closeMenu}
                  className="flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium hover:bg-secondary"
                >
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  Контакты
                </Link>

                <Link
                  to="/admin"
                  onClick={closeMenu}
                  className="mt-2 flex items-center gap-2 rounded-md border px-3 py-3 text-sm text-muted-foreground hover:bg-secondary"
                >
                  <Shield className="h-4 w-4" /> Админ-панель
                </Link>
              </nav>


              <div className="space-y-2 border-t px-4 py-4">
                {c?.phone && (
                  <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-sm font-semibold">
                    <Phone className="h-4 w-4" /> {c.phone}
                  </a>
                )}
                <Button className="w-full" onClick={() => { closeMenu(); scrollToOrder(); }}>
                  Оформить заказ
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
