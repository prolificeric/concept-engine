import type { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';
import AppLayout from '../components/AppLayout';
import AuthRequired from '../components/AuthRequired';
import SubscriptionCheck from '../components/SubscriptionCheck';
import Providers from '../providers';
import '../styles/globals.scss';

export default function MyApp({ Component: _C, pageProps }: AppProps) {
  const Component = _C as any;

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
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-KLEVBYD2WL"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: GA_SNIPPET,
        }}
      />
    </>
  );
}

const GA_SNIPPET = `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-KLEVBYD2WL');
`;
