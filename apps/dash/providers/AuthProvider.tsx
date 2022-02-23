import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { useState, useEffect, createContext, useContext } from 'react';
import config from '../site.config';

export default function AuthProvider(props: { children: any }) {
  return (
    <Auth0Provider
      {...config.auth0}
      redirectUri={(globalThis.location?.origin || '') + '/callback'}
    >
      <AccessTokenProvider>{props.children}</AccessTokenProvider>
    </Auth0Provider>
  );
}

const AccessTokenContext = createContext<string | null>(null);

export const useAccessToken = () => {
  return useContext(AccessTokenContext);
};

export const AccessTokenProvider = (props: { children: any }) => {
  const auth = useAuth0();
  const [accessToken, setAccessToken] = useState(null as null | string);

  useEffect(() => {
    if (auth.isLoading || accessToken) {
      return;
    }

    auth.getAccessTokenSilently().then((token) => {
      if (token) {
        setAccessToken(token);
      }
    });
  }, [accessToken, auth]);

  return (
    <AccessTokenContext.Provider value={accessToken}>
      {props.children}
    </AccessTokenContext.Provider>
  );
};
