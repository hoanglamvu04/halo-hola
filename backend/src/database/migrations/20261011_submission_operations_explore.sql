ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS submission_source VARCHAR(20) NOT NULL DEFAULT 'WEB',
  ADD COLUMN IF NOT EXISTS facebook_post_url TEXT,
  ADD COLUMN IF NOT EXISTS facebook_post_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS facebook_post_verified_by VARCHAR(120),
  ADD COLUMN IF NOT EXISTS facebook_reactions INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS facebook_comments INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS facebook_shares INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS facebook_metrics_updated_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname='submissions_submission_source_check'
  ) THEN
    ALTER TABLE submissions
      ADD CONSTRAINT submissions_submission_source_check
      CHECK (submission_source IN ('WEB','FACEBOOK'));
  END IF;
END $$;

UPDATE submissions
SET submission_source='WEB'
WHERE submission_source IS NULL;

CREATE INDEX IF NOT EXISTS idx_submissions_source_created
  ON submissions(submission_source, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_submissions_facebook_post
  ON submissions(facebook_completion_status, facebook_post_verified_at, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_submissions_unique_facebook_post
  ON submissions(facebook_post_url)
  WHERE facebook_post_url IS NOT NULL AND LENGTH(TRIM(facebook_post_url)) > 0;
