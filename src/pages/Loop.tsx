import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, Plus, Heart, MessageCircle, Send, X, Image as ImageIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Post {
  id: string
  content: string
  image_url: string | null
  likes_count: number
  comments_count: number
  created_at: string
  author: {
    id: string
    name: string
    photos: string[]
  }
  liked_by_me: boolean
}

interface Comment {
  id: string
  content: string
  created_at: string
  author: {
    id: string
    name: string
    photos: string[]
  }
}

interface MatchedUser {
  id: string
  name: string
  photos: string[]
}

export default function Loop() {
  const { matchId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [newPostContent, setNewPostContent] = useState('')
  const [selectedPostForComments, setSelectedPostForComments] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // Get current user's database ID
  useEffect(() => {
    async function getCurrentUserId() {
      if (!user) return
      const { data } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single()
      if (data) setCurrentUserId(data.id)
    }
    getCurrentUserId()
  }, [user])

  // Fetch match info and posts
  const { data: matchData, isLoading } = useQuery({
    queryKey: ['loop', matchId],
    queryFn: async () => {
      if (!matchId || !currentUserId) return null

      // Get the loop for this match
      const { data: loopData } = await supabase
        .from('loops')
        .select('id')
        .eq('match_id', matchId)
        .single()

      if (!loopData) return null

      // Get match info to find the other user
      const { data: match } = await supabase
        .from('matches')
        .select('user1_id, user2_id')
        .eq('id', matchId)
        .single()

      if (!match) return null

      const otherUserId = match.user1_id === currentUserId ? match.user2_id : match.user1_id

      const { data: matchedUser } = await supabase
        .from('users')
        .select('id, name, photos')
        .eq('id', otherUserId)
        .single()

      // Get posts
      const { data: posts } = await supabase
        .from('loop_posts')
        .select(`
          id,
          content,
          image_url,
          likes_count,
          comments_count,
          created_at,
          author_id
        `)
        .eq('loop_id', loopData.id)
        .order('created_at', { ascending: false })

      // Get authors for posts
      const postsWithAuthors: Post[] = []
      if (posts) {
        for (const post of posts) {
          const { data: author } = await supabase
            .from('users')
            .select('id, name, photos')
            .eq('id', post.author_id)
            .single()

          // Check if current user liked this post
          const { data: likeData } = await supabase
            .from('loop_likes')
            .select('id')
            .eq('post_id', post.id)
            .eq('user_id', currentUserId)
            .single()

          if (author) {
            postsWithAuthors.push({
              ...post,
              author,
              liked_by_me: !!likeData,
            })
          }
        }
      }

      return {
        loopId: loopData.id,
        matchedUser: matchedUser as MatchedUser,
        posts: postsWithAuthors,
      }
    },
    enabled: !!matchId && !!currentUserId,
  })

  // Create post mutation
  const createPost = useMutation({
    mutationFn: async (content: string) => {
      if (!matchData?.loopId || !currentUserId) return

      await supabase.from('loop_posts').insert({
        loop_id: matchData.loopId,
        author_id: currentUserId,
        content,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loop', matchId] })
      setNewPostContent('')
      setShowCreatePost(false)
    },
  })

  // Like/unlike mutation
  const toggleLike = useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: string; isLiked: boolean }) => {
      if (!currentUserId) return

      if (isLiked) {
        await supabase
          .from('loop_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUserId)
      } else {
        await supabase.from('loop_likes').insert({
          post_id: postId,
          user_id: currentUserId,
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loop', matchId] })
    },
  })

  // Fetch comments for a post
  const { data: comments = [] } = useQuery({
    queryKey: ['comments', selectedPostForComments],
    queryFn: async () => {
      if (!selectedPostForComments) return []

      const { data } = await supabase
        .from('loop_comments')
        .select('id, content, created_at, author_id')
        .eq('post_id', selectedPostForComments)
        .order('created_at', { ascending: true })

      if (!data) return []

      const commentsWithAuthors: Comment[] = []
      for (const comment of data) {
        const { data: author } = await supabase
          .from('users')
          .select('id, name, photos')
          .eq('id', comment.author_id)
          .single()

        if (author) {
          commentsWithAuthors.push({
            ...comment,
            author,
          })
        }
      }

      return commentsWithAuthors
    },
    enabled: !!selectedPostForComments,
  })

  // Add comment mutation
  const addComment = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedPostForComments || !currentUserId) return

      await supabase.from('loop_comments').insert({
        post_id: selectedPostForComments,
        author_id: currentUserId,
        content,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', selectedPostForComments] })
      queryClient.invalidateQueries({ queryKey: ['loop', matchId] })
      setNewComment('')
    },
  })

  if (isLoading || !matchData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400" />
      </div>
    )
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)

    if (diffMins < 1) return 'עכשיו'
    if (diffMins < 60) return `לפני ${diffMins} דק׳`
    if (diffHours < 24) return `לפני ${diffHours} שעות`
    return date.toLocaleDateString('he-IL')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={() => navigate('/matches')} className="p-2 -mr-2 hover:bg-gray-100 rounded-full">
            <ArrowRight className="h-5 w-5" />
          </button>
          <img
            src={matchData.matchedUser.photos[0] || '/placeholder-avatar.png'}
            alt={matchData.matchedUser.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h1 className="font-semibold text-gray-900">{matchData.matchedUser.name}</h1>
            <p className="text-xs text-gray-500">הלופ שלכם</p>
          </div>
        </div>
      </header>

      {/* Posts */}
      <main className="max-w-md mx-auto px-4 py-4 space-y-4">
        {matchData.posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-10 h-10 text-primary-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">הלופ שלכם ריק</h2>
            <p className="text-gray-500">התחילו לשתף רגעים יחד!</p>
          </div>
        ) : (
          matchData.posts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl shadow-sm p-4">
              {/* Post header */}
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={post.author.photos[0] || '/placeholder-avatar.png'}
                  alt={post.author.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-medium text-gray-900">{post.author.name}</h3>
                  <p className="text-xs text-gray-500">{formatTime(post.created_at)}</p>
                </div>
              </div>

              {/* Post content */}
              <p className="text-gray-800 mb-3 whitespace-pre-wrap">{post.content}</p>

              {post.image_url && (
                <img src={post.image_url} alt="" className="rounded-xl mb-3 w-full" />
              )}

              {/* Actions */}
              <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                <button
                  onClick={() => toggleLike.mutate({ postId: post.id, isLiked: post.liked_by_me })}
                  className={cn(
                    'flex items-center gap-1 text-sm',
                    post.liked_by_me ? 'text-red-500' : 'text-gray-500'
                  )}
                >
                  <Heart className={cn('w-5 h-5', post.liked_by_me && 'fill-current')} />
                  {post.likes_count > 0 && post.likes_count}
                </button>
                <button
                  onClick={() => setSelectedPostForComments(post.id)}
                  className="flex items-center gap-1 text-sm text-gray-500"
                >
                  <MessageCircle className="w-5 h-5" />
                  {post.comments_count > 0 && post.comments_count}
                </button>
              </div>
            </div>
          ))
        )}
      </main>

      {/* Create Post Button */}
      <button
        onClick={() => setShowCreatePost(true)}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-primary-400 hover:bg-primary-500 text-white px-6 py-3 rounded-full shadow-lg transition-colors flex items-center gap-2"
      >
        <Plus className="w-5 h-5" />
        פוסט חדש
      </button>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-6" dir="rtl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">פוסט חדש</h2>
              <button onClick={() => setShowCreatePost(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="מה קורה?"
              className="w-full h-32 p-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
            <div className="flex justify-between items-center mt-4">
              <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                <ImageIcon className="w-6 h-6" />
              </button>
              <Button
                onClick={() => createPost.mutate(newPostContent)}
                disabled={!newPostContent.trim() || createPost.isPending}
              >
                {createPost.isPending ? 'שולח...' : 'פרסם'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {selectedPostForComments && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-md h-[70vh] rounded-t-3xl flex flex-col" dir="rtl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">תגובות</h2>
              <button onClick={() => setSelectedPostForComments(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <img
                    src={comment.author.photos[0] || '/placeholder-avatar.png'}
                    alt={comment.author.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1 bg-gray-100 rounded-xl p-3">
                    <p className="font-medium text-sm text-gray-900">{comment.author.name}</p>
                    <p className="text-gray-800">{comment.content}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatTime(comment.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t flex gap-2">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="כתוב תגובה..."
                className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
              <button
                onClick={() => addComment.mutate(newComment)}
                disabled={!newComment.trim() || addComment.isPending}
                className="p-2 bg-primary-400 text-white rounded-full disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
        <div className="max-w-md mx-auto flex justify-around py-2">
          <Link to="/discover" className="flex flex-col items-center gap-0.5 px-4 py-1 text-gray-400">
            <span className="text-xl">🔥</span>
            <span className="text-xs">גלה</span>
          </Link>
          <Link to="/matches" className="flex flex-col items-center gap-0.5 px-4 py-1 text-primary-500">
            <span className="text-xl">💬</span>
            <span className="text-xs">התאמות</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center gap-0.5 px-4 py-1 text-gray-400">
            <span className="text-xl">👤</span>
            <span className="text-xs">פרופיל</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
