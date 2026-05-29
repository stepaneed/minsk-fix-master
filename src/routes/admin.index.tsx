import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Dashboard — Админка" }, { name: "robots", content: "noindex" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const [allOrders, newOrders, latest] = await Promise.all([
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "new"),
        supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(10),
      ]);
      return {
        total: allOrders.count ?? 0,
        newCount: newOrders.count ?? 0,
        latest: latest.data || [],
      };
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Обзор заявок</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Всего заявок</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats?.total ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Новые</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-primary">{stats?.newCount ?? "—"}</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Последние 10 заявок</CardTitle>
        </CardHeader>
        <CardContent>
          {!stats?.latest.length ? (
            <p className="text-sm text-muted-foreground">Заявок пока нет</p>
          ) : (
            <div className="divide-y divide-border">
              {stats.latest.map((o: any) => (
                <Link
                  key={o.id}
                  to="/admin/orders"
                  className="flex items-center justify-between py-3 hover:bg-secondary -mx-2 px-2 rounded-md transition-colors"
                >
                  <div>
                    <p className="font-medium">{o.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {o.phone} · {new Date(o.created_at).toLocaleString("ru-RU")}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-md bg-secondary">{o.status}</span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
