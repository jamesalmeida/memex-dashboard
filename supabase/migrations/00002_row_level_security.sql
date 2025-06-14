-- Enable Row Level Security on all tables
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE items_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_metadata ENABLE ROW LEVEL SECURITY;

-- Spaces policies
CREATE POLICY "Users can view their own spaces" ON spaces
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own spaces" ON spaces
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own spaces" ON spaces
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own spaces" ON spaces
  FOR DELETE USING (auth.uid() = user_id);

-- Items policies
CREATE POLICY "Users can view their own items" ON items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own items" ON items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items" ON items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items" ON items
  FOR DELETE USING (auth.uid() = user_id);

-- Tags policies
CREATE POLICY "Users can view their own tags" ON tags
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tags" ON tags
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags" ON tags
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags" ON tags
  FOR DELETE USING (auth.uid() = user_id);

-- Items_tags policies (check via items table)
CREATE POLICY "Users can view their own item tags" ON items_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM items 
      WHERE items.id = items_tags.item_id 
      AND items.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tags for their own items" ON items_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM items 
      WHERE items.id = items_tags.item_id 
      AND items.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tags from their own items" ON items_tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM items 
      WHERE items.id = items_tags.item_id 
      AND items.user_id = auth.uid()
    )
  );

-- Item_metadata policies (check via items table)
CREATE POLICY "Users can view metadata for their own items" ON item_metadata
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM items 
      WHERE items.id = item_metadata.item_id 
      AND items.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create metadata for their own items" ON item_metadata
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM items 
      WHERE items.id = item_metadata.item_id 
      AND items.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update metadata for their own items" ON item_metadata
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM items 
      WHERE items.id = item_metadata.item_id 
      AND items.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete metadata for their own items" ON item_metadata
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM items 
      WHERE items.id = item_metadata.item_id 
      AND items.user_id = auth.uid()
    )
  );