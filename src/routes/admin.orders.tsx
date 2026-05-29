import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminTable } from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

const STATUSES = ["new", "in_progress", "done", "cancelled"] as const;
const STATUS_LABEL: Record<string, string> = {
  new: "Новая",
  in_progress: "В работе",
  done: "Выполнена",
  cancelled: "Отменена",
};

export const Route = createFileRoute("/admin/orders")({
  head: () => ({ meta: [{ title: "Заявки — Админка" }, { name: "robots", content: "noindex" }] }),
  component: OrdersPage,
});

function OrdersPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const { data: rows = [] } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const filtered = rows.filter((r: any) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!r.name.toLowerCase().includes(s) && !r.phone.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Статус обновлён");
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Удалить заявку?")) return;
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Удалено");
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Заявки</h1>
        <p className="text-sm text-muted-foreground mt-1">Всего: {rows.length}, показано: {filtered.length}</p>
      </div>
      <div className="flex gap-3 flex-wrap">
        <Input
          placeholder="Поиск по имени или телефону..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <AdminTable
        rows={filtered}
        columns={[
          {
            key: "created_at",
            label: "Дата",
            sortable: true,
            render: (r: any) => new Date(r.created_at).toLocaleString("ru-RU"),
          },
          { key: "name", label: "Имя", sortable: true },
          { key: "phone", label: "Телефон" },
          { key: "address", label: "Адрес", render: (r: any) => r.address || "—" },
          {
            key: "description",
            label: "Описание",
            render: (r: any) => (
              <span className="line-clamp-2 max-w-xs block text-sm">{r.description || "—"}</span>
            ),
          },
          {
            key: "status",
            label: "Статус",
            render: (r: any) => (
              <Select value={r.status} onValueChange={(v) => updateStatus(r.id, v)}>
                <SelectTrigger className="w-36 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ),
          },
        ]}
        actions={(row) => (
          <Button
            size="icon"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={() => remove(row.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      />
    </div>
  );
}
