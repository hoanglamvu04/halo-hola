-- Server-only integration credentials. Public site_settings must never contain secrets.
CREATE TABLE IF NOT EXISTS integration_connections (
  connection_key VARCHAR(40) PRIMARY KEY
    CHECK (connection_key IN ('smtp', 'hola_maps', 'r2')),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
