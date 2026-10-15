CREATE TABLE IF NOT EXISTS submission_media_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id UUID NOT NULL REFERENCES submission_media(id) ON DELETE CASCADE,
  width INTEGER NOT NULL CHECK (width IN (480,960,1600)),
  format TEXT NOT NULL CHECK (format IN ('webp','avif')),
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL DEFAULT 0,
  storage_provider TEXT NOT NULL DEFAULT 'R2',
  bucket TEXT,
  object_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(media_id,width,format)
);

CREATE INDEX IF NOT EXISTS idx_submission_media_variants_media_width
  ON submission_media_variants(media_id,width,format);
