import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Flag, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface Report {
  id: string
  reason: string
  description: string | null
  status: 'pending' | 'reviewed' | 'actioned'
  created_at: string
  reporter: {
    id: string
    name: string
    photos: string[]
  }
  reported_user: {
    id: string
    name: string
    photos: string[]
  } | null
}

const reasonLabels: Record<string, string> = {
  inappropriate_content: 'תוכן לא הולם',
  harassment: 'הטרדה',
  fake_profile: 'פרופיל מזויף',
  spam: 'ספאם',
  other: 'אחר',
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'ממתין', color: 'bg-yellow-100 text-yellow-700' },
  reviewed: { label: 'נבדק', color: 'bg-blue-100 text-blue-700' },
  actioned: { label: 'טופל', color: 'bg-green-100 text-green-700' },
}

export default function AdminReports() {
  const queryClient = useQueryClient()

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Fetch reporter and reported user details
      const reportsWithUsers: Report[] = []

      for (const report of data) {
        const { data: reporter } = await supabase
          .from('users')
          .select('id, name, photos')
          .eq('id', report.reporter_id)
          .single()

        let reportedUser = null
        if (report.reported_user_id) {
          const { data } = await supabase
            .from('users')
            .select('id, name, photos')
            .eq('id', report.reported_user_id)
            .single()
          reportedUser = data
        }

        if (reporter) {
          reportsWithUsers.push({
            ...report,
            reporter,
            reported_user: reportedUser,
          })
        }
      }

      return reportsWithUsers
    },
  })

  const updateStatus = useMutation({
    mutationFn: async ({ reportId, status }: { reportId: string; status: string }) => {
      const { error } = await supabase
        .from('reports')
        .update({ status })
        .eq('id', reportId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const pendingCount = reports.filter(r => r.status === 'pending').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">ניהול דיווחים</h2>
        {pendingCount > 0 && (
          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
            {pendingCount} ממתינים
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400" />
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <Flag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">אין דיווחים</h3>
          <p className="text-gray-500">לא התקבלו דיווחים עדיין</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className={cn(
                'bg-white rounded-2xl p-6 shadow-sm',
                report.status === 'pending' && 'ring-2 ring-orange-200'
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={cn(
                    'w-5 h-5',
                    report.status === 'pending' ? 'text-orange-500' : 'text-gray-400'
                  )} />
                  <span className="font-semibold text-gray-900">
                    {reasonLabels[report.reason] || report.reason}
                  </span>
                  <span className={cn(
                    'px-2 py-0.5 text-xs font-medium rounded-full',
                    statusLabels[report.status].color
                  )}>
                    {statusLabels[report.status].label}
                  </span>
                </div>
                <span className="text-sm text-gray-500">{formatDate(report.created_at)}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500 mb-2">מדווח</p>
                  <div className="flex items-center gap-2">
                    <img
                      src={report.reporter.photos?.[0] || '/placeholder-avatar.png'}
                      alt={report.reporter.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="font-medium">{report.reporter.name}</span>
                  </div>
                </div>

                {report.reported_user && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">מדווח עליו</p>
                    <div className="flex items-center gap-2">
                      <img
                        src={report.reported_user.photos?.[0] || '/placeholder-avatar.png'}
                        alt={report.reported_user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="font-medium">{report.reported_user.name}</span>
                    </div>
                  </div>
                )}
              </div>

              {report.description && (
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg mb-4">
                  {report.description}
                </p>
              )}

              {report.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus.mutate({ reportId: report.id, status: 'actioned' })}
                    className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                  >
                    <CheckCircle className="w-4 h-4" />
                    טופל
                  </button>
                  <button
                    onClick={() => updateStatus.mutate({ reportId: report.id, status: 'reviewed' })}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                  >
                    <Clock className="w-4 h-4" />
                    סמן כנבדק
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
