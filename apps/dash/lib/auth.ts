import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';

export const useRequiredAuth = () => {
  const auth = useAuth0();
  const { isLoading, isAuthenticated, loginWithRedirect } = auth;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect();
    }
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  return auth;
};
