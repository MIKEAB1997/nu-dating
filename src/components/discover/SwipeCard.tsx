import { useState } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import type { PanInfo } from 'framer-motion'
import { MapPin, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DiscoverUser {
  id: string
  name: string
  age: number
  city: string
  bio: string | null
  photos: string[]
  occupation: string | null
  interests: string[]
}

interface SwipeCardProps {
  user: DiscoverUser
  onSwipe: (direction: 'left' | 'right') => void
  isTop: boolean
}

export function SwipeCard({ user, onSwipe, isTop }: SwipeCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null)

  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-25, 25])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5])

  // Indicators for like/skip
  const likeOpacity = useTransform(x, [0, 100], [0, 1])
  const skipOpacity = useTransform(x, [-100, 0], [1, 0])

  const handleDragEnd = (_: never, info: PanInfo) => {
    const threshold = 100
    if (info.offset.x > threshold) {
      setExitDirection('right')
      onSwipe('right')
    } else if (info.offset.x < -threshold) {
      setExitDirection('left')
      onSwipe('left')
    }
  }

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (currentPhotoIndex < user.photos.length - 1) {
      setCurrentPhotoIndex(prev => prev + 1)
    }
  }

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(prev => prev - 1)
    }
  }

  const photos = user.photos.length > 0 ? user.photos : ['/placeholder-avatar.png']

  return (
    <motion.div
      className={cn(
        'absolute inset-0 cursor-grab active:cursor-grabbing',
        !isTop && 'pointer-events-none'
      )}
      style={{ x, rotate, opacity }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      initial={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 10 }}
      animate={{
        scale: isTop ? 1 : 0.95,
        y: isTop ? 0 : 10,
        x: exitDirection === 'left' ? -500 : exitDirection === 'right' ? 500 : 0,
      }}
      exit={{
        x: exitDirection === 'left' ? -500 : 500,
        opacity: 0,
        transition: { duration: 0.3 }
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-3xl bg-white shadow-xl">
        {/* Photo */}
        <div className="relative h-3/4 w-full bg-gray-200">
          <img
            src={photos[currentPhotoIndex]}
            alt={user.name}
            className="h-full w-full object-cover"
            draggable={false}
          />

          {/* Photo navigation overlay */}
          {photos.length > 1 && (
            <>
              {/* Left area - previous photo */}
              <button
                onClick={prevPhoto}
                className="absolute left-0 top-0 h-full w-1/3 flex items-center justify-start ps-2"
                aria-label="תמונה קודמת"
              >
                {currentPhotoIndex > 0 && (
                  <div className="rounded-full bg-black/30 p-1">
                    <ChevronRight className="h-5 w-5 text-white" />
                  </div>
                )}
              </button>

              {/* Right area - next photo */}
              <button
                onClick={nextPhoto}
                className="absolute right-0 top-0 h-full w-1/3 flex items-center justify-end pe-2"
                aria-label="תמונה הבאה"
              >
                {currentPhotoIndex < photos.length - 1 && (
                  <div className="rounded-full bg-black/30 p-1">
                    <ChevronLeft className="h-5 w-5 text-white" />
                  </div>
                )}
              </button>

              {/* Photo indicators */}
              <div className="absolute top-3 left-3 right-3 flex gap-1">
                {photos.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      'h-1 flex-1 rounded-full transition-colors',
                      index === currentPhotoIndex ? 'bg-white' : 'bg-white/40'
                    )}
                  />
                ))}
              </div>
            </>
          )}

          {/* Like indicator */}
          <motion.div
            className="absolute top-6 start-6 rounded-lg border-4 border-green-500 px-4 py-2 -rotate-12"
            style={{ opacity: likeOpacity }}
          >
            <span className="text-2xl font-bold text-green-500">LIKE</span>
          </motion.div>

          {/* Skip indicator */}
          <motion.div
            className="absolute top-6 end-6 rounded-lg border-4 border-red-500 px-4 py-2 rotate-12"
            style={{ opacity: skipOpacity }}
          >
            <span className="text-2xl font-bold text-red-500">NOPE</span>
          </motion.div>

          {/* Gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* User info */}
        <div className="absolute bottom-0 inset-x-0 p-5 text-white" dir="rtl">
          <div className="flex items-baseline gap-2 mb-2">
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <span className="text-xl">{user.age}</span>
          </div>

          {user.city && (
            <div className="flex items-center gap-1 text-sm text-white/90 mb-1">
              <MapPin className="h-4 w-4" />
              <span>{user.city}</span>
            </div>
          )}

          {user.occupation && (
            <div className="flex items-center gap-1 text-sm text-white/90 mb-2">
              <Briefcase className="h-4 w-4" />
              <span>{user.occupation}</span>
            </div>
          )}

          {user.bio && (
            <p className="text-sm text-white/80 line-clamp-2 mt-2">
              {user.bio}
            </p>
          )}

          {user.interests.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {user.interests.slice(0, 4).map((interest, index) => (
                <span
                  key={index}
                  className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs"
                >
                  {interest}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
