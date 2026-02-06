import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface ProfileSettingsProps {
  discoveryDistance: number
  ageRangeMin: number
  ageRangeMax: number
  isActive: boolean
  onDiscoveryDistanceChange: (distance: number) => void
  onAgeRangeChange: (min: number, max: number) => void
  onActiveStatusChange: (isActive: boolean) => void
  onSignOut: () => void
  isSaving?: boolean
}

export function ProfileSettings({
  discoveryDistance,
  ageRangeMin,
  ageRangeMax,
  isActive,
  onDiscoveryDistanceChange,
  onAgeRangeChange,
  onActiveStatusChange,
  onSignOut,
  isSaving,
}: ProfileSettingsProps) {
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)

  return (
    <div className="space-y-6" dir="rtl">
      <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-3">
        הגדרות גילוי
      </h3>

      {/* Discovery Distance */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-gray-700">מרחק מקסימלי</Label>
          <span className="text-primary-600 font-medium">{discoveryDistance} ק"מ</span>
        </div>
        <input
          type="range"
          min={1}
          max={100}
          value={discoveryDistance}
          onChange={(e) => onDiscoveryDistanceChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>1 ק"מ</span>
          <span>100 ק"מ</span>
        </div>
      </div>

      {/* Age Range */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-gray-700">טווח גילאים</Label>
          <span className="text-primary-600 font-medium">{ageRangeMin} - {ageRangeMax}</span>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>מינימום: {ageRangeMin}</span>
            </div>
            <input
              type="range"
              min={18}
              max={ageRangeMax - 1}
              value={ageRangeMin}
              onChange={(e) => onAgeRangeChange(parseInt(e.target.value), ageRangeMax)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>מקסימום: {ageRangeMax}</span>
            </div>
            <input
              type="range"
              min={ageRangeMin + 1}
              max={99}
              value={ageRangeMax}
              onChange={(e) => onAgeRangeChange(ageRangeMin, parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
          </div>
        </div>

        <div className="flex justify-between text-xs text-gray-400">
          <span>18</span>
          <span>99</span>
        </div>
      </div>

      {/* Active Status */}
      <div className="flex justify-between items-center py-3 border-t border-gray-200">
        <div>
          <Label className="text-gray-700">סטטוס פעיל</Label>
          <p className="text-xs text-gray-400 mt-0.5">
            כשמכובה, הפרופיל שלך לא יוצג לאחרים
          </p>
        </div>
        <button
          onClick={() => onActiveStatusChange(!isActive)}
          className={cn(
            'relative w-12 h-6 rounded-full transition-colors duration-200',
            isActive ? 'bg-green-500' : 'bg-gray-300'
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
              isActive ? 'right-0.5' : 'right-6'
            )}
          />
        </button>
      </div>

      {/* Sign Out Section */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">חשבון</h3>

        {!showSignOutConfirm ? (
          <Button
            variant="outline"
            onClick={() => setShowSignOutConfirm(true)}
            className="w-full border-red-300 text-red-600 hover:bg-red-50"
            disabled={isSaving}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            התנתק
          </Button>
        ) : (
          <div className="space-y-3 bg-red-50 p-4 rounded-xl">
            <p className="text-red-700 text-sm text-center">
              האם את/ה בטוח/ה שברצונך להתנתק?
            </p>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={onSignOut}
                className="flex-1"
                disabled={isSaving}
              >
                כן, התנתק
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSignOutConfirm(false)}
                className="flex-1"
                disabled={isSaving}
              >
                ביטול
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* App Version */}
      <div className="pt-4 text-center text-xs text-gray-400">
        <p>NU Dating App v1.0.0</p>
      </div>
    </div>
  )
}
