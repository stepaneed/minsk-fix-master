import { Outlet, useRouterState } from "@tanstack/react-router";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function SiteLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main key={pathname} className="page-enter flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
