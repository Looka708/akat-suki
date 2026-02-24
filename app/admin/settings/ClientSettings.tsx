'use client'

import { useState, FormEvent, useEffect } from 'react'

export default function ClientSettings({ initialSettings }: { initialSettings: any }) {
    const [settings, setSettings] = useState(initialSettings)
    const [saving, setSaving] = useState<string | null>(null)
    const [message, setMessage] = useState('')

    const [general, setGeneral] = useState(initialSettings.general || { app_title: 'AKATSUKI ESports', maintenance_mode: false, contact_email: '' })
    const [integrations, setIntegrations] = useState(initialSettings.integrations || { discord_enabled: true })
    const [tourneyDefs, setTourneyDefs] = useState(initialSettings.tournament_defaults || { global_registration_open: true, default_currency: 'USD' })

    const handleSave = async (moduleKey: string, data: any) => {
        setSaving(moduleKey)
        setMessage('')
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ moduleKey, data })
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Failed to save settings')
            }

            setMessage(`Settings saved successfully for ${moduleKey}!`)
            setTimeout(() => setMessage(''), 3000)
        } catch (e: any) {
            setMessage(e.message)
            setTimeout(() => setMessage(''), 5000)
        } finally {
            setSaving(null)
        }
    }

    return (
        <div className="space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-rajdhani font-bold text-white tracking-wide">
                        Platform Settings
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Global configuration state for active systems and modules. Be careful making changes here.
                    </p>
                </div>
            </div>

            {message && (
                <div className="bg-white/10 text-white p-3 rounded-sm border border-white/20 text-sm font-medium tracking-wide">
                    {message}
                </div>
            )}

            {/* General Settings */}
            <div className="bg-white/[0.02] border border-white/10 rounded-sm overflow-hidden p-6 max-w-4xl">
                <h2 className="text-xl font-rajdhani font-bold text-white mb-6 flex items-center gap-3">
                    <span className="w-4 h-1 bg-[#dc143c]"></span>
                    GENERAL CONFIGURATION
                </h2>

                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave('general', general) }}>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 tracking-widest uppercase mb-2">Application Title</label>
                        <input
                            type="text"
                            value={general.app_title}
                            onChange={(e) => setGeneral({ ...general, app_title: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-[#dc143c] transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 tracking-widest uppercase mb-2">Support Email</label>
                        <input
                            type="email"
                            value={general.contact_email}
                            onChange={(e) => setGeneral({ ...general, contact_email: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-[#dc143c] transition-colors"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={general.maintenance_mode}
                                    onChange={(e) => setGeneral({ ...general, maintenance_mode: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-10 h-6 bg-white/10 rounded-full peer peer-checked:bg-[#dc143c] peer-focus:ring-2 peer-focus:ring-[#dc143c]/20 transition-all"></div>
                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-4 transition-all shadow-sm"></div>
                            </div>
                            <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                                Enable Maintenance Mode (Suspends User Access)
                            </span>
                        </label>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                        <button type="submit" disabled={saving === 'general'} className="px-6 py-2 bg-[#dc143c] hover:bg-[#dc143c]/80 text-white rounded-sm font-rajdhani uppercase font-bold tracking-widest transition-colors disabled:opacity-50">
                            {saving === 'general' ? 'SAVING...' : 'SAVE GENERAL'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Integration Setups */}
            <div className="bg-white/[0.02] border border-white/10 rounded-sm overflow-hidden p-6 max-w-4xl">
                <h2 className="text-xl font-rajdhani font-bold text-white mb-6 flex items-center gap-3">
                    <span className="w-4 h-1 bg-[#5865F2]"></span>
                    EXTERNAL INTEGRATIONS
                </h2>

                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave('integrations', integrations) }}>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={integrations.discord_enabled}
                                    onChange={(e) => setIntegrations({ ...integrations, discord_enabled: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-10 h-6 bg-white/10 rounded-full peer peer-checked:bg-[#5865F2] peer-focus:ring-2 peer-focus:ring-[#dc143c]/20 transition-all"></div>
                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-4 transition-all shadow-sm"></div>
                            </div>
                            <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                                Enable Discord Auth & Server Invites
                            </span>
                        </label>
                    </div>

                    <p className="text-xs text-gray-500 font-mono">
                        Discord Webhooks, Bot Tokens, and Guild Identifiers are automatically picked up from .env.local on deployment safely. Toggle the system usage globally above.
                    </p>

                    <div className="pt-4 border-t border-white/10">
                        <button type="submit" disabled={saving === 'integrations'} className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-sm font-rajdhani uppercase font-bold tracking-widest transition-colors disabled:opacity-50">
                            {saving === 'integrations' ? 'SAVING...' : 'SAVE INTEGRATIONS'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Tournament Defaults Settings */}
            <div className="bg-white/[0.02] border border-white/10 rounded-sm overflow-hidden p-6 max-w-4xl">
                <h2 className="text-xl font-rajdhani font-bold text-white mb-6 flex items-center gap-3">
                    <span className="w-4 h-1 bg-yellow-500"></span>
                    TOURNAMENT DEFAULTS
                </h2>

                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave('tournament_defaults', tourneyDefs) }}>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 tracking-widest uppercase mb-2">Default Currency</label>
                        <select
                            value={tourneyDefs.default_currency}
                            onChange={(e) => setTourneyDefs({ ...tourneyDefs, default_currency: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                        >
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={tourneyDefs.global_registration_open}
                                    onChange={(e) => setTourneyDefs({ ...tourneyDefs, global_registration_open: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-10 h-6 bg-white/10 rounded-full peer peer-checked:bg-yellow-500 peer-focus:ring-2 peer-focus:ring-[#dc143c]/20 transition-all"></div>
                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-4 transition-all shadow-sm"></div>
                            </div>
                            <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                                Allow new tournament creation & global active registry routes.
                            </span>
                        </label>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                        <button type="submit" disabled={saving === 'tournament_defaults'} className="px-6 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 rounded-sm font-rajdhani uppercase font-bold tracking-widest transition-colors disabled:opacity-50">
                            {saving === 'tournament_defaults' ? 'SAVING...' : 'SAVE DEFAULTS'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
