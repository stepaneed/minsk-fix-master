import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

export const Route = createFileRoute("/admin/extra-services")({
  head: () => ({ meta: [{ title: "Доп. услуги — Админка" }, { name: "robots", content: "noindex" }] }),
  component: ExtraServicesAdmin,
});

function ExtraServicesAdmin() {
  const qc = useQueryClient();
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin", "extra_services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("extra_services").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });
  const [activeKind, setActiveKind] = useState<string>("buyout");

  if (isLoading) return <p className="text-muted-foreground">Загрузка...</p>;
  const active = items.find((i: any) => i.kind === activeKind) ?? items[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Доп. услуги</h1>
        <p className="mt-1 text-sm text-muted-foreground">Выкуп, продажа восстановленной техники, продажа запчастей</p>
      </div>

      <Tabs value={activeKind} onValueChange={setActiveKind}>
        <TabsList>
          {items.map((i: any) => (
            <TabsTrigger key={i.kind} value={i.kind}>{i.title}</TabsTrigger>
          ))}
        </TabsList>
        {items.map((s: any) => (
          <TabsContent key={s.kind} value={s.kind} className="mt-6 space-y-6">
            <ServiceForm service={s} onSaved={() => qc.invalidateQueries({ queryKey: ["admin", "extra_services"] })} />
            {s.kind === "buyout" && <BuyoutSettings service={s} onSaved={() => qc.invalidateQueries({ queryKey: ["admin", "extra_services"] })} />}
          </TabsContent>
        ))}
      </Tabs>

      {active?.kind !== "buyout" && (
        <p className="text-sm text-muted-foreground">Управление товарами этой услуги → раздел «Товары».</p>
      )}
    </div>
  );
}

function ServiceForm({ service, onSaved }: { service: any; onSaved: () => void }) {
  const [v, setV] = useState(service);
  const save = async () => {
    const { error } = await supabase.from("extra_services").update({
      title: v.title,
      description: v.description,
      icon_url: v.icon_url,
      cover_url: v.cover_url,
      is_active: v.is_active,
      sort_order: Number(v.sort_order) || 0,
    }).eq("id", service.id);
    if (error) toast.error(error.message); else { toast.success("Сохранено"); onSaved(); }
  };
  return (
    <div className="space-y-4 rounded-xl border bg-card p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div><Label>Название</Label><Input className="mt-1" value={v.title ?? ""} onChange={(e) => setV({ ...v, title: e.target.value })} /></div>
        <div><Label>Порядок</Label><Input className="mt-1" type="number" value={v.sort_order ?? 0} onChange={(e) => setV({ ...v, sort_order: e.target.value })} /></div>
      </div>
      <div><Label>Описание</Label><Textarea className="mt-1" rows={3} value={v.description ?? ""} onChange={(e) => setV({ ...v, description: e.target.value })} /></div>
      <div className="grid gap-4 md:grid-cols-2">
        <div><Label>Иконка</Label><ImageUpload value={v.icon_url} onChange={(u) => setV({ ...v, icon_url: u })} /></div>
        <div><Label>Обложка</Label><ImageUpload value={v.cover_url} onChange={(u) => setV({ ...v, cover_url: u })} /></div>
      </div>
      <div className="flex items-center gap-2"><Switch checked={!!v.is_active} onCheckedChange={(c) => setV({ ...v, is_active: c })} /><Label>Активно</Label></div>
      <Button onClick={save}>Сохранить</Button>
    </div>
  );
}

function MapEditor({ title, value, onChange, placeholderK, placeholderV }: { title: string; value: Record<string, number>; onChange: (v: Record<string, number>) => void; placeholderK?: string; placeholderV?: string }) {
  const rows = Object.entries(value ?? {});
  const set = (next: Array<[string, number]>) => {
    const obj: Record<string, number> = {};
    for (const [k, v] of next) if (k.trim()) obj[k.trim()] = v;
    onChange(obj);
  };
  return (
    <div className="space-y-2 rounded-lg border bg-secondary/30 p-4">
      <Label className="text-sm font-semibold">{title}</Label>
      {rows.map(([k, val], i) => (
        <div key={i} className="flex gap-2">
          <Input value={k} placeholder={placeholderK} onChange={(e) => { const next = [...rows] as Array<[string, number]>; next[i] = [e.target.value, val]; set(next); }} className="flex-1" />
          <Input type="number" step="0.05" value={val} placeholder={placeholderV} onChange={(e) => { const next = [...rows] as Array<[string, number]>; next[i] = [k, Number(e.target.value)]; set(next); }} className="w-32" />
          <Button type="button" variant="ghost" size="icon" onClick={() => set(rows.filter((_, j) => j !== i) as Array<[string, number]>)}><X className="h-4 w-4" /></Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => set([...rows, ["", 1]] as Array<[string, number]>)}><Plus className="h-3 w-3" /> Добавить</Button>
    </div>
  );
}

function BuyoutSettings({ service, onSaved }: { service: any; onSaved: () => void }) {
  const [s, setS] = useState(() => ({
    base: service.settings?.base ?? {},
    age: service.settings?.age ?? {},
    condition: service.settings?.condition ?? {},
    brand_bonus: service.settings?.brand_bonus ?? {},
  }));
  const save = async () => {
    const { error } = await supabase.from("extra_services").update({ settings: s }).eq("id", service.id);
    if (error) toast.error(error.message); else { toast.success("Коэффициенты сохранены"); onSaved(); }
  };
  return (
    <div className="space-y-4 rounded-xl border bg-card p-5">
      <div>
        <h2 className="text-lg font-semibold">Коэффициенты калькулятора</h2>
        <p className="text-sm text-muted-foreground">Стоимость = база × возраст × состояние × бонус_бренда. В ключах используйте slug вида техники/бренда.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <MapEditor title="База (бел. руб. по виду техники)" value={s.base} onChange={(v) => setS({ ...s, base: v })} placeholderK="washing_machines" placeholderV="150" />
        <MapEditor title="Возраст (множитель)" value={s.age} onChange={(v) => setS({ ...s, age: v })} placeholderK="<3 / 3-7" placeholderV="0.7" />
        <MapEditor title="Состояние (множитель)" value={s.condition} onChange={(v) => setS({ ...s, condition: v })} placeholderK="working" placeholderV="1.0" />
        <MapEditor title="Бонус бренда" value={s.brand_bonus} onChange={(v) => setS({ ...s, brand_bonus: v })} placeholderK="bosch" placeholderV="1.1" />
      </div>
      <Button onClick={save}>Сохранить коэффициенты</Button>
    </div>
  );
}
