import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, Plus } from "lucide-react";

type Row = { k: string; v: string };

export function AttributesEditor({
  value,
  onChange,
}: {
  value: Record<string, unknown> | null | undefined;
  onChange: (v: Record<string, string>) => void;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    const entries = Object.entries(value ?? {});
    setRows(entries.length ? entries.map(([k, v]) => ({ k, v: String(v ?? "") })) : []);
  }, [value]);

  const sync = (next: Row[]) => {
    setRows(next);
    const obj: Record<string, string> = {};
    for (const r of next) {
      const k = r.k.trim();
      if (k) obj[k] = r.v;
    }
    onChange(obj);
  };

  return (
    <div className="space-y-2">
      <Label>Характеристики</Label>
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="flex gap-2">
            <Input
              value={r.k}
              placeholder="ключ (напр. бренд)"
              onChange={(e) => {
                const next = [...rows];
                next[i] = { ...next[i], k: e.target.value };
                sync(next);
              }}
              className="flex-1"
            />
            <Input
              value={r.v}
              placeholder="значение (напр. Bosch)"
              onChange={(e) => {
                const next = [...rows];
                next[i] = { ...next[i], v: e.target.value };
                sync(next);
              }}
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => sync(rows.filter((_, j) => j !== i))}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" size="sm" onClick={() => sync([...rows, { k: "", v: "" }])}>
        <Plus className="h-3.5 w-3.5" /> Добавить
      </Button>
    </div>
  );
}
