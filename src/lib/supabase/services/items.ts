import { createClient } from '@/lib/supabase/client'
import type { 
  Item, 
  ItemWithMetadata, 
  CreateItemInput, 
  UpdateItemInput,
  ItemMetadata
} from '@/types/database'

export const itemsService = {
  // Fetch all items for the current user with pagination support
  async getItems(spaceId?: string, limit?: number, offset?: number): Promise<ItemWithMetadata[]> {
    const supabase = createClient()
    
    let query = supabase
      .from('items')
      .select('id, user_id, space_id, title, url, content_type, content, description, thumbnail_url, created_at, updated_at, archived_at, is_archived, is_favorite, user_notes, search_vector')
      .eq('is_archived', false)
      .order('created_at', { ascending: false })
    
    if (spaceId) {
      query = query.eq('space_id', spaceId)
    }
    
    if (limit) {
      query = query.range(offset || 0, (offset || 0) + limit - 1)
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
    
    // Fetch tags for all items
    let tagsList = null
    if (itemIds.length > 0) {
      const { data } = await supabase
        .from('items_tags')
        .select('item_id, tag:tags(*)')
        .in('item_id', itemIds)
      tagsList = data
    }
    
    // Fetch spaces for all items
    const uniqueSpaceIds = [...new Set((items || []).map(item => item.space_id).filter(Boolean))]
    let spacesList = null
    if (uniqueSpaceIds.length > 0) {
      const { data } = await supabase
        .from('spaces')
        .select('*')
        .in('id', uniqueSpaceIds)
      spacesList = data
    }
    
    // Create a map of item_id -> metadata
    const metadataMap = new Map()
    metadataList?.forEach(metadata => {
      metadataMap.set(metadata.item_id, metadata)
    })
    
    // Create a map of item_id -> tags
    const tagsMap = new Map()
    tagsList?.forEach((itemTag: any) => {
      if (!tagsMap.has(itemTag.item_id)) {
        tagsMap.set(itemTag.item_id, [])
      }
      if (itemTag.tag) {
        tagsMap.get(itemTag.item_id).push(itemTag.tag)
      }
    })
    
    // Create a map of space_id -> space
    const spacesMap = new Map()
    spacesList?.forEach(space => {
      spacesMap.set(space.id, space)
    })
    
    return (items || []).map(item => ({
      ...item,
      metadata: metadataMap.get(item.id) || null,
      tags: tagsMap.get(item.id) || [],
      space: item.space_id ? spacesMap.get(item.space_id) || null : null
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
  async updateItem(id: string, input: UpdateItemInput): Promise<Item | null> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('items')
      .update(input)
      .eq('id', id)
      .select()
      .limit(1)
    
    if (error) throw error
    
    return data ? data[0] : null
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

  // Archive/unarchive item
  async toggleArchive(id: string, isArchived: boolean): Promise<void> {
    const supabase = createClient()
    
    const updateData = {
      is_archived: isArchived,
      archived_at: isArchived ? new Date().toISOString() : null
    }
    
    const { error } = await supabase
      .from('items')
      .update(updateData)
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
    
    console.log('=== updateItemMetadata called ===');
    console.log('Item ID:', itemId);
    console.log('Metadata to save:', JSON.stringify(metadata, null, 2));
    
    // Check if metadata exists
    const { data: existing, error: selectError } = await supabase
      .from('item_metadata')
      .select('id')
      .eq('item_id', itemId)
      .limit(1)
    
    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Error checking existing metadata:', selectError);
    }
    
    if (existing && existing.length > 0) {
      console.log('Updating existing metadata record:', existing.id);
      // Update existing metadata
      const { data, error } = await supabase
        .from('item_metadata')
        .update(metadata)
        .eq('item_id', itemId)
        .select()
      
      if (error) {
        console.error('Update error:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      console.log('Updated metadata:', data);
    } else {
      console.log('Creating new metadata record');
      // Create new metadata
      // Clean the metadata to ensure all fields match database types
      const cleanedMetadata = {
        item_id: itemId,
        author: metadata.author || null,
        domain: metadata.domain || null,
        video_url: metadata.video_url || null,
        duration: metadata.duration || null,
        file_size: metadata.file_size || null,
        page_count: metadata.page_count || null,
        username: metadata.username || null,
        likes: metadata.likes || null,
        replies: metadata.replies || null,
        retweets: metadata.retweets || null,
        views: metadata.views || null,
        stars: metadata.stars || null,
        forks: metadata.forks || null,
        language: metadata.language || null,
        price: metadata.price || null,
        rating: metadata.rating || null,
        reviews: metadata.reviews || null,
        in_stock: metadata.in_stock || null,
        citations: metadata.citations || null,
        published_date: metadata.published_date || null,
        journal: metadata.journal || null,
        extra_data: metadata.extra_data || {}
      };
      
      // Remove any undefined values
      Object.keys(cleanedMetadata).forEach(key => {
        if (cleanedMetadata[key] === undefined) {
          delete cleanedMetadata[key];
        }
      });
      
      console.log('Cleaned metadata for insert:', cleanedMetadata);
      
      const { data, error } = await supabase
        .from('item_metadata')
        .insert(cleanedMetadata)
        .select()
      
      if (error) {
        console.error('Insert error:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      console.log('Created metadata:', data);
    }
  },

  // Search items
  async searchItems(query: string): Promise<ItemWithMetadata[]> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('items')
      .select('id, user_id, space_id, title, url, content_type, content, description, thumbnail_url, created_at, updated_at, archived_at, is_archived, is_favorite, search_vector')
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
    
    // Fetch tags for all items
    let tagsList = null
    if (itemIds.length > 0) {
      const { data: tagsData } = await supabase
        .from('items_tags')
        .select('item_id, tag:tags(*)')
        .in('item_id', itemIds)
      tagsList = tagsData
    }
    
    // Fetch spaces for all items
    const uniqueSpaceIds = [...new Set((data || []).map(item => item.space_id).filter(Boolean))]
    let spacesList = null
    if (uniqueSpaceIds.length > 0) {
      const { data: spacesData } = await supabase
        .from('spaces')
        .select('*')
        .in('id', uniqueSpaceIds)
      spacesList = spacesData
    }
    
    // Create a map of item_id -> metadata
    const metadataMap = new Map()
    metadataList?.forEach(metadata => {
      metadataMap.set(metadata.item_id, metadata)
    })
    
    // Create a map of item_id -> tags
    const tagsMap = new Map()
    tagsList?.forEach((itemTag: any) => {
      if (!tagsMap.has(itemTag.item_id)) {
        tagsMap.set(itemTag.item_id, [])
      }
      if (itemTag.tag) {
        tagsMap.get(itemTag.item_id).push(itemTag.tag)
      }
    })
    
    // Create a map of space_id -> space
    const spacesMap = new Map()
    spacesList?.forEach(space => {
      spacesMap.set(space.id, space)
    })
    
    return (data || []).map(item => ({
      ...item,
      metadata: metadataMap.get(item.id) || null,
      tags: tagsMap.get(item.id) || [],
      space: item.space_id ? spacesMap.get(item.space_id) || null : null
    }))
  }
}