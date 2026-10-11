import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qronkroomifebgcgawhi.supabase.co'
const supabaseAnonKey = 'sb_publishable_SP1aF1WoKE27Q1EPfx-7-A_Ml7-tKlC'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)