import { createClient } from '@/lib/supabase/client'
import type { 
  Item, 
  ItemWithMetadata, 
  CreateItemInput, 
  UpdateItemInput,
  ItemMetadata
} from '@/types/database'

export const itemsService = {
  // Fetch all items for the current user
  async getItems(spaceId?: string): Promise<ItemWithMetadata[]> {
    const supabase = createClient()
    
    let query = supabase
      .from('items')
      .select('*')
      .eq('is_archived', false)
      .order('created_at', { ascending: false })
    
    if (spaceId) {
      query = query.eq('space_id', spaceId)
    }
    
    const { data: items, error } = await query
    
    if (error) throw error
    
    // Fetch metadata for all items
    const itemIds = (items || []).map(item => item.id)
    let metadataList = null
    
    if (itemIds.length > 0) {
      const { data } = await supabase
        .from('item_metadata')
        .select('*')
        .in('item_id', itemIds)
      metadataList = data
    }
    
    // Create a map of item_id -> metadata
    const metadataMap = new Map()
    metadataList?.forEach(metadata => {
      metadataMap.set(metadata.item_id, metadata)
    })
    
    return (items || []).map(item => ({
      ...item,
      metadata: metadataMap.get(item.id) || null,
      tags: [],
      space: null
    }))
  },

  // Get a single item by ID
  async getItem(id: string): Promise<ItemWithMetadata | null> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

    // Get tags for this item
    const { data: itemTags } = await supabase
      .from('items_tags')
      .select('tag:tags(*)')
      .eq('item_id', id)

    // Get space for this item
    let space = null
    if (data.space_id) {
      const { data: spaceData } = await supabase
        .from('spaces')
        .select('*')
        .eq('id', data.space_id)
        .single()
      space = spaceData
    }
    
    // Get metadata for this item
    const { data: metadataData } = await supabase
      .from('item_metadata')
      .select('*')
      .eq('item_id', id)
      .single()
    
    return {
      ...data,
      metadata: metadataData || null,
      tags: itemTags?.map((row: any) => row.tag).filter(Boolean) || [],
      space: space
    }
  },

  // Create a new item
  async createItem(input: CreateItemInput): Promise<Item> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')
    
    const { data, error } = await supabase
      .from('items')
      .insert({
        ...input,
        user_id: user.id
      })
      .select()
      .single()
    
    if (error) throw error
    
    return data
  },

  // Update an item
  async updateItem(id: string, input: UpdateItemInput): Promise<Item> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('items')
      .update(input)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return data
  },

  // Archive an item
  async archiveItem(id: string): Promise<void> {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('items')
      .update({ 
        is_archived: true,
        archived_at: new Date().toISOString()
      })
      .eq('id', id)
    
    if (error) throw error
  },

  // Delete an item permanently
  async deleteItem(id: string): Promise<void> {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Toggle favorite status
  async toggleFavorite(id: string, isFavorite: boolean): Promise<void> {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('items')
      .update({ is_favorite: isFavorite })
      .eq('id', id)
    
    if (error) throw error
  },

  // Add tags to an item
  async addTagsToItem(itemId: string, tagIds: string[]): Promise<void> {
    const supabase = createClient()
    
    const inserts = tagIds.map(tagId => ({
      item_id: itemId,
      tag_id: tagId
    }))
    
    const { error } = await supabase
      .from('items_tags')
      .insert(inserts)
    
    if (error) throw error
  },

  // Remove tags from an item
  async removeTagsFromItem(itemId: string, tagIds: string[]): Promise<void> {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('items_tags')
      .delete()
      .eq('item_id', itemId)
      .in('tag_id', tagIds)
    
    if (error) throw error
  },

  // Update item metadata
  async updateItemMetadata(itemId: string, metadata: Partial<ItemMetadata>): Promise<void> {
    const supabase = createClient()
    
    // Check if metadata exists
    const { data: existing } = await supabase
      .from('item_metadata')
      .select('id')
      .eq('item_id', itemId)
      .single()
    
    if (existing) {
      // Update existing metadata
      const { error } = await supabase
        .from('item_metadata')
        .update(metadata)
        .eq('item_id', itemId)
      
      if (error) throw error
    } else {
      // Create new metadata
      const { error } = await supabase
        .from('item_metadata')
        .insert({
          ...metadata,
          item_id: itemId
        })
      
      if (error) throw error
    }
  },

  // Search items
  async searchItems(query: string): Promise<ItemWithMetadata[]> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .textSearch('search_vector', query)
      .eq('is_archived', false)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    // Fetch metadata for all items
    const itemIds = (data || []).map(item => item.id)
    let metadataList = null
    
    if (itemIds.length > 0) {
      const { data: metadata } = await supabase
        .from('item_metadata')
        .select('*')
        .in('item_id', itemIds)
      metadataList = metadata
    }
    
    // Create a map of item_id -> metadata
    const metadataMap = new Map()
    metadataList?.forEach(metadata => {
      metadataMap.set(metadata.item_id, metadata)
    })
    
    return (data || []).map(item => ({
      ...item,
      metadata: metadataMap.get(item.id) || null,
      tags: [],
      space: null
    }))
  }
}