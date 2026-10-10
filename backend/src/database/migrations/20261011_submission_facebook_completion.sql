ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS facebook_completion_status VARCHAR(20),
  ADD COLUMN IF NOT EXISTS facebook_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS facebook_confirmation_source VARCHAR(40);

-- Existing submissions were created before Facebook became a required completion step.
-- Keep them valid under the historical rules instead of making them look unfinished.
UPDATE submissions
SET facebook_completion_status = 'LEGACY',
    facebook_confirmation_source = COALESCE(facebook_confirmation_source, 'LEGACY_PRE_REQUIREMENT')
WHERE facebook_completion_status IS NULL;

ALTER TABLE submissions
  ALTER COLUMN facebook_completion_status SET DEFAULT 'PENDING',
  ALTER COLUMN facebook_completion_status SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'submissions_facebook_completion_status_check'
  ) THEN
    ALTER TABLE submissions
      ADD CONSTRAINT submissions_facebook_completion_status_check
      CHECK (facebook_completion_status IN ('PENDING','CONFIRMED','LEGACY'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_submissions_facebook_completion
  ON submissions(facebook_completion_status, created_at DESC);
