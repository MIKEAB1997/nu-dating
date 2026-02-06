import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { ProfileInfo } from '@/components/profile/ProfileInfo'
import { ProfileSettings } from '@/components/profile/ProfileSettings'
import type { Database } from '@/types/database.types'

type UserProfile = Database['public']['Tables']['users']['Row']

export default function Profile() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile')

  // Editable fields
  const [editedName, setEditedName] = useState('')
  const [editedAge, setEditedAge] = useState(18)
  const [editedBio, setEditedBio] = useState('')
  const [editedInterests, setEditedInterests] = useState<string[]>([])
  const [editedCity, setEditedCity] = useState('')
  const [editedOccupation, setEditedOccupation] = useState('')
  const [editedPhotos, setEditedPhotos] = useState<string[]>([])

  // Settings fields
  const [discoveryDistance, setDiscoveryDistance] = useState(50)
  const [ageRangeMin, setAgeRangeMin] = useState(18)
  const [ageRangeMax, setAgeRangeMax] = useState(50)
  const [isActive, setIsActive] = useState(true)

  // Fetch user profile
  useEffect(() => {
    async function fetchProfile() {
      if (!user) return

      try {
        setIsLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', user.id)
          .single()

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            // No profile found, redirect to onboarding
            navigate('/onboarding')
            return
          }
          throw fetchError
        }

        setProfile(data)

        // Initialize editable fields
        setEditedName(data.name)
        setEditedAge(data.age)
        setEditedBio(data.bio || '')
        setEditedInterests(data.interests || [])
        setEditedCity(data.city)
        setEditedOccupation(data.occupation || '')
        setEditedPhotos(data.photos || [])

        // Initialize settings
        setDiscoveryDistance(data.discovery_distance)
        setAgeRangeMin(data.age_range_min)
        setAgeRangeMax(data.age_range_max)
        setIsActive(data.is_active)
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError('אירעה שגיאה בטעינת הפרופיל')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [user, navigate])

  // Handle cancel edit
  const handleCancelEdit = () => {
    if (profile) {
      setEditedName(profile.name)
      setEditedAge(profile.age)
      setEditedBio(profile.bio || '')
      setEditedInterests(profile.interests || [])
      setEditedCity(profile.city)
      setEditedOccupation(profile.occupation || '')
      setEditedPhotos(profile.photos || [])
    }
    setIsEditMode(false)
  }

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!profile) return

    try {
      setIsSaving(true)
      setError(null)

      const { error: updateError } = await supabase
        .from('users')
        .update({
          name: editedName,
          age: editedAge,
          bio: editedBio || null,
          interests: editedInterests,
          city: editedCity,
          occupation: editedOccupation || null,
          photos: editedPhotos,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (updateError) throw updateError

      // Update local profile state
      setProfile({
        ...profile,
        name: editedName,
        age: editedAge,
        bio: editedBio || null,
        interests: editedInterests,
        city: editedCity,
        occupation: editedOccupation || null,
        photos: editedPhotos,
        updated_at: new Date().toISOString(),
      })

      setIsEditMode(false)
    } catch (err) {
      console.error('Error saving profile:', err)
      setError('אירעה שגיאה בשמירת הפרופיל')
    } finally {
      setIsSaving(false)
    }
  }

  // Save settings changes (auto-save)
  const handleSaveSettings = async () => {
    if (!profile) return

    try {
      setIsSaving(true)

      const { error: updateError } = await supabase
        .from('users')
        .update({
          discovery_distance: discoveryDistance,
          age_range_min: ageRangeMin,
          age_range_max: ageRangeMax,
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (updateError) throw updateError

      // Update local profile state
      setProfile({
        ...profile,
        discovery_distance: discoveryDistance,
        age_range_min: ageRangeMin,
        age_range_max: ageRangeMax,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
    } catch (err) {
      console.error('Error saving settings:', err)
      setError('אירעה שגיאה בשמירת ההגדרות')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (err) {
      console.error('Error signing out:', err)
      setError('אירעה שגיאה בהתנתקות')
    }
  }

  // Handle settings changes with auto-save
  const handleDiscoveryDistanceChange = (distance: number) => {
    setDiscoveryDistance(distance)
  }

  const handleAgeRangeChange = (min: number, max: number) => {
    setAgeRangeMin(min)
    setAgeRangeMax(max)
  }

  const handleActiveStatusChange = (active: boolean) => {
    setIsActive(active)
  }

  // Auto-save settings when they change
  useEffect(() => {
    if (!profile) return

    const hasSettingsChanged =
      discoveryDistance !== profile.discovery_distance ||
      ageRangeMin !== profile.age_range_min ||
      ageRangeMax !== profile.age_range_max ||
      isActive !== profile.is_active

    if (hasSettingsChanged) {
      const timeoutId = setTimeout(() => {
        handleSaveSettings()
      }, 1000) // Debounce for 1 second

      return () => clearTimeout(timeoutId)
    }
  }, [discoveryDistance, ageRangeMin, ageRangeMax, isActive])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">טוען פרופיל...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-500">לא נמצא פרופיל</p>
            <Button
              onClick={() => navigate('/onboarding')}
              className="mt-4"
            >
              צור פרופיל חדש
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">הפרופיל שלי</h1>
            {activeTab === 'profile' && (
              <div>
                {isEditMode ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                    >
                      {isSaving ? 'שומר...' : 'שמור'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                    >
                      ביטול
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditMode(true)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    עריכה
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-2 px-1 border-b-2 transition-colors ${
                activeTab === 'profile'
                  ? 'border-primary-500 text-primary-600 font-medium'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              פרופיל
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-2 px-1 border-b-2 transition-colors ${
                activeTab === 'settings'
                  ? 'border-primary-500 text-primary-600 font-medium'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              הגדרות
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-2xl mx-auto px-4 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {activeTab === 'profile' ? (
          <div className="space-y-6">
            {/* Photo Gallery */}
            <Card>
              <CardContent className="p-4">
                <ProfileHeader
                  photos={isEditMode ? editedPhotos : profile.photos}
                  name={isEditMode ? editedName : profile.name}
                  isEditMode={isEditMode}
                  onPhotosChange={setEditedPhotos}
                />
              </CardContent>
            </Card>

            {/* Profile Info */}
            <Card>
              <CardContent className="p-6">
                <ProfileInfo
                  name={isEditMode ? editedName : profile.name}
                  age={isEditMode ? editedAge : profile.age}
                  bio={isEditMode ? editedBio : profile.bio}
                  interests={isEditMode ? editedInterests : profile.interests}
                  city={isEditMode ? editedCity : profile.city}
                  occupation={isEditMode ? editedOccupation : profile.occupation}
                  isEditMode={isEditMode}
                  onNameChange={setEditedName}
                  onAgeChange={setEditedAge}
                  onBioChange={setEditedBio}
                  onInterestsChange={setEditedInterests}
                  onCityChange={setEditedCity}
                  onOccupationChange={setEditedOccupation}
                />
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="p-6">
              <ProfileSettings
                discoveryDistance={discoveryDistance}
                ageRangeMin={ageRangeMin}
                ageRangeMax={ageRangeMax}
                isActive={isActive}
                onDiscoveryDistanceChange={handleDiscoveryDistanceChange}
                onAgeRangeChange={handleAgeRangeChange}
                onActiveStatusChange={handleActiveStatusChange}
                onSignOut={handleSignOut}
                isSaving={isSaving}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around max-w-md mx-auto py-3">
          <a
            href="/discover"
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
            </svg>
            <span className="text-xs">גילוי</span>
          </a>
          <a
            href="/matches"
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-xs">התאמות</span>
          </a>
          <a
            href="/profile"
            className="flex flex-col items-center gap-1 text-primary-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs font-medium">פרופיל</span>
          </a>
        </div>
      </div>
    </div>
  )
}
