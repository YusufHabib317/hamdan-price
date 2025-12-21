import currency from 'currency.js';

const PRECISION = 2;

const currencyConfig = {
  precision: PRECISION,
  separator: ',',
  decimal: '.',
};

export function usdToSyr(priceUsd: number, exchangeRate: number): number {
  if (exchangeRate <= 0) {
    throw new Error('Exchange rate must be positive');
  }
  return currency(priceUsd, currencyConfig).multiply(exchangeRate).value;
}

export function syrToUsd(priceSyr: number, exchangeRate: number): number {
  if (exchangeRate <= 0) {
    throw new Error('Exchange rate must be positive');
  }
  return currency(priceSyr, currencyConfig).divide(exchangeRate).value;
}

export function formatCurrency(value: number): string {
  return currency(value, { ...currencyConfig, symbol: '' }).format();
}

export function parseCurrency(value: number | string) {
  return currency(value, currencyConfig);
}
