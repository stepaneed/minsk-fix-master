import { useEffect, useRef } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/orders", label: "Заявки", icon: Inbox },
  { to: "/admin/service-types", label: "Виды техники", icon: Wrench },
  { to: "/admin/brands", label: "Бренды", icon: Tag },
  { to: "/admin/prices", label: "Цены", icon: DollarSign },
  { to: "/admin/discounts", label: "Скидки", icon: Percent },
  { to: "/admin/promotions", label: "Акции", icon: Sparkles },
  { to: "/admin/faq", label: "FAQ", icon: HelpCircle },
  { to: "/admin/articles", label: "Статьи", icon: Newspaper },
  { to: "/admin/settings", label: "Настройки", icon: Settings },
];

const INACTIVITY_MS = 30 * 60 * 1000;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  return (
    <div className="flex min-h-screen bg-secondary">
      <aside className="w-64 shrink-0 border-r border-border bg-background flex flex-col">
        <div className="px-6 py-5 border-b border-border">
          <Link to="/admin" className="text-lg font-semibold tracking-tight">
            МастерФикс <span className="text-muted-foreground font-normal">/ admin</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = isActive(n.to, n.exact);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-secondary",
                )}
              >
                <Icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={logout}
          className="m-3 flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Выйти
        </button>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="mx-auto max-w-7xl px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
