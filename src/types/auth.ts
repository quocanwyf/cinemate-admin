export interface Admin {
  id: string;
  email: string;
  full_name: string | null;
  accessToken: string; // ✅ Bắt buộc phải có
  refreshToken?: string;
}

export interface AuthState {
  accessToken: string | null;
  admin: Admin | null;
  setAuth: (token: string, admin: Admin) => void;
  logout: () => void;
}
