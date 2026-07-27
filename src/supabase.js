import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mgxzrpcuvaxseudzftfk.supabase.co'
const supabaseAnonKey = 'sb_publishable_cmgZbFFbwZj3eMzQ5pn9TA_raOv75NA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)