-- Jury Board management and dedicated JUROR accounts.
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('EDITOR','MODERATOR','ADMIN','JUROR'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS jury_profiles (
  juror_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(180),
  organization VARCHAR(220),
  phone VARCHAR(60),
  expertise TEXT,
  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  allowed_themes JSONB NOT NULL DEFAULT '[]'::jsonb,
  allowed_types JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_juror_status ON users(role,account_status,created_at) WHERE role='JUROR';
CREATE INDEX IF NOT EXISTS idx_jury_profiles_sort ON jury_profiles(sort_order,juror_id);
