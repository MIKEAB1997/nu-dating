import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  Users,
  Flag,
  Ban,
  Heart,
  TrendingUp,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

export default function AdminDashboard() {
  const { signOut } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [usersRes, matchesRes, reportsRes, blocksRes] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('matches').select('id', { count: 'exact', head: true }),
        supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('blocks').select('id', { count: 'exact', head: true }),
      ])

      return {
        totalUsers: usersRes.count || 0,
        totalMatches: matchesRes.count || 0,
        pendingReports: reportsRes.count || 0,
        totalBlocks: blocksRes.count || 0,
      }
    },
  })

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'סקירה כללית', exact: true },
    { to: '/admin/users', icon: Users, label: 'משתמשים' },
    { to: '/admin/reports', icon: Flag, label: 'דיווחים' },
    { to: '/admin/blocks', icon: Ban, label: 'חסימות' },
  ]

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 right-4 z-50 lg:hidden bg-white p-2 rounded-lg shadow-md"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 right-0 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out z-40',
          'lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-primary-500">NU! Admin</h1>
            <p className="text-sm text-gray-500">פאנל ניהול</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map(({ to, icon: Icon, label, exact }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                  isActive(to, exact)
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{label}</span>
              </Link>
            ))}
          </nav>

          {/* Sign out */}
          <div className="p-4 border-t">
            <button
              onClick={signOut}
              className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">יציאה</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:mr-64 p-6">
        {location.pathname === '/admin' ? (
          // Dashboard overview
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">סקירה כללית</h2>

            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="סה״כ משתמשים"
                value={stats?.totalUsers || 0}
                icon={Users}
                color="blue"
              />
              <StatCard
                title="התאמות"
                value={stats?.totalMatches || 0}
                icon={Heart}
                color="pink"
              />
              <StatCard
                title="דיווחים ממתינים"
                value={stats?.pendingReports || 0}
                icon={Flag}
                color="orange"
                alert={stats?.pendingReports && stats.pendingReports > 0}
              />
              <StatCard
                title="חסימות"
                value={stats?.totalBlocks || 0}
                icon={Ban}
                color="red"
              />
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">פעולות מהירות</h3>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/admin/users"
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  ניהול משתמשים
                </Link>
                <Link
                  to="/admin/reports"
                  className="px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  בדוק דיווחים
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <Outlet />
        )}
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number
  icon: React.ElementType
  color: 'blue' | 'pink' | 'orange' | 'red'
  alert?: boolean
}

function StatCard({ title, value, icon: Icon, color, alert }: StatCardProps) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    pink: 'bg-pink-50 text-pink-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
  }

  return (
    <div className={cn('bg-white rounded-2xl p-6 shadow-sm', alert && 'ring-2 ring-orange-400')}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={cn('p-3 rounded-xl', colors[color])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}
