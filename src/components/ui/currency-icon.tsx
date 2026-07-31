import { cn } from "@/lib/utils";

export function CurrencyIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-label="белорусский рубль"
      role="img"
      className={cn("inline-block h-[0.88em] w-[0.88em] shrink-0", className)}
    >
      <path
        d="M7 3.25h10.5v2.6H10.1v4.05h3.65c4.15 0 6.75 2.08 6.75 5.45 0 3.45-2.68 5.4-7 5.4H7v-6.1H3.5v-2.55H7V3.25Zm3.1 9.2v5.7h3.25c2.55 0 3.95-.9 3.95-2.82 0-1.9-1.42-2.88-3.95-2.88H10.1Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function PriceValue({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-baseline gap-[0.14em]", className)}>{children}<CurrencyIcon /></span>;
}