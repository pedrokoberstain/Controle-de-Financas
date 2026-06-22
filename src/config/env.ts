/**
 * Acesso centralizado e tipado às variáveis de ambiente.
 *
 * Enquanto as chaves do Supabase não estiverem preenchidas, o app opera
 * em modo local (localStorage). Assim dá pra usar no celular hoje e migrar
 * para a nuvem depois sem tocar na UI.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? ''

export const env = {
  supabaseUrl,
  supabaseAnonKey,
  /** True quando há credenciais do Supabase configuradas. */
  hasSupabase: Boolean(supabaseUrl && supabaseAnonKey),
} as const
