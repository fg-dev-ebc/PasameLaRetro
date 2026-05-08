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
      profiles: {
        Row: {
          id: string
          full_name: string | null
          company_name: string | null
          role: Database["public"]["Enums"]["user_role"]
          phone: string | null
          location: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          company_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          phone?: string | null
          location?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          company_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          phone?: string | null
          location?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          created_at?: string
        }
      }
      equipment: {
        Row: {
          id: string
          owner_id: string
          category_id: string | null
          title: string
          description: string
          price_per_hour: number
          price_per_day: number | null
          deposit_amount: number | null
          currency: string
          condition: Database["public"]["Enums"]["equipment_condition"]
          status: Database["public"]["Enums"]["equipment_status"]
          location: string
          city: string | null
          state: string | null
          specs: Json
          min_rental_hours: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          category_id?: string | null
          title: string
          description: string
          price_per_hour: number
          price_per_day?: number | null
          deposit_amount?: number | null
          currency?: string
          condition?: Database["public"]["Enums"]["equipment_condition"]
          status?: Database["public"]["Enums"]["equipment_status"]
          location: string
          city?: string | null
          state?: string | null
          specs?: Json
          min_rental_hours?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          category_id?: string | null
          title?: string
          description?: string
          price_per_hour?: number
          price_per_day?: number | null
          deposit_amount?: number | null
          currency?: string
          condition?: Database["public"]["Enums"]["equipment_condition"]
          status?: Database["public"]["Enums"]["equipment_status"]
          location?: string
          city?: string | null
          state?: string | null
          specs?: Json
          min_rental_hours?: number
          created_at?: string
          updated_at?: string
        }
      }
      equipment_images: {
        Row: {
          id: string
          equipment_id: string
          path: string
          public_url: string
          alt_text: string | null
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          equipment_id: string
          path: string
          public_url: string
          alt_text?: string | null
          position?: number
          created_at?: string
        }
        Update: {
          id?: string
          equipment_id?: string
          path?: string
          public_url?: string
          alt_text?: string | null
          position?: number
          created_at?: string
        }
      }
      availability_rules: {
        Row: {
          id: string
          equipment_id: string
          weekday: number
          start_time: string
          end_time: string
          is_available: boolean
          created_at: string
        }
        Insert: {
          id?: string
          equipment_id: string
          weekday: number
          start_time: string
          end_time: string
          is_available?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          equipment_id?: string
          weekday?: number
          start_time?: string
          end_time?: string
          is_available?: boolean
          created_at?: string
        }
      }
      availability_exceptions: {
        Row: {
          id: string
          equipment_id: string
          exception_date: string
          start_time: string | null
          end_time: string | null
          is_available: boolean
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          equipment_id: string
          exception_date: string
          start_time?: string | null
          end_time?: string | null
          is_available?: boolean
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          equipment_id?: string
          exception_date?: string
          start_time?: string | null
          end_time?: string | null
          is_available?: boolean
          note?: string | null
          created_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          equipment_id: string
          owner_id: string
          renter_id: string
          start_at: string
          end_at: string
          status: Database["public"]["Enums"]["booking_status"]
          total_price: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          equipment_id: string
          owner_id: string
          renter_id: string
          start_at: string
          end_at: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_price?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          equipment_id?: string
          owner_id?: string
          renter_id?: string
          start_at?: string
          end_at?: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_price?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      favorites: {
        Row: {
          user_id: string
          equipment_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          equipment_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          equipment_id?: string
          created_at?: string
        }
      }
    }
    Enums: {
      user_role: "owner" | "renter" | "both"
      equipment_condition: "new" | "excellent" | "good" | "fair" | "needs_service"
      equipment_status: "active" | "paused" | "maintenance" | "archived"
      booking_status: "pending" | "confirmed" | "cancelled" | "completed" | "rejected"
    }
    Functions: {
      is_equipment_available: {
        Args: { p_equipment_id: string; p_start_at: string; p_end_at: string }
        Returns: boolean
      }
    }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"]

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"]

export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T]
