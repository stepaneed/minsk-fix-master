ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;
ALTER TABLE public.discounts ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_promotions_sort ON public.promotions(sort_order);
CREATE INDEX IF NOT EXISTS idx_discounts_sort ON public.discounts(sort_order);