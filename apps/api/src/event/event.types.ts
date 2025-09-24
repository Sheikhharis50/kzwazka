// Add this to your event.service.ts file or create a separate types file

export type EventWithFullDetails = {
  id: number;
  title: string;
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
