ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS hola_maps_external_spot_id TEXT,
  ADD COLUMN IF NOT EXISTS hola_maps_public_url TEXT;

CREATE INDEX IF NOT EXISTS idx_submissions_hola_maps_external_spot_id
  ON submissions(hola_maps_external_spot_id)
  WHERE hola_maps_external_spot_id IS NOT NULL;
