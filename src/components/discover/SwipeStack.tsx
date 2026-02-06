import { useState, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Heart, X, RotateCcw, Loader2 } from 'lucide-react'
import { SwipeCard, type DiscoverUser } from './SwipeCard'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SwipeStackProps {
  users: DiscoverUser[]
  onLike: (userId: string) => Promise<{ isMatch: boolean }>
  onSkip: (userId: string) => void
  onEmpty: () => void
  isLoading?: boolean
}

export function SwipeStack({ users, onLike, onSkip, onEmpty, isLoading }: SwipeStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [swipedUsers, setSwipedUsers] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const currentUser = users[currentIndex]
  const nextUser = users[currentIndex + 1]

  const handleSwipe = useCallback(async (direction: 'left' | 'right') => {
    if (!currentUser || isProcessing) return

    setIsProcessing(true)
    setSwipedUsers(prev => [...prev, currentUser.id])

    try {
      if (direction === 'right') {
        await onLike(currentUser.id)
      } else {
        onSkip(currentUser.id)
      }
    } finally {
      setIsProcessing(false)
    }

    // Move to next card
    const nextIndex = currentIndex + 1
    if (nextIndex >= users.length) {
      onEmpty()
    } else {
      setCurrentIndex(nextIndex)
    }
  }, [currentUser, currentIndex, users.length, onLike, onSkip, onEmpty, isProcessing])

  const handleButtonSwipe = (direction: 'left' | 'right') => {
    handleSwipe(direction)
  }

  const handleUndo = () => {
    if (swipedUsers.length > 0 && currentIndex > 0) {
      setSwipedUsers(prev => prev.slice(0, -1))
      setCurrentIndex(prev => prev - 1)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary-400" />
        <p className="mt-4 text-gray-500">טוען פרופילים...</p>
      </div>
    )
  }

  if (!currentUser || currentIndex >= users.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] text-center px-6">
        <div className="text-6xl mb-4">🎯</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          אין יותר פרופילים להצגה
        </h3>
        <p className="text-gray-500 mb-6">
          חזור מאוחר יותר או הרחב את טווח החיפוש שלך
        </p>
        <Button onClick={onEmpty} variant="outline">
          <RotateCcw className="h-4 w-4 me-2" />
          רענן
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      {/* Card Stack */}
      <div className="relative h-[500px] w-full max-w-[350px]">
        <AnimatePresence mode="popLayout">
          {/* Background card (next user) */}
          {nextUser && (
            <SwipeCard
              key={nextUser.id}
              user={nextUser}
              onSwipe={() => {}}
              isTop={false}
            />
          )}

          {/* Top card (current user) */}
          {currentUser && !swipedUsers.includes(currentUser.id) && (
            <SwipeCard
              key={currentUser.id}
              user={currentUser}
              onSwipe={handleSwipe}
              isTop={true}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4 mt-6">
        {/* Undo button */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleUndo}
          disabled={swipedUsers.length === 0 || isProcessing}
          className={cn(
            'h-12 w-12 rounded-full border-2 border-yellow-400 text-yellow-500',
            'hover:bg-yellow-50 disabled:opacity-40'
          )}
          aria-label="בטל פעולה אחרונה"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>

        {/* Skip button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleButtonSwipe('left')}
          disabled={isProcessing}
          className={cn(
            'h-16 w-16 rounded-full border-2 border-red-400 text-red-500',
            'hover:bg-red-50 disabled:opacity-40'
          )}
          aria-label="דלג"
        >
          <X className="h-8 w-8" />
        </Button>

        {/* Like button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleButtonSwipe('right')}
          disabled={isProcessing}
          className={cn(
            'h-16 w-16 rounded-full border-2 border-green-400 text-green-500',
            'hover:bg-green-50 disabled:opacity-40'
          )}
          aria-label="לייק"
        >
          <Heart className="h-8 w-8" />
        </Button>
      </div>

      {/* Progress indicator */}
      <div className="mt-4 text-sm text-gray-400">
        {currentIndex + 1} / {users.length}
      </div>
    </div>
  )
}
