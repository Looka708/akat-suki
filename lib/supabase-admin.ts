import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (typeof window !== 'undefined') {
    throw new Error('supabaseAdmin can only be used on the server side!')
}

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase Admin environment variables')
}

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

