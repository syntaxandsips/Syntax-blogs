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
      ai_models: {
        Row: {
          id: string
          name: string
          display_name: string
          category: string
          version: string | null
          description: string | null
          icon_url: string | null
          parameters_schema: Record<string, unknown> | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          display_name: string
          category: string
          version?: string | null
          description?: string | null
          icon_url?: string | null
          parameters_schema?: Record<string, unknown> | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['ai_models']['Insert']>
      }
      prompt_collections: {
        Row: {
          id: string
          name: string
          description: string | null
          slug: string
          is_curated: boolean
          is_featured: boolean
          cover_image: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          slug: string
          is_curated?: boolean
          is_featured?: boolean
          cover_image?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['prompt_collections']['Insert']>
      }
      prompts: {
        Row: {
          id: string
          user_id: string
          title: string
          slug: string
          description: string | null
          prompt_text: string
          negative_prompt: string | null
          parameters: Record<string, unknown> | null
          media_type: Database['public']['Enums']['prompt_media_type']
          difficulty: Database['public']['Enums']['prompt_difficulty_level']
          language: string
          license: string
          visibility: Database['public']['Enums']['prompt_visibility']
          monetization_type: Database['public']['Enums']['prompt_monetization_type']
          price: number | null
          views_count: number
          downloads_count: number
          copies_count: number
          upvotes: number
          downvotes: number
          rating: number | null
          is_featured: boolean
          is_flagged: boolean
          moderation_status: Database['public']['Enums']['prompt_moderation_status']
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          slug: string
          description?: string | null
          prompt_text: string
          negative_prompt?: string | null
          parameters?: Record<string, unknown> | null
          media_type: Database['public']['Enums']['prompt_media_type']
          difficulty?: Database['public']['Enums']['prompt_difficulty_level']
          language?: string
          license?: string
          visibility?: Database['public']['Enums']['prompt_visibility']
          monetization_type?: Database['public']['Enums']['prompt_monetization_type']
          price?: number | null
          views_count?: number
          downloads_count?: number
          copies_count?: number
          upvotes?: number
          downvotes?: number
          rating?: number | null
          is_featured?: boolean
          is_flagged?: boolean
          moderation_status?: Database['public']['Enums']['prompt_moderation_status']
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['prompts']['Insert']>
      }
      prompt_models: {
        Row: {
          prompt_id: string
          model_id: string
          is_primary: boolean
          created_at: string
        }
        Insert: {
          prompt_id: string
          model_id: string
          is_primary?: boolean
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['prompt_models']['Insert']>
      }
      prompt_assets: {
        Row: {
          id: string
          prompt_id: string
          asset_type: Database['public']['Enums']['prompt_asset_type']
          file_url: string
          thumbnail_url: string | null
          display_order: number
          metadata: Record<string, unknown> | null
          file_size: number | null
          mime_type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          prompt_id: string
          asset_type?: Database['public']['Enums']['prompt_asset_type']
          file_url: string
          thumbnail_url?: string | null
          display_order?: number
          metadata?: Record<string, unknown> | null
          file_size?: number | null
          mime_type?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['prompt_assets']['Insert']>
      }
      prompt_tags: {
        Row: {
          id: string
          name: string
          category: string | null
          usage_count: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category?: string | null
          usage_count?: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['prompt_tags']['Insert']>
      }
      prompt_tags_junction: {
        Row: {
          prompt_id: string
          tag_id: string
          added_by: string | null
          created_at: string
        }
        Insert: {
          prompt_id: string
          tag_id: string
          added_by?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['prompt_tags_junction']['Insert']>
      }
      prompt_votes: {
        Row: {
          user_id: string
          prompt_id: string
          vote_type: Database['public']['Enums']['prompt_vote_type']
          weight: number
          created_at: string
        }
        Insert: {
          user_id: string
          prompt_id: string
          vote_type: Database['public']['Enums']['prompt_vote_type']
          weight?: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['prompt_votes']['Insert']>
      }
      prompt_downloads: {
        Row: {
          id: string
          user_id: string | null
          prompt_id: string
          ip_address: unknown | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          prompt_id: string
          ip_address?: unknown | null
          user_agent?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['prompt_downloads']['Insert']>
      }
      prompt_copy_events: {
        Row: {
          id: string
          user_id: string | null
          prompt_id: string
          ip_address: unknown | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          prompt_id: string
          ip_address?: unknown | null
          user_agent?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['prompt_copy_events']['Insert']>
      }
      prompt_bookmark_collections: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          is_default?: boolean
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['prompt_bookmark_collections']['Insert']>
      }
      prompt_bookmarks: {
        Row: {
          user_id: string
          prompt_id: string
          collection_id: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          prompt_id: string
          collection_id?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['prompt_bookmarks']['Insert']>
      }
      prompt_comments: {
        Row: {
          id: string
          prompt_id: string
          user_id: string | null
          parent_id: string | null
          content: string
          markdown_content: string | null
          upvotes: number
          downvotes: number
          is_flagged: boolean
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          prompt_id: string
          user_id?: string | null
          parent_id?: string | null
          content: string
          markdown_content?: string | null
          upvotes?: number
          downvotes?: number
          is_flagged?: boolean
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['prompt_comments']['Insert']>
      }
      prompt_collection_items: {
        Row: {
          collection_id: string
          prompt_id: string
          display_order: number
          added_by: string | null
          created_at: string
        }
        Insert: {
          collection_id: string
          prompt_id: string
          display_order?: number
          added_by?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['prompt_collection_items']['Insert']>
      }
      prompt_moderation_queue: {
        Row: {
          id: string
          prompt_id: string
          moderator_id: string | null
          status: Database['public']['Enums']['prompt_moderation_status']
          reason: string | null
          notes: string | null
          created_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          prompt_id: string
          moderator_id?: string | null
          status?: Database['public']['Enums']['prompt_moderation_status']
          reason?: string | null
          notes?: string | null
          created_at?: string
          resolved_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['prompt_moderation_queue']['Insert']>
      }
      prompt_stats_daily: {
        Row: {
          prompt_id: string
          date: string
          views: number
          downloads: number
          copies: number
          upvotes: number
          downvotes: number
          comments: number
          created_at: string
        }
        Insert: {
          prompt_id: string
          date: string
          views?: number
          downloads?: number
          copies?: number
          upvotes?: number
          downvotes?: number
          comments?: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['prompt_stats_daily']['Insert']>
      }
      prompt_activity_feed: {
        Row: {
          id: string
          user_id: string | null
          prompt_id: string | null
          activity_type: string
          metadata: Record<string, unknown> | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          prompt_id?: string | null
          activity_type: string
          metadata?: Record<string, unknown> | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['prompt_activity_feed']['Insert']>
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
    Enums: {
      prompt_media_type: 'image' | 'video' | 'text' | 'audio' | '3d' | 'workflow'
      prompt_difficulty_level: 'beginner' | 'intermediate' | 'advanced'
      prompt_visibility: 'public' | 'unlisted' | 'draft'
      prompt_monetization_type: 'free' | 'tip-enabled' | 'premium'
      prompt_asset_type: 'image' | 'video' | 'file'
      prompt_moderation_status: 'pending' | 'approved' | 'rejected'
      prompt_vote_type: 'upvote' | 'downvote'
    }
  }
}
