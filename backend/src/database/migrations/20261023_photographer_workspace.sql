-- Dedicated photographer workspace: accounts, shooting sessions and private media.
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('EDITOR','MODERATOR','ADMIN','JUROR','PHOTOGRAPHER'));

CREATE TABLE IF NOT EXISTS photographer_profiles (
  photographer_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  phone VARCHAR(60),
  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS photographer_shoots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  place_id UUID REFERENCES places(id) ON DELETE SET NULL,
  place_name VARCHAR(255) NOT NULL,
  title VARCHAR(220) NOT NULL,
  captured_on DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  status VARCHAR(24) NOT NULL DEFAULT 'OPEN'
    CHECK (status IN ('OPEN','COMPLETE','ARCHIVED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS photographer_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shoot_id UUID NOT NULL REFERENCES photographer_shoots(id) ON DELETE CASCADE,
  photographer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  original_name TEXT NOT NULL,
  mime_type VARCHAR(150) NOT NULL,
  size_bytes BIGINT NOT NULL,
  storage_provider VARCHAR(30) NOT NULL DEFAULT 'R2',
  bucket VARCHAR(180),
  object_key TEXT NOT NULL,
  sha256 VARCHAR(64),
  caption TEXT,
  tags TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_photographer_profiles_sort
  ON photographer_profiles(sort_order,photographer_id);
CREATE INDEX IF NOT EXISTS idx_photographer_shoots_owner_date
  ON photographer_shoots(photographer_id,captured_on DESC,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_photographer_shoots_place
  ON photographer_shoots(place_id,captured_on DESC);
CREATE INDEX IF NOT EXISTS idx_photographer_assets_shoot
  ON photographer_assets(shoot_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_photographer_assets_owner
  ON photographer_assets(photographer_id,created_at DESC);
