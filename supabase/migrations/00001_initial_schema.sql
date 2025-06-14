-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create content_type enum
CREATE TYPE content_type AS ENUM (
  -- Social Media
  'x', 'instagram', 'youtube', 'linkedin', 'tiktok', 'reddit', 'facebook',
  -- Development
  'github', 'gitlab', 'codepen', 'stackoverflow', 'devto', 'npm', 'documentation',
  -- Content & Media
  'article', 'pdf', 'image', 'video', 'audio', 'presentation',
  -- Commerce
  'product', 'amazon', 'etsy', 'app',
  -- Knowledge
  'wikipedia', 'paper', 'book', 'course',
  -- Personal
  'note', 'bookmark', 'recipe', 'location'
);

-- Create spaces table
CREATE TABLE spaces (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6B7280',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  is_archived BOOLEAN DEFAULT FALSE NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  UNIQUE(user_id, name)
);

-- Create items table
CREATE TABLE items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  space_id UUID REFERENCES spaces(id) ON DELETE SET NULL,
  
  -- Core fields
  title TEXT NOT NULL,
  url TEXT,
  content_type content_type NOT NULL DEFAULT 'bookmark',
  description TEXT,
  thumbnail_url TEXT,
  
  -- Content storage
  raw_text TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  archived_at TIMESTAMPTZ,
  
  -- Status flags
  is_archived BOOLEAN DEFAULT FALSE NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE NOT NULL,
  
  -- Search optimization
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(raw_text, '')), 'C')
  ) STORED
);

-- Create tags table
CREATE TABLE tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6B7280',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, name)
);

-- Create items_tags junction table
CREATE TABLE items_tags (
  item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (item_id, tag_id)
);

-- Create item_metadata table for flexible metadata storage
CREATE TABLE item_metadata (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  
  -- Common fields
  author TEXT,
  domain TEXT,
  
  -- Media fields
  duration INTEGER, -- in seconds
  file_size BIGINT, -- in bytes
  page_count INTEGER,
  
  -- Social media fields
  username TEXT,
  likes INTEGER,
  replies INTEGER,
  retweets INTEGER,
  views BIGINT,
  
  -- Commerce fields
  price DECIMAL(10,2),
  rating DECIMAL(2,1),
  reviews INTEGER,
  in_stock BOOLEAN,
  
  -- Development fields
  stars INTEGER,
  forks INTEGER,
  language TEXT,
  
  -- Academic fields
  citations INTEGER,
  published_date DATE,
  journal TEXT,
  
  -- Additional flexible JSON storage for platform-specific data
  extra_data JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(item_id)
);

-- Create indexes
CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_items_space_id ON items(space_id);
CREATE INDEX idx_items_created_at ON items(created_at DESC);
CREATE INDEX idx_items_is_archived ON items(is_archived);
CREATE INDEX idx_items_content_type ON items(content_type);
CREATE INDEX idx_items_search_vector ON items USING GIN(search_vector);

CREATE INDEX idx_spaces_user_id ON spaces(user_id);
CREATE INDEX idx_tags_user_id ON tags(user_id);
CREATE INDEX idx_item_metadata_item_id ON item_metadata(item_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spaces_updated_at BEFORE UPDATE ON spaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_item_metadata_updated_at BEFORE UPDATE ON item_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();