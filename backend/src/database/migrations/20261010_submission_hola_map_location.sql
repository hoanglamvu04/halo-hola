ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS hola_map_place_id VARCHAR(160),
  ADD COLUMN IF NOT EXISTS hola_map_place_slug VARCHAR(180),
  ADD COLUMN IF NOT EXISTS location_lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS location_lng DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS location_address TEXT,
  ADD COLUMN IF NOT EXISTS location_source VARCHAR(30) NOT NULL DEFAULT 'TEXT';

CREATE INDEX IF NOT EXISTS idx_submissions_hola_map_place_id
  ON submissions(hola_map_place_id);

CREATE INDEX IF NOT EXISTS idx_submissions_location_coords
  ON submissions(location_lat, location_lng);
