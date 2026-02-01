export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          ai_response: string
          id: string
          is_pending: boolean | null
          lead_id: string | null
          responded_at: string | null
          response_type: string | null
          sent_at: string
          session_date: string
          session_id: string | null
          user_email: string
          user_message: string
          user_name: string
          webinar_id: string
        }
        Insert: {
          ai_response: string
          id?: string
          is_pending?: boolean | null
          lead_id?: string | null
          responded_at?: string | null
          response_type?: string | null
          sent_at?: string
          session_date?: string
          session_id?: string | null
          user_email: string
          user_message: string
          user_name: string
          webinar_id: string
        }
        Update: {
          ai_response?: string
          id?: string
          is_pending?: boolean | null
          lead_id?: string | null
          responded_at?: string | null
          response_type?: string | null
          sent_at?: string
          session_date?: string
          session_id?: string | null
          user_email?: string
          user_message?: string
          user_name?: string
          webinar_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_webinar_id_fkey"
            columns: ["webinar_id"]
            isOneToOne: false
            referencedRelation: "webinars"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          last_message_at: string | null
          lead_id: string | null
          mode: string | null
          returned_to_ai_at: string | null
          taken_over_at: string | null
          taken_over_by: string | null
          updated_at: string | null
          user_email: string
          user_name: string | null
          webinar_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_message_at?: string | null
          lead_id?: string | null
          mode?: string | null
          returned_to_ai_at?: string | null
          taken_over_at?: string | null
          taken_over_by?: string | null
          updated_at?: string | null
          user_email: string
          user_name?: string | null
          webinar_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_message_at?: string | null
          lead_id?: string | null
          mode?: string | null
          returned_to_ai_at?: string | null
          taken_over_at?: string | null
          taken_over_by?: string | null
          updated_at?: string | null
          user_email?: string
          user_name?: string | null
          webinar_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_sessions_webinar_id_fkey"
            columns: ["webinar_id"]
            isOneToOne: false
            referencedRelation: "webinars"
            referencedColumns: ["id"]
          },
        ]
      }
      clips: {
        Row: {
          created_at: string
          duration_auto_detected: boolean | null
          duration_seconds: number
          file_size_mb: number | null
          id: string
          is_archived: boolean | null
          name: string
          notes: string | null
          tags: string[] | null
          thumbnail_url: string | null
          updated_at: string
          url: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          duration_auto_detected?: boolean | null
          duration_seconds: number
          file_size_mb?: number | null
          id?: string
          is_archived?: boolean | null
          name: string
          notes?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string
          url: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          duration_auto_detected?: boolean | null
          duration_seconds?: number
          file_size_mb?: number | null
          id?: string
          is_archived?: boolean | null
          name?: string
          notes?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string
          url?: string
          user_id?: string | null
        }
        Relationships: []
      }
      cta_clicks: {
        Row: {
          button_text: string | null
          button_url: string | null
          clicked_at: string
          id: string
          lead_id: string | null
          minutes_watched: number
          webinar_id: string
        }
        Insert: {
          button_text?: string | null
          button_url?: string | null
          clicked_at?: string
          id?: string
          lead_id?: string | null
          minutes_watched?: number
          webinar_id: string
        }
        Update: {
          button_text?: string | null
          button_url?: string | null
          clicked_at?: string
          id?: string
          lead_id?: string | null
          minutes_watched?: number
          webinar_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cta_clicks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cta_clicks_webinar_id_fkey"
            columns: ["webinar_id"]
            isOneToOne: false
            referencedRelation: "webinars"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          captured_at: string
          email: string
          id: string
          ip_address: string | null
          name: string
          user_agent: string | null
          webinar_id: string
        }
        Insert: {
          captured_at?: string
          email: string
          id?: string
          ip_address?: string | null
          name: string
          user_agent?: string | null
          webinar_id: string
        }
        Update: {
          captured_at?: string
          email?: string
          id?: string
          ip_address?: string | null
          name?: string
          user_agent?: string | null
          webinar_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_webinar_id_fkey"
            columns: ["webinar_id"]
            isOneToOne: false
            referencedRelation: "webinars"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_replies: {
        Row: {
          answered_at: string | null
          chat_message_id: string | null
          created_at: string | null
          human_response: string | null
          id: string
          is_answered: boolean | null
          session_id: string | null
          user_email: string | null
          user_message: string | null
          user_name: string | null
          webinar_id: string | null
        }
        Insert: {
          answered_at?: string | null
          chat_message_id?: string | null
          created_at?: string | null
          human_response?: string | null
          id?: string
          is_answered?: boolean | null
          session_id?: string | null
          user_email?: string | null
          user_message?: string | null
          user_name?: string | null
          webinar_id?: string | null
        }
        Update: {
          answered_at?: string | null
          chat_message_id?: string | null
          created_at?: string | null
          human_response?: string | null
          id?: string
          is_answered?: boolean | null
          session_id?: string | null
          user_email?: string | null
          user_message?: string | null
          user_name?: string | null
          webinar_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pending_replies_chat_message_id_fkey"
            columns: ["chat_message_id"]
            isOneToOne: true
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_replies_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_replies_webinar_id_fkey"
            columns: ["webinar_id"]
            isOneToOne: false
            referencedRelation: "webinars"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          status: Database["public"]["Enums"]["user_status"]
          trial_ends_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quick_replies: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          message: string
          sort_order: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          message: string
          sort_order?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          message?: string
          sort_order?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webinar_events: {
        Row: {
          chat_message: string | null
          created_at: string
          cta_url: string | null
          device_type: string | null
          event_type: string
          id: string
          ip_address: string | null
          session_id: string | null
          user_email: string
          user_name: string | null
          watch_minutes: number | null
          watch_percent: number | null
          webinar_id: string
          webinar_name: string | null
        }
        Insert: {
          chat_message?: string | null
          created_at?: string
          cta_url?: string | null
          device_type?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          session_id?: string | null
          user_email: string
          user_name?: string | null
          watch_minutes?: number | null
          watch_percent?: number | null
          webinar_id: string
          webinar_name?: string | null
        }
        Update: {
          chat_message?: string | null
          created_at?: string
          cta_url?: string | null
          device_type?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          session_id?: string | null
          user_email?: string
          user_name?: string | null
          watch_minutes?: number | null
          watch_percent?: number | null
          webinar_id?: string
          webinar_name?: string | null
        }
        Relationships: []
      }
      webinar_notes: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
          webinar_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
          webinar_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
          webinar_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webinar_notes_webinar_id_fkey"
            columns: ["webinar_id"]
            isOneToOne: false
            referencedRelation: "webinars"
            referencedColumns: ["id"]
          },
        ]
      }
      webinars: {
        Row: {
          background_color: string
          bot_avatar: string
          bot_name: string
          chat_background: string
          created_at: string
          cta_button_color: string
          cta_button_text: string
          cta_button_url: string
          cta_headline: string
          cta_show_after_minutes: number
          cta_show_urgency: boolean
          cta_style: string
          cta_subheadline: string
          cta_urgency_text: string
          duration_minutes: number
          enable_cta: boolean
          enable_lead_capture: boolean
          enable_registration_form: boolean | null
          enable_tracking: boolean
          error_message: string
          header_title: string
          id: string
          lead_webhook_url: string
          logo_text: string
          max_viewers: number
          min_viewers: number
          primary_color: string
          reg_form_background: string | null
          reg_form_border_radius: string | null
          reg_form_button_color: string | null
          reg_form_button_text: string | null
          reg_form_email_label: string | null
          reg_form_email_placeholder: string | null
          reg_form_ghl_webhook_url: string | null
          reg_form_headline: string | null
          reg_form_name_label: string | null
          reg_form_name_placeholder: string | null
          reg_form_privacy_text: string | null
          reg_form_show_datetime: boolean | null
          reg_form_show_privacy: boolean | null
          reg_form_subheadline: string | null
          reg_form_text_color: string | null
          reg_form_thank_you_url: string | null
          reg_form_theme: string | null
          require_email: boolean
          require_name: boolean
          start_hour: number
          start_minute: number
          timezone: string
          tracking_webhook_url: string
          typing_delay_max: number
          typing_delay_min: number
          updated_at: string
          user_id: string | null
          video_mode: string | null
          video_sequence: Json | null
          video_url: string
          webhook_url: string
          webinar_name: string
          welcome_message: string
          youtube_video_id: string | null
        }
        Insert: {
          background_color?: string
          bot_avatar?: string
          bot_name?: string
          chat_background?: string
          created_at?: string
          cta_button_color?: string
          cta_button_text?: string
          cta_button_url?: string
          cta_headline?: string
          cta_show_after_minutes?: number
          cta_show_urgency?: boolean
          cta_style?: string
          cta_subheadline?: string
          cta_urgency_text?: string
          duration_minutes?: number
          enable_cta?: boolean
          enable_lead_capture?: boolean
          enable_registration_form?: boolean | null
          enable_tracking?: boolean
          error_message?: string
          header_title?: string
          id?: string
          lead_webhook_url?: string
          logo_text?: string
          max_viewers?: number
          min_viewers?: number
          primary_color?: string
          reg_form_background?: string | null
          reg_form_border_radius?: string | null
          reg_form_button_color?: string | null
          reg_form_button_text?: string | null
          reg_form_email_label?: string | null
          reg_form_email_placeholder?: string | null
          reg_form_ghl_webhook_url?: string | null
          reg_form_headline?: string | null
          reg_form_name_label?: string | null
          reg_form_name_placeholder?: string | null
          reg_form_privacy_text?: string | null
          reg_form_show_datetime?: boolean | null
          reg_form_show_privacy?: boolean | null
          reg_form_subheadline?: string | null
          reg_form_text_color?: string | null
          reg_form_thank_you_url?: string | null
          reg_form_theme?: string | null
          require_email?: boolean
          require_name?: boolean
          start_hour?: number
          start_minute?: number
          timezone?: string
          tracking_webhook_url?: string
          typing_delay_max?: number
          typing_delay_min?: number
          updated_at?: string
          user_id?: string | null
          video_mode?: string | null
          video_sequence?: Json | null
          video_url?: string
          webhook_url?: string
          webinar_name: string
          welcome_message?: string
          youtube_video_id?: string | null
        }
        Update: {
          background_color?: string
          bot_avatar?: string
          bot_name?: string
          chat_background?: string
          created_at?: string
          cta_button_color?: string
          cta_button_text?: string
          cta_button_url?: string
          cta_headline?: string
          cta_show_after_minutes?: number
          cta_show_urgency?: boolean
          cta_style?: string
          cta_subheadline?: string
          cta_urgency_text?: string
          duration_minutes?: number
          enable_cta?: boolean
          enable_lead_capture?: boolean
          enable_registration_form?: boolean | null
          enable_tracking?: boolean
          error_message?: string
          header_title?: string
          id?: string
          lead_webhook_url?: string
          logo_text?: string
          max_viewers?: number
          min_viewers?: number
          primary_color?: string
          reg_form_background?: string | null
          reg_form_border_radius?: string | null
          reg_form_button_color?: string | null
          reg_form_button_text?: string | null
          reg_form_email_label?: string | null
          reg_form_email_placeholder?: string | null
          reg_form_ghl_webhook_url?: string | null
          reg_form_headline?: string | null
          reg_form_name_label?: string | null
          reg_form_name_placeholder?: string | null
          reg_form_privacy_text?: string | null
          reg_form_show_datetime?: boolean | null
          reg_form_show_privacy?: boolean | null
          reg_form_subheadline?: string | null
          reg_form_text_color?: string | null
          reg_form_thank_you_url?: string | null
          reg_form_theme?: string | null
          require_email?: boolean
          require_name?: boolean
          start_hour?: number
          start_minute?: number
          timezone?: string
          tracking_webhook_url?: string
          typing_delay_max?: number
          typing_delay_min?: number
          updated_at?: string
          user_id?: string | null
          video_mode?: string | null
          video_sequence?: Json | null
          video_url?: string
          webhook_url?: string
          webinar_name?: string
          welcome_message?: string
          youtube_video_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_daily_performance: {
        Args: { from_date: string; to_date: string; webinar_filter?: string }
        Returns: {
          avg_retention: number
          day_date: string
          leads_count: number
          unique_viewers: number
        }[]
      }
      get_live_viewer_counts: {
        Args: { since_ts?: string }
        Returns: {
          live_count: number
          webinar_id: string
          webinar_name: string
        }[]
      }
      get_total_viewer_count: {
        Args: { from_date: string; to_date: string; webinar_filter?: string }
        Returns: {
          unique_ips: number
          unique_sessions: number
        }[]
      }
      get_unique_viewer_count: {
        Args: { from_date: string; to_date: string; webinar_filter?: string }
        Returns: number
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_webinar_performance: {
        Args: { from_date?: string; to_date?: string }
        Returns: {
          avg_retention: number
          click_rate: number
          created_at: string
          cta_clicks: number
          total_viewers: number
          webinar_id: string
          webinar_name: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "regular" | "trial"
      user_status: "active" | "inactive"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "regular", "trial"],
      user_status: ["active", "inactive"],
    },
  },
} as const
