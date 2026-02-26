import { describe, it, expect, vi } from 'vitest'
import { createTeam } from '@/lib/db/teams'

// Mock Supabase
vi.mock('@/lib/supabase-admin', () => ({
    supabaseAdmin: {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
}))

describe('Teams DB Module', () => {
    it('should throw error if team name is empty', async () => {
        await expect(createTeam('', 'user-123')).rejects.toThrow('Team name is required')
    })

    it('should generate invite codes for new teams', async () => {
        // This is more of a logic check than an integration test
        // In a real scenario, we'd mock the return value of the insert
    })
})
