
-- 1. has_role: switch to SECURITY INVOKER (user_roles has "Users read own roles" policy, so still works for auth.uid())
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- 2. touch_updated_at: SECURITY INVOKER
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- 3. Storage: admin-images — drop broad policies, restrict writes to admins.
DROP POLICY IF EXISTS "Public read admin-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload admin-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update admin-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete admin-images" ON storage.objects;

CREATE POLICY "Admin upload admin-images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'admin-images' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admin update admin-images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'admin-images' AND public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (bucket_id = 'admin-images' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admin delete admin-images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'admin-images' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- 4. Settings: whitelist public-readable keys
DROP POLICY IF EXISTS "Public read settings" ON public.settings;
CREATE POLICY "Public read safe settings" ON public.settings
FOR SELECT TO anon, authenticated
USING (key IN ('contacts', 'services_show_icon', 'services_show_cover', 'promo_overlay_opacity'));

-- 5. Orders: tighten public INSERT with a WITH CHECK constraint set
DROP POLICY IF EXISTS "Public insert orders" ON public.orders;
CREATE POLICY "Public insert orders" ON public.orders
FOR INSERT TO anon, authenticated
WITH CHECK (
  char_length(name) BETWEEN 2 AND 100
  AND char_length(phone) BETWEEN 5 AND 30
  AND phone ~ '^[+0-9 ()\-]+$'
  AND (address IS NULL OR char_length(address) <= 300)
  AND (description IS NULL OR char_length(description) <= 2000)
);
