-- Seed data for development/testing
-- This file contains sample data that can be loaded into the database for testing

-- Note: This assumes a test user exists with ID 'd0d0d0d0-0000-0000-0000-000000000000'
-- In production, replace with actual user IDs from auth.users

-- Create test spaces
INSERT INTO spaces (id, user_id, name, color, description, sort_order) VALUES
  ('11111111-0000-0000-0000-000000000001', 'd0d0d0d0-0000-0000-0000-000000000000', 'Work', '#3B82F6', 'Work-related content and resources', 1),
  ('11111111-0000-0000-0000-000000000002', 'd0d0d0d0-0000-0000-0000-000000000000', 'Learning', '#10B981', 'Educational materials and courses', 2),
  ('11111111-0000-0000-0000-000000000003', 'd0d0d0d0-0000-0000-0000-000000000000', 'Personal', '#8B5CF6', 'Personal projects and interests', 3),
  ('11111111-0000-0000-0000-000000000004', 'd0d0d0d0-0000-0000-0000-000000000000', 'Research', '#F59E0B', 'Research papers and references', 4);

-- Create test tags
INSERT INTO tags (id, user_id, name, color) VALUES
  ('22222222-0000-0000-0000-000000000001', 'd0d0d0d0-0000-0000-0000-000000000000', 'important', '#EF4444'),
  ('22222222-0000-0000-0000-000000000002', 'd0d0d0d0-0000-0000-0000-000000000000', 'read-later', '#F59E0B'),
  ('22222222-0000-0000-0000-000000000003', 'd0d0d0d0-0000-0000-0000-000000000000', 'reference', '#3B82F6'),
  ('22222222-0000-0000-0000-000000000004', 'd0d0d0d0-0000-0000-0000-000000000000', 'tutorial', '#10B981'),
  ('22222222-0000-0000-0000-000000000005', 'd0d0d0d0-0000-0000-0000-000000000000', 'inspiration', '#8B5CF6');

-- Create test items
INSERT INTO items (id, user_id, space_id, title, url, content_type, description, created_at) VALUES
  -- Article items
  ('33333333-0000-0000-0000-000000000001', 'd0d0d0d0-0000-0000-0000-000000000000', '11111111-0000-0000-0000-000000000002', 
   'The Future of AI in Software Development', 'https://example.com/ai-future', 'article',
   'An in-depth look at how artificial intelligence is reshaping the software development landscape.',
   NOW() - INTERVAL '2 days'),
  
  -- GitHub repository
  ('33333333-0000-0000-0000-000000000002', 'd0d0d0d0-0000-0000-0000-000000000000', '11111111-0000-0000-0000-000000000001',
   'awesome-react-components', 'https://github.com/brillout/awesome-react-components', 'github',
   'Curated List of React Components & Libraries',
   NOW() - INTERVAL '5 days'),
  
  -- YouTube video
  ('33333333-0000-0000-0000-000000000003', 'd0d0d0d0-0000-0000-0000-000000000000', '11111111-0000-0000-0000-000000000002',
   'TypeScript Tutorial for Beginners', 'https://youtube.com/watch?v=example', 'youtube',
   'Complete TypeScript course covering all the basics',
   NOW() - INTERVAL '1 week'),
  
  -- PDF document
  ('33333333-0000-0000-0000-000000000004', 'd0d0d0d0-0000-0000-0000-000000000000', '11111111-0000-0000-0000-000000000004',
   'Research Paper: Neural Networks', null, 'pdf',
   'Comprehensive study on neural network architectures',
   NOW() - INTERVAL '3 days'),
  
  -- Note
  ('33333333-0000-0000-0000-000000000005', 'd0d0d0d0-0000-0000-0000-000000000000', '11111111-0000-0000-0000-000000000003',
   'Project Ideas', null, 'note',
   'Collection of project ideas for the weekend',
   NOW() - INTERVAL '1 day');

-- Add metadata for items
INSERT INTO item_metadata (item_id, author, domain, stars, forks, language, duration, views) VALUES
  ('33333333-0000-0000-0000-000000000001', 'Tech Blog', 'example.com', null, null, null, null, null),
  ('33333333-0000-0000-0000-000000000002', 'brillout', 'github.com', 42000, 3200, 'JavaScript', null, null),
  ('33333333-0000-0000-0000-000000000003', 'Code Academy', 'youtube.com', null, null, null, 3600, 1500000);

-- Add tags to items
INSERT INTO items_tags (item_id, tag_id) VALUES
  ('33333333-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000002'), -- read-later
  ('33333333-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000003'), -- reference
  ('33333333-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000001'), -- important
  ('33333333-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000004'), -- tutorial
  ('33333333-0000-0000-0000-000000000005', '22222222-0000-0000-0000-000000000005'); -- inspiration