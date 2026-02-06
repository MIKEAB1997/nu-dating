import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mx-auto"></div>
          <p className="mt-4 text-gray-600">טוען...</p>
        </div>
      </div>
    )
  }

  if (user) {
    // If user is logged in, redirect to discover
    return <Navigate to="/discover" replace />
  }

  return <>{children}</>
}
