-- Password sign-in + purpose-scoped email confirmation without losing legacy accounts.
-- Existing OTP-created accounts keep their verified email, profile and contributions.
ALTER TABLE community_accounts
  ADD COLUMN IF NOT EXISTS password_hash TEXT;

ALTER TABLE community_login_codes
  ADD COLUMN IF NOT EXISTS purpose VARCHAR(32) NOT NULL DEFAULT 'LEGACY_LOGIN';

CREATE INDEX IF NOT EXISTS idx_community_codes_purpose_email
  ON community_login_codes(email,purpose,created_at DESC);

CREATE TABLE IF NOT EXISTS community_registration_requests (
  email VARCHAR(255) PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  password_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_registration_requests_expiry
  ON community_registration_requests(expires_at);
