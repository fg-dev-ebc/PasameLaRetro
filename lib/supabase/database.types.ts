export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      availability_exceptions: {
        Row: {
          created_at: string
          end_time: string | null
          equipment_id: string
          exception_date: string
          id: string
          is_available: boolean
          note: string | null
          start_time: string | null
        }
        Insert: {
          created_at?: string
          end_time?: string | null
          equipment_id: string
          exception_date: string
          id?: string
          is_available?: boolean
          note?: string | null
          start_time?: string | null
        }
        Update: {
          created_at?: string
          end_time?: string | null
          equipment_id?: string
          exception_date?: string
          id?: string
          is_available?: boolean
          note?: string | null
          start_time?: string | null
        }
      }
      availability_rules: {
        Row: {
          created_at: string
          end_time: string
          equipment_id: string
          id: string
          is_available: boolean
          start_time: string
          weekday: number
        }
        Insert: {
          created_at?: string
          end_time: string
          equipment_id: string
          id?: string
          is_available?: boolean
          start_time: string
          weekday: number
        }
        Update: {
          created_at?: string
          end_time?: string
          equipment_id?: string
          id?: string
          is_available?: boolean
          start_time?: string
          weekday?: number
        }
      }
      bookings: {
        Row: {
          created_at: string
          end_at: string
          equipment_id: string
          id: string
          notes: string | null
          owner_id: string
          renter_id: string
          start_at: string
          status: Database["public"]["Enums"]["booking_status"]
          total_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_at: string
          equipment_id: string
          id?: string
          notes?: string | null
          owner_id: string
          renter_id: string
          start_at: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_at?: string
          equipment_id?: string
          id?: string
          notes?: string | null
          owner_id?: string
          renter_id?: string
          start_at?: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_price?: number
          updated_at?: string
        }
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
      }
      equipment: {
        Row: {
          category_id: string | null
          city: string | null
          condition: Database["public"]["Enums"]["equipment_condition"]
          created_at: string
          currency: string
          deposit_amount: number | null
          description: string
          id: string
          location: string
          min_rental_hours: number
          owner_id: string
          price_per_day: number | null
          price_per_hour: number
          specs: Json
          state: string | null
          status: Database["public"]["Enums"]["equipment_status"]
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          city?: string | null
          condition?: Database["public"]["Enums"]["equipment_condition"]
          created_at?: string
          currency?: string
          deposit_amount?: number | null
          description: string
          id?: string
          location: string
          min_rental_hours?: number
          owner_id: string
          price_per_day?: number | null
          price_per_hour: number
          specs?: Json
          state?: string | null
          status?: Database["public"]["Enums"]["equipment_status"]
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          city?: string | null
          condition?: Database["public"]["Enums"]["equipment_condition"]
          created_at?: string
          currency?: string
          deposit_amount?: number | null
          description?: string
          id?: string
          location?: string
          min_rental_hours?: number
          owner_id?: string
          price_per_day?: number | null
          price_per_hour?: number
          specs?: Json
          state?: string | null
          status?: Database["public"]["Enums"]["equipment_status"]
          title?: string
          updated_at?: string
        }
      }
      equipment_images: {
        Row: {
          alt_text: string | null
          created_at: string
          equipment_id: string
          id: string
          path: string
          position: number
          public_url: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          equipment_id: string
          id?: string
          path: string
          position?: number
          public_url: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          equipment_id?: string
          id?: string
          path?: string
          position?: number
          public_url?: string
        }
      }
      favorites: {
        Row: {
          created_at: string
          equipment_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          equipment_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          equipment_id?: string
          user_id?: string
        }
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          full_name: string | null
          id: string
          location: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          location?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Enums: {
      booking_status: "pending" | "confirmed" | "cancelled" | "completed" | "rejected"
      equipment_condition: "new" | "excellent" | "good" | "fair" | "needs_service"
      equipment_status: "active" | "paused" | "maintenance" | "archived"
      user_role: "owner" | "renter"
    }
    Functions: {
      is_equipment_available: {
        Args: { p_equipment_id: string; p_start_at: string; p_end_at: string }
        Returns: boolean
      }
    }
  }
}

type DefaultSchema = Database["public"]

export type Tables<
  TableName extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]),
> = (DefaultSchema["Tables"] & DefaultSchema["Views"])[TableName] extends { Row: infer R }
  ? R
  : never

export type TablesInsert<TableName extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][TableName] extends { Insert: infer I } ? I : never

export type TablesUpdate<TableName extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][TableName] extends { Update: infer U } ? U : never

export type Enums<EnumName extends keyof DefaultSchema["Enums"]> =
  DefaultSchema["Enums"][EnumName]
