export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      agent_runs: {
        Row: {
          agent: string;
          audit_id: string | null;
          created_at: string;
          duration_ms: number | null;
          findings: Json;
          fixes: Json;
          id: string;
          project_id: string | null;
          score: number | null;
          status: string;
          summary: string | null;
          updated_at: string;
          url: string;
          user_id: string;
        };
        Insert: {
          agent: string;
          audit_id?: string | null;
          created_at?: string;
          duration_ms?: number | null;
          findings?: Json;
          fixes?: Json;
          id?: string;
          project_id?: string | null;
          score?: number | null;
          status?: string;
          summary?: string | null;
          updated_at?: string;
          url: string;
          user_id: string;
        };
        Update: {
          agent?: string;
          audit_id?: string | null;
          created_at?: string;
          duration_ms?: number | null;
          findings?: Json;
          fixes?: Json;
          id?: string;
          project_id?: string | null;
          score?: number | null;
          status?: string;
          summary?: string | null;
          updated_at?: string;
          url?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "agent_runs_audit_id_fkey";
            columns: ["audit_id"];
            isOneToOne: false;
            referencedRelation: "audits";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "agent_runs_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      ai_usage: {
        Row: {
          agent: string | null;
          completion_tokens: number;
          created_at: string;
          id: string;
          latency_ms: number | null;
          model: string;
          prompt_tokens: number;
          success: boolean;
          total_tokens: number;
          user_id: string;
        };
        Insert: {
          agent?: string | null;
          completion_tokens?: number;
          created_at?: string;
          id?: string;
          latency_ms?: number | null;
          model: string;
          prompt_tokens?: number;
          success?: boolean;
          total_tokens?: number;
          user_id: string;
        };
        Update: {
          agent?: string | null;
          completion_tokens?: number;
          created_at?: string;
          id?: string;
          latency_ms?: number | null;
          model?: string;
          prompt_tokens?: number;
          success?: boolean;
          total_tokens?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      announcements: {
        Row: {
          body: string;
          created_at: string;
          created_by: string | null;
          ends_at: string | null;
          id: string;
          kind: string;
          pinned: boolean;
          published: boolean;
          starts_at: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          created_by?: string | null;
          ends_at?: string | null;
          id?: string;
          kind?: string;
          pinned?: boolean;
          published?: boolean;
          starts_at?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          created_by?: string | null;
          ends_at?: string | null;
          id?: string;
          kind?: string;
          pinned?: boolean;
          published?: boolean;
          starts_at?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      audit_jobs: {
        Row: {
          attempts: number;
          audit_id: string | null;
          created_at: string;
          error: string | null;
          finished_at: string | null;
          id: string;
          priority: number;
          started_at: string | null;
          status: string;
          updated_at: string;
          url: string;
          user_id: string;
        };
        Insert: {
          attempts?: number;
          audit_id?: string | null;
          created_at?: string;
          error?: string | null;
          finished_at?: string | null;
          id?: string;
          priority?: number;
          started_at?: string | null;
          status?: string;
          updated_at?: string;
          url: string;
          user_id: string;
        };
        Update: {
          attempts?: number;
          audit_id?: string | null;
          created_at?: string;
          error?: string | null;
          finished_at?: string | null;
          id?: string;
          priority?: number;
          started_at?: string | null;
          status?: string;
          updated_at?: string;
          url?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "audit_jobs_audit_id_fkey";
            columns: ["audit_id"];
            isOneToOne: false;
            referencedRelation: "audits";
            referencedColumns: ["id"];
          },
        ];
      };
      audits: {
        Row: {
          created_at: string;
          id: string;
          issues: Json;
          metrics: Json;
          project_id: string | null;
          recommendations: Json;
          score: number | null;
          status: string;
          summary: string | null;
          url: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          issues?: Json;
          metrics?: Json;
          project_id?: string | null;
          recommendations?: Json;
          score?: number | null;
          status?: string;
          summary?: string | null;
          url: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          issues?: Json;
          metrics?: Json;
          project_id?: string | null;
          recommendations?: Json;
          score?: number | null;
          status?: string;
          summary?: string | null;
          url?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "audits_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      gsc_sites: {
        Row: {
          created_at: string;
          id: string;
          import_count: number;
          is_primary: boolean;
          last_synced_at: string | null;
          permission_level: string | null;
          site_url: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          import_count?: number;
          is_primary?: boolean;
          last_synced_at?: string | null;
          permission_level?: string | null;
          site_url: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          import_count?: number;
          is_primary?: boolean;
          last_synced_at?: string | null;
          permission_level?: string | null;
          site_url?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      login_events: {
        Row: {
          created_at: string;
          email: string | null;
          id: string;
          last_seen_at: string;
          provider: string | null;
          user_agent: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          id?: string;
          last_seen_at?: string;
          provider?: string | null;
          user_agent?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          id?: string;
          last_seen_at?: string;
          provider?: string | null;
          user_agent?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          source: string | null;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          source?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          source?: string | null;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          amount_cents: number;
          created_at: string;
          currency: string;
          id: string;
          plan: string;
          status: string;
          user_id: string;
        };
        Insert: {
          amount_cents?: number;
          created_at?: string;
          currency?: string;
          id?: string;
          plan?: string;
          status?: string;
          user_id: string;
        };
        Update: {
          amount_cents?: number;
          created_at?: string;
          currency?: string;
          id?: string;
          plan?: string;
          status?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          address: string | null;
          avatar_url: string | null;
          city: string | null;
          country: string | null;
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
          onboarded: boolean;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          avatar_url?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
          onboarded?: boolean;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          avatar_url?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          onboarded?: boolean;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          is_primary: boolean;
          last_audit_score: number | null;
          name: string;
          status: string;
          updated_at: string;
          url: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_primary?: boolean;
          last_audit_score?: number | null;
          name: string;
          status?: string;
          updated_at?: string;
          url: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_primary?: boolean;
          last_audit_score?: number | null;
          name?: string;
          status?: string;
          updated_at?: string;
          url?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      site_details: {
        Row: {
          category: string;
          created_at: string;
          created_by: string | null;
          id: string;
          label: string;
          sort_order: number;
          updated_at: string;
          value: string;
        };
        Insert: {
          category?: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          label: string;
          sort_order?: number;
          updated_at?: string;
          value: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          label?: string;
          sort_order?: number;
          updated_at?: string;
          value?: string;
        };
        Relationships: [];
      };
      support_messages: {
        Row: {
          admin_reply: string | null;
          body: string;
          created_at: string;
          id: string;
          replied_at: string | null;
          status: string;
          subject: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          admin_reply?: string | null;
          body: string;
          created_at?: string;
          id?: string;
          replied_at?: string | null;
          status?: string;
          subject: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          admin_reply?: string | null;
          body?: string;
          created_at?: string;
          id?: string;
          replied_at?: string | null;
          status?: string;
          subject?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      app_role: "admin" | "moderator" | "user";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const;
