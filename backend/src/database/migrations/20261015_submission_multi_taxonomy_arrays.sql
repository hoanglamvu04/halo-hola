-- Store the full multi-selection explicitly while keeping legacy theme/color
-- columns as the primary value for old Admin/Jury code.
ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS themes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS colors TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE submissions
SET themes = CASE
      WHEN COALESCE(theme,'')='' THEN ARRAY[]::TEXT[]
      ELSE string_to_array(theme,' • ')
    END,
    colors = CASE
      WHEN COALESCE(color,'')='' THEN ARRAY[]::TEXT[]
      ELSE string_to_array(color,' • ')
    END;

UPDATE submissions
SET theme = CASE WHEN cardinality(themes)>0 THEN themes[1] ELSE theme END,
    color = CASE WHEN cardinality(colors)>0 THEN colors[1] ELSE color END;

CREATE OR REPLACE FUNCTION normalize_submission_taxonomies()
RETURNS TRIGGER AS $$
DECLARE
  incoming_themes TEXT[];
  incoming_colors TEXT[];
BEGIN
  IF TG_OP='INSERT' OR NEW.theme IS DISTINCT FROM OLD.theme THEN
    IF COALESCE(NEW.theme,'')<>'' THEN
      incoming_themes := string_to_array(NEW.theme,' • ');
      NEW.themes := ARRAY(SELECT DISTINCT trim(x) FROM unnest(incoming_themes) x WHERE trim(x)<>'');
      IF cardinality(NEW.themes)>0 THEN NEW.theme := NEW.themes[1]; END IF;
    ELSIF cardinality(NEW.themes)>0 THEN
      NEW.theme := NEW.themes[1];
    END IF;
  ELSIF cardinality(NEW.themes)=0 AND COALESCE(NEW.theme,'')<>'' THEN
    NEW.themes := ARRAY[NEW.theme];
  END IF;

  IF TG_OP='INSERT' OR NEW.color IS DISTINCT FROM OLD.color THEN
    IF COALESCE(NEW.color,'')<>'' THEN
      incoming_colors := string_to_array(NEW.color,' • ');
      NEW.colors := ARRAY(SELECT DISTINCT trim(x) FROM unnest(incoming_colors) x WHERE trim(x)<>'');
      IF cardinality(NEW.colors)>0 THEN NEW.color := NEW.colors[1]; END IF;
    ELSIF cardinality(NEW.colors)>0 THEN
      NEW.color := NEW.colors[1];
    END IF;
  ELSIF cardinality(NEW.colors)=0 AND COALESCE(NEW.color,'')<>'' THEN
    NEW.colors := ARRAY[NEW.color];
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_submission_taxonomies ON submissions;
CREATE TRIGGER trg_submission_taxonomies
BEFORE INSERT OR UPDATE OF theme,color,themes,colors
ON submissions
FOR EACH ROW EXECUTE FUNCTION normalize_submission_taxonomies();

CREATE INDEX IF NOT EXISTS idx_submissions_themes_gin ON submissions USING GIN(themes);
CREATE INDEX IF NOT EXISTS idx_submissions_colors_gin ON submissions USING GIN(colors);
