import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// Client for browser/client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)


// Database types
export interface Database {
    public: {
        Tables: {
            users: {
                Row: User
                Insert: Omit<User, 'created_at' | 'last_active'>
                Update: Partial<Omit<User, 'id' | 'created_at'>>
            }
            applications: {
                Row: Application
                Insert: Omit<Application, 'id' | 'created_at' | 'submitted_at'>
                Update: Partial<Omit<Application, 'id' | 'created_at' | 'submitted_at'>>
            }
            blog_posts: {
                Row: BlogPost
                Insert: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<BlogPost, 'id' | 'created_at'>>
            }
            players: {
                Row: Player
                Insert: Omit<Player, 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Player, 'id' | 'created_at'>>
            }
            activity_logs: {
                Row: ActivityLog
                Insert: Omit<ActivityLog, 'id' | 'created_at'>
                Update: never
            }
            notes: {
                Row: Note
                Insert: Omit<Note, 'id' | 'created_at'>
                Update: Partial<Omit<Note, 'id' | 'created_at'>>
            }
        }
    }
}

export interface User {
    id: string
    username: string
    discriminator: string
    avatar: string | null
    email: string | null
    role: string
    status: 'active' | 'inactive' | 'banned'
    created_at: string
    last_active: string | null
}

export interface Application {
    id: string
    discord_id: string
    discord_username: string
    discord_discriminator: string
    discord_avatar: string | null
    email: string
    full_name: string
    position: string
    experience: string
    why_join: string
    availability: string
    status: 'pending' | 'approved' | 'rejected' | 'waitlisted'
    submitted_at: string
    reviewed_at: string | null
    reviewed_by: string | null
    review_notes: string | null
    created_at: string
}

export interface BlogPost {
    id: string
    title: string
    slug: string
    content: string
    excerpt: string | null
    featured_image: string | null
    author_id: string
    status: 'draft' | 'published' | 'scheduled'
    published_at: string | null
    created_at: string
    updated_at: string
}

export interface Player {
    id: string
    discord_id: string
    ign: string
    real_name: string
    avatar: string
    game: string
    role: string
    nationality: string
    join_date: string
    twitter: string | null
    twitch: string | null
    youtube: string | null
    status: 'active' | 'inactive' | 'retired'
    created_at: string
    updated_at: string
}

export interface ActivityLog {
    id: string
    user_id: string
    action: string
    entity_type: string
    entity_id: string
    details: Record<string, unknown> | null
    ip_address: string | null
    user_agent: string | null
    created_at: string
}

export interface Note {
    id: string
    user_id: string
    entity_type: string
    entity_id: string
    content: string
    created_at: string
}
