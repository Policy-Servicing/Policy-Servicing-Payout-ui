export interface User {
  id: number;
  username: string;
  fullName: string;
  role: 'ADMIN' | 'VIEWER';
  email: string;
  avatar?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  expiresIn: number;
}

export interface JwtPayload {
  sub: string;
  role: string;
  exp: number;
  iat: number;
}
