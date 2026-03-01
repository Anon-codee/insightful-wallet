export interface Transaction {
  id: string;
  amount: number;
  date: string;
  category: string;
  shortDescription: string;
  detailedDescription: string;
  type: 'income' | 'expense';
  paymentMethod: 'bank' | 'cash';
  neglected?: boolean;
}

export interface Budget {
  category: string;
  limit: number;
}

export interface SavingsVault {
  balance: number;
  pin: string | null;
  history: VaultTransaction[];
}

export interface VaultTransaction {
  id: string;
  amount: number;
  date: string;
  type: 'deposit' | 'withdraw';
}

export interface CustomCategories {
  income: string[];
  expense: string[];
}

export interface FinanceState {
  transactions: Transaction[];
  budgets: Budget[];
  cashBalance: number;
  vault: SavingsVault;
  customCategories: CustomCategories;
  theme: 'light' | 'dark' | 'gradient';
}

export type FilterPeriod = 'lifetime' | 'monthly';

export interface MonthFilter {
  month: number;
  year: number;
}
