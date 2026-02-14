'use client'

import { useState, useEffect } from 'react'

interface DiscordRole {
    id: string
    name: string
    color: number
    position: number
}

interface UserRoleData {
    userId: string
    username: string
    roles: string[]
}

export default function RoleManagementPage() {
    const [roles, setRoles] = useState<DiscordRole[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Form state
    const [userId, setUserId] = useState('')
    const [selectedRoleId, setSelectedRoleId] = useState('')
    const [userRoles, setUserRoles] = useState<UserRoleData | null>(null)
    const [processing, setProcessing] = useState(false)

    // Auto-assign state
    const [autoAssignUserId, setAutoAssignUserId] = useState('')
    const [selectedAutoRoles, setSelectedAutoRoles] = useState<string[]>([])

    useEffect(() => {
        fetchRoles()
    }, [])

    const fetchRoles = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/discord/roles')

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to fetch roles')
            }

            const data = await response.json()
            setRoles(data.roles || [])
            setError(null)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const fetchUserRoles = async (targetUserId: string) => {
        try {
            setProcessing(true)
            const response = await fetch(`/api/discord/roles?userId=${targetUserId}`)

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to fetch user roles')
            }

            const data = await response.json()
            setUserRoles(data)
        } catch (err: any) {
            alert(`Error: ${err.message}`)
        } finally {
            setProcessing(false)
        }
    }

    const handleAddRole = async () => {
        if (!userId || !selectedRoleId) {
            alert('Please enter a User ID and select a role')
            return
        }

        try {
            setProcessing(true)
            const response = await fetch('/api/discord/roles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    roleId: selectedRoleId,
                    action: 'add',
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to add role')
            }

            alert('✅ Role added successfully!')
            await fetchUserRoles(userId)
        } catch (err: any) {
            alert(`❌ Error: ${err.message}`)
        } finally {
            setProcessing(false)
        }
    }

    const handleRemoveRole = async () => {
        if (!userId || !selectedRoleId) {
            alert('Please enter a User ID and select a role')
            return
        }

        try {
            setProcessing(true)
            const response = await fetch('/api/discord/roles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    roleId: selectedRoleId,
                    action: 'remove',
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to remove role')
            }

            alert('✅ Role removed successfully!')
            await fetchUserRoles(userId)
        } catch (err: any) {
            alert(`❌ Error: ${err.message}`)
        } finally {
            setProcessing(false)
        }
    }

    const handleAutoAssign = async () => {
        if (!autoAssignUserId || selectedAutoRoles.length === 0) {
            alert('Please enter a User ID and select at least one role')
            return
        }

        try {
            setProcessing(true)
            const response = await fetch('/api/discord/auto-assign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: autoAssignUserId,
                    roleIds: selectedAutoRoles,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to auto-assign roles')
            }

            alert(`✅ ${data.message}\n\nAssigned: ${data.assignedRoles.length}\nFailed: ${data.failedRoles.length}`)
            setSelectedAutoRoles([])
        } catch (err: any) {
            alert(`❌ Error: ${err.message}`)
        } finally {
            setProcessing(false)
        }
    }

    const toggleAutoRole = (roleId: string) => {
        setSelectedAutoRoles(prev =>
            prev.includes(roleId)
                ? prev.filter(id => id !== roleId)
                : [...prev, roleId]
        )
    }

    const getRoleColor = (color: number) => {
        if (color === 0) return '#99AAB5'
        return `#${color.toString(16).padStart(6, '0')}`
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#dc143c]"></div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-rajdhani font-bold text-white tracking-wide">
                    Discord Role Management
                </h1>
                <p className="text-gray-400 mt-1">
                    Manage Discord server roles for members
                </p>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-sm p-4 text-red-400">
                    <strong>Error:</strong> {error}
                    <p className="text-sm mt-1">Make sure DISCORD_BOT_TOKEN and DISCORD_GUILD_ID are set in .env.local</p>
                </div>
            )}

            {/* Manual Role Add/Remove */}
            <div className="bg-white/[0.02] border border-white/10 rounded-sm p-6">
                <h2 className="text-xl font-rajdhani font-bold text-white mb-6">
                    Manual Role Management
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-400 text-sm mb-2">
                            Discord User ID
                        </label>
                        <input
                            type="text"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            onBlur={(e) => e.target.value && fetchUserRoles(e.target.value)}
                            placeholder="Enter Discord User ID (e.g., 814571007804833852)"
                            className="w-full px-4 py-2 bg-white/[0.05] border border-white/10 rounded-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#dc143c] transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm mb-2">
                            Select Role
                        </label>
                        <select
                            value={selectedRoleId}
                            onChange={(e) => setSelectedRoleId(e.target.value)}
                            className="w-full px-4 py-2 bg-white/[0.05] border border-white/10 rounded-sm text-white focus:outline-none focus:border-[#dc143c] transition-colors"
                        >
                            <option value="">-- Select a role --</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={handleAddRole}
                            disabled={processing || !userId || !selectedRoleId}
                            className="flex-1 px-6 py-3 bg-[#22c55e] hover:bg-[#16a34a] disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-rajdhani font-bold rounded-sm transition-colors"
                        >
                            {processing ? 'Processing...' : 'Add Role'}
                        </button>
                        <button
                            onClick={handleRemoveRole}
                            disabled={processing || !userId || !selectedRoleId}
                            className="flex-1 px-6 py-3 bg-[#ef4444] hover:bg-[#dc2626] disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-rajdhani font-bold rounded-sm transition-colors"
                        >
                            {processing ? 'Processing...' : 'Remove Role'}
                        </button>
                    </div>

                    {userRoles && (
                        <div className="mt-4 p-4 bg-white/[0.05] rounded-sm">
                            <h3 className="text-white font-bold mb-2">
                                {userRoles.username}&apos;s Current Roles
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {userRoles.roles.length > 0 ? (
                                    userRoles.roles.map((roleId) => {
                                        const role = roles.find(r => r.id === roleId)
                                        return role ? (
                                            <span
                                                key={roleId}
                                                className="px-3 py-1 rounded-full text-sm font-medium"
                                                style={{
                                                    backgroundColor: `${getRoleColor(role.color)}20`,
                                                    borderColor: getRoleColor(role.color),
                                                    borderWidth: '1px',
                                                    color: getRoleColor(role.color),
                                                }}
                                            >
                                                {role.name}
                                            </span>
                                        ) : null
                                    })
                                ) : (
                                    <p className="text-gray-500">No roles</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Auto-Assign Multiple Roles */}
            <div className="bg-white/[0.02] border border-white/10 rounded-sm p-6">
                <h2 className="text-xl font-rajdhani font-bold text-white mb-6">
                    Auto-Assign Multiple Roles
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-400 text-sm mb-2">
                            Discord User ID
                        </label>
                        <input
                            type="text"
                            value={autoAssignUserId}
                            onChange={(e) => setAutoAssignUserId(e.target.value)}
                            placeholder="Enter Discord User ID"
                            className="w-full px-4 py-2 bg-white/[0.05] border border-white/10 rounded-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#dc143c] transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm mb-2">
                            Select Roles to Assign
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-2 bg-white/[0.02] rounded-sm">
                            {roles.map((role) => (
                                <label
                                    key={role.id}
                                    className="flex items-center gap-2 p-2 hover:bg-white/[0.05] rounded cursor-pointer transition-colors"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedAutoRoles.includes(role.id)}
                                        onChange={() => toggleAutoRole(role.id)}
                                        className="w-4 h-4 accent-[#dc143c]"
                                    />
                                    <span
                                        className="text-sm font-medium"
                                        style={{ color: getRoleColor(role.color) }}
                                    >
                                        {role.name}
                                    </span>
                                </label>
                            ))}
                        </div>
                        {selectedAutoRoles.length > 0 && (
                            <p className="text-gray-400 text-xs mt-2">
                                {selectedAutoRoles.length} role(s) selected
                            </p>
                        )}
                    </div>

                    <button
                        onClick={handleAutoAssign}
                        disabled={processing || !autoAssignUserId || selectedAutoRoles.length === 0}
                        className="w-full px-6 py-3 bg-[#dc143c] hover:bg-[#ff1744] disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-rajdhani font-bold rounded-sm transition-colors"
                    >
                        {processing ? 'Assigning...' : `Assign ${selectedAutoRoles.length} Role(s)`}
                    </button>
                </div>
            </div>

            {/* Available Roles List */}
            <div className="bg-white/[0.02] border border-white/10 rounded-sm p-6">
                <h2 className="text-xl font-rajdhani font-bold text-white mb-6">
                    Available Roles ({roles.length})
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {roles.map((role) => (
                        <div
                            key={role.id}
                            className="p-3 bg-white/[0.02] border border-white/10 rounded-sm hover:bg-white/[0.05] transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: getRoleColor(role.color) }}
                                />
                                <span className="text-white font-medium">{role.name}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                Position: {role.position}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
