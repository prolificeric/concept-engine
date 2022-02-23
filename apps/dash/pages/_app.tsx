import type { AppProps } from 'next/app';
import Head from 'next/head';
import AppLayout from '../components/AppLayout';
import AuthRequired from '../components/AuthRequired';
import SubscriptionCheck from '../components/SubscriptionCheck';
import Providers from '../providers';
import '../styles/globals.scss';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>ConceptEngine Dashboard</title>
        <link rel="stylesheet" href="https://use.typekit.net/ovz7ogq.css" />
      </Head>
      <Providers>
        <AppLayout>
          {(Component as any).requiresAuth !== false ? (
            <AuthRequired
              render={() => (
                <SubscriptionCheck>
                  <Component {...pageProps} />
                </SubscriptionCheck>
              )}
            />
          ) : (
            <Component {...pageProps} />
          )}
        </AppLayout>
      </Providers>
    </>
  );
}
