export type AppRole = 'admin' | 'regular' | 'trial';
export type UserStatus = 'active' | 'inactive';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: UserStatus;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface UserWithRole extends UserProfile {
  role: AppRole;
}

export interface AppSettings {
  id: string;
  setting_key: string;
  setting_value: Record<string, unknown>;
  updated_at: string;
}
