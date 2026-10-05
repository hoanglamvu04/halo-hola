DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='submissions' AND column_name='publication_state'
  ) THEN
    ALTER TABLE submissions
      ADD COLUMN publication_state VARCHAR(20) NOT NULL DEFAULT 'HIDDEN'
        CHECK (publication_state IN ('HIDDEN','PUBLISHED','SCHEDULED')),
      ADD COLUMN published_at TIMESTAMPTZ,
      ADD COLUMN publish_scheduled_at TIMESTAMPTZ,
      ADD COLUMN publication_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

    -- Preserve what was already visible before publication control existed.
    UPDATE submissions
    SET publication_state='PUBLISHED',
        published_at=COALESCE(updated_at,NOW()),
        publication_updated_at=NOW()
    WHERE status IN ('TOP52','AWARDED')
      AND is_demo=FALSE
      AND allow_media_use=TRUE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS submission_publication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(30) NOT NULL CHECK (action IN ('PUBLISH','HIDE','SCHEDULE')),
  before_data JSONB,
  after_data JSONB,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_publication
  ON submissions(publication_state,publish_scheduled_at,status);
CREATE INDEX IF NOT EXISTS idx_publication_logs_submission
  ON submission_publication_logs(submission_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_publication_logs_created
  ON submission_publication_logs(created_at DESC);
