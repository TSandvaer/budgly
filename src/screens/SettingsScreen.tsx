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
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    marginTop: 20,
    color: '#2c3e50',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  settingItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 4,
  },
  settingValue: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  arrow: {
    fontSize: 24,
    color: '#bdc3c7',
  },
  note: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 8,
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#7f8c8d',
  },
  modalScroll: {
    maxHeight: 500,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  modalItemSelected: {
    backgroundColor: '#f0f8ff',
  },
  currencySymbol: {
    fontSize: 24,
    marginRight: 12,
    width: 32,
    textAlign: 'center',
  },
  modalItemText: {
    flex: 1,
  },
  modalItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
  modalItemCode: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  checkmark: {
    fontSize: 20,
    color: '#3498db',
    fontWeight: 'bold',
  },
});
