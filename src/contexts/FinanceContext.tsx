import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Transaction, Budget, SavingsVault, CustomCategories, FinanceState, VaultTransaction } from '@/types/finance';
import { supabase } from '@/lib/supabase';

const LOCAL_KEY = 'finance-tracker-local';

const defaultState: FinanceState = {
  transactions: [],
  budgets: [],
  cashBalance: 0,
  vault: { balance: 0, pin: null, history: [] },
  customCategories: { income: [], expense: [] },
  theme: 'dark',
};

function loadLocalState(): Pick<FinanceState, 'cashBalance' | 'vault' | 'customCategories' | 'theme'> {
  try {
    const data = localStorage.getItem(LOCAL_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        cashBalance: parsed.cashBalance ?? 0,
        vault: parsed.vault ?? defaultState.vault,
        customCategories: parsed.customCategories ?? defaultState.customCategories,
        theme: parsed.theme ?? 'dark',
      };
    }
  } catch {}
  return {
    cashBalance: 0,
    vault: defaultState.vault,
    customCategories: defaultState.customCategories,
    theme: 'dark',
  };
}

function saveLocalState(state: FinanceState) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify({
    cashBalance: state.cashBalance,
    vault: state.vault,
    customCategories: state.customCategories,
    theme: state.theme,
  }));
}

interface AuthState {
  userId: string | null;
  email: string | null;
  loading: boolean;
}

interface FinanceContextType {
  state: FinanceState;
  auth: AuthState;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (tx: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  toggleNeglect: (id: string) => Promise<void>;
  addBudget: (budget: Budget) => Promise<void>;
  removeBudget: (category: string) => Promise<void>;
  updateCashBalance: (amount: number) => void;
  depositToVault: (amount: number) => void;
  withdrawFromVault: (amount: number) => void;
  setVaultPin: (pin: string | null) => void;
  addCustomCategory: (type: 'income' | 'expense', category: string) => void;
  removeCustomCategory: (type: 'income' | 'expense', category: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'gradient') => void;
  resetAllData: () => Promise<void>;
  exportData: () => string;
  importData: (json: string) => boolean;
}

const FinanceContext = createContext<FinanceContextType | null>(null);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<FinanceState>({ ...defaultState, ...loadLocalState() });
  const [auth, setAuth] = useState<AuthState>({ userId: null, email: null, loading: true });

