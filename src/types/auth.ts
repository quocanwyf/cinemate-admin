export interface Admin {
  id: string;
  email: string;
  full_name: string | null;
}

export interface AuthState {
  accessToken: string | null;
  admin: Admin | null;
  setAuth: (token: string, admin: Admin) => void;
  logout: () => void;
}
