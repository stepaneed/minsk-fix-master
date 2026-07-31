import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PriceValue } from "@/components/ui/currency-icon";

const AGE_OPTIONS = [
  { value: "<3", label: "до 3 лет" },
  { value: "3-7", label: "3–7 лет" },
  { value: "7-12", label: "7–12 лет" },
  { value: ">12", label: "более 12 лет" },
];
const CONDITION_OPTIONS = [
  { value: "working", label: "Полностью рабочая" },
  { value: "minor", label: "Незначительные неисправности" },
  { value: "broken", label: "Не работает / на запчасти" },
];

export function BuyoutCalculator({ settings }: { settings: any }) {
  const { data: types = [] } = useQuery({
    queryKey: ["service_types_repair"],
    queryFn: async () => {
      const { data } = await supabase
        .from("service_types")
        .select("slug,title")
        .eq("is_active", true)
        .order("sort_order");
      return data ?? [];
    },
  });
  const { data: brands = [] } = useQuery({
    queryKey: ["brands_active"],
    queryFn: async () => {
      const { data } = await supabase
        .from("brands")
        .select("slug,title")
        .eq("is_active", true)
        .order("sort_order");
      return data ?? [];
    },
  });

  const [typeSlug, setTypeSlug] = useState<string>("");
  const [brandSlug, setBrandSlug] = useState<string>("");
  const [age, setAge] = useState<string>("3-7");
  const [condition, setCondition] = useState<string>("working");

  const cfg = settings || {};
  const base = cfg.base ?? {};
  const ageMul = cfg.age ?? {};
  const condMul = cfg.condition ?? {};
  const brandBonus = cfg.brand_bonus ?? {};

  const estimate = useMemo(() => {
    if (!typeSlug) return null;
    const b = Number(base[typeSlug] ?? 100);
    const a = Number(ageMul[age] ?? 0.5);
    const c = Number(condMul[condition] ?? 0.5);
    const br = brandSlug ? Number(brandBonus[brandSlug] ?? 1) : 1;
    const val = b * a * c * br;
    const low = Math.round(val * 0.85);
    const high = Math.round(val * 1.15);
    return { low, high };
  }, [typeSlug, brandSlug, age, condition, base, ageMul, condMul, brandBonus]);

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm md:p-8">
      <h2 className="text-2xl font-semibold tracking-tight">Калькулятор оценки</h2>
      <p className="mt-1 text-sm text-muted-foreground">Узнайте примерную стоимость выкупа за минуту.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <Label>Вид техники</Label>
          <Select value={typeSlug} onValueChange={setTypeSlug}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Выберите..." /></SelectTrigger>
            <SelectContent>
              {types.map((t: any) => <SelectItem key={t.slug} value={t.slug}>{t.title}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Бренд</Label>
          <Select value={brandSlug} onValueChange={setBrandSlug}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Не выбран" /></SelectTrigger>
            <SelectContent>
              {brands.map((b: any) => <SelectItem key={b.slug} value={b.slug}>{b.title}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Возраст</Label>
          <Select value={age} onValueChange={setAge}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {AGE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Состояние</Label>
          <Select value={condition} onValueChange={setCondition}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CONDITION_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6 rounded-xl border bg-secondary p-5">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">Ориентировочная цена выкупа</div>
        <div className="mt-1 text-3xl font-semibold">
          {estimate ? <PriceValue>{estimate.low}–{estimate.high}</PriceValue> : "—"}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Финальная цена определяется после осмотра.</p>
      </div>

      <Button
        size="lg"
        className="mt-5 w-full"
        onClick={() => document.getElementById("order")?.scrollIntoView({ behavior: "smooth" })}
      >
        Оставить заявку на выкуп
      </Button>

      <div className="mt-4">
        <Input
          type="tel"
          placeholder="Ваш телефон — перезвоним"
          onKeyDown={(e) => { if (e.key === "Enter") document.getElementById("order")?.scrollIntoView({ behavior: "smooth" }); }}
        />
      </div>
    </div>
  );
}
