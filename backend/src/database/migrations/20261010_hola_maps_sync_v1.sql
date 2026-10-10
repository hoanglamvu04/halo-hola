ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS hola_maps_sync_status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
    CHECK (hola_maps_sync_status IN ('PENDING','SYNCED','FAILED')),
  ADD COLUMN IF NOT EXISTS hola_maps_last_sync_error TEXT,
  ADD COLUMN IF NOT EXISTS hola_maps_last_synced_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS hola_maps_sync_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES submissions(id) ON DELETE SET NULL,
  external_post_id VARCHAR(180) NOT NULL,
  action VARCHAR(20) NOT NULL CHECK (action IN ('UPSERT','DELETE')),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','SYNCED','FAILED')),
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hola_maps_sync_jobs_pending
  ON hola_maps_sync_jobs(status, next_attempt_at, created_at);

CREATE INDEX IF NOT EXISTS idx_hola_maps_sync_jobs_submission
  ON hola_maps_sync_jobs(submission_id, created_at DESC);
