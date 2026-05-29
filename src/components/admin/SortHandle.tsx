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
    const { error } = await supabase.from(table as any).upsert([
      { id: a.id, sort_order: b.sort_order },
      { id: b.id, sort_order: a.sort_order },
    ] as any);
    if (error) toast.error(error.message);
    else onReorder();
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
