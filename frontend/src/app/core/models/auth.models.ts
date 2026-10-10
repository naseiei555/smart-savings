export interface User {
  id: number;
  name: string;
  email: string;
  notify_enabled?: boolean;
  created_at?: string;
}

export interface AuthResponse {
  message: string;
  token?: string;
  user?: User;
  error?: string;
}
