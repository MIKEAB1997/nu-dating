import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ProfileInfoProps {
  name: string
  age: number
  bio: string | null
  interests: string[]
  city: string
  occupation: string | null
  isEditMode: boolean
  onNameChange?: (name: string) => void
  onAgeChange?: (age: number) => void
  onBioChange?: (bio: string) => void
  onInterestsChange?: (interests: string[]) => void
  onCityChange?: (city: string) => void
  onOccupationChange?: (occupation: string) => void
}

const AVAILABLE_INTERESTS = [
  'ספורט', 'מוזיקה', 'קולנוע', 'טיולים', 'בישול', 'קריאה',
  'אמנות', 'צילום', 'משחקים', 'יוגה', 'ריקוד', 'כושר',
  'אופנה', 'טכנולוגיה', 'טבע', 'חיות', 'קפה', 'יין',
  'מדיטציה', 'גלישה', 'טניס', 'כדורגל', 'כדורסל', 'שחייה'
]

export function ProfileInfo({
  name,
  age,
  bio,
  interests,
  city,
  occupation,
  isEditMode,
  onNameChange,
  onAgeChange,
  onBioChange,
  onInterestsChange,
  onCityChange,
  onOccupationChange,
}: ProfileInfoProps) {
  const handleInterestToggle = (interest: string) => {
    if (!onInterestsChange) return

    if (interests.includes(interest)) {
      onInterestsChange(interests.filter((i) => i !== interest))
    } else if (interests.length < 10) {
      onInterestsChange([...interests, interest])
    }
  }

  if (isEditMode) {
    return (
      <div className="space-y-6" dir="rtl">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-700">שם</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => onNameChange?.(e.target.value)}
            placeholder="השם שלך"
            className="text-right"
          />
        </div>

        {/* Age */}
        <div className="space-y-2">
          <Label htmlFor="age" className="text-gray-700">גיל</Label>
          <Input
            id="age"
            type="number"
            value={age}
            onChange={(e) => onAgeChange?.(parseInt(e.target.value) || 18)}
            min={18}
            max={120}
            className="text-right"
          />
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label htmlFor="city" className="text-gray-700">עיר</Label>
          <Input
            id="city"
            value={city}
            onChange={(e) => onCityChange?.(e.target.value)}
            placeholder="העיר שלך"
            className="text-right"
          />
        </div>

        {/* Occupation */}
        <div className="space-y-2">
          <Label htmlFor="occupation" className="text-gray-700">עיסוק</Label>
          <Input
            id="occupation"
            value={occupation || ''}
            onChange={(e) => onOccupationChange?.(e.target.value)}
            placeholder="מה את/ה עושה?"
            className="text-right"
          />
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio" className="text-gray-700">קצת עליי</Label>
          <textarea
            id="bio"
            value={bio || ''}
            onChange={(e) => onBioChange?.(e.target.value)}
            placeholder="ספר/י קצת על עצמך..."
            rows={4}
            maxLength={500}
            className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 text-right resize-none"
          />
          <p className="text-xs text-gray-400 text-left">{(bio || '').length}/500</p>
        </div>

        {/* Interests */}
        <div className="space-y-2">
          <Label className="text-gray-700">תחומי עניין ({interests.length}/10)</Label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_INTERESTS.map((interest) => (
              <button
                key={interest}
                onClick={() => handleInterestToggle(interest)}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  interests.includes(interest)
                    ? 'bg-primary-400 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Display Mode
  return (
    <div className="space-y-6" dir="rtl">
      {/* Name and Age */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">{name}, {age}</h2>
        <div className="flex items-center justify-center gap-2 mt-1 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{city}</span>
        </div>
        {occupation && (
          <div className="flex items-center justify-center gap-2 mt-1 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>{occupation}</span>
          </div>
        )}
      </div>

      {/* Bio */}
      {bio && (
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="font-semibold text-gray-700 mb-2">קצת עליי</h3>
          <p className="text-gray-600 whitespace-pre-wrap">{bio}</p>
        </div>
      )}

      {/* Interests */}
      {interests.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-700 mb-3">תחומי עניין</h3>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <span
                key={interest}
                className="px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
