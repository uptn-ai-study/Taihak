import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { PlayerRecord } from '../types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

const TABLE = 'omok_players'

export async function upsertPlayer(record: Omit<PlayerRecord, 'updated_at'>): Promise<void> {
  if (!supabase) return
  await supabase.from(TABLE).upsert({ ...record, updated_at: new Date().toISOString() })
}

export async function fetchRanking(): Promise<PlayerRecord[]> {
  if (!supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('max_stage', { ascending: false })
    .order('wins', { ascending: false })
    .limit(30)
  if (error) throw error
  return data ?? []
}
