import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Transaction, Budget } from '../types';

// Transactions
export const addTransaction = async (userId: string, transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
  const transactionsRef = collection(db, 'transactions');
  const docRef = await addDoc(transactionsRef, {
    ...transaction,
    userId,
    date: Timestamp.fromDate(transaction.date),
    createdAt: Timestamp.fromDate(new Date()),
  });

  // Update budget category spent amount
  if (transaction.type === 'expense') {
    await updateCategorySpent(userId, transaction.category, transaction.amount);
  }

  return docRef.id;
};

export const getTransactions = async (userId: string, month?: string): Promise<Transaction[]> => {
  const transactionsRef = collection(db, 'transactions');
  let q = query(
    transactionsRef,
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );

  const querySnapshot = await getDocs(q);
  const transactions: Transaction[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    transactions.push({
      id: doc.id,
      userId: data.userId,
      amount: data.amount,
      category: data.category,
      description: data.description,
      date: data.date.toDate(),
      type: data.type,
      createdAt: data.createdAt.toDate(),
    });
  });

  return transactions;
};

export const deleteTransaction = async (transactionId: string) => {
  await deleteDoc(doc(db, 'transactions', transactionId));
};

// Budgets
export const getBudget = async (userId: string, month: string): Promise<Budget | null> => {
  const budgetsRef = collection(db, 'budgets');
  const q = query(
    budgetsRef,
    where('userId', '==', userId),
    where('month', '==', month)
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  const data = doc.data();

  return {
    id: doc.id,
    userId: data.userId,
    month: data.month,
    totalIncome: data.totalIncome,
    totalExpenses: data.totalExpenses,
    categoryBudgets: data.categoryBudgets,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  };
};

export const updateBudget = async (budgetId: string, updates: Partial<Budget>) => {
  const budgetRef = doc(db, 'budgets', budgetId);
  await updateDoc(budgetRef, {
    ...updates,
    updatedAt: Timestamp.fromDate(new Date()),
  });
};

export const createBudget = async (userId: string, month: string) => {
  const budgetsRef = collection(db, 'budgets');
  const docRef = await addDoc(budgetsRef, {
    userId,
    month,
    totalIncome: 0,
    totalExpenses: 0,
    categoryBudgets: [],
    createdAt: Timestamp.fromDate(new Date()),
    updatedAt: Timestamp.fromDate(new Date()),
  });
  return docRef.id;
};

// Helper function to update category spent amount
export const updateCategorySpent = async (userId: string, category: string, amount: number) => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const budget = await getBudget(userId, currentMonth);

  if (!budget) return;

  const updatedCategories = budget.categoryBudgets.map((cat) => {
    if (cat.category === category) {
      return { ...cat, spent: cat.spent + amount };
    }
    return cat;
  });

  await updateBudget(budget.id, {
    categoryBudgets: updatedCategories,
    totalExpenses: budget.totalExpenses + amount,
  });
};

// Calculate budget summary with spending by category
export const calculateBudgetSummary = async (userId: string, month: string) => {
  const budget = await getBudget(userId, month);
  const transactions = await getTransactions(userId, month);

  if (!budget) return null;

  // Calculate actual spending per category
  const categorySpending = new Map<string, number>();

  transactions.forEach((transaction) => {
    if (transaction.type === 'expense') {
      const current = categorySpending.get(transaction.category) || 0;
      categorySpending.set(transaction.category, current + transaction.amount);
    }
  });

  // Update category budgets with actual spending
  const updatedCategories = budget.categoryBudgets.map((cat) => ({
    ...cat,
    spent: categorySpending.get(cat.category) || 0,
  }));

  return {
    ...budget,
    categoryBudgets: updatedCategories,
  };
};
