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
        <ActivityIndicator size="large" color="#3498db" />
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
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#3498db',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsIconButton: {
    padding: 4,
  },
  settingsIcon: {
    fontSize: 22,
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: 'white',
    fontSize: 14,
  },
  summaryCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  settingsButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ecf0f1',
    borderRadius: 6,
  },
  settingsButtonText: {
    fontSize: 12,
    color: '#2c3e50',
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
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  income: {
    color: '#27ae60',
  },
  expense: {
    color: '#e74c3c',
  },
  recentTransactions: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2c3e50',
  },
  emptyText: {
    textAlign: 'center',
    color: '#7f8c8d',
    padding: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
  transactionCategory: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#3498db',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewAllButton: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    alignItems: 'center',
  },
  viewAllText: {
    color: '#3498db',
    fontSize: 14,
  },
  categoriesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  categoriesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
    marginBottom: 12,
  },
  categoryBudget: {
    marginBottom: 12,
  },
  categoryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  categoryAmounts: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#ecf0f1',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  noBudgetContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noBudgetText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 16,
  },
  setupBudgetButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  setupBudgetButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
