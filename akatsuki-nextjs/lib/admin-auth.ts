import { getUserFromSession } from './session'
import { ADMIN_ROLES, ROLE_PERMISSIONS, hasPermission, type AdminRole, type Permission } from './admin-roles'

export interface AdminUser {
    id: string
    username: string
    discriminator: string
    avatar: string | null
    email: string | null
    role: AdminRole
    permissions: Permission[]
}

// List of Discord user IDs with admin access (temporary solution)
// In production, this should be stored in a database
const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || '').split(',').filter(Boolean)

// Determine admin role based on user ID
// In production, fetch from database or Discord roles
export function getAdminRole(userId: string): AdminRole | null {

    // For now, first user is super admin, others are regular admins
    // Replace this with actual role checking logic
    if (ADMIN_USER_IDS.length === 0) {
        return null
    }

    if (userId === ADMIN_USER_IDS[0]) {
        return ADMIN_ROLES.SUPER_ADMIN
    }

    if (ADMIN_USER_IDS.includes(userId)) {
        return ADMIN_ROLES.ADMIN
    }

    return null
}

// Get admin user from session
export async function getAdminUser(): Promise<AdminUser | null> {
    const user = await getUserFromSession()

    if (!user) {
        return null
    }

    const role = getAdminRole(user.id)

    if (!role) {
        return null
    }

    return {
        id: user.id,
        username: user.username,
        discriminator: user.discriminator,
        avatar: user.avatar,
        email: user.email,
        role,
        permissions: ROLE_PERMISSIONS[role],
    }
}

// Check if user has specific permission
export function userHasPermission(user: AdminUser | null, permission: Permission): boolean {
    if (!user) return false
    return hasPermission(user.role, permission)
}

// Require admin access
export async function requireAdmin(): Promise<AdminUser> {
    const user = await getAdminUser()

    if (!user) {
        throw new Error('Admin access required')
    }

    return user
}

// Require specific permission
export async function requirePermission(permission: Permission): Promise<AdminUser> {
    const user = await requireAdmin()

    if (!userHasPermission(user, permission)) {
        throw new Error(`Permission required: ${permission}`)
    }

    return user
}
