import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

let supabaseAdminInstance: SupabaseClient | null = null

function getSupabaseAdmin(): SupabaseClient {
    // Ensure this is server-side only
    if (typeof window !== 'undefined') {
        throw new Error('supabaseAdmin can only be used on the server side!')
    }

    // Return cached instance if available
    if (supabaseAdminInstance) {
        return supabaseAdminInstance
    }

    // Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    // Validate environment variables
    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing Supabase Admin environment variables')
    }

    // Create and cache the admin client
    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    return supabaseAdminInstance
}

// Export a proxy that lazily initializes the admin client
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
    get: (target, prop) => {
        const admin = getSupabaseAdmin()
        return (admin as any)[prop]
    }
})

