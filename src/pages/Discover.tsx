import { useState, useEffect, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Flame, MessageCircle, User, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { SwipeStack, MatchPopup, type DiscoverUser } from '@/components/discover'
import { cn } from '@/lib/utils'

export default function Discover() {
  const { user } = useAuth()
  const location = useLocation()
  const queryClient = useQueryClient()
  const [currentUserProfile, setCurrentUserProfile] = useState<{ photos: string[] } | null>(null)
  const [matchPopup, setMatchPopup] = useState<{
    isOpen: boolean
    matchedUser: { id: string; name: string; photo: string } | null
  }>({
    isOpen: false,
    matchedUser: null,
  })

  // Fetch current user's profile
  useEffect(() => {
    async function fetchCurrentUserProfile() {
      if (!user) return

      const { data } = await supabase
        .from('users')
        .select('photos')
        .eq('auth_id', user.id)
        .single()

      if (data) {
        setCurrentUserProfile(data)
      }
    }

    fetchCurrentUserProfile()
  }, [user])

  // Fetch discover users using the Supabase function
  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['discover-users', user?.id],
    queryFn: async () => {
      if (!user) return []

      // First get the current user's database ID
      const { data: currentUserData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single()

      if (!currentUserData) return []

      // Call the get_discover_users function
      const { data, error } = await supabase.rpc('get_discover_users', {
        current_user_id: currentUserData.id,
        limit_count: 20,
      })

      if (error) {
        console.error('Error fetching discover users:', error)
        // Return mock data for development if the function doesn't exist yet
        return getMockUsers()
      }

      return (data as DiscoverUser[]) || []
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Handle like action
  const handleLike = useCallback(async (likedUserId: string): Promise<{ isMatch: boolean }> => {
    if (!user) return { isMatch: false }

    try {
      // Get current user's database ID
      const { data: currentUserData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single()

      if (!currentUserData) return { isMatch: false }

      // Insert the like
      const { error: likeError } = await supabase.from('likes').insert({
        liker_id: currentUserData.id,
        liked_id: likedUserId,
      })

      if (likeError) {
        console.error('Error inserting like:', likeError)
        return { isMatch: false }
      }

      // Check if the other user has already liked us (mutual like = match)
      const { data: mutualLike } = await supabase
        .from('likes')
        .select('id')
        .eq('liker_id', likedUserId)
        .eq('liked_id', currentUserData.id)
        .single()

      if (mutualLike) {
        // It's a match! Insert into matches table
        await supabase.from('matches').insert({
          user1_id: currentUserData.id,
          user2_id: likedUserId,
        })

        // Get the matched user's details for the popup
        const matchedUser = users.find(u => u.id === likedUserId)
        if (matchedUser) {
          setMatchPopup({
            isOpen: true,
            matchedUser: {
              id: matchedUser.id,
              name: matchedUser.name,
              photo: matchedUser.photos[0] || '/placeholder-avatar.png',
            },
          })
        }

        // Invalidate matches query
        queryClient.invalidateQueries({ queryKey: ['matches'] })

        return { isMatch: true }
      }

      return { isMatch: false }
    } catch (error) {
      console.error('Error handling like:', error)
      return { isMatch: false }
    }
  }, [user, users, queryClient])

  // Handle skip action
  const handleSkip = useCallback((skippedUserId: string) => {
    // Optionally track skips for analytics or to avoid showing the user again
    console.log('Skipped user:', skippedUserId)
  }, [])

  // Handle empty stack
  const handleEmpty = useCallback(() => {
    refetch()
  }, [refetch])

  // Close match popup
  const closeMatchPopup = () => {
    setMatchPopup({ isOpen: false, matchedUser: null })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50/50 via-white to-accent-50/30 pb-24" dir="rtl">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-200/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-accent-200/30 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-sm"
      >
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Flame className="h-7 w-7 text-primary-500" />
            </motion.div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
              NU!
            </h1>
          </div>
          <Link
            to="/profile"
            className="p-2.5 rounded-full bg-white/80 hover:bg-white shadow-sm hover:shadow transition-all border border-gray-100"
            aria-label="פרופיל"
          >
            <User className="h-5 w-5 text-gray-600" />
          </Link>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative max-w-md mx-auto px-4 py-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-primary-100">
            <Sparkles className="h-4 w-4 text-primary-400" />
            <span className="text-sm font-medium text-gray-700">גלו אנשים מדהימים</span>
          </div>
        </motion.div>

        <SwipeStack
          users={users}
          onLike={handleLike}
          onSkip={handleSkip}
          onEmpty={handleEmpty}
          isLoading={isLoading}
        />
      </main>

      {/* Match Popup */}
      <MatchPopup
        isOpen={matchPopup.isOpen}
        onClose={closeMatchPopup}
        matchedUser={matchPopup.matchedUser}
        currentUserPhoto={currentUserProfile?.photos[0]}
      />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-white/80 backdrop-blur-xl border-t border-white/50 shadow-lg safe-area-bottom">
          <div className="max-w-md mx-auto flex justify-around py-2 px-4">
            <NavLink
              to="/discover"
              icon={<Flame className="h-6 w-6" />}
              label="גלה"
              isActive={location.pathname === '/discover'}
            />
            <NavLink
              to="/matches"
              icon={<MessageCircle className="h-6 w-6" />}
              label="התאמות"
              isActive={location.pathname === '/matches'}
            />
            <NavLink
              to="/profile"
              icon={<User className="h-6 w-6" />}
              label="פרופיל"
              isActive={location.pathname === '/profile'}
            />
          </div>
        </div>
      </nav>
    </div>
  )
}

// Navigation link component
interface NavLinkProps {
  to: string
  icon: React.ReactNode
  label: string
  isActive: boolean
}

function NavLink({ to, icon, label, isActive }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        'relative flex flex-col items-center gap-0.5 px-6 py-2 rounded-xl transition-all',
        isActive
          ? 'text-primary-500'
          : 'text-gray-400 hover:text-gray-600'
      )}
    >
      {isActive && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute inset-0 bg-primary-50 rounded-xl"
          transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
        />
      )}
      <span className="relative z-10">{icon}</span>
      <span className={cn(
        "relative z-10 text-xs font-medium",
        isActive && "text-primary-600"
      )}>{label}</span>
    </Link>
  )
}

