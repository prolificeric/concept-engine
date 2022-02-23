import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';

export default function Logout() {
  const { logout } = useAuth0();

  useEffect(() => {
    logout({
      returnTo: window.location.origin,
    });
  }, [logout]);

  return (
    <div>
      <h1>Logging out...</h1>
    </div>
  );
}

Logout.requiresAuth = false;
