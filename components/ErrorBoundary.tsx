'use client'

import React from 'react'

interface ErrorBoundaryProps {
    children: React.ReactNode
    fallback?: React.ReactNode
}

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('[ErrorBoundary] Caught error:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback

            return (
                <div className="min-h-[400px] flex items-center justify-center">
                    <div className="text-center max-w-md px-6">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#dc143c]/10 border border-[#dc143c]/20 flex items-center justify-center">
                            <span className="text-[#dc143c] text-2xl">!</span>
                        </div>
                        <h3 className="text-xl font-rajdhani font-bold text-white uppercase tracking-wider mb-2">
                            Something went wrong
                        </h3>
                        <p className="text-zinc-500 text-sm font-mono mb-6">
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </p>
                        <button
                            onClick={() => {
                                this.setState({ hasError: false, error: null })
                                window.location.reload()
                            }}
                            className="px-6 py-2.5 bg-[#dc143c]/10 text-[#dc143c] border border-[#dc143c]/30 hover:bg-[#dc143c] hover:text-white rounded-sm text-xs font-bold uppercase tracking-widest transition-all"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
