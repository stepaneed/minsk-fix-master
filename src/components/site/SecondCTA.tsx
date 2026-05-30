import { useState } from "react";
import { Button } from "@/components/ui/button";
import { OrderModal } from "@/components/site/OrderModal";

export function SecondCTA({
  title = "Нужна помощь мастера?",
  subtitle = "Оставьте заявку — перезвоним в течение 15 минут",
}: {
  title?: string;
  subtitle?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <section className="bg-secondary py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center md:flex-row md:justify-between md:text-left">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h2>
          <p className="mt-1 text-muted-foreground">{subtitle}</p>
        </div>
        <Button size="lg" onClick={() => setOpen(true)}>Оформить заказ</Button>
      </div>
      <OrderModal open={open} onOpenChange={setOpen} />
    </section>
  );
}
