CREATE TABLE IF NOT EXISTS submission_notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('RECEIVED','STATUS')),
  status TEXT,
  recipient TEXT NOT NULL,
  delivery_status TEXT NOT NULL CHECK (delivery_status IN ('SENT','SKIPPED','FAILED')),
  detail TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submission_notification_logs_submission_created
  ON submission_notification_logs(submission_id,created_at DESC);
