import {
  Html, Head, Main, NextScript,
} from 'next/document';
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import type { DocumentContext, DocumentInitialProps } from 'next/document';

const RTL_LOCALES = ['ar'];

interface CustomDocumentProps extends DocumentInitialProps {
  locale: string;
}

export default function Document({ locale }: CustomDocumentProps) {
  const dir = RTL_LOCALES.includes(locale || 'en') ? 'rtl' : 'ltr';

  return (
    <Html lang={locale || 'en'} dir={dir} {...mantineHtmlProps}>
      <Head>
        <ColorSchemeScript />
        {/* Favicon and touch icon using project logo */}
        <link rel="icon" href="/logo/logo.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/logo/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <style>
          {`
          html[lang="ar"] body {
            font-family: 'Cairo', -apple-system, BlinkMacSystemFont, sans-serif !important;
          }
          html[lang="en"] body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
          }
        `}
        </style>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

Document.getInitialProps = async (ctx: DocumentContext): Promise<CustomDocumentProps> => {
  const initialProps = await ctx.defaultGetInitialProps(ctx);
  return {
    ...initialProps,
    locale: ctx.locale || 'en',
  };
};
