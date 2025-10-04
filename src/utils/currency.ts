import { Currency } from '../types/settings';

/**
 * Format a number as currency with the given currency settings
 */
export const formatCurrency = (amount: number, currency: Currency, decimals: number = 2): string => {
  const formattedAmount = amount.toFixed(decimals);

  // Handle different currency symbol positions
  // Most currencies have symbol before amount, some after
  const currenciesWithSymbolAfter = ['EUR', 'CHF', 'SEK', 'NOK', 'DKK', 'PLN'];

  if (currenciesWithSymbolAfter.includes(currency.code)) {
    return `${formattedAmount} ${currency.symbol}`;
  }

  return `${currency.symbol}${formattedAmount}`;
};

/**
 * Format currency for display (with thousand separators)
 */
export const formatCurrencyDisplay = (amount: number, currency: Currency): string => {
  const absAmount = Math.abs(amount);
  const formattedNumber = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const sign = amount < 0 ? '-' : '';
  const currenciesWithSymbolAfter = ['EUR', 'CHF', 'SEK', 'NOK', 'DKK', 'PLN'];

  if (currenciesWithSymbolAfter.includes(currency.code)) {
    return `${sign}${formattedNumber} ${currency.symbol}`;
  }

  return `${sign}${currency.symbol}${formattedNumber}`;
};

/**
 * Get currency symbol only
 */
export const getCurrencySymbol = (currency: Currency): string => {
  return currency.symbol;
};
