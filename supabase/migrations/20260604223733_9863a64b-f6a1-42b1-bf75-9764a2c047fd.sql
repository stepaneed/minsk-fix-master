
ALTER TABLE public.service_types ADD COLUMN IF NOT EXISTS cover_url text;

INSERT INTO public.settings (key, value) VALUES
  ('services_show_icon', 'true'::jsonb),
  ('services_show_cover', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.service_types (slug, title, title_genitive, description, sort_order, is_active)
VALUES
  ('cooktops', 'Варочные панели', 'варочных панелей', 'Ремонт варочных панелей всех типов на дому', 7, true),
  ('air-conditioners', 'Кондиционеры', 'кондиционеров', 'Ремонт и обслуживание кондиционеров', 8, true),
  ('dryers', 'Сушильные машины', 'сушильных машин', 'Ремонт сушильных машин на дому', 9, true),
  ('coffee-machines', 'Кофемашины', 'кофемашин', 'Ремонт кофемашин любых брендов', 10, true)
ON CONFLICT (slug) DO NOTHING;
