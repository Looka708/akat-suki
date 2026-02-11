import { ReactNode } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/admin-auth'

interface AdminLayoutProps {
    children: ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
    // Check if user is admin
    const adminUser = await getAdminUser()

    if (!adminUser) {
        redirect('/?auth=admin_required')
    }

    return (
        <div className="min-h-screen bg-[#050505]">
            <AdminSidebar />
            <div className="ml-64">
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
