-- Add content field to items table
ALTER TABLE items 
ADD COLUMN content TEXT;

-- Add comment to clarify the difference
COMMENT ON COLUMN items.content IS 'Main content of the item (tweet text, article body, note content, etc.)';
COMMENT ON COLUMN items.description IS 'Summary or metadata description (article excerpt, image filename, etc.)';

-- Migrate existing data where appropriate
-- For notes, move description to content
UPDATE items 
SET content = description,
    description = NULL
WHERE content_type = 'note';

-- For X posts, move description to content
UPDATE items 
SET content = description,
    description = NULL
WHERE content_type = 'x';

-- Update RLS policies (they should already work with the new column)