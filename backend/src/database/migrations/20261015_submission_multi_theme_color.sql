-- Allow one submission to belong to multiple themes and color stories.
-- Values are stored in the existing human-readable columns separated by ` • `
-- so legacy Admin/Jury surfaces remain backward compatible while public filters
-- can treat each value as a distinct taxonomy item.
ALTER TABLE submissions
  ALTER COLUMN theme TYPE TEXT,
  ALTER COLUMN color TYPE TEXT;
