export type UserRole = 'user' | 'admin' | 'superadmin';

export interface DashboardUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
  role: UserRole;
  claims?: Record<string, any>;
} 