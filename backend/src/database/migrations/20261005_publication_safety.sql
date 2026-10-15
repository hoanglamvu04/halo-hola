-- Publication visibility must never survive a status/rights change that makes a work ineligible.
-- VALID and SHORTLIST are intentionally public-eligible in the current moderation flow,
-- alongside TOP52 and AWARDED.
CREATE OR REPLACE FUNCTION enforce_submission_publication_safety()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status NOT IN ('VALID','SHORTLIST','TOP52','AWARDED')
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

-- Clean up visibility only when the work is truly no longer eligible.
UPDATE submissions
SET publication_state='HIDDEN',
    published_at=NULL,
    publish_scheduled_at=NULL,
    publication_updated_at=NOW()
WHERE publication_state<>'HIDDEN'
  AND (
    status NOT IN ('VALID','SHORTLIST','TOP52','AWARDED')
    OR is_demo=TRUE
    OR allow_media_use=FALSE
    OR rights_confirmed=FALSE
    OR image_consent_confirmed=FALSE
    OR (is_minor=TRUE AND guardian_consent=FALSE)
  );

-- Repair works that an admin explicitly published but the previous safety rule
-- incorrectly hid merely because the status was VALID/SHORTLIST. We only restore
-- when the latest publication audit action is PUBLISH, so an intentional HIDE is
-- never undone.
WITH latest_publication_action AS (
  SELECT DISTINCT ON (submission_id)
    submission_id,
    action,
    created_at
  FROM submission_publication_logs
  ORDER BY submission_id, created_at DESC
)
UPDATE submissions s
SET publication_state='PUBLISHED',
    published_at=COALESCE(s.published_at,l.created_at,NOW()),
    publish_scheduled_at=NULL,
    publication_updated_at=NOW()
FROM latest_publication_action l
WHERE s.id=l.submission_id
  AND l.action='PUBLISH'
  AND s.publication_state='HIDDEN'
  AND s.status IN ('VALID','SHORTLIST','TOP52','AWARDED')
  AND s.is_demo=FALSE
  AND s.allow_media_use=TRUE
  AND s.rights_confirmed=TRUE
  AND s.image_consent_confirmed=TRUE
  AND (s.is_minor=FALSE OR s.guardian_consent=TRUE);
