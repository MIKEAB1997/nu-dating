import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

interface MatchPopupProps {
  isOpen: boolean
  onClose: () => void
  matchedUser: {
    id: string
    name: string
    photo: string
  } | null
  currentUserPhoto?: string
}

export function MatchPopup({ isOpen, onClose, matchedUser, currentUserPhoto }: MatchPopupProps) {
  const navigate = useNavigate()

  if (!matchedUser) return null

  const handleSendMessage = () => {
    // Navigate to chat with the matched user
    navigate(`/matches`)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-primary-500/90 to-accent-500/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Content */}
          <motion.div
            className="relative z-10 flex flex-col items-center text-white text-center"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute -top-12 end-0 p-2 text-white/80 hover:text-white"
              aria-label="סגור"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Match text */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-4xl font-bold mb-2">יש התאמה!</h2>
              <p className="text-white/80 mb-8">
                גם {matchedUser.name} אוהב/ת אותך
              </p>
            </motion.div>

            {/* Photos */}
            <div className="flex items-center justify-center mb-8">
              {/* Current user photo */}
              <motion.div
                className="relative"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-white shadow-xl">
                  <img
                    src={currentUserPhoto || '/placeholder-avatar.png'}
                    alt="אתה"
                    className="h-full w-full object-cover"
                  />
                </div>
              </motion.div>

              {/* Heart icon in the middle */}
              <motion.div
                className="relative z-10 -mx-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 400 }}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg">
                  <Heart className="h-7 w-7 fill-accent-500 text-accent-500" />
                </div>
              </motion.div>

              {/* Matched user photo */}
              <motion.div
                className="relative"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-white shadow-xl">
                  <img
                    src={matchedUser.photo || '/placeholder-avatar.png'}
                    alt={matchedUser.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </motion.div>
            </div>

            {/* Action buttons */}
            <motion.div
              className="flex flex-col gap-3 w-full max-w-xs"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                onClick={handleSendMessage}
                className="w-full bg-white text-primary-500 hover:bg-white/90 h-12 text-base font-semibold"
              >
                <MessageCircle className="h-5 w-5 me-2" />
                שלח הודעה
              </Button>

              <Button
                onClick={onClose}
                variant="ghost"
                className="w-full text-white hover:bg-white/10 h-12"
              >
                המשך לגלות
              </Button>
            </motion.div>

            {/* Confetti animation placeholder - hearts floating */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-3xl"
                  initial={{
                    x: Math.random() * 300 - 150,
                    y: 200,
                    opacity: 0,
                    rotate: Math.random() * 360,
                  }}
                  animate={{
                    y: -400,
                    opacity: [0, 1, 1, 0],
                    rotate: Math.random() * 720,
                  }}
                  transition={{
                    duration: 3,
                    delay: 0.5 + i * 0.15,
                    ease: 'easeOut',
                  }}
                >
                  <Heart className="h-6 w-6 fill-white/60 text-white/60" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
