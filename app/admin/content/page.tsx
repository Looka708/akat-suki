import { requirePermission } from '@/lib/admin-auth'
import { PERMISSIONS } from '@/lib/admin-roles'
import { supabaseAdmin } from '@/lib/supabase-admin'

import Link from 'next/link'

export default async function ContentPage() {
    await requirePermission(PERMISSIONS.VIEW_CONTENT)


    // Fetch blog posts
    const { data: posts, error } = await supabaseAdmin
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching blog posts:', error)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-rajdhani font-bold text-white tracking-wide uppercase">
                        Content Management
                    </h1>
                    <p className="text-gray-400 mt-1 uppercase tracking-widest text-[10px] font-mono">
                        Publish and manage organization news and updates
                    </p>
                </div>
                <Link
                    href="/admin/content/new"
                    className="px-6 py-2 bg-[#dc143c] text-white text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-white hover:text-black transition-all"
                >
                    Create New Post
                </Link>

            </div>

            <div className="bg-white/[0.02] border border-white/10 rounded-sm overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Post</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Author</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Status</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Published At</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {posts && posts.length > 0 ? (
                            posts.map((post) => (
                                <tr key={post.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-white text-sm font-medium">{post.title}</span>
                                            <span className="text-gray-500 text-[10px] font-mono">{post.slug}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-400">
                                        {post.author_id}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest border ${post.status === 'published' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                            }`}>
                                            {post.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                                        {post.published_at ? new Date(post.published_at).toLocaleString() : 'Not published'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-[#dc143c] text-xs font-bold hover:underline">Edit</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500 uppercase tracking-widest text-xs">
                                    No organization content found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
