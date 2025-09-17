export type IEvent = {
  id: number;
  title: string;
  location_id: number;
  min_age: number;
  max_age: number;
  event_date: string;
  opening_time: string;
  closing_time: string;
  status: string;
  created_by: number;
  amount: number;
  created_at: string;
  updated_at: string;
};

export type EventQueryParams = {
  search?: string;
  sort_by?: string;
  status?: 'active' | 'inactive' | 'cancelled' | 'completed' | 'draft';
  min_age?: number;
  max_age?: number;
  from_date?: string;
  to_date?: string;
  page?: number;
  limit?: number;
};
