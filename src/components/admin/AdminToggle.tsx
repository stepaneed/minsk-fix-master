import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export function AdminToggle({
  table,
  id,
  value,
  onChange,
}: {
  table: string;
  id: string;
  value: boolean;
  onChange?: (v: boolean) => void;
}) {
  const [v, setV] = useState(value);
  const [loading, setLoading] = useState(false);
  const handle = async (next: boolean) => {
    setLoading(true);
    setV(next);
    const { error } = await supabase.from(table as any).update({ is_active: next }).eq("id", id);
    setLoading(false);
    if (error) {
      setV(!next);
      toast.error(error.message);
    } else {
      onChange?.(next);
      toast.success(next ? "Активно" : "Скрыто");
    }
  };
  return <Switch checked={v} onCheckedChange={handle} disabled={loading} />;
}
