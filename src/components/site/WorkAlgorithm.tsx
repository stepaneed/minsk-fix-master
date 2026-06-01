import { ArrowRight, PhoneCall, Search, Wrench, Wallet } from "lucide-react";

const steps = [
  { icon: PhoneCall, title: "Заявка", text: "Оставьте заявку или позвоните" },
  { icon: Search, title: "Диагностика", text: "Бесплатно выявим причину" },
  { icon: Wrench, title: "Ремонт", text: "Устраним неисправность на месте" },
  { icon: Wallet, title: "Оплата", text: "После выполнения работ" },
];

export function WorkAlgorithm() {
  return (
    <section className="bg-secondary py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-3xl font-semibold tracking-tight">Как мы работаем</h2>
        <div className="mt-10 grid auto-rows-fr grid-cols-1 gap-6 md:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.title} className="relative h-full">
              <div className="flex h-full flex-col rounded-2xl bg-background p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <s.icon className="h-6 w-6" />
                </div>
                <div className="mt-4 text-sm font-medium text-muted-foreground">Шаг {i + 1}</div>
                <div className="mt-1 text-lg font-semibold">{s.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.text}</div>
              </div>
              {i < steps.length - 1 && (
                <ArrowRight className="absolute -right-4 top-1/2 hidden h-6 w-6 -translate-y-1/2 text-muted-foreground md:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
