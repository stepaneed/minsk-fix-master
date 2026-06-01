
-- 1. Grant admin to user
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'stepan.9823762@yandex.ru'
ON CONFLICT (user_id, role) DO NOTHING;

-- 2. Add genitive title for proper grammar ("Ремонт стиральных машин")
ALTER TABLE public.service_types ADD COLUMN IF NOT EXISTS title_genitive text;

-- 3. Populate genitive forms for known service slugs
UPDATE public.service_types SET title_genitive = CASE slug
  WHEN 'washing-machines' THEN 'стиральных машин'
  WHEN 'refrigerators' THEN 'холодильников'
  WHEN 'dishwashers' THEN 'посудомоечных машин'
  WHEN 'electric-stoves' THEN 'электрических плит и духовок'
  WHEN 'gas-stoves' THEN 'газовых плит'
  WHEN 'microwaves' THEN 'микроволновых печей'
  WHEN 'coffee-machines' THEN 'кофемашин'
  WHEN 'air-conditioners' THEN 'кондиционеров'
  WHEN 'boilers' THEN 'бойлеров и водонагревателей'
  WHEN 'vacuum-cleaners' THEN 'пылесосов'
  WHEN 'small-appliances' THEN 'мелкой бытовой техники'
  WHEN 'ovens' THEN 'духовых шкафов'
  WHEN 'hoods' THEN 'вытяжек'
  WHEN 'tvs' THEN 'телевизоров'
  ELSE lower(title)
END
WHERE title_genitive IS NULL;

-- 4. Add logo crop mode to brands for auto-crop control
ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS logo_fit text DEFAULT 'contain';
-- 'contain' = fit inside (default), 'cover' = auto-crop to fill

-- 5. Replace failing clearbit URLs with Google s2 favicon API (universally reliable)
UPDATE public.brands
SET logo_url = 'https://www.google.com/s2/favicons?domain=' ||
  regexp_replace(logo_url, '^https?://logo\.clearbit\.com/', '') || '&sz=128'
WHERE logo_url LIKE '%logo.clearbit.com%';
