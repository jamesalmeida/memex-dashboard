-- Add video_url field to item_metadata table
ALTER TABLE item_metadata 
ADD COLUMN video_url TEXT;

-- Add comment to clarify the field
COMMENT ON COLUMN item_metadata.video_url IS 'Direct URL to video content (for tweets, reels, TikToks, etc.)';

-- Create index for faster queries on items with videos
CREATE INDEX idx_item_metadata_video_url ON item_metadata(item_id) WHERE video_url IS NOT NULL;

-- Migrate existing video URLs from extra_data JSON
UPDATE item_metadata 
SET video_url = extra_data->>'video_url'
WHERE extra_data->>'video_url' IS NOT NULL;