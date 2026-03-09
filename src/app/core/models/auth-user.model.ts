export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

export interface SignupPayload {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}
