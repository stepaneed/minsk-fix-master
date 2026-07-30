ALTER TABLE public.prices
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'repair',
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

ALTER TABLE public.prices DROP CONSTRAINT IF EXISTS prices_kind_check;
ALTER TABLE public.prices ADD CONSTRAINT prices_kind_check CHECK (kind IN ('service','repair'));

CREATE TABLE IF NOT EXISTS public.media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  content_type text NOT NULL DEFAULT 'image/jpeg',
  size integer NOT NULL DEFAULT 0,
  data text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.media TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media TO authenticated;
GRANT ALL ON public.media TO service_role;

ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read media" ON public.media FOR SELECT USING (true);
CREATE POLICY "Admin write media" ON public.media FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER media_touch_updated_at BEFORE UPDATE ON public.media
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();