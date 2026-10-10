CREATE TABLE IF NOT EXISTS community_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(32) NOT NULL UNIQUE,
  program VARCHAR(30) NOT NULL CHECK (program IN ('WE_HOLA','HOLA_DAY')),
  name VARCHAR(160) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(60) NOT NULL,
  role_label VARCHAR(120),
  interest TEXT,
  note TEXT,
  allow_updates BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(30) NOT NULL DEFAULT 'REGISTERED'
    CHECK (status IN ('REGISTERED','CONFIRMED','ATTENDED','CANCELLED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_registrations_program_created
  ON community_registrations(program, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_community_registrations_email
  ON community_registrations(LOWER(email));
