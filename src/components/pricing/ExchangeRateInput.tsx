import { useCallback } from 'react';
import {
  Group, NumberInput, Text, Paper,
} from '@mantine/core';
import useTranslation from 'next-translate/useTranslation';
import { parseCurrency } from '../../utils/currency';

export interface ExchangeRateInputProps {
  rate: number;
  onRateChange: (rate: number) => void;
}

export function ExchangeRateInput({
  rate,
  onRateChange,
}: ExchangeRateInputProps) {
  const { t } = useTranslation('common');

  const handleChange = useCallback((value: number | string) => {
    const numericRate = parseCurrency(value || 0).value;

    if (!Number.isNaN(numericRate) && numericRate > 0) {
      onRateChange(numericRate);
    }
  }, [onRateChange]);

  return (
    <Paper shadow="xs" p="md" withBorder>
      <Group gap="sm" align="center">
        <Text fw={500}>{t('exchangeRate.label')}</Text>
        <NumberInput
          value={rate}
          onChange={handleChange}
          min={0.01}
          decimalScale={2}
          step={0.01}
          allowNegative={false}
          w={150}
          aria-label="Exchange rate"
        />
        <Text fw={500}>{t('exchangeRate.suffix')}</Text>
      </Group>
    </Paper>
  );
}

export default ExchangeRateInput;
