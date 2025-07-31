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
      departments: {
        Row: {
          id: string
          code: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          created_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          code: string
          title: string
          department_id: string | null
          credits: number | null
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          title: string
          department_id?: string | null
          credits?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          title?: string
          department_id?: string | null
          credits?: number | null
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          student_id: string | null
          department_id: string | null
          semester: number | null
          section: string | null
          avatar_url: string | null
          bio: string | null
          is_faculty: boolean | null
          is_active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          student_id?: string | null
          department_id?: string | null
          semester?: number | null
          section?: string | null
          avatar_url?: string | null
          bio?: string | null
          is_faculty?: boolean | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          student_id?: string | null
          department_id?: string | null
          semester?: number | null
          section?: string | null
          avatar_url?: string | null
          bio?: string | null
          is_faculty?: boolean | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          author_id: string
          content: string
          image_url: string | null
          is_announcement: boolean | null
          likes_count: number | null
          comments_count: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          content: string
          image_url?: string | null
          is_announcement?: boolean | null
          likes_count?: number | null
          comments_count?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          content?: string
          image_url?: string | null
          is_announcement?: boolean | null
          likes_count?: number | null
          comments_count?: number | null
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
      friendships: {
        Row: {
          id: string
          user_id: string
          friend_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          friend_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          friend_id?: string
          created_at?: string
        }
      }
      friend_requests: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          status?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          data: Json | null
          is_read: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          data?: Json | null
          is_read?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          data?: Json | null
          is_read?: boolean | null
          created_at?: string
        }
      }
      schedules: {
        Row: {
          id: string
          course_id: string
          instructor_id: string | null
          semester: number
          section: string
          day_of_week: number | null
          start_time: string
          end_time: string
          room: string | null
          academic_year: string
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          instructor_id?: string | null
          semester: number
          section: string
          day_of_week?: number | null
          start_time: string
          end_time: string
          room?: string | null
          academic_year: string
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          instructor_id?: string | null
          semester?: number
          section?: string
          day_of_week?: number | null
          start_time?: string
          end_time?: string
          room?: string | null
          academic_year?: string
          created_at?: string
        }
      }
      user_schedules: {
        Row: {
          id: string
          user_id: string
          schedule_id: string
          enrolled_at: string
        }
        Insert: {
          id?: string
          user_id: string
          schedule_id: string
          enrolled_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          schedule_id?: string
          enrolled_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_notification: {
        Args: {
          p_user_id: string
          p_type: string
          p_title: string
          p_message: string
          p_data?: Json
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}