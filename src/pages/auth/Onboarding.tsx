import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Camera, X, MapPin, Loader2, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase, getCurrentUser } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

// Israeli cities list
const ISRAELI_CITIES = [
  'תל אביב',
  'ירושלים',
  'חיפה',
  'ראשון לציון',
  'פתח תקווה',
  'אשדוד',
  'נתניה',
  'באר שבע',
  'בני ברק',
  'חולון',
  'רמת גן',
  'אשקלון',
  'רחובות',
  'בת ים',
  'הרצליה',
  'כפר סבא',
  'מודיעין',
  'לוד',
  'רמלה',
  'נצרת',
  'עכו',
  'אילת',
  'קריית גת',
  'רעננה',
  'הוד השרון',
  'גבעתיים',
  'קריית אתא',
  'נהריה',
  'טבריה',
  'צפת',
]

// Predefined interests list
const INTERESTS_LIST = [
  'מוזיקה',
  'ספורט',
  'טיולים',
  'בישול',
  'קריאה',
  'קולנוע',
  'אמנות',
  'צילום',
  'יוגה',
  'ריצה',
  'שחייה',
  'כושר',
  'נסיעות',
  'משחקי וידאו',
  'טכנולוגיה',
  'אופנה',
  'כתיבה',
  'מדיטציה',
  'ריקוד',
  'גינון',
  'חיות מחמד',
  'התנדבות',
  'לימודים',
  'קפה',
  'יין',
  'בירה',
  'הופעות',
  'תיאטרון',
  'סטנדאפ',
  'פודקאסטים',
]

// Step 1: Basic Info Schema
const basicInfoSchema = z.object({
  name: z.string().min(2, 'השם חייב להכיל לפחות 2 תווים'),
  age: z.number().min(18, 'גיל מינימלי הוא 18').max(120, 'גיל לא תקין'),
  gender: z.enum(['male', 'female', 'other'], {
    errorMap: () => ({ message: 'יש לבחור מגדר' }),
  }),
  looking_for: z.array(z.string()).min(1, 'יש לבחור לפחות אפשרות אחת'),
})

// Step 2: Photos Schema
const photosSchema = z.object({
  photos: z.array(z.string()).min(1, 'יש להעלות לפחות תמונה אחת'),
})

// Step 3: Bio & Interests Schema
const bioInterestsSchema = z.object({
  bio: z.string().min(10, 'הביו חייב להכיל לפחות 10 תווים').max(500, 'הביו לא יכול להכיל יותר מ-500 תווים'),
  interests: z.array(z.string()).min(3, 'יש לבחור לפחות 3 תחומי עניין'),
  occupation: z.string().optional(),
})

// Step 4: Location Schema
const locationSchema = z.object({
  city: z.string().min(1, 'יש לבחור עיר'),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
})

// Combined schema for all steps
type BasicInfoData = z.infer<typeof basicInfoSchema>
type PhotosData = z.infer<typeof photosSchema>
type BioInterestsData = z.infer<typeof bioInterestsSchema>
type LocationData = z.infer<typeof locationSchema>

interface OnboardingData extends BasicInfoData, PhotosData, BioInterestsData, LocationData {}

