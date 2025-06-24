import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { ItemWithMetadata } from '@/types/database'
import { cache } from 'react'
import { performance } from '@/lib/performance'

// Cache the getItems function for deduplication within a request
export const getItemsServer = cache(async (spaceId?: string, limit: number = 20, offset: number = 0): Promise<ItemWithMetadata[]> => {
  const startTime = Date.now()
  const supabase = await createServerSupabaseClient()
  
  let query = supabase
    .from('items')
    .select('id, user_id, space_id, title, url, content_type, content, description, thumbnail_url, created_at, updated_at, archived_at, is_archived, is_favorite, search_vector')
    .eq('is_archived', false)
    .order('created_at', { ascending: false })
  
  if (spaceId) {
    query = query.eq('space_id', spaceId)
  }
  
  query = query.range(offset, offset + limit - 1)
  
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
  
  // Create maps for efficient lookup
  const metadataMap = new Map()
  metadataList?.forEach(metadata => {
    metadataMap.set(metadata.item_id, metadata)
  })
  
  const tagsMap = new Map()
  tagsList?.forEach((itemTag: any) => {
    if (!tagsMap.has(itemTag.item_id)) {
      tagsMap.set(itemTag.item_id, [])
    }
    if (itemTag.tag) {
      tagsMap.get(itemTag.item_id).push(itemTag.tag)
    }
  })
  
  const spacesMap = new Map()
  spacesList?.forEach(space => {
    spacesMap.set(space.id, space)
  })
  
  const result = (items || []).map(item => ({
    ...item,
    metadata: metadataMap.get(item.id) || null,
    tags: tagsMap.get(item.id) || [],
    space: item.space_id ? spacesMap.get(item.space_id) || null : null
  }))
  
  performance.logQuery(`getItems(${spaceId || 'all'})`, startTime)
  return result
})

// Search items server-side
export const searchItemsServer = cache(async (query: string, limit: number = 20): Promise<ItemWithMetadata[]> => {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('items')
    .select('id, user_id, space_id, title, url, content_type, content, description, thumbnail_url, created_at, updated_at, archived_at, is_archived, is_favorite, search_vector')
    .textSearch('search_vector', query)
    .eq('is_archived', false)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  
  // Rest of the function is the same as getItemsServer
  const itemIds = (data || []).map(item => item.id)
  let metadataList = null
  
  if (itemIds.length > 0) {
    const { data: metadata } = await supabase
      .from('item_metadata')
      .select('*')
      .in('item_id', itemIds)
    metadataList = metadata
  }
  
  let tagsList = null
  if (itemIds.length > 0) {
    const { data: tagsData } = await supabase
      .from('items_tags')
      .select('item_id, tag:tags(*)')
      .in('item_id', itemIds)
    tagsList = tagsData
  }
  
  const uniqueSpaceIds = [...new Set((data || []).map(item => item.space_id).filter(Boolean))]
  let spacesList = null
  if (uniqueSpaceIds.length > 0) {
    const { data: spacesData } = await supabase
      .from('spaces')
      .select('*')
      .in('id', uniqueSpaceIds)
    spacesList = spacesData
  }
  
  const metadataMap = new Map()
  metadataList?.forEach(metadata => {
    metadataMap.set(metadata.item_id, metadata)
  })
  
  const tagsMap = new Map()
  tagsList?.forEach((itemTag: any) => {
    if (!tagsMap.has(itemTag.item_id)) {
      tagsMap.set(itemTag.item_id, [])
    }
    if (itemTag.tag) {
      tagsMap.get(itemTag.item_id).push(itemTag.tag)
    }
  })
  
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
})