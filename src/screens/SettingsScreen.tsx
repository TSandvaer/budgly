import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { CURRENCIES, LANGUAGES, Currency, Language } from '../types/settings';
import { colors, borderRadius, spacing, fontSize, fontWeight, shadows } from '../constants/theme';

export default function SettingsScreen({ navigation }: any) {
  const { settings, setCurrency, setLanguage } = useSettings();
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const handleCurrencySelect = async (currency: Currency) => {
    await setCurrency(currency);
    setCurrencyModalVisible(false);
  };

  const handleLanguageSelect = async (language: Language) => {
    await setLanguage(language);
    setLanguageModalVisible(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Settings</Text>

        {/* Currency Setting */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Currency</Text>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setCurrencyModalVisible(true)}
          >
            <View>
              <Text style={styles.settingLabel}>Currency</Text>
              <Text style={styles.settingValue}>
                {settings.currency.symbol} - {settings.currency.name}
              </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Language Setting */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language</Text>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setLanguageModalVisible(true)}
          >
            <View>
              <Text style={styles.settingLabel}>Language</Text>
              <Text style={styles.settingValue}>
                {settings.language.nativeName}
              </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
          <Text style={styles.note}>
            Note: Translation feature coming soon
          </Text>
        </View>

        {/* Currency Selection Modal */}
        <Modal
          visible={currencyModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setCurrencyModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Currency</Text>
                <TouchableOpacity
                  onPress={() => setCurrencyModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalScroll}>
                {CURRENCIES.map((currency) => (
                  <TouchableOpacity
                    key={currency.code}
                    style={[
                      styles.modalItem,
                      settings.currency.code === currency.code &&
                        styles.modalItemSelected,
                    ]}
                    onPress={() => handleCurrencySelect(currency)}
                  >
                    <Text style={styles.currencySymbol}>{currency.symbol}</Text>
                    <View style={styles.modalItemText}>
                      <Text style={styles.modalItemName}>{currency.name}</Text>
                      <Text style={styles.modalItemCode}>{currency.code}</Text>
                    </View>
                    {settings.currency.code === currency.code && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Language Selection Modal */}
        <Modal
          visible={languageModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setLanguageModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Language</Text>
                <TouchableOpacity
                  onPress={() => setLanguageModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalScroll}>
                {LANGUAGES.map((language) => (
                  <TouchableOpacity
                    key={language.code}
                    style={[
                      styles.modalItem,
                      settings.language.code === language.code &&
                        styles.modalItemSelected,
                    ]}
                    onPress={() => handleLanguageSelect(language)}
                  >
                    <View style={styles.modalItemText}>
                      <Text style={styles.modalItemName}>
                        {language.nativeName}
                      </Text>
                      <Text style={styles.modalItemCode}>{language.name}</Text>
                    </View>
                    {settings.language.code === language.code && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xxl,
    marginTop: spacing.xl,
    color: colors.text,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  settingItem: {
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shadows.sm,
  },
  settingLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  settingValue: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  arrow: {
    fontSize: 24,
    color: colors.textTertiary,
  },
  note: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  closeButton: {
    padding: spacing.xs,
  },
  closeButtonText: {
    fontSize: 24,
    color: colors.textSecondary,
  },
  modalScroll: {
    maxHeight: 500,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalItemSelected: {
    backgroundColor: colors.backgroundTertiary,
  },
  currencySymbol: {
    fontSize: 24,
    marginRight: spacing.md,
    width: 32,
    textAlign: 'center',
    color: colors.text,
  },
  modalItemText: {
    flex: 1,
  },
  modalItemName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  modalItemCode: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  checkmark: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: fontWeight.bold,
  },
});
