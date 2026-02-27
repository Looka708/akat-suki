'use client'

import React from 'react'

interface Tab {
 id: string
 label: string
 icon: string
}

interface TournamentTabsProps {
 tabs: Tab[]
 activeTab: string
 onChange: (tabId: string) => void
}

export default function TournamentTabs({ tabs, activeTab, onChange }: TournamentTabsProps) {
 return (
 <div className="flex items-center justify-center p-1 bg-zinc-900/60 border border-white/5 backdrop-blur-xl rounded-sm">
 {tabs.map((tab) => (
 <button
 key={tab.id}
 onClick={() => onChange(tab.id)}
 className={`
 relative flex items-center gap-2 px-6 py-2.5 transition-all duration-300 rounded-sm
 ${activeTab === tab.id
 ? 'text-white'
 : 'text-zinc-500 hover:text-zinc-300'
 }
 `}
 >
 {activeTab === tab.id && (
 <div className="absolute inset-0 bg-[#dc143c]/10 border border-[#dc143c]/20 rounded-sm animate-in fade-in zoom-in duration-300"></div>
 )}
 <span className={`text-base ${activeTab === tab.id ? 'text-[#dc143c]' : 'text-zinc-600'}`}>
 {tab.icon}
 </span>
 <span className="text-[10px] font-bold uppercase tracking-[0.2em] font-rajdhani">
 {tab.label}
 </span>
 {activeTab === tab.id && (
 <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-[1px] bg-[#dc143c] "></div>
 )}
 </button>
 ))}
 </div>
 )
}
