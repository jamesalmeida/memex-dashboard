import { createClient } from '@/lib/supabase/client'
import type { Tag, CreateTagInput } from '@/types/database'

export const tagsService = {
  // Get all tags for the current user
  async getTags(): Promise<Tag[]> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) throw error
    
    return data || []
  },

  // Get tags with usage counts
  async getTagsWithCounts(): Promise<(Tag & { item_count: number })[]> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) throw error
    
    return (data || []).map(tag => ({
      ...tag,
      item_count: 0
    }))
  },

  // Get a single tag by ID
  async getTag(id: string): Promise<Tag | null> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }
    
    return data
  },

  // Create a new tag
  async createTag(input: CreateTagInput): Promise<Tag> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')
    
    const { data, error } = await supabase
      .from('tags')
      .insert({
        ...input,
        user_id: user.id
      })
      .select()
      .single()
    
    if (error) throw error
    
    return data
  },

  // Update a tag
  async updateTag(id: string, input: Partial<CreateTagInput>): Promise<Tag> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('tags')
      .update(input)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return data
  },

  // Delete a tag
  async deleteTag(id: string): Promise<void> {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Get or create tag by name
  async getOrCreateTag(name: string, color?: string): Promise<Tag> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')
    
    // First try to get existing tag
    const { data: existing, error: selectError } = await supabase
      .from('tags')
      .select('*')
      .eq('name', name.toLowerCase())
      .eq('user_id', user.id)
      .maybeSingle()
    
    if (selectError) throw selectError
    if (existing) return existing
    
    // Create new tag if it doesn't exist
    const { data, error } = await supabase
      .from('tags')
      .insert({
        name: name.toLowerCase(),
        color: color || '#6B7280',
        user_id: user.id
      })
      .select()
      .single()
    
    if (error) throw error
    
    return data
  },

  // Get tags for an item
  async getItemTags(itemId: string): Promise<Tag[]> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('items_tags')
      .select('tag_id')
      .eq('item_id', itemId)
    
    if (error) throw error
    
    // For now, return empty array
    return []
  },

  // Add a tag to an item
  async addTagToItem(itemId: string, tagName: string): Promise<void> {
    console.log('=== TAGS SERVICE: addTagToItem ===');
    console.log('itemId:', itemId);
    console.log('tagName:', tagName);
    
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')
    console.log('User authenticated:', user.id);
    
    // First get or create the tag
    console.log('Getting or creating tag...');
    const tag = await this.getOrCreateTag(tagName)
    console.log('Tag result:', tag);
    
    // Then create the relationship (ignore if it already exists)
    console.log('Creating items_tags relationship...');
    const { data, error } = await supabase
      .from('items_tags')
      .upsert({
        item_id: itemId,
        tag_id: tag.id
      }, {
        onConflict: 'item_id,tag_id',
        ignoreDuplicates: true
      })
      .select()
    
    console.log('Upsert result data:', data);
    console.log('Upsert result error:', error);
    
    if (error) throw error
    
    console.log('=== TAGS SERVICE: addTagToItem COMPLETE ===');
  },

  // Remove a tag from an item
  async removeTagFromItem(itemId: string, tagId: string): Promise<void> {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('items_tags')
      .delete()
      .eq('item_id', itemId)
      .eq('tag_id', tagId)
    
    if (error) throw error
  },

  // Suggest tags based on content
  async suggestTags(content: string): Promise<Tag[]> {
    // This is a placeholder for future ML-based tag suggestions
    // For now, we'll just return existing tags that might match
    const supabase = createClient()
    
    const words = content.toLowerCase().split(/\s+/)
    
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .filter('name', 'in', `(${words.join(',')})`)
      .limit(5)
    
    if (error) throw error
    
    return data || []
  }
}