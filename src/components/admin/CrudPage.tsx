import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AdminTable, type Column, type TableFilter } from "./AdminTable";
import { AdminForm, type Field } from "./AdminForm";
import { AdminToggle } from "./AdminToggle";
import { SortHandle } from "./SortHandle";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export type CrudConfig = {
  title: string;
  table: string;
  fields: Field[];
  columns: Column<any>[];
  orderBy?: { column: string; ascending?: boolean };
  showSortHandle?: boolean;
  showActiveToggle?: boolean;
  /** Dropdown filters shown above the table. */
  filters?: TableFilter<any>[];
  pageSize?: number;
};

export function CrudPage({ config }: { config: CrudConfig }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const queryKey = ["admin", config.table];
  const { data: rows = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      let q = supabase.from(config.table as any).select("*");
      if (config.orderBy) q = q.order(config.orderBy.column, { ascending: config.orderBy.ascending ?? true });
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
  });

  const refresh = () => qc.invalidateQueries({ queryKey });

  const handleSubmit = async (values: Record<string, any>) => {
    if (editing) {
      const { error } = await supabase.from(config.table as any).update(values).eq("id", editing.id);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Обновлено");
    } else {
      const { error } = await supabase.from(config.table as any).insert(values as any);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Создано");
    }
    setOpen(false);
    setEditing(null);
    refresh();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from(config.table as any).delete().eq("id", deleteId);
    if (error) toast.error(error.message);
    else {
      toast.success("Удалено");
      refresh();
    }
    setDeleteId(null);
  };

  const cols: Column<any>[] = [
    ...(config.showSortHandle
      ? [
          {
            key: "__sort",
            label: "↕",
            className: "w-12",
            render: (row: any) => (
              <SortHandle
                table={config.table}
                rows={rows as any}
                index={(rows as any[]).findIndex((r) => r.id === row.id)}
                onReorder={refresh}
              />
            ),
          },
        ]
      : []),
    ...config.columns,
    ...(config.showActiveToggle
      ? [
          {
            key: "is_active",
            label: "Активно",
            className: "w-24",
            render: (row: any) => (
              <AdminToggle table={config.table} id={row.id} value={row.is_active} onChange={refresh} />
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{config.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">Всего записей: {rows.length}</p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(o) => {
            setOpen(o);
            if (!o) setEditing(null);
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setEditing(null)}>
              <Plus className="h-4 w-4" /> Добавить
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Редактирование" : "Создание"}</DialogTitle>
            </DialogHeader>
            <AdminForm
              fields={config.fields}
              initial={editing || {}}
              onSubmit={handleSubmit}
              onCancel={() => {
                setOpen(false);
                setEditing(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Загрузка...</p>
      ) : (
        <AdminTable
          rows={rows as any[]}
          columns={cols}
          actions={(row) => (
            <div className="flex justify-end gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  setEditing(row);
                  setOpen(true);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => setDeleteId(row.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить запись?</AlertDialogTitle>
            <AlertDialogDescription>Это действие нельзя отменить.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
