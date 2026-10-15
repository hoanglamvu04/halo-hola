ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS hola_maps_published BOOLEAN NOT NULL DEFAULT FALSE;

-- Preserve knowledge of posts that were already synced before publication-gating existed.
UPDATE submissions
SET hola_maps_published=TRUE
WHERE hola_maps_last_synced_at IS NOT NULL
  AND hola_maps_sync_status='SYNCED';

-- Any previously synced submission that is not currently public must be removed
-- from HOLA Maps during the next sync sweep.
INSERT INTO hola_maps_sync_jobs(submission_id,external_post_id,action,status,next_attempt_at,last_error)
SELECT s.id,s.id::text,'DELETE','PENDING',NOW(),'Cleanup after publication-gated HOLA Maps sync upgrade'
FROM submissions s
WHERE s.hola_maps_published=TRUE
  AND NOT (
    s.status IN ('VALID','SHORTLIST','TOP52','AWARDED')
    AND s.is_demo=FALSE
    AND s.allow_media_use=TRUE
    AND s.rights_confirmed=TRUE
    AND s.image_consent_confirmed=TRUE
    AND (s.is_minor=FALSE OR s.guardian_consent=TRUE)
    AND (
      s.publication_state='PUBLISHED'
      OR (s.publication_state='SCHEDULED' AND s.publish_scheduled_at IS NOT NULL AND s.publish_scheduled_at<=NOW())
    )
  )
  AND NOT EXISTS (
    SELECT 1 FROM hola_maps_sync_jobs j
    WHERE j.submission_id=s.id AND j.action='DELETE' AND j.status='PENDING'
  );

UPDATE submissions s
SET hola_maps_sync_status='PENDING',
    hola_maps_last_sync_error=NULL
WHERE s.hola_maps_published=TRUE
  AND NOT (
    s.status IN ('VALID','SHORTLIST','TOP52','AWARDED')
    AND s.is_demo=FALSE
    AND s.allow_media_use=TRUE
    AND s.rights_confirmed=TRUE
    AND s.image_consent_confirmed=TRUE
    AND (s.is_minor=FALSE OR s.guardian_consent=TRUE)
    AND (
      s.publication_state='PUBLISHED'
      OR (s.publication_state='SCHEDULED' AND s.publish_scheduled_at IS NOT NULL AND s.publish_scheduled_at<=NOW())
    )
  );
