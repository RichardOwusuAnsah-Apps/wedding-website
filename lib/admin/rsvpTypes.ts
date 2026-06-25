export interface RsvpRow {
  id: string;
  full_name: string;
  email: string | null;
  attending: boolean | null;
  events_attending: string | null;
  party_size: number | null;
  meal_preference: string | null;
  message: string | null;
  created_at: string;
}
