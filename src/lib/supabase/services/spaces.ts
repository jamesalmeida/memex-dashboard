import { createClient } from '@/lib/supabase/client'
import type { Space, CreateSpaceInput, UpdateSpaceInput } from '@/types/database'

export const spacesService = {
  // Get all spaces for the current user
  async getSpaces(): Promise<Space[]> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('spaces')
      .select('*')
      .eq('is_archived', false)
      .order('sort_order', { ascending: true })
    
    if (error) throw error
    
    return data || []
  },

  // Get spaces with item counts
  async getSpacesWithCounts(): Promise<(Space & { item_count: number })[]> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('spaces')
      .select('*')
      .eq('is_archived', false)
      .order('sort_order', { ascending: true })
    
    if (error) throw error
    
    // For now, return spaces without counts
    return (data || []).map(space => ({
      ...space,
      item_count: 0
    }))
  },

  // Get a single space by ID
  async getSpace(id: string): Promise<Space | null> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('spaces')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }
    
    return data
  },

  // Create a new space
  async createSpace(input: CreateSpaceInput): Promise<Space> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')
    
    // Get the highest sort_order
    const { data: maxSortOrder } = await supabase
      .from('spaces')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .single()
    
    const nextSortOrder = (maxSortOrder?.sort_order || 0) + 1
    
    const { data, error } = await supabase
      .from('spaces')
      .insert({
        ...input,
        user_id: user.id,
        sort_order: input.sort_order ?? nextSortOrder
      })
      .select()
      .single()
    
    if (error) throw error
    
    return data
  },

  // Update a space
  async updateSpace(id: string, input: UpdateSpaceInput): Promise<Space> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('spaces')
      .update(input)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return data
  },

  // Archive a space
  async archiveSpace(id: string): Promise<void> {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('spaces')
      .update({ is_archived: true })
      .eq('id', id)
    
    if (error) throw error
  },

  // Delete a space permanently
  async deleteSpace(id: string): Promise<void> {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('spaces')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Reorder spaces
  async reorderSpaces(spaceIds: string[]): Promise<void> {
    const supabase = createClient()
    
    // Update sort_order for each space
    const updates = spaceIds.map((id, index) => 
      supabase
        .from('spaces')
        .update({ sort_order: index })
        .eq('id', id)
    )
    
    await Promise.all(updates)
  },

  // Get default space (first non-archived space)
  async getDefaultSpace(): Promise<Space | null> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('spaces')
      .select('*')
      .eq('is_archived', false)
      .order('sort_order', { ascending: true })
      .limit(1)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // No spaces found
      throw error
    }
    
    return data
  }
}