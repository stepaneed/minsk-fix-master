import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { submitOrder } from "@/lib/orders.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const schema = z.object({
  type_id: z.string().uuid().optional().or(z.literal("")),
  name: z.string().trim().min(2, "Введите имя").max(100),
  phone: z.string().trim().min(5, "Введите телефон").max(30),
  address: z.string().max(300).optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  description: z.string().max(2000).optional(),
  consent: z.literal(true, { message: "Требуется согласие" }),
});
type FormData = z.infer<typeof schema>;

function useMinskHours() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      // Europe/Minsk = UTC+3 fixed
      const minskH = (now.getUTCHours() + 3) % 24;
      setOpen(minskH >= 9 && minskH < 18);
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);
  return open;
}

export function OrderForm({ defaultTypeId, compact }: { defaultTypeId?: string; compact?: boolean }) {
  const open = useMinskHours();
  const submit = useServerFn(submitOrder);
  const { data: types = [] } = useQuery({
    queryKey: ["service_types_active"],
    queryFn: async () => {
      const { data } = await supabase
        .from("service_types")
        .select("id,title,slug")
        .eq("is_active", true)
        .order("sort_order");
      return data ?? [];
    },
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type_id: defaultTypeId ?? "", name: "", phone: "", address: "", date: "", time: "", description: "" },
  });

  useEffect(() => {
    if (defaultTypeId) form.setValue("type_id", defaultTypeId);
  }, [defaultTypeId, form]);

  const onSubmit = async (v: FormData) => {
    try {
      await submit({ data: { ...v, type_id: v.type_id || null } });
      toast.success("Заявка отправлена! Перезвоним в течение 15 минут.");
      form.reset({ type_id: defaultTypeId ?? "", name: "", phone: "", address: "", date: "", time: "", description: "" });
    } catch (e) {
      toast.error("Не удалось отправить. Попробуйте ещё раз.");
    }
  };

  return (
    <div id="order" className="rounded-2xl border bg-card p-6 shadow-sm md:p-8">
      <div className="mb-4 flex items-center gap-2 text-sm">
        <span className={`pulse-dot inline-block h-2.5 w-2.5 rounded-full ${open ? "bg-[color:var(--success)]" : "bg-[color:var(--warning)]"}`} />
        <span className="text-muted-foreground">
          {open ? "Мастер на связи · принимаем заявки" : "Сейчас нерабочее время — оставьте заявку, перезвоним с 9:00"}
        </span>
      </div>
      <h2 className="text-2xl font-semibold tracking-tight">Оставьте заявку</h2>
      <p className="mt-1 text-sm text-muted-foreground">Бесплатный выезд · Гарантия до 12 мес · Оплата после ремонта</p>

      <form onSubmit={form.handleSubmit(onSubmit)} className={`mt-6 grid gap-4 ${compact ? "" : "md:grid-cols-2"}`}>
        <div className={compact ? "" : "md:col-span-2"}>
          <Label>Вид техники</Label>
          <select
            className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            {...form.register("type_id")}
          >
            <option value="">— Выберите —</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>Имя *</Label>
          <Input className="mt-1" {...form.register("name")} placeholder="Иван" />
          {form.formState.errors.name && <p className="mt-1 text-xs text-destructive">{form.formState.errors.name.message}</p>}
        </div>
        <div>
          <Label>Телефон *</Label>
          <Input className="mt-1" type="tel" {...form.register("phone")} placeholder="+375 29 ..." />
          {form.formState.errors.phone && <p className="mt-1 text-xs text-destructive">{form.formState.errors.phone.message}</p>}
        </div>
        <div className={compact ? "" : "md:col-span-2"}>
          <Label>Адрес</Label>
          <Input className="mt-1" {...form.register("address")} placeholder="ул. Независимости, 1" />
        </div>
        <div>
          <Label>Дата</Label>
          <Input className="mt-1" type="date" {...form.register("date")} />
        </div>
        <div>
          <Label>Время</Label>
          <Input className="mt-1" type="time" {...form.register("time")} />
        </div>
        <div className={compact ? "" : "md:col-span-2"}>
          <Label>Описание неисправности</Label>
          <Textarea className="mt-1" rows={3} {...form.register("description")} placeholder="Опишите проблему..." />
        </div>
        <div className={`flex items-start gap-2 ${compact ? "" : "md:col-span-2"}`}>
          <Checkbox id="consent" onCheckedChange={(c) => form.setValue("consent", c === true ? true : (false as never))} />
          <label htmlFor="consent" className="text-xs text-muted-foreground">
            Согласен с обработкой персональных данных
          </label>
        </div>
        {form.formState.errors.consent && <p className="text-xs text-destructive">{form.formState.errors.consent.message}</p>}
        <div className={compact ? "" : "md:col-span-2"}>
          <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Отправка..." : "Оформить заказ"}
          </Button>
        </div>
      </form>
    </div>
  );
}
