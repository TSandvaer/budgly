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
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { getBudget, createBudget, updateBudget } from '../services/budgetService';
import { Budget, CategoryBudget } from '../types';
import { formatCurrency } from '../utils/currency';
import { colors, borderRadius, spacing, fontSize, fontWeight, shadows } from '../constants/theme';

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
        <ActivityIndicator size="large" color={colors.primary} />
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
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
    marginTop: spacing.xl,
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
  },
  incomeSection: {
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.md,
    color: colors.text,
  },
  incomeInput: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
    backgroundColor: colors.backgroundSecondary,
    color: colors.text,
  },
  summaryCard: {
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xxl,
    ...shadows.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  summaryTotal: {
    borderTopWidth: 2,
    borderTopColor: colors.border,
    marginTop: spacing.sm,
    paddingTop: spacing.md,
  },
  summaryLabel: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  bold: {
    fontWeight: fontWeight.bold,
  },
  income: {
    color: colors.income,
  },
  expense: {
    color: colors.expense,
  },
  categoryItem: {
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  categorySpent: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  categoryInput: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md - 2,
    borderRadius: borderRadius.md,
    fontSize: fontSize.lg,
    textAlign: 'right',
    backgroundColor: colors.backgroundSecondary,
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.xxl,
    ...shadows.md,
  },
  saveButtonDisabled: {
    backgroundColor: colors.textDisabled,
  },
  saveButtonText: {
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  cancelButton: {
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md - 2,
    marginBottom: 40,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: fontSize.base,
  },
});
