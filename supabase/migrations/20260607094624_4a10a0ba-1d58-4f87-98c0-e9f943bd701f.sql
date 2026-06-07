ALTER TABLE public.discounts ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS image_url text;