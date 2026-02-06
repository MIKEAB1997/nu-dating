/**
 * Database types - will be auto-generated from Supabase
 * For now, this is a placeholder
 *
 * To generate:
 * supabase gen types typescript --local > src/types/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          auth_id: string
          email: string
          name: string
          age: number
          gender: string
          looking_for: string[]
          city: string
          latitude: number | null
          longitude: number | null
          bio: string | null
          photos: string[]
          interests: string[]
          occupation: string | null
          discovery_distance: number
          age_range_min: number
          age_range_max: number
          is_active: boolean
          is_premium: boolean
          created_at: string
          updated_at: string
          last_active_at: string
        }
        Insert: {
          id?: string
          auth_id: string
          email: string
          name: string
          age: number
          gender: string
          looking_for: string[]
          city: string
          latitude?: number | null
          longitude?: number | null
          bio?: string | null
          photos?: string[]
          interests?: string[]
          occupation?: string | null
          discovery_distance?: number
          age_range_min?: number
          age_range_max?: number
          is_active?: boolean
          is_premium?: boolean
          created_at?: string
          updated_at?: string
          last_active_at?: string
        }
        Update: {
          id?: string
          auth_id?: string
          email?: string
          name?: string
          age?: number
          gender?: string
          looking_for?: string[]
          city?: string
          latitude?: number | null
          longitude?: number | null
          bio?: string | null
          photos?: string[]
          interests?: string[]
          occupation?: string | null
          discovery_distance?: number
          age_range_min?: number
          age_range_max?: number
          is_active?: boolean
          is_premium?: boolean
          created_at?: string
          updated_at?: string
          last_active_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          liker_id: string
          liked_id: string
          created_at: string
        }
        Insert: {
          id?: string
          liker_id: string
          liked_id: string
          created_at?: string
        }
        Update: {
          id?: string
          liker_id?: string
          liked_id?: string
          created_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          user1_id: string
          user2_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user1_id: string
          user2_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user1_id?: string
          user2_id?: string
          created_at?: string
        }
      }
      loop_posts: {
        Row: {
          id: string
          match_id: string
          author_id: string
          content: string
          image_url: string | null
          likes_count: number
          comments_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          match_id: string
          author_id: string
          content: string
          image_url?: string | null
          likes_count?: number
          comments_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          match_id?: string
          author_id?: string
          content?: string
          image_url?: string | null
          likes_count?: number
          comments_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      post_likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          created_at?: string
        }
      }
      post_comments: {
        Row: {
          id: string
          post_id: string
          author_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          author_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          author_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      get_discover_users: {
        Args: {
          current_user_id: string
          limit_count?: number
        }
        Returns: {
          id: string
          name: string
          age: number
          city: string
          bio: string | null
          photos: string[]
          occupation: string | null
          interests: string[]
        }[]
      }
    }
  }
}

// Convenience types
export type User = Database['public']['Tables']['users']['Row']
export type Match = Database['public']['Tables']['matches']['Row']
export type LoopPost = Database['public']['Tables']['loop_posts']['Row']
export type PostLike = Database['public']['Tables']['post_likes']['Row']
export type PostComment = Database['public']['Tables']['post_comments']['Row']

// Extended types with relations
export interface MatchWithUser extends Match {
  matched_user: User
}

export interface LoopPostWithAuthor extends LoopPost {
  author: User
  user_has_liked?: boolean
}

export interface PostCommentWithAuthor extends PostComment {
  author: User
}
