import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, MoreVertical, Ban, CheckCircle, Eye, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface User {
  id: string
  name: string
  email: string
  age: number
  gender: string
  city: string
  photos: string[]
  is_active: boolean
  is_premium: boolean
  created_at: string
}

export default function AdminUsers() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: async () => {
      let query = supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,city.ilike.%${search}%`)
      }

      const { data, error } = await query.limit(50)
      if (error) throw error
      return data as User[]
    },
  })

  const toggleActive = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('users')
        .update({ is_active: !isActive })
        .eq('id', userId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setSelectedUser(null)
    },
  })

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.from('users').delete().eq('id', userId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      setSelectedUser(null)
    },
  })

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">ניהול משתמשים</h2>
        <span className="text-gray-500">{users.length} משתמשים</span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="חיפוש לפי שם, אימייל או עיר..."
          className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400"
        />
      </div>

      {/* Users table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">משתמש</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">מיקום</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">סטטוס</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">הצטרפות</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.photos?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=40&background=f47a3a&color=fff`}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{user.name}, {user.age}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.city}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'px-2 py-1 text-xs font-medium rounded-full',
                            user.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          )}
                        >
                          {user.is_active ? 'פעיל' : 'מושבת'}
                        </span>
                        {user.is_premium && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                            פרימיום
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{formatDate(user.created_at)}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User actions modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full" dir="rtl">
            <div className="flex items-center gap-4 mb-6">
              <img
                src={selectedUser.photos?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name)}&size=60&background=f47a3a&color=fff`}
                alt={selectedUser.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h3 className="text-lg font-semibold">{selectedUser.name}, {selectedUser.age}</h3>
                <p className="text-gray-500">{selectedUser.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => toggleActive.mutate({ userId: selectedUser.id, isActive: selectedUser.is_active })}
                className="flex items-center gap-3 w-full px-4 py-3 text-right hover:bg-gray-50 rounded-xl"
              >
                {selectedUser.is_active ? (
                  <>
                    <Ban className="w-5 h-5 text-red-500" />
                    <span>השבת משתמש</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>הפעל משתמש</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  if (confirm('האם אתה בטוח שברצונך למחוק את המשתמש?')) {
                    deleteUser.mutate(selectedUser.id)
                  }
                }}
                className="flex items-center gap-3 w-full px-4 py-3 text-right hover:bg-red-50 rounded-xl text-red-600"
              >
                <Trash2 className="w-5 h-5" />
                <span>מחק משתמש</span>
              </button>
            </div>

            <button
              onClick={() => setSelectedUser(null)}
              className="w-full mt-4 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
            >
              סגור
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
