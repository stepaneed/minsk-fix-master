import { useMemo, useState } from "react";

type Img = { id: string; url: string; role: string; sort_order: number };

const ROLE_ORDER: Record<string, number> = { main: 0, top: 1, left: 2, right: 3, other: 4 };

export function ProductGallery({ images, title }: { images: Img[]; title: string }) {
  const sorted = useMemo(
    () => [...images].sort((a, b) => (ROLE_ORDER[a.role] ?? 9) - (ROLE_ORDER[b.role] ?? 9) || a.sort_order - b.sort_order),
    [images],
  );
  const [active, setActive] = useState(0);
  if (sorted.length === 0) {
    return <div className="aspect-square w-full rounded-2xl bg-secondary" />;
  }
  return (
    <div className="space-y-3">
      <div className="aspect-square w-full overflow-hidden rounded-2xl border bg-secondary">
        <img src={sorted[active].url} alt={title} className="h-full w-full object-contain" />
      </div>
      {sorted.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {sorted.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={`aspect-square overflow-hidden rounded-lg border transition ${i === active ? "border-primary ring-2 ring-primary" : "border-border hover:border-primary"}`}
            >
              <img src={img.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
