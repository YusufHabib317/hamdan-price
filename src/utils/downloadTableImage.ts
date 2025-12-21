/* eslint-disable no-param-reassign */
import html2canvas from 'html2canvas';

interface TableEntry {
  name: string;
  priceUsd: number;
  priceSyr: number;
}

interface TableData {
  title: string;
  entries: TableEntry[];
}

interface DownloadAllTablesImageOptions {
  tables: TableData[];
  date: string;
  isRTL: boolean;
  snapshotTitle?: string;
  logoUrl?: string;
  currency?: 'USD' | 'SYP';
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export async function downloadAllTablesAsImage(
  options: DownloadAllTablesImageOptions,
): Promise<void> {
  const {
    tables, date, isRTL, snapshotTitle, logoUrl = '/logo/logo.png', currency = 'SYP',
  } = options;

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '900px';
  container.style.backgroundColor = '#f5f5f5';
  container.style.fontFamily = 'Cairo, Inter, sans-serif';
  container.style.direction = isRTL ? 'rtl' : 'ltr';

  document.body.appendChild(container);

  try {
    // Helper function to generate table HTML
    const generateTableHtml = (table: TableData) => `
      <div style="background: rgba(255, 255, 255, 0.95); border-radius: 6px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.08); border: 1px solid rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(180deg, #4a9fe8 0%, #2d7bc9 100%); padding: 8px 12px;">
          <h3 style="margin: 0; font-size: 15px; font-weight: 700; color: white; text-align: center; text-shadow: 0 1px 2px rgba(0,0,0,0.15);">
            ${table.title}
          </h3>
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <tbody>
            ${table.entries.map((entry: TableEntry, index: number) => `
              <tr style="background: ${index % 2 === 0 ? 'rgba(255,255,255,0.95)' : 'rgba(245,247,250,0.95)'}; border-bottom: 1px solid #e8e8e8;">
                <td style="padding: 5px 10px; text-align: ${isRTL ? 'right' : 'left'}; font-size: 12px; color: #1a1a1a; font-weight: 500;">
                  • ${entry.name}
                </td>
                <td style="padding: 5px 10px; text-align: ${isRTL ? 'left' : 'right'}; font-size: 12px; color: #1a1a1a; font-weight: 600; white-space: nowrap;">
                  ${currency === 'USD' ? `$${entry.priceUsd.toFixed(2)}` : `${entry.priceSyr.toLocaleString('en-US')} ل.س`}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    // Split tables into pairs for two-column layout
    const tableRows: string[] = [];
    for (let i = 0; i < tables.length; i += 2) {
      const leftTable = tables[i];
      const rightTable = tables[i + 1];

      const leftHtml = generateTableHtml(leftTable);
      const rightHtml = rightTable ? generateTableHtml(rightTable) : '<div></div>';

      tableRows.push(`
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; align-items: start;">
          ${leftHtml}
          ${rightHtml}
        </div>
      `);
    }

    const html = `
      <div style="padding: 0; position: relative; min-height: 100%;">
        <!-- Logo in top corner -->
        <div style="position: absolute; top: 5px; ${isRTL ? 'left' : 'right'}: 20px; z-index: 10;">
          <img src="${logoUrl}" alt="" style="width: 50px; height: auto; opacity: 0.9;" />
        </div>

        <!-- Header -->
        <div style="background: linear-gradient(180deg, #f5a623 0%, #e8920d 100%); padding: 14px 20px;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: white; text-align: center; font-family: 'Cairo', sans-serif; text-shadow: 1px 1px 2px rgba(0,0,0,0.2);">
            مركز الحمدان للإتصالات - فرع شين
          </h1>
          <div style="margin-top: 8px; text-align: center;">
            <span style="font-size: 18px; font-weight: 600; color: white; font-family: 'Inter', sans-serif; letter-spacing: 2px; direction: ltr; display: inline-block;">
              0945 555 647
            </span>
          </div>
        </div>

        <!-- Tables Container -->
        <div style="padding: 15px; position: relative;">
          <!-- Tables -->
          <div style="position: relative; z-index: 1;">
            ${tableRows.join('')}
          </div>
        </div>

        <!-- Footer with Date -->
        <div style="padding: 12px 20px; text-align: right;">
          <span style="font-size: 16px; font-weight: 700; color: #1a1a1a; font-family: 'Inter', sans-serif;">
            ${date}
          </span>
        </div>
      </div>
    `;

    container.innerHTML = html;

    const images = container.getElementsByTagName('img');
    await Promise.all(
      Array.from(images).map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
      }),
    );

    const canvas = await html2canvas(container, {
      backgroundColor: '#f5f5f5',
      scale: 3,
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const filename = snapshotTitle || 'price-snapshot';
        link.download = `${filename}-${date}.png`;
        link.click();
        URL.revokeObjectURL(url);
      }
    }, 'image/png', 1.0);
  } finally {
    document.body.removeChild(container);
  }
}
