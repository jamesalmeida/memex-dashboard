-- Add user_notes column to items table
ALTER TABLE items
ADD COLUMN user_notes TEXT;

-- Add comment for documentation
COMMENT ON COLUMN items.user_notes IS 'User-added notes for the item';