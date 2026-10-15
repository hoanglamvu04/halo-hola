CREATE OR REPLACE FUNCTION reconcile_hola_maps_on_submission_status()
RETURNS TRIGGER AS $$
DECLARE
  public_effective BOOLEAN;
  base_eligible BOOLEAN;
BEGIN
  IF NEW.status IS NOT DISTINCT FROM OLD.status THEN
    RETURN NEW;
  END IF;

  public_effective := (
    NEW.publication_state='PUBLISHED'
    OR (
      NEW.publication_state='SCHEDULED'
      AND NEW.publish_scheduled_at IS NOT NULL
      AND NEW.publish_scheduled_at<=NOW()
    )
  );

  base_eligible := (
    NEW.status IN ('VALID','SHORTLIST','TOP52','AWARDED')
    AND NEW.is_demo=FALSE
    AND NEW.allow_media_use=TRUE
    AND NEW.rights_confirmed=TRUE
    AND NEW.image_consent_confirmed=TRUE
    AND (NEW.is_minor=FALSE OR NEW.guardian_consent=TRUE)
  );

  DELETE FROM hola_maps_sync_jobs
  WHERE submission_id=NEW.id AND status='PENDING';

  IF base_eligible AND public_effective THEN
    INSERT INTO hola_maps_sync_jobs(submission_id,external_post_id,action,status,next_attempt_at,last_error)
    VALUES(NEW.id,NEW.id::text,'UPSERT','PENDING',NOW(),'Status changed: reconcile published HALO HOLA submission');
    NEW.hola_maps_sync_status := 'PENDING';
    NEW.hola_maps_last_sync_error := NULL;
  ELSIF NEW.hola_maps_published=TRUE THEN
    INSERT INTO hola_maps_sync_jobs(submission_id,external_post_id,action,status,next_attempt_at,last_error)
    VALUES(NEW.id,NEW.id::text,'DELETE','PENDING',NOW(),'Status changed: remove ineligible HALO HOLA submission');
    NEW.hola_maps_sync_status := 'PENDING';
    NEW.hola_maps_last_sync_error := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_hola_maps_submission_status ON submissions;
CREATE TRIGGER trg_hola_maps_submission_status
BEFORE UPDATE OF status ON submissions
FOR EACH ROW
EXECUTE FUNCTION reconcile_hola_maps_on_submission_status();