// Mock data for development
function getMockUsers(): DiscoverUser[] {
  return [
    {
      id: '1',
      name: 'נועה',
      age: 25,
      city: 'תל אביב',
      bio: 'אוהבת לטייל, לצפות בסרטים ולבשל. מחפשת מישהו עם חוש הומור טוב.',
      photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'],
      occupation: 'מעצבת גרפית',
      interests: ['טיולים', 'בישול', 'קולנוע', 'יוגה'],
    },
    {
      id: '2',
      name: 'דניאל',
      age: 28,
      city: 'ירושלים',
      bio: 'מתכנת ביום, מוזיקאי בלילה. אוהב הופעות חיות וקפה טוב.',
      photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'],
      occupation: 'מפתח תוכנה',
      interests: ['מוזיקה', 'טכנולוגיה', 'קפה', 'הופעות'],
    },
    {
      id: '3',
      name: 'מאיה',
      age: 24,
      city: 'חיפה',
      bio: 'סטודנטית לפסיכולוגיה. אוהבת ים, ספרים וטיולים בטבע.',
      photos: ['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400'],
      occupation: 'סטודנטית',
      interests: ['ים', 'קריאה', 'טיולים', 'פסיכולוגיה'],
    },
    {
      id: '4',
      name: 'יואב',
      age: 30,
      city: 'תל אביב',
      bio: 'יזם בתחום הפינטק. אוהב אתגרים חדשים ואוכל טוב.',
      photos: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400'],
      occupation: 'יזם',
      interests: ['עסקים', 'ספורט', 'אוכל', 'נסיעות'],
    },
    {
      id: '5',
      name: 'שירה',
      age: 26,
      city: 'רמת גן',
      bio: 'רופאה וטרינרית. אוהבת חיות, טבע ואנשים טובים.',
      photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'],
      occupation: 'וטרינרית',
      interests: ['חיות', 'טבע', 'ריצה', 'צילום'],
    },
  ]
}
