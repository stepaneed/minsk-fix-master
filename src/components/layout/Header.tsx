import { Link } from "@tanstack/react-router";

const nav = [
  { to: "/services", label: "Услуги" },
  { to: "/prices", label: "Цены" },
  { to: "/discounts", label: "Скидки" },
  { to: "/promotions", label: "Акции" },
  { to: "/faq", label: "FAQ" },
  { to: "/contacts", label: "Контакты" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="text-lg font-semibold tracking-tight text-foreground">
          МастерФикс
        </Link>
        <nav className="hidden gap-6 md:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground font-medium" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
