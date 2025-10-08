export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string | null
          display_name: string | null
          avatar_url: string | null
          is_admin: boolean | null
        }
        Insert: {
          id: string
          user_id?: string | null
          display_name?: string | null
          avatar_url?: string | null
          is_admin?: boolean | null
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      gamification_profiles: {
        Row: {
          profile_id: string
          xp_total: number
          level: number
          prestige_level: number
          level_progress: Record<string, unknown>
          current_streak: number
          longest_streak: number
          last_action_at: string | null
          streak_frozen_until: string | null
          opted_in: boolean
          settings: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: {
          profile_id: string
          xp_total?: number
          level?: number
          prestige_level?: number
          level_progress?: Record<string, unknown>
          current_streak?: number
          longest_streak?: number
          last_action_at?: string | null
          streak_frozen_until?: string | null
          opted_in?: boolean
          settings?: Record<string, unknown>
        }
        Update: Partial<Database['public']['Tables']['gamification_profiles']['Insert']>
      }
      gamification_actions: {
        Row: {
          id: string
          profile_id: string
          action_type: string
          action_source: string | null
          points_awarded: number
          xp_awarded: number
          metadata: Record<string, unknown>
          awarded_at: string
          request_id: string | null
        }
        Insert: {
          id?: string
          profile_id: string
          action_type: string
          action_source?: string | null
          points_awarded?: number
          xp_awarded?: number
          metadata?: Record<string, unknown>
          awarded_at?: string
          request_id?: string | null
        }
        Update: Partial<Database['public']['Tables']['gamification_actions']['Insert']>
      }
      gamification_badges: {
        Row: {
          id: string
          slug: string
          name: string
          description: string | null
          category: string
          rarity: string
          parent_badge_id: string | null
          icon: string | null
          theme: string | null
          requirements: Record<string, unknown>
          reward_points: number
          is_time_limited: boolean
          available_from: string | null
          available_to: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          description?: string | null
          category: string
          rarity?: string
          parent_badge_id?: string | null
          icon?: string | null
          theme?: string | null
          requirements?: Record<string, unknown>
          reward_points?: number
          is_time_limited?: boolean
          available_from?: string | null
          available_to?: string | null
        }
        Update: Partial<Database['public']['Tables']['gamification_badges']['Insert']>
      }
      profile_badges: {
        Row: {
          profile_id: string
          badge_id: string
          state: 'awarded' | 'revoked' | 'suspended'
          awarded_at: string
          evidence: Record<string, unknown> | null
          progress: Record<string, unknown>
          notified_at: string | null
        }
        Insert: {
          profile_id: string
          badge_id: string
          state?: 'awarded' | 'revoked' | 'suspended'
          awarded_at?: string
          evidence?: Record<string, unknown> | null
          progress?: Record<string, unknown>
          notified_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['profile_badges']['Insert']>
      }
      gamification_levels: {
        Row: {
          level: number
          title: string
          min_xp: number
          perks: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: {
          level: number
          title: string
          min_xp: number
          perks?: Record<string, unknown>
        }
        Update: Partial<Database['public']['Tables']['gamification_levels']['Insert']>
      }
      gamification_challenges: {
        Row: {
          id: string
          slug: string
          title: string
          description: string | null
          cadence: 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'event'
          requirements: Record<string, unknown>
          reward_points: number
          reward_badge_id: string | null
          starts_at: string | null
          ends_at: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          description?: string | null
          cadence: 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'event'
          requirements?: Record<string, unknown>
          reward_points?: number
          reward_badge_id?: string | null
          starts_at?: string | null
          ends_at?: string | null
          is_active?: boolean
        }
        Update: Partial<Database['public']['Tables']['gamification_challenges']['Insert']>
      }
      profile_challenge_progress: {
        Row: {
          id: string
          profile_id: string
          challenge_id: string
          progress: Record<string, unknown>
          status: 'active' | 'completed' | 'expired' | 'abandoned'
          streak_count: number
          started_at: string
          completed_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          challenge_id: string
          progress?: Record<string, unknown>
          status?: 'active' | 'completed' | 'expired' | 'abandoned'
          streak_count?: number
          started_at?: string
          completed_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['profile_challenge_progress']['Insert']>
      }
      leaderboard_snapshots: {
        Row: {
          id: string
          scope: string
          captured_at: string
          expires_at: string | null
          payload: Record<string, unknown>
        }
        Insert: {
          id?: string
          scope: string
          captured_at?: string
          expires_at?: string | null
          payload?: Record<string, unknown>
        }
        Update: Partial<Database['public']['Tables']['leaderboard_snapshots']['Insert']>
      }
      gamification_audit: {
        Row: {
          id: string
          profile_id: string | null
          action: string
          delta: number | null
          reason: string | null
          performed_by: string | null
          metadata: Record<string, unknown>
          created_at: string
        }
        Insert: {
          id?: string
          profile_id?: string | null
          action: string
          delta?: number | null
          reason?: string | null
          performed_by?: string | null
          metadata?: Record<string, unknown>
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['gamification_audit']['Insert']>
      }
    }
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
  }
}
