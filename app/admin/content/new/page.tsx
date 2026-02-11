'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewPostPage() {
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [excerpt, setExcerpt] = useState('')
    const [featuredImage, setFeaturedImage] = useState('')
    const [status, setStatus] = useState<'draft' | 'published'>('draft')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)

        try {
            const response = await fetch('/api/content/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    content,
                    excerpt,
                    featured_image: featuredImage,
                    status
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create post')
            }

            router.push('/admin/content')
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/content"
                        className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-sm text-gray-400 hover:text-white hover:border-white/20 transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-rajdhani font-bold text-white tracking-wide uppercase">
                            Create New Post
                        </h1>
                        <p className="text-gray-400 text-[10px] uppercase tracking-[0.2em] font-mono mt-1">
                            Publish organization news and announcements
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white/[0.02] border border-white/10 rounded-sm p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Post Title</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter a compelling title..."
                                className="w-full bg-black border border-white/10 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-[#dc143c] placeholder-gray-700 font-rajdhani text-xl"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Content (Markdown Supported)</label>
                            <textarea
                                required
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Write your post content here..."
                                className="w-full h-[400px] bg-black border border-white/10 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-[#dc143c] placeholder-gray-700 font-mono text-sm leading-relaxed resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar Settings */}
                <div className="space-y-6">
                    <div className="bg-white/[0.02] border border-white/10 rounded-sm p-6 space-y-6">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-white/10 pb-4">Post Settings</h3>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Excerpt</label>
                            <textarea
                                value={excerpt}
                                onChange={(e) => setExcerpt(e.target.value)}
                                placeholder="Short summary of the post..."
                                className="w-full h-24 bg-black border border-white/10 rounded-sm px-3 py-2 text-white text-xs focus:outline-none focus:border-[#dc143c] placeholder-gray-700 resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Featured Image URL</label>
                            <input
                                type="url"
                                value={featuredImage}
                                onChange={(e) => setFeaturedImage(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                                className="w-full bg-black border border-white/10 rounded-sm px-3 py-2 text-white text-xs focus:outline-none focus:border-[#dc143c] placeholder-gray-700"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Publication Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                                className="w-full bg-black border border-white/10 rounded-sm px-3 py-2 text-white text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-[#dc143c]"
                            >
                                <option value="draft">Save as Draft</option>
                                <option value="published">Publish Immediately</option>
                            </select>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-bold uppercase tracking-widest text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 bg-[#dc143c] hover:bg-white hover:text-black text-white text-xs font-bold uppercase tracking-[0.2em] rounded-sm transition-all shadow-[0_0_20px_rgba(220,20,60,0.2)] disabled:opacity-50"
                        >
                            {isSubmitting ? 'Processing...' : status === 'published' ? 'Launch Post' : 'Save Draft'}
                        </button>
                    </div>

                    <div className="bg-[#dc143c]/5 border border-[#dc143c]/10 rounded-sm p-4">
                        <p className="text-[10px] text-gray-400 leading-relaxed uppercase tracking-widest">
                            <span className="text-[#dc143c] font-bold">Pro Tip:</span> Slugs are automatically generated from your title. Ensure your content follows organization guidelines before publishing.
                        </p>
                    </div>
                </div>
            </form>
        </div>
    )
}
