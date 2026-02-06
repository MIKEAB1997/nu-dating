import { useQuery } from '@tanstack/react-query'
import { Ban, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

interface Block {
  id: string
  reason: string | null
  created_at: string
  blocker: {
    id: string
    name: string
    photos: string[]
  }
  blocked: {
    id: string
    name: string
    photos: string[]
  }
}

export default function AdminBlocks() {
  const { data: blocks = [], isLoading } = useQuery({
    queryKey: ['admin-blocks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blocks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Fetch blocker and blocked user details
      const blocksWithUsers: Block[] = []

      for (const block of data) {
        const [blockerRes, blockedRes] = await Promise.all([
          supabase.from('users').select('id, name, photos').eq('id', block.blocker_id).single(),
          supabase.from('users').select('id, name, photos').eq('id', block.blocked_id).single(),
        ])

        if (blockerRes.data && blockedRes.data) {
          blocksWithUsers.push({
            ...block,
            blocker: blockerRes.data,
            blocked: blockedRes.data,
          })
        }
      }

      return blocksWithUsers
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
        <h2 className="text-2xl font-bold text-gray-900">חסימות</h2>
        <span className="text-gray-500">{blocks.length} חסימות</span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400" />
        </div>
      ) : blocks.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <Ban className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">אין חסימות</h3>
          <p className="text-gray-500">לא נמצאו חסימות במערכת</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">חוסם</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600"></th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">נחסם</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">סיבה</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">תאריך</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {blocks.map((block) => (
                  <tr key={block.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={block.blocker.photos?.[0] || '/placeholder-avatar.png'}
                          alt={block.blocker.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <span className="font-medium">{block.blocker.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <ArrowLeft className="w-5 h-5 text-gray-400 mx-auto" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={block.blocked.photos?.[0] || '/placeholder-avatar.png'}
                          alt={block.blocked.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <span className="font-medium">{block.blocked.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {block.reason || 'לא צוין'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatDate(block.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
