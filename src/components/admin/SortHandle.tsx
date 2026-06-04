import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ArrowDown, ArrowUp } from "lucide-react";
import { toast } from "sonner";

export function SortHandle({
  table,
  rows,
  index,
  onReorder,
}: {
  table: string;
  rows: { id: string; sort_order: number }[];
  index: number;
  onReorder: () => void;
}) {
  const move = async (dir: -1 | 1) => {
    const a = rows[index];
    const b = rows[index + dir];
    if (!a || !b) return;
    // Two-step swap with temporary sentinel to avoid the unique-constraint and to
    // sidestep upsert (which fails on NOT NULL columns like "slug" by attempting INSERT).
    const tmp = -1 - Date.now() % 100000;
    const r1 = await supabase.from(table as any).update({ sort_order: tmp }).eq("id", a.id);
    if (r1.error) return toast.error(r1.error.message);
    const r2 = await supabase.from(table as any).update({ sort_order: a.sort_order }).eq("id", b.id);
    if (r2.error) return toast.error(r2.error.message);
    const r3 = await supabase.from(table as any).update({ sort_order: b.sort_order }).eq("id", a.id);
    if (r3.error) return toast.error(r3.error.message);
    onReorder();
  };
  return (
    <div className="flex flex-col">
      <Button size="icon" variant="ghost" className="h-5 w-5" disabled={index === 0} onClick={() => move(-1)}>
        <ArrowUp className="h-3 w-3" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="h-5 w-5"
        disabled={index === rows.length - 1}
        onClick={() => move(1)}
      >
        <ArrowDown className="h-3 w-3" />
      </Button>
    </div>
  );
}
