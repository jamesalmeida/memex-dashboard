-- Add profile_image and views fields to item_metadata table
ALTER TABLE item_metadata 
ADD COLUMN profile_image TEXT,
ADD COLUMN views BIGINT;

-- Add comments to clarify the fields
COMMENT ON COLUMN item_metadata.profile_image IS 'Profile image URL for social media authors';
COMMENT ON COLUMN item_metadata.views IS 'View count for social media posts, videos, etc.';