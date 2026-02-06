import { useQuery } from '@tanstack/react-query'
import { Link, useLocation } from 'react-router-dom'
import { Flame, MessageCircle, User, Heart, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

interface MatchedUser {
  id: string
  name: string
  age: number
  city: string
  photos: string[]
  is_active: boolean
  last_active_at: string | null
}

interface Match {
  id: string
  created_at: string
  last_activity_at: string
  matched_user: MatchedUser
}

export default function Matches() {
  const { user } = useAuth()
  const location = useLocation()

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['matches', user?.id],
    queryFn: async () => {
      if (!user) return []

      // Get current user's database ID
      const { data: currentUserData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single()

      if (!currentUserData) return []

      // Fetch matches where user is either user1 or user2
      const { data: matchesData, error } = await supabase
        .from('matches')
        .select(`
          id,
          created_at,
          last_activity_at,
          user1_id,
          user2_id
        `)
        .or(`user1_id.eq.${currentUserData.id},user2_id.eq.${currentUserData.id}`)
        .order('last_activity_at', { ascending: false })

      if (error || !matchesData) {
        console.error('Error fetching matches:', error)
        return []
      }

      // Fetch the matched users' details
      const matchesWithUsers: Match[] = []

      for (const match of matchesData) {
        const matchedUserId = match.user1_id === currentUserData.id
          ? match.user2_id
          : match.user1_id

        const { data: matchedUser } = await supabase
          .from('users')
          .select('id, name, age, city, photos, is_active, last_active_at')
          .eq('id', matchedUserId)
          .single()

        if (matchedUser) {
          matchesWithUsers.push({
            id: match.id,
            created_at: match.created_at,
            last_activity_at: match.last_activity_at,
            matched_user: matchedUser,
          })
        }
      }

      return matchesWithUsers
    },
    enabled: !!user,
  })

  return (
    <div className="min-h-screen bg-gray-50 pb-20" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-md mx-auto px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary-500" />
            ההתאמות שלי
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400" />
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              עדיין אין התאמות
            </h2>
            <p className="text-gray-500 mb-6">
              המשיכו לגלות אנשים חדשים ותמצאו את ההתאמה שלכם
            </p>
            <Link
              to="/discover"
              className="inline-flex items-center gap-2 bg-primary-400 text-white px-6 py-3 rounded-full font-medium hover:bg-primary-500 transition-colors"
            >
              <Search className="w-5 h-5" />
              גלו אנשים חדשים
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav currentPath={location.pathname} />
    </div>
  )
}

function MatchCard({ match }: { match: Match }) {
  const { matched_user } = match
  const photo = matched_user.photos?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(matched_user.name)}&size=80&background=f47a3a&color=fff`

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'עכשיו'
    if (diffMins < 60) return `לפני ${diffMins} דקות`
    if (diffHours < 24) return `לפני ${diffHours} שעות`
    if (diffDays < 7) return `לפני ${diffDays} ימים`
    return date.toLocaleDateString('he-IL')
  }

  return (
    <Link
      to={`/loop/${match.id}`}
      className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all active:scale-[0.98]"
    >
      <div className="relative flex-shrink-0">
        <img
          src={photo}
          alt={matched_user.name}
          className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
        />
        {matched_user.is_active && (
          <span className="absolute bottom-0 left-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 truncate">{matched_user.name}</h3>
          <span className="text-gray-400">,</span>
          <span className="text-gray-600">{matched_user.age}</span>
        </div>
        <p className="text-sm text-gray-500 truncate">{matched_user.city}</p>
        <p className="text-xs text-gray-400 mt-1">{formatTime(match.last_activity_at)}</p>
      </div>

      <MessageCircle className="w-6 h-6 text-primary-400" />
    </Link>
  )
}

function BottomNav({ currentPath }: { currentPath: string }) {
  const navItems = [
    { to: '/discover', icon: Flame, label: 'גלה' },
    { to: '/matches', icon: MessageCircle, label: 'התאמות' },
    { to: '/profile', icon: User, label: 'פרופיל' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="max-w-md mx-auto flex justify-around py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              'flex flex-col items-center gap-0.5 px-4 py-1 transition-colors',
              currentPath === to ? 'text-primary-500' : 'text-gray-400 hover:text-gray-600'
            )}
          >
            <Icon className="h-6 w-6" />
            <span className="text-xs">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
