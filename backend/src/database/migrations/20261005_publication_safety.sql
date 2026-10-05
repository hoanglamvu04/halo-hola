-- Publication visibility must never survive a status/rights change that makes a work ineligible.
CREATE OR REPLACE FUNCTION enforce_submission_publication_safety()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status NOT IN ('TOP52','AWARDED')
     OR NEW.is_demo=TRUE
     OR NEW.allow_media_use=FALSE
     OR NEW.rights_confirmed=FALSE
     OR NEW.image_consent_confirmed=FALSE
     OR (NEW.is_minor=TRUE AND NEW.guardian_consent=FALSE)
  THEN
    NEW.publication_state='HIDDEN';
    NEW.published_at=NULL;
    NEW.publish_scheduled_at=NULL;
    NEW.publication_updated_at=NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_submission_publication_safety ON submissions;
CREATE TRIGGER trg_submission_publication_safety
BEFORE UPDATE OF status,is_demo,allow_media_use,rights_confirmed,image_consent_confirmed,is_minor,guardian_consent
ON submissions
FOR EACH ROW EXECUTE FUNCTION enforce_submission_publication_safety();

-- Clean up any legacy visibility that does not meet current publication requirements.
UPDATE submissions
SET publication_state='HIDDEN',
    published_at=NULL,
    publish_scheduled_at=NULL,
    publication_updated_at=NOW()
WHERE publication_state<>'HIDDEN'
  AND (
    status NOT IN ('TOP52','AWARDED')
    OR is_demo=TRUE
    OR allow_media_use=FALSE
    OR rights_confirmed=FALSE
    OR image_consent_confirmed=FALSE
    OR (is_minor=TRUE AND guardian_consent=FALSE)
  );
