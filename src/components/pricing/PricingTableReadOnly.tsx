import {
  Paper,
  Table,
  Stack,
  Text,
} from '@mantine/core';
import useTranslation from 'next-translate/useTranslation';
import { usdToSyr, formatCurrency } from '../../utils/currency';

export interface DeviceEntry {
  name: string;
  priceUsd: number;
  order: number;
}

export interface PricingTableData {
  id: string;
  title: string;
  entries: DeviceEntry[];
}

export interface PricingTableReadOnlyProps {
  table: PricingTableData;
  exchangeRate: number;
}

export function PricingTableReadOnly(props: PricingTableReadOnlyProps) {
  const { table, exchangeRate } = props;
  const { t, lang } = useTranslation('common');
  const isRTL = lang === 'ar';

  return (
    <Paper shadow="sm" p="md" withBorder>
      <Stack gap="md">
        <Text fw={600} size="lg">
          {table.title}
        </Text>

        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ textAlign: isRTL ? 'right' : 'left' }}>
                {t('pricingTable.deviceName')}
              </Table.Th>
              <Table.Th style={{ textAlign: isRTL ? 'right' : 'left' }}>
                {t('pricingTable.priceUsd')}
              </Table.Th>
              <Table.Th style={{ textAlign: isRTL ? 'right' : 'left' }}>
                {t('pricingTable.priceSyr')}
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {table.entries.map((entry, index) => {
              const priceSyr = usdToSyr(entry.priceUsd, exchangeRate);
              return (
                // eslint-disable-next-line react/no-array-index-key
                <Table.Tr key={`${table.id}-${index}`}>
                  <Table.Td style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    <Text>{entry.name || '-'}</Text>
                  </Table.Td>
                  <Table.Td style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    <Text>
                      {formatCurrency(entry.priceUsd)}
                      {' $'}
                    </Text>
                  </Table.Td>
                  <Table.Td style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    <Text>
                      {formatCurrency(priceSyr)}
                      {' '}
                      {isRTL ? 'ل.س' : 'SYP'}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Stack>
    </Paper>
  );
}

export default PricingTableReadOnly;
