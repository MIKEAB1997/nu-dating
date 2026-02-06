import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { MatchWithUser } from '@/types/database.types'

interface MatchCardProps {
  match: MatchWithUser
  className?: string
}

/**
 * Formats a date to relative time in Hebrew
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'עכשיו'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `לפני ${diffInMinutes} דקות`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `לפני ${diffInHours} שעות`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `לפני ${diffInDays} ימים`
  }

  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `לפני ${diffInWeeks} שבועות`
  }

  return date.toLocaleDateString('he-IL')
}

export function MatchCard({ match, className }: MatchCardProps) {
  const { matched_user } = match
  const profilePhoto = matched_user.photos?.[0] || '/placeholder-avatar.png'
  const lastActive = matched_user.last_active_at
    ? formatRelativeTime(matched_user.last_active_at)
    : formatRelativeTime(match.created_at)

  return (
    <Link
      to={`/loop/${match.id}`}
      className={cn(
        'flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100',
        'hover:shadow-md hover:border-primary-200 transition-all duration-200',
        'active:scale-[0.98]',
        className
      )}
    >
      {/* Profile Photo */}
      <div className="relative flex-shrink-0">
        <img
          src={profilePhoto}
          alt={matched_user.name}
          className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = '/placeholder-avatar.png'
          }}
        />
        {/* Online indicator */}
        {matched_user.is_active && (
          <span className="absolute bottom-0 left-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
        )}
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 truncate">
            {matched_user.name}
          </h3>
          <span className="text-gray-400">,</span>
          <span className="text-gray-600">{matched_user.age}</span>
        </div>

        <p className="text-sm text-gray-500 truncate">
          {matched_user.city}
        </p>

        <p className="text-xs text-gray-400 mt-1">
          {lastActive}
        </p>
      </div>

      {/* Arrow indicator */}
      <div className="flex-shrink-0 text-gray-400">
        <svg
          className="w-5 h-5 rtl:rotate-180"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </Link>
  )
}
