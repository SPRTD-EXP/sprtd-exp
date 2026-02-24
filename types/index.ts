export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  role: 'community' | 'roster' | 'admin';
  niche: string | null;
  qimah_balance: number;
  avatar_url: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  action_type:
    | 'event_win'
    | 'event_participation'
    | 'purchase'
    | 'checkin'
    | 'haybah_unlock'
    | 'roster_challenge'
    | 'roster_apply'
    | 'nomination';
  reference_id: string | null;
  created_at: string;
}

export interface Location {
  id: string;
  business_name: string;
  niche: string;
  address: string | null;
  lat: number;
  lng: number;
  checkin_radius_meters: number;
  qimah_per_checkin: number;
  roster_member_id: string | null;
  active: boolean;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  niche: string;
  location_id: string | null;
  host_id: string | null;
  date: string;
  status: 'upcoming' | 'live' | 'completed';
  qimah_participation: number;
  qimah_winner: number;
  max_participants: number | null;
  season: number;
  created_at: string;
  // joined via query
  location?: Location;
  host?: Profile;
  participant_count?: number;
}

export interface CheckIn {
  id: string;
  user_id: string;
  location_id: string;
  qimah_earned: number;
  created_at: string;
}

export interface RosterMember {
  id: string;
  user_id: string;
  niche: string;
  active: boolean;
  challenged: boolean;
  monthly_qimah: number;
  joined_at: string;
  // joined via query
  profile?: Profile;
}

export interface HaybahItem {
  id: string;
  name: string;
  description: string | null;
  qimah_required: number;
  quantity_total: number;
  quantity_remaining: number;
  season: number | null;
  image_url: string | null;
  active: boolean;
  created_at: string;
}

export interface HaybahUnlock {
  id: string;
  user_id: string;
  item_id: string;
  unlocked_at: string;
  purchased: boolean;
}

export interface RosterChallenge {
  id: string;
  challenger_id: string;
  defender_id: string;
  niche: string;
  qimah_staked: number;
  status: 'pending' | 'accepted' | 'completed';
  winner_id: string | null;
  created_at: string;
}

export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  registered_at: string;
}
