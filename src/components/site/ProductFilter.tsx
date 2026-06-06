import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

export type Product = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  price: number | null;
  old_price: number | null;
  attributes: Record<string, unknown>;
  product_images?: { url: string; role: string; sort_order: number }[];
};

type Selection = Record<string, string[]>;

function attrToString(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (v === null || v === undefined || v === "") return [];
  return [String(v)];
}

export function buildFilterOptions(products: Product[], selected: Selection) {
  const matches = (p: Product, excludeKey?: string) =>
    Object.entries(selected).every(([k, vals]) => {
      if (k === excludeKey || vals.length === 0) return true;
      const pv = attrToString(p.attributes?.[k]);
      return vals.some((v) => pv.includes(v));
    });
  const keyValues: Record<string, Set<string>> = {};
  for (const p of products) {
    for (const k of Object.keys(p.attributes || {})) {
      if (!keyValues[k]) keyValues[k] = new Set();
    }
  }
  // Available values per key (counting matches excluding own selection)
  const availableMap: Record<string, Map<string, number>> = {};
  for (const k of Object.keys(keyValues)) {
    const map = new Map<string, number>();
    for (const p of products) {
      if (!matches(p, k)) continue;
      for (const v of attrToString(p.attributes?.[k])) {
        map.set(v, (map.get(v) ?? 0) + 1);
      }
    }
    availableMap[k] = map;
  }
  return availableMap;
}

export function filterProducts(products: Product[], selected: Selection) {
  return products.filter((p) =>
    Object.entries(selected).every(([k, vals]) => {
      if (vals.length === 0) return true;
      const pv = attrToString(p.attributes?.[k]);
      return vals.some((v) => pv.includes(v));
    }),
  );
}

export function ProductFilter({
  products,
  selected,
  onChange,
}: {
  products: Product[];
  selected: Selection;
  onChange: (s: Selection) => void;
}) {
  const available = useMemo(() => buildFilterOptions(products, selected), [products, selected]);
  const keys = Object.keys(available).sort();
  if (keys.length === 0) return null;
  const toggle = (k: string, v: string) => {
    const cur = selected[k] ?? [];
    const next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
    onChange({ ...selected, [k]: next });
  };
  return (
    <aside className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Фильтр</h3>
        {Object.values(selected).some((a) => a.length > 0) && (
          <Button size="sm" variant="ghost" onClick={() => onChange({})}>Сбросить</Button>
        )}
      </div>
      {keys.map((k) => {
        const values = Array.from(available[k].entries()).sort((a, b) => a[0].localeCompare(b[0], "ru"));
        if (values.length === 0) return null;
        return (
          <div key={k}>
            <div className="mb-2 text-sm font-medium capitalize">{k}</div>
            <div className="space-y-1.5">
              {values.map(([v, count]) => {
                const id = `f-${k}-${v}`;
                const checked = (selected[k] ?? []).includes(v);
                return (
                  <div key={v} className="flex items-center gap-2 text-sm">
                    <Checkbox id={id} checked={checked} onCheckedChange={() => toggle(k, v)} />
                    <Label htmlFor={id} className="flex-1 cursor-pointer font-normal">{v}</Label>
                    <span className="text-xs text-muted-foreground">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </aside>
  );
}
