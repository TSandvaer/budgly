export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  category: string;
  description: string;
  date: Date;
  type: 'income' | 'expense';
  createdAt: Date;
}

export interface Budget {
  id: string;
  userId: string;
  month: string; // Format: 'YYYY-MM'
  totalIncome: number;
  totalExpenses: number;
  categoryBudgets: CategoryBudget[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryBudget {
  category: string;
  budgeted: number;
  spent: number;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
