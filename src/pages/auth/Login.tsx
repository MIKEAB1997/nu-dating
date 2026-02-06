import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', data.user.id)
          .single()

        if (!profile) {
          navigate('/onboarding')
        } else {
          navigate('/discover')
        }
      }
    } catch (error: any) {
      setError(error.message || 'שגיאה בהתחברות')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden" dir="rtl">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50" />

      {/* Decorative background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large warm circle */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-primary-200 to-primary-300 rounded-full blur-3xl"
        />

        {/* Accent circle */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.3 }}
          transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
          className="absolute -bottom-24 -right-24 w-80 h-80 bg-gradient-to-br from-accent-200 to-accent-300 rounded-full blur-3xl"
        />

        {/* Floating hearts */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: 100, opacity: 0 }}
            animate={{
              y: [-20, -40, -20],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 4 + i,
              delay: i * 0.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute"
            style={{
              left: `${15 + i * 18}%`,
              bottom: `${10 + i * 5}%`,
            }}
          >
            <Heart
              className="text-primary-300"
              size={16 + i * 4}
              fill="currentColor"
            />
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Glass card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-primary-200/30 p-8 border border-white/50">

            {/* Logo section */}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center mb-8"
            >
              <div className="relative inline-block">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <h1 className="text-6xl font-black bg-gradient-to-r from-primary-400 via-primary-500 to-accent-500 bg-clip-text text-transparent">
                    NU!
                  </h1>
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="absolute -top-2 -left-2"
                >
                  <Sparkles className="w-6 h-6 text-primary-400" />
                </motion.div>
              </div>
              <p className="text-gray-500 mt-3 text-lg">ברוכים הבאים בחזרה</p>
              <p className="text-primary-400 text-sm mt-1">הרפתקה חדשה מחכה לך</p>
            </motion.div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl"
              >
                <p className="text-red-600 text-sm text-center">{error}</p>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email field */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <label
                  htmlFor="email"
                  className={`block text-sm font-medium mb-2 transition-colors ${
                    focusedField === 'email' ? 'text-primary-500' : 'text-gray-600'
                  }`}
                >
                  אימייל
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="your@email.com"
                    required
                    disabled={loading}
                    className={`w-full px-5 py-4 bg-gray-50/50 border-2 rounded-2xl text-gray-900 placeholder-gray-400 transition-all duration-300 outline-none ${
                      focusedField === 'email'
                        ? 'border-primary-400 bg-white shadow-lg shadow-primary-100'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                    dir="ltr"
                  />
                </div>
              </motion.div>

              {/* Password field */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <label
                  htmlFor="password"
                  className={`block text-sm font-medium mb-2 transition-colors ${
                    focusedField === 'password' ? 'text-primary-500' : 'text-gray-600'
                  }`}
                >
                  סיסמה
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className={`w-full px-5 py-4 bg-gray-50/50 border-2 rounded-2xl text-gray-900 placeholder-gray-400 transition-all duration-300 outline-none ${
                      focusedField === 'password'
                        ? 'border-primary-400 bg-white shadow-lg shadow-primary-100'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                    dir="ltr"
                  />
                </div>
              </motion.div>

              {/* Submit button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full py-4 px-6 bg-gradient-to-r from-primary-400 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white font-semibold text-lg rounded-2xl shadow-lg shadow-primary-300/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary-300/50 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                        מתחבר...
                      </>
                    ) : (
                      <>
                        <Heart className="w-5 h-5" />
                        כניסה
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-accent-400 to-primary-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </motion.div>
            </form>

            {/* Sign up link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 text-center"
            >
              <p className="text-gray-500">
                עדיין אין לך חשבון?{' '}
                <Link
                  to="/signup"
                  className="text-primary-500 font-semibold hover:text-primary-600 transition-colors relative group"
                >
                  הרשמה
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-right" />
                </Link>
              </p>
            </motion.div>
          </div>

          {/* Bottom tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-gray-400 text-sm mt-6"
          >
            מצאו את האהבה שלכם 💕
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
