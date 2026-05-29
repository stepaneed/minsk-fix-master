
INSERT INTO storage.buckets (id, name, public) VALUES ('admin-images', 'admin-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read admin-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'admin-images');

CREATE POLICY "Authenticated upload admin-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'admin-images');

CREATE POLICY "Authenticated update admin-images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'admin-images');

CREATE POLICY "Authenticated delete admin-images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'admin-images');
