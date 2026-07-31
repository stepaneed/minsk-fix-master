import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { estimatePrice } from "@/lib/api/price-estimate.functions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Wrench, Loader2 } from "lucide-react";
import { OrderModal } from "@/components/site/OrderModal";
import { toast } from "sonner";
import { PriceValue } from "@/components/ui/currency-icon";

export function PriceCalculator() {
  const [typeId, setTypeId] = useState<string>("");
  const [brand, setBrand] = useState<string>("");
  const [problem, setProblem] = useState<string>("");
  const [orderOpen, setOrderOpen] = useState(false);

  const { data: types = [] } = useQuery({
    queryKey: ["calc_service_types"],
    queryFn: async () => {
      const { data } = await supabase
        .from("service_types")
        .select("id,title,slug")
        .eq("is_active", true)
        .eq("category", "repair")
        .order("sort_order");
      return data ?? [];
    },
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["calc_brands"],
    queryFn: async () => {
      const { data } = await supabase
        .from("brands")
        .select("id,title,slug")
        .eq("is_active", true)
        .order("sort_order");
      return data ?? [];
    },
  });

  const { data: prices = [] } = useQuery({
    queryKey: ["calc_prices", typeId],
    enabled: !!typeId,
    queryFn: async () => {
      const { data } = await supabase
        .from("prices")
        .select("title,price_from,price_to")
        .eq("service_type_id", typeId)
        .eq("is_active", true);
      return data ?? [];
    },
  });

  const currentType = useMemo(() => types.find((t) => t.id === typeId), [types, typeId]);

  const estimateFn = useServerFn(estimatePrice);
  const mutation = useMutation({
    mutationFn: async () => {
      return estimateFn({
        data: {
          applianceType: currentType?.title ?? "",
          brand,
          problem,
          priceContext: prices.map((p: any) => ({
            title: p.title,
            price_from: p.price_from == null ? null : Number(p.price_from),
            price_to: p.price_to == null ? null : Number(p.price_to),
          })),
        },
      });
    },
    onError: (e: any) => {
      toast.error(e?.message || "Не удалось рассчитать стоимость");
    },
  });

  const canSubmit = typeId && problem.trim().length >= 5 && !mutation.isPending;

  return (
    <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Калькулятор стоимости ремонта</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Опишите проблему — ИИ прикинет ориентировочную стоимость работ на основе прейскуранта.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <Label>Вид техники *</Label>
          <select
            value={typeId}
            onChange={(e) => setTypeId(e.target.value)}
            className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Выберите…</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>Бренд</Label>
          <input
            list="calc-brands"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="напр. Bosch"
            className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
          <datalist id="calc-brands">
            {brands.map((b) => <option key={b.id} value={b.title} />)}
          </datalist>
        </div>
      </div>

      <div className="mt-4">
        <Label>Описание проблемы *</Label>
        <Textarea
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          rows={4}
          maxLength={1500}
          placeholder="Например: стиральная машина не сливает воду и гудит при отжиме"
          className="mt-1.5"
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          disabled={!canSubmit}
          onClick={() => mutation.mutate()}
          className="min-w-[180px]"
        >
          {mutation.isPending ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Считаем…</>
          ) : (
            <>Рассчитать стоимость</>
          )}
        </Button>
        <p className="text-xs text-muted-foreground">
          Оценка ориентировочная. Точную цену мастер называет после диагностики.
        </p>
      </div>

      {mutation.data && (
        <div className="mt-6 rounded-xl border bg-secondary/40 p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Ориентировочная стоимость работ</div>
              <div className="mt-1 text-3xl font-semibold text-primary">
                {mutation.data.min === mutation.data.max
                  ? <PriceValue>{mutation.data.min}</PriceValue>
                  : <PriceValue>{mutation.data.min} – {mutation.data.max}</PriceValue>}
              </div>
            </div>
            <Button onClick={() => setOrderOpen(true)}>
              <Wrench className="mr-2 h-4 w-4" /> Вызвать мастера
            </Button>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2 text-sm">
            <div>
              <div className="text-xs font-medium text-muted-foreground">Вероятная причина</div>
              <p className="mt-1">{mutation.data.likely_issue}</p>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground">Возможные работы</div>
              <ul className="mt-1 list-disc pl-4 space-y-0.5">
                {mutation.data.works.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          </div>
          {mutation.data.note && (
            <p className="mt-4 text-xs text-muted-foreground border-t pt-3">{mutation.data.note}</p>
          )}
        </div>
      )}

      <OrderModal
        open={orderOpen}
        onOpenChange={setOrderOpen}
        defaultTypeId={typeId || undefined}
      />
    </div>
  );
}