const STEP_TITLES = [
  { title: 'פרטים בסיסיים', subtitle: 'ספרו לנו קצת על עצמכם' },
  { title: 'תמונות', subtitle: 'הוסיפו תמונות לפרופיל' },
  { title: 'ביו ותחומי עניין', subtitle: 'מה אתם אוהבים לעשות?' },
  { title: 'מיקום', subtitle: 'איפה אתם נמצאים?' },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)

  // Form data state
  const [formData, setFormData] = useState<Partial<OnboardingData>>({
    name: '',
    age: 18,
    gender: undefined,
    looking_for: [],
    photos: [],
    bio: '',
    interests: [],
    occupation: '',
    city: '',
    latitude: null,
    longitude: null,
  })

  // Step 1 Form
  const basicInfoForm = useForm<BasicInfoData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      name: formData.name || '',
      age: formData.age || 18,
      gender: formData.gender as 'male' | 'female' | 'other' | undefined,
      looking_for: formData.looking_for || [],
    },
  })

  // Step 2 Form
  const photosForm = useForm<PhotosData>({
    resolver: zodResolver(photosSchema),
    defaultValues: {
      photos: formData.photos || [],
    },
  })

  // Step 3 Form
  const bioInterestsForm = useForm<BioInterestsData>({
    resolver: zodResolver(bioInterestsSchema),
    defaultValues: {
      bio: formData.bio || '',
      interests: formData.interests || [],
      occupation: formData.occupation || '',
    },
  })

  // Step 4 Form
  const locationForm = useForm<LocationData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      city: formData.city || '',
      latitude: formData.latitude || null,
      longitude: formData.longitude || null,
    },
  })

  const handleNext = async () => {
    let isValid = false
    let stepData = {}

    switch (currentStep) {
      case 0:
        isValid = await basicInfoForm.trigger()
        if (isValid) {
          stepData = basicInfoForm.getValues()
        }
        break
      case 1:
        isValid = await photosForm.trigger()
        if (isValid) {
          stepData = photosForm.getValues()
        }
        break
      case 2:
        isValid = await bioInterestsForm.trigger()
        if (isValid) {
          stepData = bioInterestsForm.getValues()
        }
        break
      case 3:
        isValid = await locationForm.trigger()
        if (isValid) {
          stepData = locationForm.getValues()
          await handleSubmit({ ...formData, ...stepData } as OnboardingData)
          return
        }
        break
    }

    if (isValid) {
      setFormData((prev) => ({ ...prev, ...stepData }))
      setCurrentStep((prev) => Math.min(prev + 1, 3))
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleSubmit = async (data: OnboardingData) => {
    setIsSubmitting(true)
    try {
      const user = await getCurrentUser()
      if (!user) {
        throw new Error('משתמש לא מחובר')
      }

      const { error } = await supabase.from('users').insert({
        auth_id: user.id,
        email: user.email || '',
        name: data.name,
        age: data.age,
        gender: data.gender,
        looking_for: data.looking_for,
        city: data.city,
        latitude: data.latitude,
        longitude: data.longitude,
        bio: data.bio,
        photos: data.photos,
        interests: data.interests,
        occupation: data.occupation || null,
      })

      if (error) {
        throw error
      }

      // Redirect to main app
      navigate('/app')
    } catch (error) {
      console.error('Error saving onboarding data:', error)
      alert('אירעה שגיאה בשמירת הנתונים. אנא נסו שנית.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const currentPhotos = photosForm.getValues('photos') || []
    if (currentPhotos.length >= 6) {
      alert('ניתן להעלות עד 6 תמונות')
      return
    }

    try {
      const user = await getCurrentUser()
      if (!user) {
        throw new Error('משתמש לא מחובר')
      }

      for (const file of Array.from(files)) {
        if (currentPhotos.length >= 6) break

        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`

        const { error: uploadError, data } = await supabase.storage
          .from('photos')
          .upload(fileName, file)

        if (uploadError) {
          console.error('Upload error:', uploadError)
          continue
        }

        const { data: urlData } = supabase.storage.from('photos').getPublicUrl(data.path)

        currentPhotos.push(urlData.publicUrl)
      }

      photosForm.setValue('photos', currentPhotos, { shouldValidate: true })
    } catch (error) {
      console.error('Error uploading photos:', error)
      // For now, use placeholder URLs if storage is not configured
      const placeholderUrl = `https://picsum.photos/seed/${Date.now()}/400/500`
      currentPhotos.push(placeholderUrl)
      photosForm.setValue('photos', currentPhotos, { shouldValidate: true })
    }
  }

  const handleRemovePhoto = (index: number) => {
    const currentPhotos = photosForm.getValues('photos') || []
    const newPhotos = currentPhotos.filter((_, i) => i !== index)
    photosForm.setValue('photos', newPhotos, { shouldValidate: true })
  }

  const handleGetLocation = () => {
    setIsLoadingLocation(true)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          locationForm.setValue('latitude', position.coords.latitude)
          locationForm.setValue('longitude', position.coords.longitude)
          setIsLoadingLocation(false)
        },
        (error) => {
          console.error('Geolocation error:', error)
          setIsLoadingLocation(false)
          alert('לא הצלחנו לקבל את המיקום שלך. אנא ודא שנתת הרשאות מיקום.')
        }
      )
    } else {
      setIsLoadingLocation(false)
      alert('הדפדפן שלך לא תומך בשירותי מיקום')
    }
  }

  const toggleLookingFor = (value: string) => {
    const current = basicInfoForm.getValues('looking_for') || []
    const newValue = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    basicInfoForm.setValue('looking_for', newValue, { shouldValidate: true })
  }

  const toggleInterest = (interest: string) => {
    const current = bioInterestsForm.getValues('interests') || []
    const newValue = current.includes(interest)
      ? current.filter((i) => i !== interest)
      : [...current, interest]
    bioInterestsForm.setValue('interests', newValue, { shouldValidate: true })
  }

  return (
    <div className="min-h-screen bg-gradient-warm p-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 pt-6">
          <h1 className="text-3xl font-bold text-primary-600 mb-2">בואו נכיר אותך</h1>
          <p className="text-gray-600">עוד כמה פרטים ואתם בפנים</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            {STEP_TITLES.map((_, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                    index < currentStep
                      ? 'bg-primary-500 text-white'
                      : index === currentStep
                        ? 'bg-primary-400 text-white'
                        : 'bg-gray-200 text-gray-500'
                  )}
                >
                  {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
                </div>
                {index < 3 && (
                  <div
                    className={cn(
                      'w-12 sm:w-20 h-1 mx-1',
                      index < currentStep ? 'bg-primary-500' : 'bg-gray-200'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-800">
              {STEP_TITLES[currentStep].title}
            </h2>
            <p className="text-sm text-gray-500">{STEP_TITLES[currentStep].subtitle}</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 1: Basic Info */}
              {currentStep === 0 && (
                <form className="space-y-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">שם</Label>
                    <Input
                      id="name"
                      placeholder="השם שלך"
                      {...basicInfoForm.register('name')}
                    />
                    {basicInfoForm.formState.errors.name && (
                      <p className="text-sm text-red-500">
                        {basicInfoForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Age */}
                  <div className="space-y-2">
                    <Label htmlFor="age">גיל</Label>
                    <Input
                      id="age"
                      type="number"
                      min={18}
                      max={120}
                      {...basicInfoForm.register('age', { valueAsNumber: true })}
                    />
                    {basicInfoForm.formState.errors.age && (
                      <p className="text-sm text-red-500">
                        {basicInfoForm.formState.errors.age.message}
                      </p>
                    )}
                  </div>

                  {/* Gender */}
                  <div className="space-y-2">
                    <Label>מגדר</Label>
                    <div className="flex gap-3 flex-wrap">
                      {[
                        { value: 'male', label: 'גבר' },
                        { value: 'female', label: 'אישה' },
                        { value: 'other', label: 'אחר' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            basicInfoForm.setValue(
                              'gender',
                              option.value as 'male' | 'female' | 'other',
                              { shouldValidate: true }
                            )
                          }
                          className={cn(
                            'px-6 py-2 rounded-full border-2 transition-colors',
                            basicInfoForm.watch('gender') === option.value
                              ? 'border-primary-400 bg-primary-50 text-primary-600'
                              : 'border-gray-200 hover:border-primary-200'
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    {basicInfoForm.formState.errors.gender && (
                      <p className="text-sm text-red-500">
                        {basicInfoForm.formState.errors.gender.message}
                      </p>
                    )}
                  </div>

                  {/* Looking For */}
                  <div className="space-y-2">
                    <Label>מחפש/ת</Label>
                    <div className="flex gap-3 flex-wrap">
                      {[
                        { value: 'male', label: 'גברים' },
                        { value: 'female', label: 'נשים' },
                        { value: 'other', label: 'אחר' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => toggleLookingFor(option.value)}
                          className={cn(
                            'px-6 py-2 rounded-full border-2 transition-colors',
                            basicInfoForm.watch('looking_for')?.includes(option.value)
                              ? 'border-primary-400 bg-primary-50 text-primary-600'
                              : 'border-gray-200 hover:border-primary-200'
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    {basicInfoForm.formState.errors.looking_for && (
                      <p className="text-sm text-red-500">
                        {basicInfoForm.formState.errors.looking_for.message}
                      </p>
                    )}
                  </div>
                </form>
              )}

              {/* Step 2: Photos */}
              {currentStep === 1 && (
                <form className="space-y-6">
                  <div className="space-y-2">
                    <Label>תמונות (עד 6)</Label>
                    <p className="text-sm text-gray-500">
                      הוסיפו תמונות שמציגות אתכם במיטבכם
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {Array.from({ length: 6 }).map((_, index) => {
                      const photos = photosForm.watch('photos') || []
                      const photo = photos[index]

                      return (
                        <div
                          key={index}
                          className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 relative group"
                        >
                          {photo ? (
                            <>
                              <img
                                src={photo}
                                alt={`תמונה ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemovePhoto(index)}
                                className="absolute top-2 left-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                              <Camera className="w-8 h-8 text-gray-400 mb-2" />
                              <span className="text-xs text-gray-400">הוסף תמונה</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handlePhotoUpload}
                              />
                            </label>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {photosForm.formState.errors.photos && (
                    <p className="text-sm text-red-500">
                      {photosForm.formState.errors.photos.message}
                    </p>
                  )}
                </form>
              )}

              {/* Step 3: Bio & Interests */}
              {currentStep === 2 && (
                <form className="space-y-6">
                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio">קצת עליי</Label>
                    <textarea
                      id="bio"
                      rows={4}
                      placeholder="ספרו קצת על עצמכם..."
                      className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      {...bioInterestsForm.register('bio')}
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>
                        {bioInterestsForm.formState.errors.bio?.message || ''}
                      </span>
                      <span>{bioInterestsForm.watch('bio')?.length || 0}/500</span>
                    </div>
                  </div>

                  {/* Occupation */}
                  <div className="space-y-2">
                    <Label htmlFor="occupation">עיסוק (לא חובה)</Label>
                    <Input
                      id="occupation"
                      placeholder="מה אתם עושים?"
                      {...bioInterestsForm.register('occupation')}
                    />
                  </div>

                  {/* Interests */}
                  <div className="space-y-2">
                    <Label>תחומי עניין (בחרו לפחות 3)</Label>
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2">
                      {INTERESTS_LIST.map((interest) => (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={cn(
                            'px-4 py-1.5 rounded-full text-sm transition-colors',
                            bioInterestsForm.watch('interests')?.includes(interest)
                              ? 'bg-primary-400 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          )}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                    {bioInterestsForm.formState.errors.interests && (
                      <p className="text-sm text-red-500">
                        {bioInterestsForm.formState.errors.interests.message}
                      </p>
                    )}
                  </div>
                </form>
              )}

              {/* Step 4: Location */}
              {currentStep === 3 && (
                <form className="space-y-6">
                  {/* City Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="city">עיר</Label>
                    <select
                      id="city"
                      className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                      {...locationForm.register('city')}
                    >
                      <option value="">בחרו עיר</option>
                      {ISRAELI_CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                    {locationForm.formState.errors.city && (
                      <p className="text-sm text-red-500">
                        {locationForm.formState.errors.city.message}
                      </p>
                    )}
                  </div>

                  {/* Location Permission */}
                  <div className="space-y-4">
                    <Label>מיקום מדויק (לא חובה)</Label>
                    <p className="text-sm text-gray-500">
                      שתפו את המיקום שלכם כדי למצוא התאמות קרובות יותר
                    </p>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGetLocation}
                      disabled={isLoadingLocation}
                    >
                      {isLoadingLocation ? (
                        <Loader2 className="w-4 h-4 animate-spin ml-2" />
                      ) : (
                        <MapPin className="w-4 h-4 ml-2" />
                      )}
                      {isLoadingLocation ? 'מקבל מיקום...' : 'שתף מיקום'}
                    </Button>

                    {locationForm.watch('latitude') && locationForm.watch('longitude') && (
                      <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                        <Check className="w-4 h-4" />
                        <span>המיקום נשמר בהצלחה</span>
                      </div>
                    )}
                  </div>
                </form>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            <Button
              type="button"
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              className={cn(currentStep === 0 && 'invisible')}
            >
              <ChevronRight className="w-4 h-4 ml-1" />
              הקודם
            </Button>

            <Button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  שומר...
                </>
              ) : currentStep === 3 ? (
                'סיום'
              ) : (
                <>
                  הבא
                  <ChevronLeft className="w-4 h-4 mr-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
