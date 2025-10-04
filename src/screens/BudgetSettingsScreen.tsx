import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { getBudget, createBudget, updateBudget } from '../services/budgetService';
import { Budget, CategoryBudget } from '../types';
import { formatCurrency } from '../utils/currency';

const DEFAULT_CATEGORIES = [
  'Housing',
  'Insurance',
  'Phone',
  'Utilities',
  'Groceries',
  'Transportation',
  'Entertainment',
  'Other',
];

export default function BudgetSettingsScreen({ navigation }: any) {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [budget, setBudget] = useState<Budget | null>(null);
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  useEffect(() => {
    loadBudget();
  }, []);

  const loadBudget = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let budgetData = await getBudget(user.uid, currentMonth);

      if (!budgetData) {
        // Create a new budget for this month
        const budgetId = await createBudget(user.uid, currentMonth);
        budgetData = await getBudget(user.uid, currentMonth);
      }

      if (budgetData) {
        setBudget(budgetData);
        setMonthlyIncome(budgetData.totalIncome.toString());

        // Initialize category budgets
        if (budgetData.categoryBudgets.length === 0) {
          const initialCategories = DEFAULT_CATEGORIES.map((cat) => ({
            category: cat,
            budgeted: 0,
            spent: 0,
          }));
          setCategoryBudgets(initialCategories);
        } else {
          setCategoryBudgets(budgetData.categoryBudgets);
        }
      }
    } catch (error) {
      console.error('Error loading budget:', error);
      Alert.alert('Error', 'Failed to load budget');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryBudgetChange = (category: string, value: string) => {
    const budgeted = parseFloat(value) || 0;
    setCategoryBudgets((prev) =>
      prev.map((cat) =>
        cat.category === category ? { ...cat, budgeted } : cat
      )
    );
  };

  const handleSave = async () => {
    if (!user || !budget) return;

    const income = parseFloat(monthlyIncome) || 0;

    if (income < 0) {
      Alert.alert('Error', 'Income cannot be negative');
      return;
    }

    setSaving(true);
    try {
      const totalBudgeted = categoryBudgets.reduce(
        (sum, cat) => sum + cat.budgeted,
        0
      );

      await updateBudget(budget.id, {
        totalIncome: income,
        categoryBudgets,
      });

      Alert.alert('Success', 'Budget settings saved!');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving budget:', error);
      Alert.alert('Error', 'Failed to save budget');
    } finally {
      setSaving(false);
    }
  };

  const totalBudgeted = categoryBudgets.reduce(
    (sum, cat) => sum + cat.budgeted,
    0
  );
  const income = parseFloat(monthlyIncome) || 0;
  const remaining = income - totalBudgeted;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>Budget Settings</Text>
          <Text style={styles.subtitle}>
            Set your monthly income and budget for each category
          </Text>

          <View style={styles.incomeSection}>
            <Text style={styles.sectionTitle}>Monthly Income</Text>
            <TextInput
              style={styles.incomeInput}
              placeholder="0.00"
              value={monthlyIncome}
              onChangeText={setMonthlyIncome}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Income:</Text>
              <Text style={[styles.summaryValue, styles.income]}>
                {formatCurrency(income, settings.currency)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Budgeted:</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(totalBudgeted, settings.currency)}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryTotal]}>
              <Text style={styles.summaryLabel}>Remaining:</Text>
              <Text
                style={[
                  styles.summaryValue,
                  styles.bold,
                  remaining >= 0 ? styles.income : styles.expense,
                ]}
              >
                {formatCurrency(remaining, settings.currency)}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Category Budgets</Text>

          {categoryBudgets.map((categoryBudget) => (
            <View key={categoryBudget.category} style={styles.categoryItem}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>
                  {categoryBudget.category}
                </Text>
                <Text style={styles.categorySpent}>
                  Spent: {formatCurrency(categoryBudget.spent, settings.currency)}
                </Text>
              </View>
              <TextInput
                style={styles.categoryInput}
                placeholder="0.00"
                value={
                  categoryBudget.budgeted > 0
                    ? categoryBudget.budgeted.toString()
                    : ''
                }
                onChangeText={(value) =>
                  handleCategoryBudgetChange(categoryBudget.category, value)
                }
                keyboardType="decimal-pad"
              />
            </View>
          ))}

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save Budget'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 20,
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 24,
  },
  incomeSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2c3e50',
  },
  incomeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryTotal: {
    borderTopWidth: 2,
    borderTopColor: '#ecf0f1',
    marginTop: 8,
    paddingTop: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  bold: {
    fontWeight: 'bold',
  },
  income: {
    color: '#27ae60',
  },
  expense: {
    color: '#e74c3c',
  },
  categoryItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  categorySpent: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  categoryInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 8,
    fontSize: 18,
    textAlign: 'right',
    backgroundColor: '#f9f9f9',
  },
  saveButton: {
    backgroundColor: '#27ae60',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  cancelButtonText: {
    color: '#7f8c8d',
    fontSize: 16,
  },
});
