import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';

export default function AuthRequired(props: { render: () => any }) {
  const { isAuthenticated, isLoading, error, loginWithRedirect } = useAuth0();
  const shouldLogin = !isAuthenticated && !isLoading && !error;

  useEffect(() => {
    if (shouldLogin) {
      loginWithRedirect({
        redirect_uri: window.location.origin,
      });
    }
  }, [loginWithRedirect, shouldLogin]);

  return isAuthenticated ? props.render() : null;
}
