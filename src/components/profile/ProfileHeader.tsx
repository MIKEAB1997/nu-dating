import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ProfileHeaderProps {
  photos: string[]
  name: string
  isEditMode: boolean
  onPhotosChange?: (photos: string[]) => void
}

export function ProfileHeader({ photos, name, isEditMode, onPhotosChange }: ProfileHeaderProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  const displayPhotos = photos.length > 0 ? photos : ['/placeholder-avatar.png']

  const handlePrevPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev === 0 ? displayPhotos.length - 1 : prev - 1
    )
  }

  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev === displayPhotos.length - 1 ? 0 : prev + 1
    )
  }

  const handleAddPhoto = () => {
    // In a real implementation, this would open a file picker
    // and upload the image to Supabase storage
    const newPhotoUrl = prompt('הכנס URL לתמונה חדשה:')
    if (newPhotoUrl && onPhotosChange) {
      onPhotosChange([...photos, newPhotoUrl])
    }
  }

  const handleRemovePhoto = (index: number) => {
    if (onPhotosChange && photos.length > 1) {
      const newPhotos = photos.filter((_, i) => i !== index)
      onPhotosChange(newPhotos)
      if (currentPhotoIndex >= newPhotos.length) {
        setCurrentPhotoIndex(newPhotos.length - 1)
      }
    }
  }

  return (
    <div className="relative">
      {/* Main Photo */}
      <div className="relative w-full aspect-square bg-gray-100 rounded-2xl overflow-hidden">
        {displayPhotos.length > 0 && displayPhotos[0] !== '/placeholder-avatar.png' ? (
          <img
            src={displayPhotos[currentPhotoIndex]}
            alt={`${name} - תמונה ${currentPhotoIndex + 1}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
            <span className="text-8xl">👤</span>
          </div>
        )}

        {/* Photo Navigation Arrows */}
        {displayPhotos.length > 1 && !isEditMode && (
          <>
            <button
              onClick={handlePrevPhoto}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
              aria-label="תמונה קודמת"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={handleNextPhoto}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
              aria-label="תמונה הבאה"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </>
        )}

        {/* Photo Indicators */}
        {displayPhotos.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {displayPhotos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPhotoIndex(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  index === currentPhotoIndex
                    ? 'bg-white w-6'
                    : 'bg-white/50 hover:bg-white/70'
                )}
                aria-label={`עבור לתמונה ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Edit Mode: Remove Photo Button */}
        {isEditMode && photos.length > 1 && (
          <button
            onClick={() => handleRemovePhoto(currentPhotoIndex)}
            className="absolute top-4 left-4 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
            aria-label="הסר תמונה"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Edit Mode: Photo Thumbnails */}
      {isEditMode && (
        <div className="mt-4 flex gap-2 flex-wrap justify-center">
          {photos.map((photo, index) => (
            <button
              key={index}
              onClick={() => setCurrentPhotoIndex(index)}
              className={cn(
                'w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
                index === currentPhotoIndex
                  ? 'border-primary-500 ring-2 ring-primary-200'
                  : 'border-transparent hover:border-gray-300'
              )}
            >
              <img
                src={photo}
                alt={`תמונה ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}

          {/* Add Photo Button */}
          {photos.length < 6 && (
            <Button
              onClick={handleAddPhoto}
              variant="outline"
              className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-400 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
