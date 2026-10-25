import type { SchoolSummary, Classroom } from "./core";
export type UserRole = "admin" | "teacher" | "student";

export interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  rules: UserRole;
  avatar: string | null;
  user_code: string;
  is_staff: boolean;
  is_active: boolean;
  date_joined: string;
  last_login: string | null;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface DashboardResponse {
  profile: UserProfile;
  schools: SchoolSummary[];
  classrooms: Classroom[];
}
