ALTER TABLE photographer_shoots
  ADD COLUMN IF NOT EXISTS drive_url TEXT;

CREATE INDEX IF NOT EXISTS idx_photographer_shoots_drive_url
  ON photographer_shoots ((drive_url IS NOT NULL));
