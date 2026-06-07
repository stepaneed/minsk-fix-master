import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Returns the configured veil opacity (0..1) for promo/discount card cover images. */
export function usePromoOverlay(): number {
  const { data } = useQuery({
    queryKey: ["setting", "promo_overlay_opacity"],
    queryFn: async () => {
      const { data } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "promo_overlay_opacity")
        .maybeSingle();
      return data?.value ?? null;
    },
    staleTime: 60_000,
  });

  // Accept number, numeric string, or { value: number }
  let raw: any = data;
  if (raw && typeof raw === "object" && "value" in raw) raw = raw.value;
  const n = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw) : NaN;
  const pct = Number.isFinite(n) ? n : 35; // default 35%
  return Math.max(0, Math.min(100, pct)) / 100;
}
