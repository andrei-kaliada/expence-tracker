export interface Category {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
}

export interface Expense {
  id: string;
  amount: string; // Decimal serialized as string
  currency: string;
  description: string | null;
  date: string; // ISO date
  categoryId: string | null;
}

export interface HealthResponse {
  status: 'ok';
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
