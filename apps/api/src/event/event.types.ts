// Add this to your event.service.ts file or create a separate types file

export type EventWithFullDetails = {
  id: number;
  title: string;
  description: string | null;
  location_id: number | null;
  start_date: Date;
  end_date: Date | null;
  opening_time: Date | null;
  closing_time: Date | null;
  event_type: string;
  group_id: number;
  created_at: Date;
  updated_at: Date;
  coach_id: number | null;
  coach_first_name: string | null;
  coach_last_name: string | null;
  group: {
    id: number;
    name: string | null;
    min_age: number | null;
    max_age: number | null;
    skill_level: string | null;
    sessions: Array<{
      id: number;
      start_time: string;
      end_time: string;
      day: string;
    }>;
  };
  location: {
    id: number | null;
    name: string | null;
    address1: string | null;
    address2: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
  };
};

// Raw event data from database query
export type RawEventData = {
  id: number;
  title: string;
  description: string | null;
  location_id: number | null;
  start_date: Date;
  end_date: Date | null;
  opening_time: Date | null;
  closing_time: Date | null;
  event_type: string;
  group_id: number;
  created_at: Date;
  updated_at: Date;
  coach_id: number | null;
  group_name: string | null;
  group_min_age: number | null;
  group_max_age: number | null;
  group_skill_level: string | null;
  group_location_id: number | null;
  event_location_name: string | null;
  event_location_address1: string | null;
  event_location_address2: string | null;
  event_location_city: string | null;
  event_location_state: string | null;
  event_location_country: string | null;
  coach_first_name: string | null;
  coach_last_name: string | null;
};

// Group session data
export type GroupSessionData = {
  id: number;
  group_id?: number;
  start_time: string;
  end_time: string;
  day: string;
};

// Group location data
export type GroupLocationData = {
  group_id: number;
  location_id: number | null;
  location_name: string | null;
  location_address1: string | null;
  location_address2: string | null;
  location_city: string | null;
  location_state: string | null;
  location_country: string | null;
};

// Location data structure
export type LocationData = {
  id: number | null;
  name: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
};

// Session data structure
export type SessionData = {
  id: number;
  start_time: string;
  end_time: string;
  day: string;
};
