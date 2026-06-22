import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { env } from '../config/env'

/**
 * Cliente Supabase singleton. Só é criado quando há credenciais
 * configuradas (.env.local). Enquanto isso, fica null e o app usa o
 * repositório local.
 */
export const supabase: SupabaseClient | null = env.hasSupabase
  ? createClient(env.supabaseUrl, env.supabaseAnonKey)
  : null
