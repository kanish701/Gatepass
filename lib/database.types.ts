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
      vehicles: {
        Row: {
          id: string
          vehicle_type: string
          vehicle_number: string
          capacity: number
          from_district: string
          driver_name: string
          contact_number: string
          registration_time: string
          arrived: boolean
          arrival_time: string | null
          qr_code: string | null
        }
        Insert: {
          id?: string
          vehicle_type: string
          vehicle_number: string
          capacity: number
          from_district: string
          driver_name: string
          contact_number: string
          registration_time?: string
          arrived?: boolean
          arrival_time?: string | null
          qr_code?: string | null
        }
        Update: {
          id?: string
          vehicle_type?: string
          vehicle_number?: string
          capacity?: number
          from_district?: string
          driver_name?: string
          contact_number?: string
          registration_time?: string
          arrived?: boolean
          arrival_time?: string | null
          qr_code?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}