  // ─── Auth listener ──────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuth({
        userId: session?.user?.id ?? null,
        email: session?.user?.email ?? null,
        loading: false,
      });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuth({
        userId: session?.user?.id ?? null,
        email: session?.user?.email ?? null,
        loading: false,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  // ─── Load cloud data when user logs in ─────────────────────────────────
  useEffect(() => {
    if (!auth.userId) {
      setState(prev => ({ ...prev, transactions: [], budgets: [] }));
      return;
    }
    fetchCloudData(auth.userId);
  }, [auth.userId]);

  async function fetchCloudData(userId: string) {
    const [{ data: transactions }, { data: budgets }] = await Promise.all([
      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false }),
      supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId),
    ]);

    setState(prev => ({
      ...prev,
      transactions: (transactions ?? []).map(mapTransaction),
      budgets: (budgets ?? []).map(mapBudget),
    }));
  }

  function mapTransaction(row: any): Transaction {
    return {
      id: row.id,
      amount: row.amount,
      type: row.type,
      category: row.category,
      shortDescription: row.short_description ?? '',
      detailedDescription: row.detailed_description ?? '',
      paymentMethod: row.payment_method ?? 'bank',
      date: row.date,
      neglected: row.neglected ?? false,
    };
  }

  function mapBudget(row: any): Budget {
    return {
      category: row.category,
      limit: row.limit_amount,
    };
  }

  useEffect(() => {
    saveLocalState(state);
  }, [state.cashBalance, state.vault, state.customCategories, state.theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'theme-gradient');
    if (state.theme === 'dark') root.classList.add('dark');
    else if (state.theme === 'gradient') root.classList.add('dark', 'theme-gradient');
  }, [state.theme]);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setState(prev => ({ ...prev, transactions: [], budgets: [] }));
  }, []);

  const addTransaction = useCallback(async (tx: Omit<Transaction, 'id'>) => {
    if (!auth.userId) return;
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: auth.userId,
        amount: tx.amount,
        type: tx.type,
        category: tx.category,
        short_description: tx.shortDescription,
        detailed_description: tx.detailedDescription,
        payment_method: tx.paymentMethod,
        date: tx.date,
        neglected: tx.neglected ?? false,
      })
      .select()
      .single();

    if (!error && data) {
      setState(prev => ({
        ...prev,
        transactions: [mapTransaction(data), ...prev.transactions],
      }));
    }
  }, [auth.userId]);

  const updateTransaction = useCallback(async (tx: Transaction) => {
    if (!auth.userId) return;
    const { error } = await supabase
      .from('transactions')
      .update({
        amount: tx.amount,
        type: tx.type,
        category: tx.category,
        short_description: tx.shortDescription,
        detailed_description: tx.detailedDescription,
        payment_method: tx.paymentMethod,
        date: tx.date,
        neglected: tx.neglected,
      })
      .eq('id', tx.id)
      .eq('user_id', auth.userId);

    if (!error) {
      setState(prev => ({
        ...prev,
        transactions: prev.transactions.map(t => t.id === tx.id ? tx : t),
      }));
    }
  }, [auth.userId]);

  const deleteTransaction = useCallback(async (id: string) => {
    if (!auth.userId) return;
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', auth.userId);

    if (!error) {
      setState(prev => ({
        ...prev,
        transactions: prev.transactions.filter(t => t.id !== id),
      }));
    }
  }, [auth.userId]);

  const toggleNeglect = useCallback(async (id: string) => {
    if (!auth.userId) return;
    const tx = state.transactions.find(t => t.id === id);
    if (!tx) return;
    await updateTransaction({ ...tx, neglected: !tx.neglected });
  }, [auth.userId, state.transactions, updateTransaction]);

  const addBudget = useCallback(async (budget: Budget) => {
    if (!auth.userId) return;
    const { data, error } = await supabase
      .from('budgets')
      .upsert({
        user_id: auth.userId,
        category: budget.category,
        limit_amount: budget.limit,
      }, { onConflict: 'user_id,category' })
      .select()
      .single();

    if (!error && data) {
      setState(prev => ({
        ...prev,
        budgets: [
          ...prev.budgets.filter(b => b.category !== budget.category),
          mapBudget(data),
        ],
      }));
    }
  }, [auth.userId]);

  const removeBudget = useCallback(async (category: string) => {
    if (!auth.userId) return;
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('user_id', auth.userId)
      .eq('category', category);

    if (!error) {
      setState(prev => ({
        ...prev,
        budgets: prev.budgets.filter(b => b.category !== category),
      }));
    }
  }, [auth.userId]);

  const updateCashBalance = useCallback((amount: number) => {
    setState(prev => ({ ...prev, cashBalance: amount }));
  }, []);

  const depositToVault = useCallback((amount: number) => {
    const vaultTx: VaultTransaction = {
      id: crypto.randomUUID(),
      amount,
      date: new Date().toISOString(),
      type: 'deposit',
    };
    setState(prev => ({
      ...prev,
      vault: {
        ...prev.vault,
        balance: prev.vault.balance + amount,
        history: [vaultTx, ...prev.vault.history],
      },
    }));
  }, []);

  const withdrawFromVault = useCallback((amount: number) => {
    const vaultTx: VaultTransaction = {
      id: crypto.randomUUID(),
      amount,
      date: new Date().toISOString(),
      type: 'withdraw',
    };
    setState(prev => ({
      ...prev,
      vault: {
        ...prev.vault,
        balance: Math.max(0, prev.vault.balance - amount),
        history: [vaultTx, ...prev.vault.history],
      },
    }));
  }, []);

  const setVaultPin = useCallback((pin: string | null) => {
    setState(prev => ({ ...prev, vault: { ...prev.vault, pin } }));
  }, []);

  const addCustomCategory = useCallback((type: 'income' | 'expense', category: string) => {
    setState(prev => ({
      ...prev,
      customCategories: {
        ...prev.customCategories,
        [type]: [...prev.customCategories[type], category],
      },
    }));
  }, []);

  const removeCustomCategory = useCallback((type: 'income' | 'expense', category: string) => {
    setState(prev => ({
      ...prev,
      customCategories: {
        ...prev.customCategories,
        [type]: prev.customCategories[type].filter(c => c !== category),
      },
    }));
  }, []);

  const setTheme = useCallback((theme: 'light' | 'dark' | 'gradient') => {
    setState(prev => ({ ...prev, theme }));
  }, []);

  const resetAllData = useCallback(async () => {
    if (auth.userId) {
      await Promise.all([
        supabase.from('transactions').delete().eq('user_id', auth.userId),
        supabase.from('budgets').delete().eq('user_id', auth.userId),
      ]);
    }
    setState(defaultState);
    localStorage.removeItem(LOCAL_KEY);
  }, [auth.userId]);

  const exportData = useCallback(() => {
    return JSON.stringify(state, null, 2);
  }, [state]);

  const importData = useCallback((json: string): boolean => {
    try {
      const parsed = JSON.parse(json);
      const merged: FinanceState = { ...defaultState, ...parsed };
      setState(merged);
      return true;
    } catch {
      return false;
    }
  }, []);

  return (
    <FinanceContext.Provider value={{
      state,
      auth,
      signUp,
      signIn,
      signOut,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      toggleNeglect,
      addBudget,
      removeBudget,
      updateCashBalance,
      depositToVault,
      withdrawFromVault,
      setVaultPin,
      addCustomCategory,
      removeCustomCategory,
      setTheme,
      resetAllData,
      exportData,
      importData,
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
}