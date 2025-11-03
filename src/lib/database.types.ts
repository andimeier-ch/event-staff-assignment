export type Database = {
  public: {
    Tables: {
      skill_types: {
        Row: {
          id: string;
          name: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          color?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string;
          created_at?: string;
        };
      };
      skills: {
        Row: {
          id: string;
          name: string;
          skill_type_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          skill_type_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          skill_type_id?: string;
          created_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          date?: string;
          created_at?: string;
        };
      };
      staff: {
        Row: {
          id: string;
          name: string;
          email: string;
          skill_id: string;
          is_leader: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          skill_id: string;
          is_leader?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          skill_id?: string;
          is_leader?: boolean;
          created_at?: string;
        };
      };
      survey_requests: {
        Row: {
          id: string;
          token: string;
          staff_id: string;
          sent_at: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          token?: string;
          staff_id: string;
          sent_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          token?: string;
          staff_id?: string;
          sent_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
      };
      survey_request_events: {
        Row: {
          id: string;
          survey_request_id: string;
          event_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          survey_request_id: string;
          event_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          survey_request_id?: string;
          event_id?: string;
          created_at?: string;
        };
      };
      staff_availability: {
        Row: {
          id: string;
          survey_request_id: string;
          event_id: string;
          is_available: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          survey_request_id: string;
          event_id: string;
          is_available?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          survey_request_id?: string;
          event_id?: string;
          is_available?: boolean;
          created_at?: string;
        };
      };
      event_assignments: {
        Row: {
          id: string;
          event_id: string;
          staff_id: string;
          assigned_at: string;
          assigned_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          staff_id: string;
          assigned_at?: string;
          assigned_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          staff_id?: string;
          assigned_at?: string;
          assigned_by?: string | null;
          created_at?: string;
        };
      };
    };
  };
};
