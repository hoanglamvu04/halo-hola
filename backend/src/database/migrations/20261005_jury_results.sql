-- Jury Results workflow: round lock, curated selections and append-only audit log.
CREATE TABLE IF NOT EXISTS jury_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(60) NOT NULL UNIQUE,
  name VARCHAR(180) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','LOCKED')),
  rules JSONB NOT NULL DEFAULT '{"quality":30,"representation":30,"story":20,"creativity":20}'::jsonb,
  locked_at TIMESTAMPTZ,
  locked_by UUID REFERENCES users(id) ON DELETE SET NULL,
  locked_reason TEXT,
  reopened_at TIMESTAMPTZ,
  reopened_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reopened_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO jury_rounds (code,name,status,rules)
VALUES ('PRELIMINARY','Chấm sơ khảo / TOP52','OPEN','{"quality":30,"representation":30,"story":20,"creativity":20}'::jsonb)
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS jury_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES jury_rounds(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  selection_type VARCHAR(40) NOT NULL CHECK (selection_type IN ('TOP52','RESERVE','TOP3_THEME','THEME_WINNER','COLOR_WINNER','TITLE_FINALIST')),
  source VARCHAR(20) NOT NULL DEFAULT 'MANUAL' CHECK (source IN ('AUTO','MANUAL')),
  note TEXT,
  selected_by UUID REFERENCES users(id) ON DELETE SET NULL,
  selected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (round_id,submission_id,selection_type)
);

CREATE TABLE IF NOT EXISTS jury_audit_logs (
  id BIGSERIAL PRIMARY KEY,
  round_id UUID REFERENCES jury_rounds(id) ON DELETE SET NULL,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(80) NOT NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id TEXT,
  before_data JSONB,
  after_data JSONB,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jury_selections_round_type ON jury_selections(round_id,selection_type,selected_at);
CREATE INDEX IF NOT EXISTS idx_jury_selections_submission ON jury_selections(submission_id,selection_type);
CREATE INDEX IF NOT EXISTS idx_jury_audit_round_created ON jury_audit_logs(round_id,created_at DESC);
