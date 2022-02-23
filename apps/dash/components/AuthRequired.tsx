import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';

export default function AuthRequired(props: { render: () => any }) {
  const { user, isLoading, loginWithRedirect } = useAuth0();

  useEffect(() => {
    if (!user && !isLoading) {
      loginWithRedirect({
        redirect_uri: window.location.origin,
      });
    }
  }, [isLoading, loginWithRedirect, user]);

  return user ? props.render() : null;
}
