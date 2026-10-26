CREATE TABLE IF NOT EXISTS community_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(160) NOT NULL DEFAULT '',
  display_name VARCHAR(160),
  phone VARCHAR(60),
  bio TEXT,
  avatar_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE','BLOCKED')),
  email_verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_login_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  code_hash VARCHAR(64) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  request_ip VARCHAR(120),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES community_accounts(id) ON DELETE CASCADE,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  user_agent VARCHAR(500),
  expires_at TIMESTAMPTZ NOT NULL,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS contributor_id UUID REFERENCES community_accounts(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_community_login_codes_email_created
  ON community_login_codes(email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_sessions_account_expires
  ON community_sessions(account_id, expires_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_contributor_created
  ON submissions(contributor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_email_lower
  ON submissions(LOWER(email));
