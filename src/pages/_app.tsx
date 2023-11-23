import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { AppProvider } from '@shopify/polaris'
import enTranslations from '@shopify/polaris/locales/en.json';
import { QueryClient, QueryClientProvider } from 'react-query';
import React from 'react';



export default function App({ Component, pageProps }: AppProps) {
  const queryClient = new QueryClient();
  return (
    <React.Fragment>
      <QueryClientProvider client={queryClient}>
        <AppProvider i18n={enTranslations}>
          <Component {...pageProps} />
        </AppProvider>
      </QueryClientProvider>
    </React.Fragment>
  )
}
