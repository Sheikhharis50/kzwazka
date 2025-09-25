export enum EventType {
  TRAINING = 'training',
  ONE_TIME = 'one_time',
}

export type IEvent = {
  id: number;
  title: string;
  description: string | null;
  location_id: number;
  start_date: string;
  end_date: string | null;
  opening_time: string | null;
  closing_time: string | null;
  event_type: EventType;
  group_id: number;
  coach_id: number;
  coach_first_name: string;
  coach_last_name: string;
  group: {
    id: number;
    name: string;
    min_age: number;
    max_age: number;
    skill_level: string;
    sessions: [
      {
        id: number;
        start_time: string;
        end_time: string;
        day: string;
      },
    ];
  };
  location: {
    id: number;
    name: string;
    address1: string;
    address2: string | null;
    city: string;
    state: string;
    country: string;
  };
  created_at: string;
  updated_at: string;
};

export type EventQueryParams = {
  search?: string;
  group_id?: number;
  location_id?: number;
  date?: string;
  event_type?: EventType;
};
