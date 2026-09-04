export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      admin_requests: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          message: string | null;
          organization_id: string;
          requested_user_id: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: Database["public"]["Enums"]["admin_request_status"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          message?: string | null;
          organization_id: string;
          requested_user_id?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: Database["public"]["Enums"]["admin_request_status"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          message?: string | null;
          organization_id?: string;
          requested_user_id?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: Database["public"]["Enums"]["admin_request_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "admin_requests_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      aircraft: {
        Row: {
          avionics: string[];
          created_at: string;
          cruise_speed: string | null;
          description: string | null;
          display_order: number;
          engine: string | null;
          fuel_burn: string | null;
          hours: number;
          id: string;
          image_url: string | null;
          max_seats: string | null;
          model: string;
          next_50hr: number | null;
          next_annual: string | null;
          organization_id: string;
          published: boolean;
          rate_wet: number | null;
          registration: string;
          status: Database["public"]["Enums"]["aircraft_status"];
          tagline: string | null;
          updated_at: string;
        };
        Insert: {
          avionics?: string[];
          created_at?: string;
          cruise_speed?: string | null;
          description?: string | null;
          display_order?: number;
          engine?: string | null;
          fuel_burn?: string | null;
          hours?: number;
          id?: string;
          image_url?: string | null;
          max_seats?: string | null;
          model: string;
          next_50hr?: number | null;
          next_annual?: string | null;
          organization_id: string;
          published?: boolean;
          rate_wet?: number | null;
          registration: string;
          status?: Database["public"]["Enums"]["aircraft_status"];
          tagline?: string | null;
          updated_at?: string;
        };
        Update: {
          avionics?: string[];
          created_at?: string;
          cruise_speed?: string | null;
          description?: string | null;
          display_order?: number;
          engine?: string | null;
          fuel_burn?: string | null;
          hours?: number;
          id?: string;
          image_url?: string | null;
          max_seats?: string | null;
          model?: string;
          next_50hr?: number | null;
          next_annual?: string | null;
          organization_id?: string;
          published?: boolean;
          rate_wet?: number | null;
          registration?: string;
          status?: Database["public"]["Enums"]["aircraft_status"];
          tagline?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "aircraft_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      booking_calendar_settings: {
        Row: {
          buffer_minutes: number;
          close_time: string;
          created_at: string;
          id: string;
          open_time: string;
          organization_id: string;
          slot_minutes: number;
          timezone: string;
          updated_at: string;
          updated_by: string | null;
          weekday_mask: string;
        };
        Insert: {
          buffer_minutes?: number;
          close_time?: string;
          created_at?: string;
          id?: string;
          open_time?: string;
          organization_id: string;
          slot_minutes?: number;
          timezone?: string;
          updated_at?: string;
          updated_by?: string | null;
          weekday_mask?: string;
        };
        Update: {
          buffer_minutes?: number;
          close_time?: string;
          created_at?: string;
          id?: string;
          open_time?: string;
          organization_id?: string;
          slot_minutes?: number;
          timezone?: string;
          updated_at?: string;
          updated_by?: string | null;
          weekday_mask?: string;
        };
        Relationships: [
          {
            foreignKeyName: "booking_calendar_settings_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      booking_closed_dates: {
        Row: {
          created_at: string;
          created_by: string | null;
          ends_on: string;
          id: string;
          organization_id: string;
          reason: string | null;
          starts_on: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          ends_on: string;
          id?: string;
          organization_id: string;
          reason?: string | null;
          starts_on: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          ends_on?: string;
          id?: string;
          organization_id?: string;
          reason?: string | null;
          starts_on?: string;
        };
        Relationships: [
          {
            foreignKeyName: "booking_closed_dates_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      booking_products: {
        Row: {
          cancellation_hours: number;
          created_at: string;
          deposit_pct: number;
          description: string | null;
          display_order: number;
          duration_minutes: number;
          id: string;
          instructor_fee_per_hour_cents: number | null;
          kind: Database["public"]["Enums"]["booking_product_kind"];
          max_advance_days: number;
          min_notice_hours: number;
          name: string;
          organization_id: string;
          package_price_cents: number | null;
          payment_mode: Database["public"]["Enums"]["booking_payment_mode"];
          published: boolean;
          requires_approval: boolean;
          slug: string;
          tagline: string | null;
          updated_at: string;
        };
        Insert: {
          cancellation_hours?: number;
          created_at?: string;
          deposit_pct?: number;
          description?: string | null;
          display_order?: number;
          duration_minutes: number;
          id?: string;
          instructor_fee_per_hour_cents?: number | null;
          kind: Database["public"]["Enums"]["booking_product_kind"];
          max_advance_days?: number;
          min_notice_hours?: number;
          name: string;
          organization_id: string;
          package_price_cents?: number | null;
          payment_mode?: Database["public"]["Enums"]["booking_payment_mode"];
          published?: boolean;
          requires_approval?: boolean;
          slug: string;
          tagline?: string | null;
          updated_at?: string;
        };
        Update: {
          cancellation_hours?: number;
          created_at?: string;
          deposit_pct?: number;
          description?: string | null;
          display_order?: number;
          duration_minutes?: number;
          id?: string;
          instructor_fee_per_hour_cents?: number | null;
          kind?: Database["public"]["Enums"]["booking_product_kind"];
          max_advance_days?: number;
          min_notice_hours?: number;
          name?: string;
          organization_id?: string;
          package_price_cents?: number | null;
          payment_mode?: Database["public"]["Enums"]["booking_payment_mode"];
          published?: boolean;
          requires_approval?: boolean;
          slug?: string;
          tagline?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "booking_products_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      booking_promotions: {
        Row: {
          active_from: string;
          active_until: string | null;
          applies_to_kinds: string[];
          code: string;
          created_at: string;
          discount_type: string;
          discount_value: number;
          id: string;
          max_uses: number | null;
          name: string;
          organization_id: string;
          published: boolean;
          updated_at: string;
          uses_count: number;
        };
        Insert: {
          active_from?: string;
          active_until?: string | null;
          applies_to_kinds?: string[];
          code: string;
          created_at?: string;
          discount_type: string;
          discount_value: number;
          id?: string;
          max_uses?: number | null;
          name: string;
          organization_id: string;
          published?: boolean;
          updated_at?: string;
          uses_count?: number;
        };
        Update: {
          active_from?: string;
          active_until?: string | null;
          applies_to_kinds?: string[];
          code?: string;
          created_at?: string;
          discount_type?: string;
          discount_value?: number;
          id?: string;
          max_uses?: number | null;
          name?: string;
          organization_id?: string;
          published?: boolean;
          updated_at?: string;
          uses_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: "booking_promotions_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      booking_resource_blocks: {
        Row: {
          aircraft_id: string | null;
          created_at: string;
          created_by: string | null;
          ends_at: string;
          id: string;
          instructor_id: string | null;
          organization_id: string;
          reason: string | null;
          resource_kind: Database["public"]["Enums"]["booking_resource_kind"];
          starts_at: string;
        };
        Insert: {
          aircraft_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          ends_at: string;
          id?: string;
          instructor_id?: string | null;
          organization_id: string;
          reason?: string | null;
          resource_kind: Database["public"]["Enums"]["booking_resource_kind"];
          starts_at: string;
        };
        Update: {
          aircraft_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          ends_at?: string;
          id?: string;
          instructor_id?: string | null;
          organization_id?: string;
          reason?: string | null;
          resource_kind?: Database["public"]["Enums"]["booking_resource_kind"];
          starts_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "booking_resource_blocks_aircraft_id_fkey";
            columns: ["aircraft_id"];
            isOneToOne: false;
            referencedRelation: "aircraft";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "booking_resource_blocks_instructor_id_fkey";
            columns: ["instructor_id"];
            isOneToOne: false;
            referencedRelation: "instructors";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "booking_resource_blocks_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      bookings: {
        Row: {
          aircraft_id: string | null;
          amount_paid_cents: number;
          approved_at: string | null;
          approved_by: string | null;
          cancellation_reason: string | null;
          cancelled_at: string | null;
          created_at: string;
          customer_email: string;
          customer_name: string;
          customer_phone: string | null;
          deposit_due_cents: number;
          discount_applied_cents: number;
          ends_at: string;
          id: string;
          instructor_id: string | null;
          notes: string | null;
          organization_id: string;
          payment_status: Database["public"]["Enums"]["booking_payment_status"];
          price_total_cents: number;
          product_id: string;
          promo_code: string | null;
          starts_at: string;
          status: Database["public"]["Enums"]["booking_status"];
          stripe_payment_intent_id: string | null;
          stripe_session_id: string | null;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          aircraft_id?: string | null;
          amount_paid_cents?: number;
          approved_at?: string | null;
          approved_by?: string | null;
          cancellation_reason?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
          customer_email: string;
          customer_name: string;
          customer_phone?: string | null;
          deposit_due_cents?: number;
          discount_applied_cents?: number;
          ends_at: string;
          id?: string;
          instructor_id?: string | null;
          notes?: string | null;
          organization_id: string;
          payment_status?: Database["public"]["Enums"]["booking_payment_status"];
          price_total_cents?: number;
          product_id: string;
          promo_code?: string | null;
          starts_at: string;
          status?: Database["public"]["Enums"]["booking_status"];
          stripe_payment_intent_id?: string | null;
          stripe_session_id?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          aircraft_id?: string | null;
          amount_paid_cents?: number;
          approved_at?: string | null;
          approved_by?: string | null;
          cancellation_reason?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
          customer_email?: string;
          customer_name?: string;
          customer_phone?: string | null;
          deposit_due_cents?: number;
          discount_applied_cents?: number;
          ends_at?: string;
          id?: string;
          instructor_id?: string | null;
          notes?: string | null;
          organization_id?: string;
          payment_status?: Database["public"]["Enums"]["booking_payment_status"];
          price_total_cents?: number;
          product_id?: string;
          promo_code?: string | null;
          starts_at?: string;
          status?: Database["public"]["Enums"]["booking_status"];
          stripe_payment_intent_id?: string | null;
          stripe_session_id?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_aircraft_id_fkey";
            columns: ["aircraft_id"];
            isOneToOne: false;
            referencedRelation: "aircraft";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_instructor_id_fkey";
            columns: ["instructor_id"];
            isOneToOne: false;
            referencedRelation: "instructors";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "booking_products";
            referencedColumns: ["id"];
          },
        ];
      };
      contact_submissions: {
        Row: {
          company: string | null;
          created_at: string;
          email: string;
          id: string;
          message: string;
          name: string;
          source: string | null;
        };
        Insert: {
          company?: string | null;
          created_at?: string;
          email: string;
          id?: string;
          message: string;
          name: string;
          source?: string | null;
        };
        Update: {
          company?: string | null;
          created_at?: string;
          email?: string;
          id?: string;
          message?: string;
          name?: string;
          source?: string | null;
        };
        Relationships: [];
      };
      customer_profiles: {
        Row: {
          created_at: string;
          id: string;
          notes: string | null;
          organization_id: string;
          qualified_at: string | null;
          tier: Database["public"]["Enums"]["customer_tier"] | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          notes?: string | null;
          organization_id: string;
          qualified_at?: string | null;
          tier?: Database["public"]["Enums"]["customer_tier"] | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          notes?: string | null;
          organization_id?: string;
          qualified_at?: string | null;
          tier?: Database["public"]["Enums"]["customer_tier"] | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "customer_profiles_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      flight_log_entries: {
        Row: {
          aircraft_id: string | null;
          aircraft_model: string;
          aircraft_registration: string;
          arrival_aerodrome: string;
          capacity: Database["public"]["Enums"]["flight_capacity"];
          created_at: string;
          departure_aerodrome: string;
          dual_received_minutes: number;
          flight_date: string;
          fstd_minutes: number;
          fstd_type: string | null;
          id: string;
          ifr_minutes: number;
          instructor_given_minutes: number;
          instructor_user_id: string | null;
          landings_day: number;
          landings_night: number;
          multi_pilot_minutes: number;
          night_minutes: number;
          off_blocks_at: string;
          on_blocks_at: string;
          organization_id: string;
          pic_name: string;
          remarks: string | null;
          signed_at: string | null;
          signed_by_user_id: string | null;
          single_pilot_me_minutes: number;
          single_pilot_se_minutes: number;
          student_id: string;
          total_minutes: number;
          updated_at: string;
        };
        Insert: {
          aircraft_id?: string | null;
          aircraft_model: string;
          aircraft_registration: string;
          arrival_aerodrome: string;
          capacity: Database["public"]["Enums"]["flight_capacity"];
          created_at?: string;
          departure_aerodrome: string;
          dual_received_minutes?: number;
          flight_date: string;
          fstd_minutes?: number;
          fstd_type?: string | null;
          id?: string;
          ifr_minutes?: number;
          instructor_given_minutes?: number;
          instructor_user_id?: string | null;
          landings_day?: number;
          landings_night?: number;
          multi_pilot_minutes?: number;
          night_minutes?: number;
          off_blocks_at: string;
          on_blocks_at: string;
          organization_id: string;
          pic_name: string;
          remarks?: string | null;
          signed_at?: string | null;
          signed_by_user_id?: string | null;
          single_pilot_me_minutes?: number;
          single_pilot_se_minutes?: number;
          student_id: string;
          total_minutes: number;
          updated_at?: string;
        };
        Update: {
          aircraft_id?: string | null;
          aircraft_model?: string;
          aircraft_registration?: string;
          arrival_aerodrome?: string;
          capacity?: Database["public"]["Enums"]["flight_capacity"];
          created_at?: string;
          departure_aerodrome?: string;
          dual_received_minutes?: number;
          flight_date?: string;
          fstd_minutes?: number;
          fstd_type?: string | null;
          id?: string;
          ifr_minutes?: number;
          instructor_given_minutes?: number;
          instructor_user_id?: string | null;
          landings_day?: number;
          landings_night?: number;
          multi_pilot_minutes?: number;
          night_minutes?: number;
          off_blocks_at?: string;
          on_blocks_at?: string;
          organization_id?: string;
          pic_name?: string;
          remarks?: string | null;
          signed_at?: string | null;
          signed_by_user_id?: string | null;
          single_pilot_me_minutes?: number;
          single_pilot_se_minutes?: number;
          student_id?: string;
          total_minutes?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "flight_log_entries_aircraft_id_fkey";
            columns: ["aircraft_id"];
            isOneToOne: false;
            referencedRelation: "aircraft";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "flight_log_entries_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "flight_log_entries_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      flight_log_exercises: {
        Row: {
          created_at: string;
          exercise_id: string;
          flight_log_entry_id: string;
          grade: Database["public"]["Enums"]["exercise_grade"];
          id: string;
          notes: string | null;
          organization_id: string;
        };
        Insert: {
          created_at?: string;
          exercise_id: string;
          flight_log_entry_id: string;
          grade?: Database["public"]["Enums"]["exercise_grade"];
          id?: string;
          notes?: string | null;
          organization_id: string;
        };
        Update: {
          created_at?: string;
          exercise_id?: string;
          flight_log_entry_id?: string;
          grade?: Database["public"]["Enums"]["exercise_grade"];
          id?: string;
          notes?: string | null;
          organization_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "flight_log_exercises_exercise_id_fkey";
            columns: ["exercise_id"];
            isOneToOne: false;
            referencedRelation: "syllabus_exercises";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "flight_log_exercises_flight_log_entry_id_fkey";
            columns: ["flight_log_entry_id"];
            isOneToOne: false;
            referencedRelation: "flight_log_entries";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "flight_log_exercises_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      flying_status: {
        Row: {
          created_at: string;
          id: string;
          is_open: boolean;
          message: string | null;
          organization_id: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_open?: boolean;
          message?: string | null;
          organization_id: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_open?: boolean;
          message?: string | null;
          organization_id?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "flying_status_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      instructors: {
        Row: {
          bio: string | null;
          created_at: string;
          display_order: number;
          hours: string | null;
          id: string;
          image_url: string | null;
          name: string;
          organization_id: string;
          published: boolean;
          role: string | null;
          updated_at: string;
        };
        Insert: {
          bio?: string | null;
          created_at?: string;
          display_order?: number;
          hours?: string | null;
          id?: string;
          image_url?: string | null;
          name: string;
          organization_id: string;
          published?: boolean;
          role?: string | null;
          updated_at?: string;
        };
        Update: {
          bio?: string | null;
          created_at?: string;
          display_order?: number;
          hours?: string | null;
          id?: string;
          image_url?: string | null;
          name?: string;
          organization_id?: string;
          published?: boolean;
          role?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "instructors_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      organization_invites: {
        Row: {
          accepted_at: string | null;
          created_at: string;
          email: string;
          expires_at: string;
          id: string;
          invited_by: string | null;
          organization_id: string;
          role: Database["public"]["Enums"]["org_role"];
          token: string;
          updated_at: string;
        };
        Insert: {
          accepted_at?: string | null;
          created_at?: string;
          email: string;
          expires_at?: string;
          id?: string;
          invited_by?: string | null;
          organization_id: string;
          role?: Database["public"]["Enums"]["org_role"];
          token?: string;
          updated_at?: string;
        };
        Update: {
          accepted_at?: string | null;
          created_at?: string;
          email?: string;
          expires_at?: string;
          id?: string;
          invited_by?: string | null;
          organization_id?: string;
          role?: Database["public"]["Enums"]["org_role"];
          token?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_invites_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      organization_members: {
        Row: {
          created_at: string;
          id: string;
          invited_by: string | null;
          joined_at: string;
          organization_id: string;
          role: Database["public"]["Enums"]["org_role"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          invited_by?: string | null;
          joined_at?: string;
          organization_id: string;
          role?: Database["public"]["Enums"]["org_role"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          invited_by?: string | null;
          joined_at?: string;
          organization_id?: string;
          role?: Database["public"]["Enums"]["org_role"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      organizations: {
        Row: {
          branding: Json;
          created_at: string;
          currency: string;
          icao_code: string | null;
          id: string;
          name: string;
          slug: string;
          subscription_tier: Database["public"]["Enums"]["org_subscription_tier"];
          timezone: string;
          trial_ends_at: string | null;
          updated_at: string;
        };
        Insert: {
          branding?: Json;
          created_at?: string;
          currency?: string;
          icao_code?: string | null;
          id?: string;
          name: string;
          slug: string;
          subscription_tier?: Database["public"]["Enums"]["org_subscription_tier"];
          timezone?: string;
          trial_ends_at?: string | null;
          updated_at?: string;
        };
        Update: {
          branding?: Json;
          created_at?: string;
          currency?: string;
          icao_code?: string | null;
          id?: string;
          name?: string;
          slug?: string;
          subscription_tier?: Database["public"]["Enums"]["org_subscription_tier"];
          timezone?: string;
          trial_ends_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      pilot_verification_requests: {
        Row: {
          created_at: string;
          document_path: string | null;
          id: string;
          issuing_authority: string;
          licence_expiry: string | null;
          licence_number: string;
          medical_document_path: string | null;
          medical_expiry: string | null;
          organization_id: string;
          ratings: string | null;
          review_notes: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: Database["public"]["Enums"]["pilot_verification_status"];
          submitted_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          document_path?: string | null;
          id?: string;
          issuing_authority: string;
          licence_expiry?: string | null;
          licence_number: string;
          medical_document_path?: string | null;
          medical_expiry?: string | null;
          organization_id: string;
          ratings?: string | null;
          review_notes?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: Database["public"]["Enums"]["pilot_verification_status"];
          submitted_at?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          document_path?: string | null;
          id?: string;
          issuing_authority?: string;
          licence_expiry?: string | null;
          licence_number?: string;
          medical_document_path?: string | null;
          medical_expiry?: string | null;
          organization_id?: string;
          ratings?: string | null;
          review_notes?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: Database["public"]["Enums"]["pilot_verification_status"];
          submitted_at?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pilot_verification_requests_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string | null;
          id: string;
          last_active_at: string | null;
          phone: string | null;
          status: Database["public"]["Enums"]["profile_status"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id?: string;
          last_active_at?: string | null;
          phone?: string | null;
          status?: Database["public"]["Enums"]["profile_status"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id?: string;
          last_active_at?: string | null;
          phone?: string | null;
          status?: Database["public"]["Enums"]["profile_status"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      self_hire_approvals: {
        Row: {
          approved_at: string;
          approved_by: string;
          created_at: string;
          expires_at: string | null;
          id: string;
          notes: string | null;
          organization_id: string;
          revoked_at: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          approved_at?: string;
          approved_by: string;
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          notes?: string | null;
          organization_id: string;
          revoked_at?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          approved_at?: string;
          approved_by?: string;
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          notes?: string | null;
          organization_id?: string;
          revoked_at?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "self_hire_approvals_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      site_content: {
        Row: {
          created_at: string;
          data: Json;
          draft_data: Json | null;
          draft_updated_at: string | null;
          draft_updated_by: string | null;
          id: string;
          organization_id: string;
          section_key: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          created_at?: string;
          data?: Json;
          draft_data?: Json | null;
          draft_updated_at?: string | null;
          draft_updated_by?: string | null;
          id?: string;
          organization_id: string;
          section_key: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          created_at?: string;
          data?: Json;
          draft_data?: Json | null;
          draft_updated_at?: string | null;
          draft_updated_by?: string | null;
          id?: string;
          organization_id?: string;
          section_key?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "site_content_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      site_content_revisions: {
        Row: {
          created_at: string;
          data: Json;
          id: string;
          organization_id: string;
          section_key: string;
          updated_by: string | null;
        };
        Insert: {
          created_at?: string;
          data: Json;
          id?: string;
          organization_id: string;
          section_key: string;
          updated_by?: string | null;
        };
        Update: {
          created_at?: string;
          data?: Json;
          id?: string;
          organization_id?: string;
          section_key?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "site_content_revisions_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      student_documents: {
        Row: {
          created_at: string;
          document_number: string | null;
          document_type: Database["public"]["Enums"]["document_type"];
          expires_on: string | null;
          id: string;
          issued_on: string | null;
          issuing_authority: string | null;
          notes: string | null;
          organization_id: string;
          student_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          document_number?: string | null;
          document_type: Database["public"]["Enums"]["document_type"];
          expires_on?: string | null;
          id?: string;
          issued_on?: string | null;
          issuing_authority?: string | null;
          notes?: string | null;
          organization_id: string;
          student_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          document_number?: string | null;
          document_type?: Database["public"]["Enums"]["document_type"];
          expires_on?: string | null;
          id?: string;
          issued_on?: string | null;
          issuing_authority?: string | null;
          notes?: string | null;
          organization_id?: string;
          student_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "student_documents_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_documents_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      student_endorsements: {
        Row: {
          created_at: string;
          details: string | null;
          endorsement_type: Database["public"]["Enums"]["endorsement_type"];
          id: string;
          organization_id: string;
          signed_at: string;
          signed_by_user_id: string;
          student_id: string;
          title: string;
          valid_until: string | null;
        };
        Insert: {
          created_at?: string;
          details?: string | null;
          endorsement_type: Database["public"]["Enums"]["endorsement_type"];
          id?: string;
          organization_id: string;
          signed_at?: string;
          signed_by_user_id: string;
          student_id: string;
          title: string;
          valid_until?: string | null;
        };
        Update: {
          created_at?: string;
          details?: string | null;
          endorsement_type?: Database["public"]["Enums"]["endorsement_type"];
          id?: string;
          organization_id?: string;
          signed_at?: string;
          signed_by_user_id?: string;
          student_id?: string;
          title?: string;
          valid_until?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "student_endorsements_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_endorsements_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      students: {
        Row: {
          created_at: string;
          id: string;
          license_sought: Database["public"]["Enums"]["license_sought"];
          notes: string | null;
          organization_id: string;
          primary_instructor_id: string | null;
          start_date: string | null;
          status: Database["public"]["Enums"]["student_status"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          license_sought?: Database["public"]["Enums"]["license_sought"];
          notes?: string | null;
          organization_id: string;
          primary_instructor_id?: string | null;
          start_date?: string | null;
          status?: Database["public"]["Enums"]["student_status"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          license_sought?: Database["public"]["Enums"]["license_sought"];
          notes?: string | null;
          organization_id?: string;
          primary_instructor_id?: string | null;
          start_date?: string | null;
          status?: Database["public"]["Enums"]["student_status"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "students_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      syllabus_exercises: {
        Row: {
          category: string | null;
          created_at: string;
          description: string | null;
          display_order: number;
          exercise_number: number;
          id: string;
          organization_id: string;
          title: string;
        };
        Insert: {
          category?: string | null;
          created_at?: string;
          description?: string | null;
          display_order?: number;
          exercise_number: number;
          id?: string;
          organization_id: string;
          title: string;
        };
        Update: {
          category?: string | null;
          created_at?: string;
          description?: string | null;
          display_order?: number;
          exercise_number?: number;
          id?: string;
          organization_id?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "syllabus_exercises_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      theory_exam_results: {
        Row: {
          created_at: string;
          id: string;
          notes: string | null;
          organization_id: string;
          recorded_by_user_id: string | null;
          result: Database["public"]["Enums"]["exam_result"];
          score: number | null;
          student_id: string;
          subject: string;
          taken_on: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          notes?: string | null;
          organization_id: string;
          recorded_by_user_id?: string | null;
          result?: Database["public"]["Enums"]["exam_result"];
          score?: number | null;
          student_id: string;
          subject: string;
          taken_on?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          notes?: string | null;
          organization_id?: string;
          recorded_by_user_id?: string | null;
          result?: Database["public"]["Enums"]["exam_result"];
          score?: number | null;
          student_id?: string;
          subject?: string;
          taken_on?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "theory_exam_results_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "theory_exam_results_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
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
      has_org_role: {
        Args: {
          _org_id: string;
          _role: Database["public"]["Enums"]["org_role"];
        };
        Returns: boolean;
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_org_admin: { Args: { _org_id: string }; Returns: boolean };
      is_org_member: { Args: { _org_id: string }; Returns: boolean };
      set_self_as_student: {
        Args: never;
        Returns: {
          created_at: string;
          id: string;
          notes: string | null;
          organization_id: string;
          qualified_at: string | null;
          tier: Database["public"]["Enums"]["customer_tier"] | null;
          updated_at: string;
          user_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "customer_profiles";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      user_orgs: { Args: { _user_id: string }; Returns: string[] };
    };
    Enums: {
      admin_request_status: "pending" | "approved" | "rejected";
      aircraft_status: "serviceable" | "maintenance" | "inspection" | "retired";
      app_role: "super_admin" | "admin" | "instructor" | "student" | "pilot" | "customer";
      booking_payment_mode: "full" | "deposit" | "invoice";
      booking_payment_status: "unpaid" | "deposit_paid" | "paid" | "refunded" | "partial_refund";
      booking_product_kind: "experience" | "lesson" | "self_hire";
      booking_resource_kind: "aircraft" | "instructor";
      booking_status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
      customer_tier: "student" | "pilot";
      document_type:
        | "medical_class1"
        | "medical_class2"
        | "medical_lapl"
        | "student_pilot_license"
        | "ppl"
        | "lapl"
        | "rt_license"
        | "passport"
        | "photo_id"
        | "language_proficiency"
        | "other";
      endorsement_type:
        | "first_solo"
        | "solo_circuits"
        | "solo_local"
        | "solo_nav"
        | "solo_cross_country"
        | "type_endorsement"
        | "night_rating"
        | "differences_training"
        | "other";
      exam_result: "pass" | "fail" | "pending";
      exercise_grade: "intro" | "practiced" | "competent" | "review";
      flight_capacity: "dual" | "pic" | "put" | "picus" | "instructor" | "examiner";
      license_sought: "PPL" | "LAPL" | "NPPL" | "CPL" | "IR" | "Other";
      org_role: "owner" | "admin" | "staff";
      org_subscription_tier: "trial" | "starter" | "pro" | "enterprise";
      pilot_verification_status: "pending" | "approved" | "rejected" | "withdrawn";
      profile_status: "active" | "pending" | "suspended";
      student_status: "active" | "paused" | "completed" | "withdrawn";
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      admin_request_status: ["pending", "approved", "rejected"],
      aircraft_status: ["serviceable", "maintenance", "inspection", "retired"],
      app_role: ["super_admin", "admin", "instructor", "student", "pilot", "customer"],
      booking_payment_mode: ["full", "deposit", "invoice"],
      booking_payment_status: ["unpaid", "deposit_paid", "paid", "refunded", "partial_refund"],
      booking_product_kind: ["experience", "lesson", "self_hire"],
      booking_resource_kind: ["aircraft", "instructor"],
      booking_status: ["pending", "confirmed", "cancelled", "completed", "no_show"],
      customer_tier: ["student", "pilot"],
      document_type: [
        "medical_class1",
        "medical_class2",
        "medical_lapl",
        "student_pilot_license",
        "ppl",
        "lapl",
        "rt_license",
        "passport",
        "photo_id",
        "language_proficiency",
        "other",
      ],
      endorsement_type: [
        "first_solo",
        "solo_circuits",
        "solo_local",
        "solo_nav",
        "solo_cross_country",
        "type_endorsement",
        "night_rating",
        "differences_training",
        "other",
      ],
      exam_result: ["pass", "fail", "pending"],
      exercise_grade: ["intro", "practiced", "competent", "review"],
      flight_capacity: ["dual", "pic", "put", "picus", "instructor", "examiner"],
      license_sought: ["PPL", "LAPL", "NPPL", "CPL", "IR", "Other"],
      org_role: ["owner", "admin", "staff"],
      org_subscription_tier: ["trial", "starter", "pro", "enterprise"],
      pilot_verification_status: ["pending", "approved", "rejected", "withdrawn"],
      profile_status: ["active", "pending", "suspended"],
      student_status: ["active", "paused", "completed", "withdrawn"],
    },
  },
} as const;
