import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Настройки — Админка" }, { name: "robots", content: "noindex" }] }),
  component: SettingsPage,
});

function PromoOverlayControl() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin", "setting", "promo_overlay_opacity"],
    queryFn: async () => {
      const { data } = await supabase.from("settings").select("value").eq("key", "promo_overlay_opacity").maybeSingle();
      let raw: any = data?.value;
      if (raw && typeof raw === "object" && "value" in raw) raw = raw.value;
      const n = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw) : NaN;
      return Number.isFinite(n) ? n : 35;
    },
  });
  const [val, setVal] = useState<number>(35);
  useEffect(() => {
    if (typeof data === "number") setVal(data);
  }, [data]);

  const save = async (n: number) => {
    const { error } = await supabase.from("settings").upsert({ key: "promo_overlay_opacity", value: n });
    if (error) toast.error(error.message);
    else {
      toast.success("Сохранено");
      qc.invalidateQueries({ queryKey: ["admin", "setting", "promo_overlay_opacity"] });
      qc.invalidateQueries({ queryKey: ["setting", "promo_overlay_opacity"] });
    }
  };

  return (
    <div className="rounded-lg border border-border bg-background p-4 space-y-3">
      <div>
        <Label>Пелена на изображениях акций и скидок</Label>
        <p className="text-xs text-muted-foreground mt-1">
          Контрастность фоновых изображений в карточках акций и скидок. 0% — изображение без пелены, 100% — полностью скрыто.
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Slider
          value={[val]}
          min={0}
          max={100}
          step={5}
          onValueChange={(v) => setVal(v[0] ?? 0)}
          className="flex-1"
        />
        <div className="w-14 text-right text-sm font-mono">{val}%</div>
        <Button size="sm" onClick={() => save(val)}>Сохранить</Button>
      </div>
    </div>
  );
}

function SettingsPage() {
  const qc = useQueryClient();
  const { data: settings = [] } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("settings").select("*").order("key");
      if (error) throw error;
      return data || [];
    },
  });

  const [rows, setRows] = useState<{ key: string; value: string }[]>([]);
  const [newKey, setNewKey] = useState("");

  useEffect(() => {
    setRows(
      settings.map((s: any) => ({
        key: s.key,
        value: typeof s.value === "string" ? s.value : JSON.stringify(s.value ?? "", null, 2),
      })),
    );
  }, [settings]);

  const save = async (key: string, value: string) => {
    let parsed: any = value;
    try {
      parsed = JSON.parse(value);
    } catch {
      /* keep as string */
    }
    const { error } = await supabase.from("settings").upsert({ key, value: parsed });
    if (error) toast.error(error.message);
    else {
      toast.success("Сохранено");
      qc.invalidateQueries({ queryKey: ["admin", "settings"] });
    }
  };

  const remove = async (key: string) => {
    if (!confirm(`Удалить настройку "${key}"?`)) return;
    const { error } = await supabase.from("settings").delete().eq("key", key);
    if (error) toast.error(error.message);
    else {
      toast.success("Удалено");
      qc.invalidateQueries({ queryKey: ["admin", "settings"] });
    }
  };

  const add = async () => {
    if (!newKey.trim()) return;
    const { error } = await supabase.from("settings").insert({ key: newKey.trim(), value: "" });
    if (error) toast.error(error.message);
    else {
      toast.success("Добавлено");
      setNewKey("");
      qc.invalidateQueries({ queryKey: ["admin", "settings"] });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Настройки</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Произвольные ключ-значения. Значение может быть строкой или JSON.
        </p>
      </div>

      <div className="flex gap-2 items-end">
        <div className="flex-1 max-w-sm">
          <Label htmlFor="new-key">Новый ключ</Label>
          <Input
            id="new-key"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="напр. telegram_chat_id"
          />
        </div>
        <Button onClick={add}>
          <Plus className="h-4 w-4" /> Добавить
        </Button>
      </div>

      <div className="space-y-4">
        {rows.map((r, i) => (
          <div key={r.key} className="border border-border rounded-lg p-4 bg-background space-y-2">
            <div className="flex items-center justify-between">
              <code className="text-sm font-semibold">{r.key}</code>
              <Button
                size="icon"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => remove(r.key)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              value={r.value}
              onChange={(e) => {
                const copy = [...rows];
                copy[i] = { ...r, value: e.target.value };
                setRows(copy);
              }}
              rows={3}
              className="font-mono text-sm"
            />
            <Button size="sm" onClick={() => save(r.key, r.value)}>
              Сохранить
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
