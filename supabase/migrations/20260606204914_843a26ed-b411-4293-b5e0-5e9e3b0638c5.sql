
ALTER TABLE public.service_types ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'repair';
ALTER TABLE public.discounts ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_service_types_category ON public.service_types(category);

INSERT INTO public.service_types (slug, title, title_genitive, description, category, sort_order, is_active)
VALUES
  ('buyout', 'Выкуп техники', 'выкупа техники', 'Выкупаем бытовую технику в любом состоянии', 'service', 100, true),
  ('refurbished', 'Продажа восстановленной техники', 'продажи восстановленной техники', 'Восстановленная техника с гарантией', 'service', 110, true),
  ('parts', 'Продажа запчастей', 'продажи запчастей', 'Оригинальные и совместимые запчасти в наличии', 'service', 120, true)
ON CONFLICT (slug) DO NOTHING;
