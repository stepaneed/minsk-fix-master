import { useEffect, useRef, useState } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Inbox,
  Wrench,
  Tag,
  DollarSign,
  Percent,
  Sparkles,
  HelpCircle,
  Newspaper,
  Settings,
  LogOut,
  Menu,
  PackageOpen,
  Boxes,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/orders", label: "Заявки", icon: Inbox },
  { to: "/admin/service-types", label: "Виды техники", icon: Wrench },
  { to: "/admin/brands", label: "Бренды", icon: Tag },
  { to: "/admin/extra-services", label: "Доп. услуги", icon: PackageOpen },
  { to: "/admin/products", label: "Товары", icon: Boxes },
  { to: "/admin/prices", label: "Цены", icon: DollarSign },
  { to: "/admin/discounts", label: "Скидки", icon: Percent },
  { to: "/admin/promotions", label: "Акции", icon: Sparkles },
  { to: "/admin/faq", label: "FAQ", icon: HelpCircle },
  { to: "/admin/error-codes", label: "Коды ошибок", icon: AlertTriangle },
  { to: "/admin/articles", label: "Статьи", icon: Newspaper },
  { to: "/admin/settings", label: "Настройки", icon: Settings },
];

const INACTIVITY_MS = 30 * 60 * 1000;

function NavList({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");
  return (
    <nav className="flex-1 space-y-1 overflow-y-auto p-3">
      {NAV.map((n) => {
        const Icon = n.icon;
        const active = isActive(n.to, n.exact);
        return (
          <Link
            key={n.to}
            to={n.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary",
            )}
          >
            <Icon className="h-4 w-4" />
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const logout = async () => {
    await supabase.auth.signOut();
    toast.info("Сеанс завершён");
    navigate({ to: "/admin/login" });
  };

  useEffect(() => {
    const reset = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        await supabase.auth.signOut();
        toast.warning("Автовыход из-за неактивности (30 минут)");
        navigate({ to: "/admin/login" });
      }, INACTIVITY_MS);
    };
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, reset));
    reset();
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen bg-secondary">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-background lg:flex">
        <div className="border-b border-border px-6 py-5">
          <Link to="/admin" className="text-lg font-semibold tracking-tight">
            МастерФикс <span className="font-normal text-muted-foreground">/ admin</span>
          </Link>
        </div>
        <NavList pathname={pathname} />
        <button
          onClick={logout}
          className="m-3 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Выйти
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-2 border-b border-border bg-background px-3 lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button aria-label="Меню" className="rounded-md p-2 hover:bg-secondary">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">Админ-меню</SheetTitle>
              <div className="flex h-full flex-col">
                <div className="border-b border-border px-6 py-5">
                  <Link to="/admin" onClick={() => setMobileOpen(false)} className="text-lg font-semibold tracking-tight">
                    МастерФикс <span className="font-normal text-muted-foreground">/ admin</span>
                  </Link>
                </div>
                <NavList pathname={pathname} onNavigate={() => setMobileOpen(false)} />
                <button
                  onClick={() => { setMobileOpen(false); logout(); }}
                  className="m-3 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" /> Выйти
                </button>
              </div>
            </SheetContent>
          </Sheet>
          <Link to="/admin" className="text-base font-semibold">
            МастерФикс <span className="text-xs font-normal text-muted-foreground">/ admin</span>
          </Link>
        </header>

        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
