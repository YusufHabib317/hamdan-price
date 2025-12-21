import {
  useState, useCallback, useEffect,
} from 'react';
import {
  TextInput, NumberInput, ActionIcon, Table,
} from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import useTranslation from 'next-translate/useTranslation';
import { usdToSyr, syrToUsd, parseCurrency } from '../../utils/currency';

export interface DeviceEntryRowProps {
  entry: {
    name: string;
    priceUsd: number;
    order: number;
  };
  exchangeRate: number;
  onFieldChange: (field: 'name' | 'priceUsd', value: string | number) => void;
  onDelete: () => void;
}

export function DeviceEntryRow(props: DeviceEntryRowProps) {
  const {
    entry, exchangeRate, onFieldChange, onDelete,
  } = props;
  const { t, lang } = useTranslation('common');
  const isRTL = lang === 'ar';

  const [localName, setLocalName] = useState(entry.name);
  const [localPriceUsd, setLocalPriceUsd] = useState<number | string>(entry.priceUsd);

  useEffect(() => {
    setLocalName(entry.name);
  }, [entry.name]);

  useEffect(() => {
    setLocalPriceUsd(entry.priceUsd);
  }, [entry.priceUsd]);

  const priceSyr = usdToSyr(entry.priceUsd, exchangeRate);

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalName(newValue);
      onFieldChange('name', newValue);
    },
    [onFieldChange],
  );

  const handleUsdChange = useCallback(
    (value: number | string) => {
      setLocalPriceUsd(value);
      const numValue = parseCurrency(value || 0).value;
      onFieldChange('priceUsd', numValue);
    },
    [onFieldChange],
  );

  const handleSyrChange = useCallback(
    (value: number | string) => {
      const numValue = parseCurrency(value || 0).value;
      const usdValue = syrToUsd(numValue, exchangeRate);
      setLocalPriceUsd(usdValue);
      onFieldChange('priceUsd', usdValue);
    },
    [exchangeRate, onFieldChange],
  );

  return (
    <Table.Tr>
      <Table.Td style={{ textAlign: isRTL ? 'right' : 'left', minWidth: 180 }}>
        <TextInput
          value={localName}
          onChange={handleNameChange}
          placeholder={t('pricingTable.deviceName')}
          aria-label={t('pricingTable.deviceName')}
          style={{ textAlign: isRTL ? 'right' : 'left' }}
        />
      </Table.Td>
      <Table.Td style={{ textAlign: isRTL ? 'right' : 'left', minWidth: 140 }}>
        <NumberInput
          value={localPriceUsd}
          onChange={handleUsdChange}
          min={0}
          decimalScale={2}
          allowNegative={false}
          placeholder="0.00"
          aria-label={t('pricingTable.priceUsd')}
          style={{ textAlign: isRTL ? 'right' : 'left' }}
          thousandSeparator=","
        />
      </Table.Td>
      <Table.Td style={{ textAlign: isRTL ? 'right' : 'left', minWidth: 140 }}>
        <NumberInput
          value={priceSyr}
          onChange={handleSyrChange}
          min={0}
          decimalScale={2}
          allowNegative={false}
          placeholder="0.00"
          aria-label={t('pricingTable.priceSyr')}
          style={{ textAlign: isRTL ? 'right' : 'left' }}
          readOnly
          thousandSeparator=","
        />
      </Table.Td>
      <Table.Td style={{ textAlign: 'center' }}>
        <ActionIcon
          color="red"
          variant="subtle"
          onClick={onDelete}
          aria-label={t('actions.delete')}
        >
          <IconTrash size={18} />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  );
}

export default DeviceEntryRow;
