CREATE TABLE public.error_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type_id uuid REFERENCES public.service_types(id) ON DELETE CASCADE,
  brand_id uuid REFERENCES public.brands(id) ON DELETE CASCADE,
  code text NOT NULL,
  meaning text NOT NULL,
  cause text,
  solution text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.error_codes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.error_codes TO authenticated;
GRANT ALL ON public.error_codes TO service_role;

ALTER TABLE public.error_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read error_codes" ON public.error_codes FOR SELECT USING (true);
CREATE POLICY "Admin write error_codes" ON public.error_codes FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER error_codes_touch BEFORE UPDATE ON public.error_codes
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX error_codes_type_brand_idx ON public.error_codes (service_type_id, brand_id, sort_order);