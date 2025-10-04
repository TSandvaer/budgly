import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { getTransactions, calculateBudgetSummary } from '../services/budgetService';
import { Transaction, Budget } from '../types';
import { formatCurrency } from '../utils/currency';
import { colors, borderRadius, spacing, fontSize, fontWeight, shadows } from '../constants/theme';

export default function HomeScreen({ navigation }: any) {
  const { user, signOut } = useAuth();
  const { settings } = useSettings();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [transactionsData, budgetData] = await Promise.all([
        getTransactions(user.uid),
        calculateBudgetSummary(user.uid, currentMonth),
      ]);

      setTransactions(transactionsData.slice(0, 5)); // Show only recent 5
      setBudget(budgetData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expenses, balance: income - expenses };
  };

  const { income, expenses, balance } = calculateTotals();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Welcome, {user?.email}</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            style={styles.settingsIconButton}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={signOut} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Monthly Budget</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('BudgetSettings')}
            style={styles.settingsButton}
          >
            <Text style={styles.settingsButtonText}>⚙️ Settings</Text>
          </TouchableOpacity>
        </View>

        {budget && budget.totalIncome > 0 ? (
          <>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Income</Text>
                <Text style={[styles.summaryAmount, styles.income]}>
                  {formatCurrency(budget.totalIncome, settings.currency)}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Expenses</Text>
                <Text style={[styles.summaryAmount, styles.expense]}>
                  {formatCurrency(expenses, settings.currency)}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Remaining</Text>
                <Text
                  style={[
                    styles.summaryAmount,
                    (budget.totalIncome - expenses) >= 0 ? styles.income : styles.expense,
                  ]}
                >
                  {formatCurrency(budget.totalIncome - expenses, settings.currency)}
                </Text>
              </View>
            </View>

            {budget.categoryBudgets.length > 0 && (
              <View style={styles.categoriesSection}>
                <Text style={styles.categoriesTitle}>Budget by Category</Text>
                {budget.categoryBudgets
                  .filter((cat) => cat.budgeted > 0)
                  .map((category) => {
                    const percentage = category.budgeted > 0
                      ? Math.min((category.spent / category.budgeted) * 100, 100)
                      : 0;
                    const isOverBudget = category.spent > category.budgeted;

                    return (
                      <View key={category.category} style={styles.categoryBudget}>
                        <View style={styles.categoryInfo}>
                          <Text style={styles.categoryName}>{category.category}</Text>
                          <Text style={styles.categoryAmounts}>
                            {formatCurrency(category.spent, settings.currency, 0)} / {formatCurrency(category.budgeted, settings.currency, 0)}
                          </Text>
                        </View>
                        <View style={styles.progressBarContainer}>
                          <View
                            style={[
                              styles.progressBar,
                              {
                                width: `${percentage}%`,
                                backgroundColor: isOverBudget ? '#e74c3c' : '#27ae60',
                              },
                            ]}
                          />
                        </View>
                      </View>
                    );
                  })}
              </View>
            )}
          </>
        ) : (
          <View style={styles.noBudgetContainer}>
            <Text style={styles.noBudgetText}>
              Set up your monthly budget to track spending
            </Text>
            <TouchableOpacity
              style={styles.setupBudgetButton}
              onPress={() => navigation.navigate('BudgetSettings')}
            >
              <Text style={styles.setupBudgetButtonText}>Set Up Budget</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.recentTransactions}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {transactions.length === 0 ? (
          <Text style={styles.emptyText}>No transactions yet</Text>
        ) : (
          transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View>
                <Text style={styles.transactionDescription}>
                  {transaction.description}
                </Text>
                <Text style={styles.transactionCategory}>
                  {transaction.category}
                </Text>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  transaction.type === 'income' ? styles.income : styles.expense,
                ]}
              >
                {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, settings.currency)}
              </Text>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddTransaction')}
      >
        <Text style={styles.addButtonText}>+ Add Transaction</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.viewAllButton}
        onPress={() => navigation.navigate('Transactions')}
      >
        <Text style={styles.viewAllText}>View All Transactions</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.backgroundTertiary,
    padding: spacing.xl,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  settingsIconButton: {
    padding: spacing.xs,
  },
  settingsIcon: {
    fontSize: 22,
  },
  logoutButton: {
    padding: spacing.sm,
  },
  logoutText: {
    color: colors.text,
    fontSize: fontSize.md,
  },
  summaryCard: {
    backgroundColor: colors.card,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  settingsButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: spacing.xs + 2,
  },
  settingsButtonText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  summaryAmount: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  income: {
    color: colors.income,
  },
  expense: {
    color: colors.expense,
  },
  recentTransactions: {
    backgroundColor: colors.card,
    margin: spacing.lg,
    marginTop: 0,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.md,
    color: colors.text,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    padding: spacing.xl,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  transactionDescription: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  transactionCategory: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  addButton: {
    backgroundColor: colors.primary,
    margin: spacing.lg,
    marginTop: 0,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...shadows.md,
  },
  addButtonText: {
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  viewAllButton: {
    margin: spacing.lg,
    marginTop: 0,
    padding: spacing.lg,
    alignItems: 'center',
  },
  viewAllText: {
    color: colors.primary,
    fontSize: fontSize.md,
  },
  categoriesSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  categoriesTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  categoryBudget: {
    marginBottom: spacing.md,
  },
  categoryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  categoryName: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  categoryAmounts: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  noBudgetContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  noBudgetText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  setupBudgetButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  setupBudgetButtonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});
