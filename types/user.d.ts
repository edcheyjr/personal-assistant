export interface AuthUser {
  name: string;
  email: string;
  picture: string | null;
}

export interface Session {
  user: AuthUser;
  accessToken: string | null;
  isAuthenticated: boolean;
}
