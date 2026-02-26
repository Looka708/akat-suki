// Environment variable validation — throws at build/startup if critical vars are missing

function requireEnv(key: string): string {
    const value = process.env[key]
    if (!value) {
        throw new Error(`❌ Missing required environment variable: ${key}`)
    }
    return value
}

function optionalEnv(key: string, fallback: string = ''): string {
    return process.env[key] || fallback
}

// Supabase
export const SUPABASE_URL = requireEnv('NEXT_PUBLIC_SUPABASE_URL')
export const SUPABASE_ANON_KEY = requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
export const SUPABASE_SERVICE_ROLE_KEY = requireEnv('SUPABASE_SERVICE_ROLE_KEY')

// Discord
export const DISCORD_CLIENT_ID = requireEnv('DISCORD_CLIENT_ID')
export const DISCORD_CLIENT_SECRET = requireEnv('DISCORD_CLIENT_SECRET')
export const DISCORD_BOT_TOKEN = requireEnv('DISCORD_BOT_TOKEN')
export const DISCORD_GUILD_ID = optionalEnv('DISCORD_GUILD_ID')
export const DISCORD_REDIRECT_URI = optionalEnv('DISCORD_REDIRECT_URI')

// Auth
export const SESSION_SECRET = requireEnv('SESSION_SECRET')

// Optional
export const NEXT_PUBLIC_URL = optionalEnv('NEXT_PUBLIC_URL', 'http://localhost:3000')
