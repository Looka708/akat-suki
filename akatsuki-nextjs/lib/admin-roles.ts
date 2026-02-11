// Admin role definitions and permissions

export const ADMIN_ROLES = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    MODERATOR: 'moderator',
    SUPPORT: 'support',
} as const

export type AdminRole = typeof ADMIN_ROLES[keyof typeof ADMIN_ROLES]

// Permission definitions
export const PERMISSIONS = {
    // Applications
    VIEW_APPLICATIONS: 'view_applications',
    REVIEW_APPLICATIONS: 'review_applications',
    APPROVE_APPLICATIONS: 'approve_applications',
    REJECT_APPLICATIONS: 'reject_applications',

    // Users
    VIEW_USERS: 'view_users',
    EDIT_USERS: 'edit_users',
    BAN_USERS: 'ban_users',
    MANAGE_ROLES: 'manage_roles',

    // Content
    VIEW_CONTENT: 'view_content',
    CREATE_CONTENT: 'create_content',
    EDIT_CONTENT: 'edit_content',
    DELETE_CONTENT: 'delete_content',

    // Analytics
    VIEW_ANALYTICS: 'view_analytics',
    EXPORT_DATA: 'export_data',

    // Settings
    VIEW_SETTINGS: 'view_settings',
    EDIT_SETTINGS: 'edit_settings',
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

// Role to permissions mapping
export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
    [ADMIN_ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS) as Permission[],
    [ADMIN_ROLES.ADMIN]: [
        PERMISSIONS.VIEW_APPLICATIONS,
        PERMISSIONS.REVIEW_APPLICATIONS,
        PERMISSIONS.APPROVE_APPLICATIONS,
        PERMISSIONS.REJECT_APPLICATIONS,
        PERMISSIONS.VIEW_USERS,
        PERMISSIONS.EDIT_USERS,
        PERMISSIONS.VIEW_CONTENT,
        PERMISSIONS.CREATE_CONTENT,
        PERMISSIONS.EDIT_CONTENT,
        PERMISSIONS.DELETE_CONTENT,
        PERMISSIONS.VIEW_ANALYTICS,
        PERMISSIONS.EXPORT_DATA,
        PERMISSIONS.VIEW_SETTINGS,
    ],
    [ADMIN_ROLES.MODERATOR]: [
        PERMISSIONS.VIEW_APPLICATIONS,
        PERMISSIONS.REVIEW_APPLICATIONS,
        PERMISSIONS.APPROVE_APPLICATIONS,
        PERMISSIONS.REJECT_APPLICATIONS,
        PERMISSIONS.VIEW_CONTENT,
        PERMISSIONS.VIEW_ANALYTICS,
    ],
    [ADMIN_ROLES.SUPPORT]: [
        PERMISSIONS.VIEW_APPLICATIONS,
        PERMISSIONS.VIEW_CONTENT,
    ],
}

// Check if role has permission
export function hasPermission(role: AdminRole, permission: Permission): boolean {
    return ROLE_PERMISSIONS[role]?.includes(permission) || false
}

// Get all permissions for a role
export function getRolePermissions(role: AdminRole): Permission[] {
    return ROLE_PERMISSIONS[role] || []
}
