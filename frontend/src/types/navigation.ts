import type { UserRole } from "./auth";

export const ROLE_DASHBOARD: Record<UserRole, string> = {
  admin: "/admin/dashboard",
  teacher: "/teacher/dashboard",
  student: "/student/dashboard",
};