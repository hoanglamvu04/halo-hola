-- Explicit per-account delegation for automatic publication.
-- This migration uses a fresh identifier so a stale migration-history marker
-- cannot silently skip creation of the required columns.
ALTER TABLE community_accounts
  ADD COLUMN IF NOT EXISTS auto_publish_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS auto_publish_granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS auto_publish_granted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS auto_publish_note TEXT;

CREATE INDEX IF NOT EXISTS idx_community_accounts_auto_publish
  ON community_accounts(auto_publish_enabled,status,created_at DESC);

CREATE TABLE IF NOT EXISTS community_auto_publish_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_account_id UUID REFERENCES community_accounts(id) ON DELETE SET NULL,
  submission_id UUID REFERENCES submissions(id) ON DELETE SET NULL,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(24) NOT NULL CHECK (action IN ('GRANT','REVOKE','AUTO_PUBLISH')),
  note TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_auto_publish_audit_account
  ON community_auto_publish_audit(community_account_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_auto_publish_audit_submission
  ON community_auto_publish_audit(submission_id,created_at DESC);
