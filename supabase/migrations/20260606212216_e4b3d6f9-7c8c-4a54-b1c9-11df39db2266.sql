
-- Clean previously seeded "service" rows from service_types (moved to extra_services)
DELETE FROM public.service_types WHERE category = 'service' AND slug IN ('buyout','refurbished','parts');

-- ============ extra_services ============
CREATE TABLE public.extra_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('buyout','refurbished','parts')),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  icon_url text,
  cover_url text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX extra_services_kind_unique ON public.extra_services(kind);

GRANT SELECT ON public.extra_services TO anon, authenticated;
GRANT ALL ON public.extra_services TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.extra_services TO authenticated;

ALTER TABLE public.extra_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read extra_services" ON public.extra_services FOR SELECT USING (true);
CREATE POLICY "Admin write extra_services" ON public.extra_services FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============ products ============
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES public.extra_services(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  description text,
  price numeric(12,2),
  old_price numeric(12,2),
  stock integer,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  attributes jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (service_id, slug)
);
CREATE INDEX products_service_idx ON public.products(service_id);
CREATE INDEX products_attributes_gin ON public.products USING GIN (attributes);

GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admin write products" ON public.products FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============ product_images ============
CREATE TABLE public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url text NOT NULL,
  role text NOT NULL DEFAULT 'other' CHECK (role IN ('main','top','left','right','other')),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX product_images_product_idx ON public.product_images(product_id);

GRANT SELECT ON public.product_images TO anon, authenticated;
GRANT ALL ON public.product_images TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.product_images TO authenticated;

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read product_images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Admin write product_images" ON public.product_images FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============ orders: extra service / product refs ============
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS extra_service_id uuid REFERENCES public.extra_services(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES public.products(id) ON DELETE SET NULL;

-- ============ updated_at triggers ============
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER extra_services_touch BEFORE UPDATE ON public.extra_services
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER products_touch BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ Seed extra services ============
INSERT INTO public.extra_services (kind, slug, title, description, sort_order, settings) VALUES
('buyout','buyout','Выкуп техники','Выкупаем бытовую технику любого состояния. Оценка за 5 минут.',1,
 '{
   "base":{"washing_machines":150,"refrigerators":250,"dishwashers":180,"ovens":140,"cooktops":120,"dryers":160,"microwaves":60,"tv":120,"coffee_machines":140,"air_conditioners":200},
   "age":{"<3":1.0,"3-7":0.7,"7-12":0.4,">12":0.2},
   "condition":{"working":1.0,"minor":0.7,"broken":0.4},
   "brand_bonus":{"bosch":1.1,"miele":1.25,"siemens":1.1,"lg":1.05,"samsung":1.05}
 }'::jsonb),
('refurbished','refurbished','Продажа восстановленной техники','Восстановленная техника с гарантией по выгодной цене.',2,'{}'::jsonb),
('parts','parts','Продажа запчастей','Оригинальные и аналоговые запчасти в наличии.',3,'{}'::jsonb);
