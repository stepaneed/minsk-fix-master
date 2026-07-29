import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ChevronUp, ChevronsUpDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type Column<T> = {
  key: string;
  label: string;
  /** Sorting is enabled by default; pass false to disable. */
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  className?: string;
  /** Custom value used for sorting/search (defaults to row[key]). */
  value?: (row: T) => string | number | null | undefined;
};

export type TableFilter<T> = {
  key: string;
  label: string;
  options: { value: string; label: string }[];
  /** Row value to compare with the selected option (defaults to row[key]). */
  value?: (row: T) => string | null | undefined;
};

const ALL = "__all__";

export function AdminTable<T extends { id: string }>({
  rows,
  columns,
  pageSize = 20,
  actions,
  searchable = true,
  filters,
}: {
  rows: T[];
  columns: Column<T>[];
  pageSize?: number;
  actions?: (row: T) => React.ReactNode;
  searchable?: boolean;
  filters?: TableFilter<T>[];
}) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<Record<string, string>>({});

  const colValue = (row: T, c: Column<T>) =>
    c.value ? c.value(row) : (row as any)[c.key];

  const filtered = useMemo(() => {
    let out = rows;
    for (const f of filters ?? []) {
      const sel = active[f.key];
      if (!sel || sel === ALL) continue;
      out = out.filter((r) => String((f.value ? f.value(r) : (r as any)[f.key]) ?? "") === sel);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      out = out.filter((r) =>
        columns.some((c) => String(colValue(r, c) ?? "").toLowerCase().includes(q)),
      );
    }
    return out;
  }, [rows, filters, active, search, columns]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = col ? colValue(a, col) : (a as any)[sortKey];
      const bv = col ? colValue(b, col) : (b as any)[sortKey];
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number")
        return sortDir === "asc" ? av - bv : bv - av;
      const cmp = String(av).localeCompare(String(bv), "ru", { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sortKey, sortDir, columns]);

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pages - 1);
  const slice = sorted.slice(current * pageSize, (current + 1) * pageSize);

  const toggleSort = (key: string) => {
    setPage(0);
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const hasControls = searchable || (filters && filters.length > 0);
  const dirty = search.trim() !== "" || Object.values(active).some((v) => v && v !== ALL);

  return (
    <div className="space-y-3">
      {hasControls && (
        <div className="flex flex-wrap items-center gap-2">
          {searchable && (
            <div className="relative min-w-[220px] flex-1 max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                placeholder="Поиск..."
                className="pl-9"
              />
            </div>
          )}
          {(filters ?? []).map((f) => (
            <Select
              key={f.key}
              value={active[f.key] ?? ALL}
              onValueChange={(v) => {
                setActive((p) => ({ ...p, [f.key]: v }));
                setPage(0);
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={f.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{f.label}: все</SelectItem>
                {f.options.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
          {dirty && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setActive({});
                setPage(0);
              }}
            >
              <X className="h-4 w-4" /> Сбросить
            </Button>
          )}
        </div>
      )}

      <div className="rounded-lg border border-border bg-background overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((c) => (
                <TableHead key={c.key} className={c.className}>
                  {c.sortable === false || c.key.startsWith("__") ? (
                    c.label
                  ) : (
                    <button
                      onClick={() => toggleSort(c.key)}
                      className="inline-flex items-center gap-1 hover:text-foreground"
                    >
                      {c.label}
                      {sortKey === c.key ? (
                        sortDir === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-3 w-3 opacity-50" />
                      )}
                    </button>
                  )}
                </TableHead>
              ))}
              {actions && <TableHead className="w-32 text-right">Действия</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {slice.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="text-center text-muted-foreground py-8">
                  Нет данных
                </TableCell>
              </TableRow>
            ) : (
              slice.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((c) => (
                    <TableCell key={c.key} className={cn(c.className)}>
                      {c.render ? c.render(row) : String((row as any)[c.key] ?? "")}
                    </TableCell>
                  ))}
                  {actions && <TableCell className="text-right">{actions(row)}</TableCell>}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {pages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Стр. {current + 1} из {pages} · всего {sorted.length}
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={current === 0} onClick={() => setPage(current - 1)}>
              Назад
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={current >= pages - 1}
              onClick={() => setPage(current + 1)}
            >
              Вперёд
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
